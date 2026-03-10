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
  const session = await getAdminSession();
  if (!session) {
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
