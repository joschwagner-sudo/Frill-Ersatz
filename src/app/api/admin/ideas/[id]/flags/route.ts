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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Extract valid flag fields
  const updateData: Record<string, boolean> = {};
  if (typeof body.isPinned === "boolean") updateData.isPinned = body.isPinned;
  if (typeof body.isPrivate === "boolean") updateData.isPrivate = body.isPrivate;
  if (typeof body.isShortlisted === "boolean") updateData.isShortlisted = body.isShortlisted;
  if (typeof body.archived === "boolean") updateData.archived = body.archived;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid flags provided" }, { status: 400 });
  }

  try {
    const idea = await prisma.featureRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, idea });
  } catch (error) {
    console.error("Failed to update flags:", error);
    return NextResponse.json({ error: "Failed to update flags" }, { status: 500 });
  }
}
