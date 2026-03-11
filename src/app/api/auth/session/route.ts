import { NextResponse } from "next/server";
import { getSession, getCurrentUser } from "@/lib/session";

// GET /api/auth/session — get current session
export async function GET() {
    try {
        const user = await getCurrentUser();
        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ user: null });
    }
}

// DELETE /api/auth/session — logout
export async function DELETE() {
    const session = await getSession();
    session.destroy();
    return NextResponse.json({ success: true });
}
