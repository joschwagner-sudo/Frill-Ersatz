import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { isAdminEmail } from "@/lib/env";

// POST /api/auth/verify-code — verify magic link code & create session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json({ error: "Email and code required" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find valid (unused, unexpired) auth codes for this email
        const authCodes = await prisma.authCode.findMany({
            where: {
                email: normalizedEmail,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        // Check code against stored hashes
        let matchedCode = null;
        for (const ac of authCodes) {
            const isValid = await compare(code, ac.code);
            if (isValid) {
                matchedCode = ac;
                break;
            }
        }

        if (!matchedCode) {
            return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
        }

        // Mark code as used
        await prisma.authCode.update({
            where: { id: matchedCode.id },
            data: { usedAt: new Date() },
        });

        // Upsert user
        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: normalizedEmail,
                    isAdmin: isAdminEmail(normalizedEmail),
                    lastLoginAt: new Date(),
                },
            });
        } else {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLoginAt: new Date(),
                    isAdmin: isAdminEmail(normalizedEmail),
                },
            });
        }

        // Set session cookie (simple approach: store user ID + email as JSON, base64 encoded)
        // In production, use iron-session or JWT for proper encryption
        const sessionData = JSON.stringify({
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
        });
        const sessionToken = Buffer.from(sessionData).toString("base64");

        const cookieStore = await cookies();
        cookieStore.set("session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email, isAdmin: user.isAdmin },
        });
    } catch (error) {
        console.error("Auth verify-code error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
