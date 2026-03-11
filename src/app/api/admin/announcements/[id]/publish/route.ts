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
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error("Failed to publish announcement:", error);
    return NextResponse.json({ error: "Failed to publish announcement" }, { status: 500 });
  }
}
