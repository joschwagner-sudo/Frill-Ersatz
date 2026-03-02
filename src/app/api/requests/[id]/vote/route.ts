import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/requests/[id]/vote — toggle vote
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 });
        }

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
            return NextResponse.json({ voted: false, message: "Vote removed" });
        } else {
            // Add vote
            await prisma.vote.create({
                data: { userId, featureRequestId: id },
            });
            return NextResponse.json({ voted: true, message: "Vote added" }, { status: 201 });
        }
    } catch (error) {
        console.error("Vote API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
