import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import type { Metadata } from "next";
import Markdown from "@/components/Markdown";
import CommentSection from "@/components/CommentSection";
import VoteButton from "@/components/VoteButton";


export const dynamic = "force-dynamic";

// Generate Open Graph metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const request = await prisma.featureRequest.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      number: true,
    },
  });

  if (!request) {
    return {
      title: "Idee nicht gefunden",
    };
  }

  const truncatedDesc =
    request.description.length > 160
      ? request.description.slice(0, 157) + "..."
      : request.description;

  return {
    title: `${request.title} — Copilot Feedback`,
    description: truncatedDesc,
    openGraph: {
      title: request.title,
      description: truncatedDesc,
      type: "website",
      url: `https://copilot-feedback.vercel.app/requests/${id}`,
      siteName: "Copilot Feedback",
    },
    twitter: {
      card: "summary",
      title: request.title,
      description: truncatedDesc,
    },
  };
}

const statusConfig: Record<
  string,
  { label: string; emoji: string; class: string }
> = {
  UNDER_REVIEW: { label: "In Prüfung", emoji: "🔎", class: "badge-review" },
  PLANNED: { label: "To Do", emoji: "📋", class: "badge-planned" },
  IN_PROGRESS: { label: "In Arbeit", emoji: "🧑‍💻", class: "badge-progress" },
  DONE: { label: "Erledigt", emoji: "🎉", class: "badge-done" },

};


export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const _user = await getCurrentUser();
  const userId = _user?.userId || null;

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
      mergedInto: { select: { id: true, number: true, title: true } },
      mergedFrom: { select: { id: true, number: true, title: true } },
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

      {/* Merged notice */}
      {request.mergedInto && (
        <div
          style={{
            padding: "1rem",
            background: "#dbeafe",
            border: "2px solid var(--color-primary-600)",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-primary-600)",
              marginBottom: "0.375rem",
            }}
          >
            🔀 Diese Idee wurde zusammengeführt
          </div>
          <div style={{ fontSize: "0.875rem" }}>
            Diese Idee ist jetzt Teil von{" "}
            <Link
              href={`/requests/${request.mergedInto.id}`}
              style={{
                color: "var(--color-primary-600)",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              #{request.mergedInto.number} {request.mergedInto.title}
            </Link>
          </div>
        </div>
      )}

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
              {request.status && statusConfig[request.status] && (
                <span
                  className={`badge ${statusConfig[request.status].class}`}
                >
                  {statusConfig[request.status].emoji}{" "}
                  {statusConfig[request.status].label}
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
              <span>von {request.isAnonymous ? "Anonym" : request.createdBy.email.split("@")[0]}</span>
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
              marginBottom: "1.25rem",
            }}
          >
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
              }}
            >
              🗺️ Auf der Roadmap — {request.roadmapItem.quarter}
            </div>
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
      <CommentSection requestId={id} currentUser={currentUserObj} mergedFrom={request.mergedFrom} />
    </div>
  );
}
