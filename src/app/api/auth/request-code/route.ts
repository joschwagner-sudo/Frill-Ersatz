import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";

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

        // DEV: log code to console
        if (process.env.NODE_ENV !== "production" || !process.env.RESEND_API_KEY) {
            console.log(`\n🔐 [DEV] Auth code for ${normalizedEmail}: ${code}\n`);
        } else {
            // PROD: send via Resend
            // TODO: implement Resend email sending
            console.log(`📧 Would send code to ${normalizedEmail} via Resend`);
        }

        return NextResponse.json({
            success: true,
            message: "Code sent! Check your email (or console in dev mode).",
        });
    } catch (error) {
        console.error("Auth request-code error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
