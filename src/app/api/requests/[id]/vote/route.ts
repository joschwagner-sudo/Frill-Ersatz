import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getSessionUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session?.value) return null;
    try {
        return JSON.parse(Buffer.from(session.value, "base64").toString("utf-8"));
    } catch {
        return null;
    }
}

// POST /api/requests/[id]/vote — toggle vote
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const session = await getSessionUser();
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
