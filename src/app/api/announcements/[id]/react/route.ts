import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SUPPORTED_EMOJIS = ["🔥", "❤️", "👍"];

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    );
    return sessionData.userId || null;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emoji } = body;

    if (!emoji || !SUPPORTED_EMOJIS.includes(emoji)) {
      return NextResponse.json(
        { error: "Invalid emoji" },
        { status: 400 }
      );
    }

    // Check if announcement exists
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check if user already reacted with this emoji
    const existing = await prisma.announcementReaction.findUnique({
      where: {
        userId_announcementId_emoji: {
          userId,
          announcementId: id,
          emoji,
        },
      },
    });

    if (existing) {
      // Remove reaction (toggle off)
      await prisma.announcementReaction.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ removed: true });
    } else {
      // Add reaction
      await prisma.announcementReaction.create({
        data: {
          userId,
          announcementId: id,
          emoji,
        },
      });

      return NextResponse.json({ added: true });
    }
  } catch (error) {
    console.error("Reaction API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
