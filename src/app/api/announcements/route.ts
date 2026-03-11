import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/announcements — list all announcements
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { email: true } } },
    });
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/announcements — create new announcement (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body: content,
        createdById: session.userId,
      },
      include: { createdBy: { select: { email: true } } },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
