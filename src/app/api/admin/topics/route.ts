import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const topics = await prisma.topic.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { ideas: true },
        },
      },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, emoji, order, isPrivate } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const topic = await prisma.topic.create({
      data: {
        name,
        emoji: emoji || "",
        order: order || 0,
        isPrivate: isPrivate || false,
      },
    });

    return NextResponse.json({ success: true, topic });
  } catch (error) {
    console.error("Failed to create topic:", error);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
