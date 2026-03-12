import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "🎉", "🤔", "👀"];

// POST /api/requests/[id]/comments/[commentId]/react — toggle reaction
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { commentId } = await params;
        const { emoji } = await request.json();

        if (!ALLOWED_EMOJIS.includes(emoji)) {
            return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
        }

        // Check if already reacted
        const existing = await prisma.commentReaction.findUnique({
            where: {
                userId_commentId_emoji: {
                    userId: user.userId,
                    commentId,
                    emoji,
                },
            },
        });

        if (existing) {
            // Remove reaction
            await prisma.commentReaction.delete({ where: { id: existing.id } });
            return NextResponse.json({ action: "removed" });
        } else {
            // Add reaction
            await prisma.commentReaction.create({
                data: {
                    userId: user.userId,
                    commentId,
                    emoji,
                },
            });
            return NextResponse.json({ action: "added" });
        }
    } catch (error) {
        console.error("Comment reaction error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
