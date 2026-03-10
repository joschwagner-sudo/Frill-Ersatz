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
    const idea = await prisma.featureRequest.update({
      where: { id },
      data: {
        approvalStatus: "REJECTED",
      },
    });

    return NextResponse.json({ success: true, idea });
  } catch (error) {
    console.error("Failed to reject idea:", error);
    return NextResponse.json({ error: "Failed to reject idea" }, { status: 500 });
  }
}
