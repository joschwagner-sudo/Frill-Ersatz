import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// POST /api/admin/emails/send — send email broadcast
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { subject, body, bodyHtml, recipientType, recipientFilter, testOnly } = await request.json();

  if (!subject || !body || !bodyHtml) {
    return NextResponse.json({ error: "Subject, body and bodyHtml required" }, { status: 400 });
  }

  // Determine recipients
  let recipients: { id: string; email: string }[] = [];

  if (recipientType === "ALL") {
    recipients = await prisma.user.findMany({
      where: { emailNotifications: true },
      select: { id: true, email: true },
    });
  } else if (recipientType === "IDEA_VOTERS" && recipientFilter) {
    const votes = await prisma.vote.findMany({
      where: { featureRequestId: recipientFilter },
      include: { user: { select: { id: true, email: true, emailNotifications: true } } },
    });
    // Also include the idea creator
    const idea = await prisma.featureRequest.findUnique({
      where: { id: recipientFilter },
      include: { createdBy: { select: { id: true, email: true, emailNotifications: true } } },
    });
    const voterEmails = new Set<string>();
    for (const v of votes) {
      if (v.user.emailNotifications) {
        voterEmails.add(v.user.email);
        recipients.push({ id: v.user.id, email: v.user.email });
      }
    }
    if (idea?.createdBy.emailNotifications && !voterEmails.has(idea.createdBy.email)) {
      recipients.push({ id: idea.createdBy.id, email: idea.createdBy.email });
    }
  } else if (recipientType === "ADMINS") {
    recipients = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true, email: true },
    });
  }

  // Test mode: only send to current admin
  if (testOnly) {
    recipients = [{ id: user.userId, email: user.email }];
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "Keine Empfänger gefunden" }, { status: 400 });
  }

  // Create broadcast record
  const broadcast = await prisma.emailBroadcast.create({
    data: {
      subject,
      body,
      bodyHtml,
      recipientType: testOnly ? "TEST" : recipientType,
      recipientFilter,
      recipientCount: recipients.length,
      status: "SENDING",
      sentById: user.userId,
    },
  });

  // Send emails via Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    // Dev mode
    console.log(`\n📧 [DEV] Would send "${subject}" to ${recipients.length} recipients`);
    recipients.forEach((r) => console.log(`  → ${r.email}`));

    await prisma.emailBroadcast.update({
      where: { id: broadcast.id },
      data: {
        status: "SENT",
        sentCount: recipients.length,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      broadcast: { ...broadcast, sentCount: recipients.length, status: "SENT" },
      devMode: true,
    });
  }

  const resend = new Resend(resendKey);
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  let sentCount = 0;
  let failedCount = 0;

  // Send in batches of 10
  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((r) =>
        resend.emails.send({
          from: fromEmail,
          to: r.email,
          subject,
          html: bodyHtml,
        })
      )
    );
    for (const result of results) {
      if (result.status === "fulfilled" && !result.value.error) {
        sentCount++;
      } else {
        failedCount++;
      }
    }
  }

  await prisma.emailBroadcast.update({
    where: { id: broadcast.id },
    data: {
      status: failedCount === recipients.length ? "FAILED" : "SENT",
      sentCount,
      failedCount,
      sentAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    broadcast: {
      id: broadcast.id,
      sentCount,
      failedCount,
      recipientCount: recipients.length,
    },
  });
}
