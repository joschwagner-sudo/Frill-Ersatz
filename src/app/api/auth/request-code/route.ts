import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { Resend } from "resend";

// POST /api/auth/request-code — send magic link code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Generate 6-digit code
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const hashedCode = await hash(code, 10);

        // Store in DB (expires in 10 minutes)
        await prisma.authCode.create({
            data: {
                email: normalizedEmail,
                code: hashedCode,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        // Always return code directly for testing (demo mode)
        // Also try to send via email if Resend is configured
        if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: process.env.EMAIL_FROM,
                    to: normalizedEmail,
                    subject: "Dein Login-Code für Copilot",
                    html: `
                        <div style="font-family: 'Outfit', system-ui, sans-serif; max-width: 400px; margin: 0 auto; padding: 2rem;">
                            <h2 style="color: #15284B; margin-bottom: 0.5rem;">Dein Login-Code</h2>
                            <p style="color: #6D778B; font-size: 0.9rem;">Gib diesen Code ein, um dich bei Copilot anzumelden:</p>
                            <div style="background: #EDF0FC; border-radius: 12px; padding: 1.5rem; text-align: center; margin: 1.5rem 0;">
                                <span style="font-size: 2rem; font-weight: 700; letter-spacing: 0.3em; color: #4D6BDD;">${code}</span>
                            </div>
                            <p style="color: #8A93A5; font-size: 0.8rem;">Der Code ist 10 Minuten gültig.</p>
                        </div>
                    `,
                });
            } catch (err) {
                console.error("Resend error (non-blocking):", err);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Code bereit!",
            devCode: code,
        });
    } catch (error) {
        console.error("Auth request-code error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
