import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CommentSchema = z.object({
    body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
    userId: z.string().min(1, "User ID is required"),
    parentId: z.string().optional(),
});

// POST /api/requests/[id]/comments — add a comment (or reply)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: featureRequestId } = await params;
        const body = await request.json();
        const result = CommentSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { body: commentBody, userId, parentId } = result.data;

        // Verify request exists
        const fr = await prisma.featureRequest.findUnique({
            where: { id: featureRequestId },
        });

        if (!fr) {
            return NextResponse.json({ error: "Feature request not found" }, { status: 404 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isAdmin: true },
        });

        const comment = await prisma.comment.create({
            data: {
                body: commentBody,
                userId,
                featureRequestId,
                isOfficial: user?.isAdmin || false,
                parentId: parentId || null,
            },
            include: {
                user: { select: { email: true, isAdmin: true } },
                reactions: {
                    include: { user: { select: { id: true } } },
                },
            },
        });

        // Create notification for idea creator (if not commenting on own idea)
        if (fr.createdById !== userId) {
            await prisma.notification.create({
                data: {
                    userId: fr.createdById,
                    type: "NEW_COMMENT",
                    message: `Jemand hat deine Idee "${fr.title}" kommentiert.`,
                    ideaId: fr.id,
                },
            });
        }

        // If reply, also notify the parent comment author
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
                select: { userId: true },
            });
            if (parentComment && parentComment.userId !== userId) {
                await prisma.notification.create({
                    data: {
                        userId: parentComment.userId,
                        type: "NEW_COMMENT",
                        message: `Jemand hat auf deinen Kommentar geantwortet.`,
                        ideaId: fr.id,
                    },
                });
            }
        }

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("Comment API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET /api/requests/[id]/comments — list comments with replies and reactions
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: featureRequestId } = await params;

        const comments = await prisma.comment.findMany({
            where: { featureRequestId, parentId: null },
            include: {
                user: { select: { email: true, isAdmin: true } },
                reactions: {
                    include: { user: { select: { id: true } } },
                },
                replies: {
                    include: {
                        user: { select: { email: true, isAdmin: true } },
                        reactions: {
                            include: { user: { select: { id: true } } },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Comment list error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
