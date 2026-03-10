import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MergeSchema = z.object({
  targetId: z.string().min(1, "Target ID is required"),
});

// POST /api/admin/ideas/[id]/merge — merge idea A into idea B
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params;
    const body = await request.json();
    const result = MergeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { targetId } = result.data;

    if (sourceId === targetId) {
      return NextResponse.json(
        { error: "Cannot merge an idea into itself" },
        { status: 400 }
      );
    }

    // Verify both ideas exist
    const [sourceIdea, targetIdea] = await Promise.all([
      prisma.featureRequest.findUnique({ where: { id: sourceId } }),
      prisma.featureRequest.findUnique({ where: { id: targetId } }),
    ]);

    if (!sourceIdea) {
      return NextResponse.json(
        { error: "Source idea not found" },
        { status: 404 }
      );
    }

    if (!targetIdea) {
      return NextResponse.json(
        { error: "Target idea not found" },
        { status: 404 }
      );
    }

    // Perform the merge in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Transfer votes from source to target (avoiding duplicates)
      const sourceVotes = await tx.vote.findMany({
        where: { featureRequestId: sourceId },
        select: { userId: true },
      });

      const targetVoteUserIds = await tx.vote.findMany({
        where: { featureRequestId: targetId },
        select: { userId: true },
      });

      const targetUserIdSet = new Set(
        targetVoteUserIds.map((v) => v.userId)
      );

      const votesToTransfer = sourceVotes.filter(
        (v) => !targetUserIdSet.has(v.userId)
      );

      if (votesToTransfer.length > 0) {
        await tx.vote.createMany({
          data: votesToTransfer.map((v) => ({
            userId: v.userId,
            featureRequestId: targetId,
          })),
        });
      }

      // 2. Delete source votes
      await tx.vote.deleteMany({
        where: { featureRequestId: sourceId },
      });

      // 3. Transfer comments from source to target
      await tx.comment.updateMany({
        where: { featureRequestId: sourceId },
        data: { featureRequestId: targetId },
      });

      // 4. Mark source as merged
      await tx.featureRequest.update({
        where: { id: sourceId },
        data: {
          status: "MERGED",
          mergedIntoId: targetId,
        },
      });

      // 5. Create notification for source idea creator
      await tx.notification.create({
        data: {
          userId: sourceIdea.createdById,
          type: "STATUS_CHANGED",
          message: `Deine Idee wurde mit "${targetIdea.title}" zusammengeführt.`,
          ideaId: sourceId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Ideas merged successfully",
    });
  } catch (error) {
    console.error("Merge error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
