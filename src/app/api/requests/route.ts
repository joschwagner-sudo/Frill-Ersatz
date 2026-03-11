import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { FeatureRequestSchema } from "@/lib/schemas";

// GET /api/requests — list requests
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const sort = searchParams.get("sort") || "newest";
    const q = searchParams.get("q");

    const where: Record<string, unknown> = { archived: false };
    if (status && status !== "all") where.status = status;
    if (type && type !== "all") where.type = type;
    if (q) {
        where.OR = [
            { title: { contains: q } },
            { description: { contains: q } },
        ];
    }

    const requests = await prisma.featureRequest.findMany({
        where,
        include: {
            createdBy: { select: { email: true, id: true } },
            _count: { select: { votes: true } },
        },
        orderBy:
            sort === "votes"
                ? { votes: { _count: "desc" } }
                : sort === "oldest"
                    ? { createdAt: "asc" }
                    : { createdAt: "desc" },
    });

    return NextResponse.json(requests);
}

// POST /api/requests — create new request
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Simplified validation for now - just check required fields
        const { title, description, topicId, userId, isAnonymous } = body;

        if (!title || !description || !topicId || !userId) {
            return NextResponse.json(
                { error: "Missing required fields: title, description, topicId, userId" },
                { status: 400 }
            );
        }

        if (title.length > 80) {
            return NextResponse.json(
                { error: "Title must be 80 characters or less" },
                { status: 400 }
            );
        }

        // Rate limit: max 3 requests/day/user (Europe/Berlin timezone)
        const now = new Date();
        const berlinOffset = new Date(
            now.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
        );
        const todayStart = new Date(berlinOffset);
        todayStart.setHours(0, 0, 0, 0);

        const todayCount = await prisma.featureRequest.count({
            where: {
                createdById: userId,
                createdAt: { gte: todayStart },
            },
        });

        if (todayCount >= 3) {
            return NextResponse.json(
                { error: "Rate limit: max 3 requests per day" },
                { status: 429 }
            );
        }

        // Create feature request with topic
        const featureRequest = await prisma.featureRequest.create({
            data: {
                title,
                description,
                type: "FEATURE",
                approvalStatus: "NEEDS_APPROVAL",
                isAnonymous: isAnonymous !== false, // Default true
                createdById: userId,
                topics: {
                    create: {
                        topicId,
                    },
                },
            },
            include: {
                topics: {
                    include: {
                        topic: true,
                    },
                },
            },
        });

        return NextResponse.json(featureRequest, { status: 201 });
    } catch (error) {
        console.error("Request API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
