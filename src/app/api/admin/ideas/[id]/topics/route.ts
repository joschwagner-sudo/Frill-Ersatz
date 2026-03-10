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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
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
