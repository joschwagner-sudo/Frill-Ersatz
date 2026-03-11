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
