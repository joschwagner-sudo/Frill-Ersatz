import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET /api/auth/session — get current session
export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");

        if (!session?.value) {
            return NextResponse.json({ user: null });
        }

        try {
            const decoded = Buffer.from(session.value, "base64").toString("utf-8");
            const user = JSON.parse(decoded);
            return NextResponse.json({ user });
        } catch {
            return NextResponse.json({ user: null });
        }
    } catch {
        return NextResponse.json({ user: null });
    }
}

// DELETE /api/auth/session — logout
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return NextResponse.json({ success: true });
}
