import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";


type PageProps = {
  searchParams: Promise<{ tab?: string; filter?: string }>;
};

export default async function AdminPage({ searchParams }: PageProps) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) redirect("/login");

  const params = await searchParams;
  const currentTab = params.tab || "ideas";
  const currentFilter = params.filter || "all";

  // Fetch all data
  const [ideas, announcements, users, stats] = await Promise.all([
    prisma.featureRequest.findMany({
      where: { archived: false },
      include: {
        createdBy: { select: { email: true } },
        topics: { include: { topic: { select: { name: true, emoji: true } } } },
        _count: { select: { votes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.announcement.findMany({
      include: { createdBy: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      include: {
        _count: { select: { createdRequests: true, votes: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    (async () => {
      const [
        totalIdeas,
        needsApproval,
        approved,
        rejected,
        totalUsers,
        totalVotes,
        totalComments,
        draftAnnouncements,
        publishedAnnouncements,
      ] = await Promise.all([
        prisma.featureRequest.count(),
        prisma.featureRequest.count({ where: { approvalStatus: "NEEDS_APPROVAL" } }),
        prisma.featureRequest.count({ where: { approvalStatus: "APPROVED" } }),
        prisma.featureRequest.count({ where: { approvalStatus: "REJECTED" } }),
        prisma.user.count(),
        prisma.vote.count(),
        prisma.comment.count(),
        prisma.announcement.count({ where: { publishedAt: null } }),
        prisma.announcement.count({ where: { publishedAt: { not: null } } }),
      ]);

      return {
        totalIdeas,
        needsApproval,
        approved,
        rejected,
        totalUsers,
        totalVotes,
        totalComments,
        draftAnnouncements,
        publishedAnnouncements,
      };
    })(),
  ]);

  // Serialize dates to strings for client component
  const serializedIdeas = ideas.map((idea) => ({
    ...idea,
    topics: idea.topics.map((it) => ({ name: it.topic.name, emoji: it.topic.emoji })),
    createdAt: idea.createdAt.toISOString(),
    updatedAt: idea.updatedAt.toISOString(),
  }));

  const serializedAnnouncements = announcements.map((ann) => ({
    ...ann,
    createdAt: ann.createdAt.toISOString(),
    publishedAt: ann.publishedAt?.toISOString() || null,
  }));

  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
  }));

  return (
    <AdminDashboard
      initialIdeas={serializedIdeas}
      initialAnnouncements={serializedAnnouncements}
      initialUsers={serializedUsers}
      initialStats={stats}
      currentTab={currentTab}
      currentFilter={currentFilter}
    />
  );
}
