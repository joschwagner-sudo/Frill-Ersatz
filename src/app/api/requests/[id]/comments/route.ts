import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CommentSchema = z.object({
    body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
    userId: z.string().min(1, "User ID is required"),
});

// POST /api/requests/[id]/comments — add a comment
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

        const { body: commentBody, userId } = result.data;

        // Verify request exists
        const fr = await prisma.featureRequest.findUnique({
            where: { id: featureRequestId },
        });

        if (!fr) {
            return NextResponse.json({ error: "Feature request not found" }, { status: 404 });
        }

        const comment = await prisma.comment.create({
            data: {
                body: commentBody,
                userId,
                featureRequestId,
            },
            include: {
                user: { select: { email: true } },
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("Comment API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET /api/requests/[id]/comments — list comments
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: featureRequestId } = await params;

        const comments = await prisma.comment.findMany({
            where: { featureRequestId },
            include: {
                user: { select: { email: true } },
            },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Comment list error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
