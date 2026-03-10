import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/cron/digest — Weekly digest email generation
// This would be called by a cron job (Vercel Cron, GitHub Actions, etc.)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret";
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date range: last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Collect data for digest
    const [newIdeas, statusChanges, topVotedIdeas] = await Promise.all([
      // New ideas this week (approved)
      prisma.featureRequest.findMany({
        where: {
          approvalStatus: "APPROVED",
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),

      // Ideas with status changes this week
      prisma.featureRequest.findMany({
        where: {
          approvalStatus: "APPROVED",
          updatedAt: {
            gte: sevenDaysAgo,
          },
          status: {
            in: ["IN_PROGRESS", "DONE"],
          },
        },
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      }),

      // Top voted ideas this week
      prisma.featureRequest.findMany({
        where: {
          approvalStatus: "APPROVED",
          votes: {
            some: {
              createdAt: {
                gte: sevenDaysAgo,
              },
            },
          },
        },
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
        orderBy: {
          votes: {
            _count: "desc",
          },
        },
        take: 5,
      }),
    ]);

    // Get users who opted in for email notifications
    const subscribedUsers = await prisma.user.findMany({
      where: {
        emailNotifications: true,
      },
      select: {
        id: true,
        email: true,
      },
    });

    // Generate HTML email
    const emailHtml = generateDigestEmail({
      newIdeas,
      statusChanges,
      topVotedIdeas,
    });

    // In production, you would send emails here using Resend or similar
    // For now, we just log and return the data
    console.log(`Would send digest to ${subscribedUsers.length} users`);
    console.log(`New ideas: ${newIdeas.length}`);
    console.log(`Status changes: ${statusChanges.length}`);
    console.log(`Top voted: ${topVotedIdeas.length}`);

    return NextResponse.json({
      success: true,
      recipientCount: subscribedUsers.length,
      digest: {
        newIdeas: newIdeas.length,
        statusChanges: statusChanges.length,
        topVotedIdeas: topVotedIdeas.length,
      },
      preview: emailHtml,
    });
  } catch (error) {
    console.error("Digest generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate HTML email template
function generateDigestEmail({
  newIdeas,
  statusChanges,
  topVotedIdeas,
}: {
  newIdeas: any[];
  statusChanges: any[];
  topVotedIdeas: any[];
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wöchentlicher Digest — Copilot Feedback</title>
</head>
<body style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f9fafb; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: #1a56db; padding: 30px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">📬 Wöchentlicher Digest</h1>
      <p style="color: #dbeafe; margin: 10px 0 0; font-size: 14px;">Das Beste aus dieser Woche</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px 20px;">
      
      ${
        newIdeas.length > 0
          ? `
      <!-- New Ideas -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 15px;">🆕 Neue Ideen</h2>
        ${newIdeas
          .map(
            (idea) => `
        <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; margin-bottom: 10px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 5px;">
            <a href="${baseUrl}/requests/${idea.id}" style="color: #1a56db; text-decoration: none;">${idea.title}</a>
          </h3>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
            ${idea.topics.map((t: any) => `${t.topic.emoji} ${t.topic.name}`).join(" · ")}
          </p>
          <p style="font-size: 14px; color: #9ca3af; margin: 5px 0;">👍 ${idea._count.votes} Stimmen</p>
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }

      ${
        statusChanges.length > 0
          ? `
      <!-- Status Changes -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 15px;">📊 Status-Updates</h2>
        ${statusChanges
          .map(
            (idea) => `
        <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; margin-bottom: 10px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 5px;">
            <a href="${baseUrl}/requests/${idea.id}" style="color: #1a56db; text-decoration: none;">${idea.title}</a>
          </h3>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
            Status: <strong>${idea.status === "IN_PROGRESS" ? "In Arbeit 🧑‍💻" : idea.status === "DONE" ? "Erledigt 🎉" : idea.status}</strong>
          </p>
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }

      ${
        topVotedIdeas.length > 0
          ? `
      <!-- Top Voted -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 15px;">🔥 Im Trend</h2>
        ${topVotedIdeas
          .map(
            (idea) => `
        <div style="padding: 15px; background: #fef3c7; border-radius: 8px; margin-bottom: 10px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 5px;">
            <a href="${baseUrl}/requests/${idea.id}" style="color: #1a56db; text-decoration: none;">${idea.title}</a>
          </h3>
          <p style="font-size: 14px; color: #92400e; margin: 5px 0;">👍 ${idea._count.votes} Stimmen</p>
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }

      <!-- CTA -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${baseUrl}/requests" style="display: inline-block; background: #1a56db; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Alle Ideen ansehen
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; margin: 0 0 10px;">
        Du erhältst diese E-Mail, weil du für Benachrichtigungen angemeldet bist.
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        <a href="${baseUrl}/account" style="color: #1a56db; text-decoration: none;">Einstellungen ändern</a> · 
        <a href="${baseUrl}/account?unsubscribe=true" style="color: #6b7280; text-decoration: none;">Abmelden</a>
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}
