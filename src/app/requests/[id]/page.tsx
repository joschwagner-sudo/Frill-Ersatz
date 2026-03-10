import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Markdown from "@/components/Markdown";
import CommentSection from "@/components/CommentSection";
import VoteButton from "@/components/VoteButton";

export const dynamic = "force-dynamic";

const statusConfig: Record<
  string,
  { label: string; emoji: string; class: string }
> = {
  UNDER_REVIEW: { label: "In Prüfung", emoji: "🔎", class: "badge-review" },
  PLANNED: { label: "To Do", emoji: "📋", class: "badge-planned" },
  IN_PROGRESS: { label: "In Arbeit", emoji: "🧑‍💻", class: "badge-progress" },
  DONE: { label: "Erledigt", emoji: "🎉", class: "badge-done" },
};

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

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getCurrentUser();

  const request = await prisma.featureRequest.findUnique({
    where: { id },
    include: {
      createdBy: { select: { email: true } },
      votes: userId ? { where: { userId } } : { select: { id: true } },
      topics: {
        include: {
          topic: true,
        },
      },
      roadmapItem: true,
      _count: { select: { votes: true } },
    },
  });

  if (!request) notFound();

  const hasVoted = userId
    ? (request.votes as { userId?: string }[]).some((v) => v.userId === userId)
    : false;

  // Fetch user for comment section
  const currentUserObj = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      })
    : null;

  return (
    <div className="animate-in" style={{ maxWidth: "720px", margin: "0 auto" }}>
      {/* Back link */}
      <Link
        href="/requests"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.875rem",
          color: "var(--muted)",
          textDecoration: "none",
          marginBottom: "1.5rem",
        }}
      >
        ← Zurück zu Ideen
      </Link>

      <div className="card" style={{ padding: "1.5rem" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start",
            marginBottom: "1.25rem",
          }}
        >
          {/* Vote button */}
          <VoteButton
            requestId={request.id}
            initialVoteCount={request._count.votes}
            initialHasVoted={hasVoted}
            userId={userId}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {request.title}
              </h1>
              {request.topics.map((t) => (
                <span key={t.id} className="badge badge-topic">
                  {t.topic.emoji} {t.topic.name}
                </span>
              ))}
              {request.status && (
                <span
                  className={`badge ${statusConfig[request.status]?.class || ""}`}
                >
                  {statusConfig[request.status]?.emoji}{" "}
                  {statusConfig[request.status]?.label || request.status}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                fontSize: "0.875rem",
                color: "var(--muted)",
              }}
            >
              <span>von {request.createdBy.email.split("@")[0]}</span>
              <span>·</span>
              <span>
                {new Date(request.createdAt).toLocaleDateString("de-DE")}
              </span>
            </div>
          </div>
        </div>

        {/* Roadmap badge */}
        {request.roadmapItem && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 0.875rem",
              background: "#dbeafe",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--color-primary-600)",
              marginBottom: "1.25rem",
            }}
          >
            🗺️ Auf der Roadmap — {request.roadmapItem.quarter}
          </div>
        )}

        {/* Description */}
        <div
          style={{
            padding: "1.25rem 0",
            borderTop: "1px solid var(--card-border)",
            fontSize: "0.9375rem",
            lineHeight: 1.7,
            color: "var(--foreground)",
          }}
        >
          <Markdown content={request.description} />
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection requestId={id} currentUser={currentUserObj} />
    </div>
  );
}
