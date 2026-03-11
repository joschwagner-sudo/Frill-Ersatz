import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const idea = await prisma.featureRequest.update({
      where: { id },
      data: {
        approvalStatus: "APPROVED",
        status: "UNDER_REVIEW", // Default status when approved
      },
    });

    // Create notification for idea creator
    await prisma.notification.create({
      data: {
        userId: idea.createdById,
        type: "IDEA_APPROVED",
        message: `Deine Idee "${idea.title}" wurde freigegeben und ist jetzt öffentlich sichtbar!`,
        ideaId: idea.id,
      },
    });

    return NextResponse.json({ success: true, idea });
  } catch (error) {
    console.error("Failed to approve idea:", error);
    return NextResponse.json({ error: "Failed to approve idea" }, { status: 500 });
  }
}
