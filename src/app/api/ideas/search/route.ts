import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q");

  if (!query || query.trim().length < 3) {
    return NextResponse.json([]);
  }

  try {
    // Search in approved ideas only
    const ideas = await prisma.featureRequest.findMany({
      where: {
        approvalStatus: "APPROVED",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        number: true,
        title: true,
        _count: { select: { votes: true } },
      },
      take: 5,
      orderBy: { votes: { _count: "desc" } },
    });

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
