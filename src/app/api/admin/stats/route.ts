import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(session.value, "base64").toString("utf-8"));
    return parsed?.isAdmin ? parsed : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
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
