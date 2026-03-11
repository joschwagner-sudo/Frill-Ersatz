import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";


// POST /api/requests/[id]/vote — toggle vote
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const session = await getCurrentUser();
        if (!session?.userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const userId = session.userId;

        // Check feature request exists
        const featureRequest = await prisma.featureRequest.findUnique({ where: { id } });
        if (!featureRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // Check existing vote
        const existingVote = await prisma.vote.findUnique({
            where: { userId_featureRequestId: { userId, featureRequestId: id } },
        });

        if (existingVote) {
            // Remove vote (toggle off)
            await prisma.vote.delete({ where: { id: existingVote.id } });
        } else {
            // Add vote
            await prisma.vote.create({
                data: { userId, featureRequestId: id },
            });
        }

        // Get updated count
        const voteCount = await prisma.vote.count({ where: { featureRequestId: id } });
        const hasVoted = !existingVote;

        return NextResponse.json({ voteCount, hasVoted });
    } catch (error) {
        console.error("Vote API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
