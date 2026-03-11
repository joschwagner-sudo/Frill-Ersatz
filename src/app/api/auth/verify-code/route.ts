import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { isAdminEmail } from "@/lib/env";
import { getSession } from "@/lib/session";

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
            return NextResponse.json({ error: "Ungültiger oder abgelaufener Code" }, { status: 401 });
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

        // Set encrypted session via iron-session
        const session = await getSession();
        session.userId = user.id;
        session.email = user.email;
        session.isAdmin = user.isAdmin;
        await session.save();

        return NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email, isAdmin: user.isAdmin },
        });
    } catch (error) {
        console.error("Auth verify-code error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
