import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { topicIds } = body;

  if (!Array.isArray(topicIds)) {
    return NextResponse.json({ error: "topicIds must be an array" }, { status: 400 });
  }

  try {
    // Delete existing topic associations
    await prisma.ideaTopics.deleteMany({
      where: { featureRequestId: id },
    });

    // Create new associations
    if (topicIds.length > 0) {
      await prisma.ideaTopics.createMany({
        data: topicIds.map((topicId: string) => ({
          featureRequestId: id,
          topicId,
        })),
      });
    }

    const idea = await prisma.featureRequest.findUnique({
      where: { id },
      include: { topics: { include: { topic: true } } },
    });

    return NextResponse.json({ success: true, idea });
  } catch (error) {
    console.error("Failed to update topics:", error);
    return NextResponse.json({ error: "Failed to update topics" }, { status: 500 });
  }
}
