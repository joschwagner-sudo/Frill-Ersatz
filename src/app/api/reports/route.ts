import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ReportSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = ReportSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { type, title, description, userEmail, pageUrl } = result.data;

        // Save to DB
        const report = await prisma.reportToIntercom.create({
            data: {
                type,
                title,
                description,
                userEmail,
                pageUrl: pageUrl || null,
                intercomDeliveryStatus: "PENDING",
            },
        });

        // Try to forward to Intercom
        const webhookUrl = process.env.INTERCOM_WEBHOOK_URL;
        const forwardEmail = process.env.INTERCOM_FORWARD_EMAIL;

        if (webhookUrl) {
            try {
                const res = await fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: report.type,
                        title: report.title,
                        description: report.description,
                        userEmail: report.userEmail,
                        pageUrl: report.pageUrl,
                        createdAt: report.createdAt,
                    }),
                });

                await prisma.reportToIntercom.update({
                    where: { id: report.id },
                    data: {
                        intercomDeliveryStatus: res.ok ? "SENT" : "FAILED",
                        intercomResponse: `HTTP ${res.status}`,
                    },
                });
            } catch (err) {
                await prisma.reportToIntercom.update({
                    where: { id: report.id },
                    data: {
                        intercomDeliveryStatus: "FAILED",
                        intercomResponse: String(err),
                    },
                });
            }
        } else if (forwardEmail) {
            // DEV mode: log email
            console.log(`\n📧 [DEV] Report forwarding email to: ${forwardEmail}`);
            console.log(`   Type: ${report.type}`);
            console.log(`   Title: ${report.title}`);
            console.log(`   From: ${report.userEmail}\n`);
        }

        return NextResponse.json({ success: true, id: report.id }, { status: 201 });
    } catch (error) {
        console.error("Report API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
