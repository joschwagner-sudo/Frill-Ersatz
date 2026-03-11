import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const validStatuses = ["UNDER_REVIEW", "PLANNED", "IN_PROGRESS", "DONE", "NOT_PLANNED"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const idea = await prisma.featureRequest.update({
      where: { id },
      data: { status },
    });

    // Create notification for idea creator
    const statusLabels: Record<string, string> = {
      UNDER_REVIEW: "In Prüfung 🔎",
      PLANNED: "To Do 📋",
      IN_PROGRESS: "In Arbeit 🧑‍💻",
      DONE: "Erledigt 🎉",
      NOT_PLANNED: "Nicht geplant",
    };

    await prisma.notification.create({
      data: {
        userId: idea.createdById,
        type: "STATUS_CHANGED",
        message: `Der Status deiner Idee "${idea.title}" wurde auf "${statusLabels[status]}" geändert.`,
        ideaId: idea.id,
      },
    });

    return NextResponse.json({ success: true, idea });
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
