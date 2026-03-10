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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
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
