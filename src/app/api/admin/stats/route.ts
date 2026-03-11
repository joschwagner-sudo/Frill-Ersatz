import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [
      totalIdeas,
      needsApproval,
      approved,
      rejected,
      totalUsers,
      totalVotes,
      totalComments,
      draftAnnouncements,
      publishedAnnouncements,
    ] = await Promise.all([
      prisma.featureRequest.count(),
      prisma.featureRequest.count({ where: { approvalStatus: "NEEDS_APPROVAL" } }),
      prisma.featureRequest.count({ where: { approvalStatus: "APPROVED" } }),
      prisma.featureRequest.count({ where: { approvalStatus: "REJECTED" } }),
      prisma.user.count(),
      prisma.vote.count(),
      prisma.comment.count(),
      prisma.announcement.count({ where: { publishedAt: null } }),
      prisma.announcement.count({ where: { publishedAt: { not: null } } }),
    ]);

    return NextResponse.json({
      totalIdeas,
      needsApproval,
      approved,
      rejected,
      totalUsers,
      totalVotes,
      totalComments,
      draftAnnouncements,
      publishedAnnouncements,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
