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

        // Send code via email
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

            const { error } = await resend.emails.send({
                from: fromEmail,
                to: normalizedEmail,
                subject: "Dein Login-Code für Copilot",
                html: `
                    <div style="font-family: 'Outfit', system-ui, sans-serif; max-width: 400px; margin: 0 auto; padding: 2rem;">
                        <h2 style="color: #15284B; margin-bottom: 0.5rem;">Dein Login-Code</h2>
                        <p style="color: #6D778B; font-size: 0.9rem;">Gib diesen Code ein, um dich bei Copilot anzumelden:</p>
                        <div style="background: #EDF0FC; border-radius: 12px; padding: 1.5rem; text-align: center; margin: 1.5rem 0;">
                            <span style="font-size: 2rem; font-weight: 700; letter-spacing: 0.3em; color: #4D6BDD;">${code}</span>
                        </div>
                        <p style="color: #8A93A5; font-size: 0.8rem;">Der Code ist 10 Minuten gültig. Falls du diesen Login nicht angefordert hast, ignoriere diese Mail.</p>
                    </div>
                `,
            });

            if (error) {
                console.error("Resend error:", error);
                return NextResponse.json(
                    { error: "Code konnte nicht gesendet werden. Bitte versuche es erneut." },
                    { status: 500 }
                );
            }
        } else {
            console.log(`\n🔐 [DEV] Auth code for ${normalizedEmail}: ${code}\n`);
        }

        return NextResponse.json({
            success: true,
            message: "Code gesendet! Überprüfe deine E-Mails.",
        });
    } catch (error) {
        console.error("Auth request-code error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
