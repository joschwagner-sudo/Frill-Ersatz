import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
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


export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    topic?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const { status, topic, sort, q } = params;

  const _user = await getCurrentUser();
  const userId = _user?.userId || null;

  // Fetch all topics for the filter
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
  });

  // Build filters - ONLY SHOW APPROVED IDEAS
  const where: Record<string, unknown> = {
    archived: false,
    approvalStatus: "APPROVED",
  };

  if (status && status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  // Topic filter via join table
  if (topic && topic !== "all") {
    where.topics = {
      some: {
        topic: {
          id: topic,
        },
      },
    };
  }

  // For trending: calculate votes in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const requests = await prisma.featureRequest.findMany({
    where,
    include: {
      createdBy: { select: { email: true } },
      votes: userId ? { where: { userId } } : false,
      topics: {
        include: {
          topic: true,
        },
      },
      _count: { select: { votes: true } },
    },
    orderBy:
      sort === "votes"
        ? { votes: { _count: "desc" } }
        : sort === "votes-least"
          ? { votes: { _count: "asc" } }
          : sort === "oldest"
            ? { createdAt: "asc" }
            : sort === "trending"
              ? { createdAt: "desc" } // We'll sort client-side for trending
              : { createdAt: "desc" },
  });

  // Calculate trending votes if needed
  let requestsWithTrending: (typeof requests[0] & { recentVoteCount?: number })[] = requests;
  if (sort === "trending" || !sort) {
    // Get recent vote counts for all ideas
    const recentVotes = await prisma.vote.groupBy({
      by: ["featureRequestId"],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        featureRequestId: {
          in: requests.map((r) => r.id),
        },
      },
      _count: true,
    });

    const recentVoteMap = new Map(
      recentVotes.map((v) => [v.featureRequestId, v._count])
    );

    requestsWithTrending = requests.map((r) => ({
      ...r,
      recentVoteCount: recentVoteMap.get(r.id) || 0,
    }));

    // Sort by trending if selected
    if (sort === "trending") {
      requestsWithTrending.sort((a, b) => (b.recentVoteCount || 0) - (a.recentVoteCount || 0));
    }
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Ideen & Vorschläge
          </h1>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--muted)",
              marginTop: "0.25rem",
            }}
          >
            {requestsWithTrending.length}{" "}
            {requestsWithTrending.length === 1 ? "Vorschlag" : "Vorschläge"}
          </p>
        </div>
        <Link href="/requests/new" className="btn-primary">
          + Idee einreichen
        </Link>
      </div>

      {/* Topic Filter Pills */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
        }}
      >
        <Link
          href={`/requests?${status ? `status=${status}&` : ""}${sort ? `sort=${sort}&` : ""}${q ? `q=${q}` : ""}`}
          className={`badge badge-topic ${!topic || topic === "all" ? "active" : ""}`}
          style={{
            cursor: "pointer",
            transition: "all 0.2s",
            ...((!topic || topic === "all")
              ? {
                  borderColor: "var(--color-primary-500)",
                  background: "#dbeafe",
                  color: "var(--color-primary-600)",
                }
              : {}),
          }}
        >
          Alle Topics
        </Link>
        {topics.map((t) => (
          <Link
            key={t.id}
            href={`/requests?topic=${t.id}${status ? `&status=${status}` : ""}${sort ? `&sort=${sort}` : ""}${q ? `&q=${q}` : ""}`}
            className={`badge badge-topic ${topic === t.id ? "active" : ""}`}
            style={{
              cursor: "pointer",
              transition: "all 0.2s",
              ...(topic === t.id
                ? {
                    borderColor: "var(--color-primary-500)",
                    background: "#dbeafe",
                    color: "var(--color-primary-600)",
                  }
                : {}),
            }}
          >
            {t.emoji} {t.name}
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        {/* Search */}
        <form style={{ flex: "1 1 200px", display: "flex", gap: "0.375rem" }}>
          <input
            type="text"
            name="q"
            placeholder="Vorschläge durchsuchen..."
            defaultValue={q}
            className="input"
            style={{ flex: 1 }}
          />
          {status && <input type="hidden" name="status" value={status} />}
          {topic && <input type="hidden" name="topic" value={topic} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <button type="submit" className="btn-primary" style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", flexShrink: 0 }}>
            🔍
          </button>
        </form>
        {q && (
          <Link
            href="/requests"
            className="btn-secondary"
            style={{ fontSize: "0.8rem", padding: "0.5rem 0.875rem", whiteSpace: "nowrap" }}
          >
            ✕ Suche zurücksetzen
          </Link>
        )}

        {/* Filter (Status) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginRight: "0.25rem" }}>Filter:</span>
          {[
            { value: "all", label: "Alle" },
            { value: "UNDER_REVIEW", label: "In Prüfung" },
            { value: "PLANNED", label: "To Do" },
            { value: "IN_PROGRESS", label: "In Arbeit" },
            { value: "DONE", label: "Erledigt" },
          ].map((s) => (
            <Link
              key={s.value}
              href={`/requests?status=${s.value}${topic ? `&topic=${topic}` : ""}${sort ? `&sort=${sort}` : ""}${q ? `&q=${q}` : ""}`}
              className="btn-ghost"
              style={{
                fontSize: "0.75rem",
                padding: "0.375rem 0.625rem",
                borderRadius: "9999px",
                border: "1px solid transparent",
                ...((!status && s.value === "all") || status === s.value
                  ? {
                      background: "var(--accent-bg)",
                      color: "var(--color-primary-600)",
                      border: "1px solid var(--color-primary-300)",
                    }
                  : {}),
              }}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Sortieren */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginRight: "0.25rem" }}>Sortieren:</span>
          {[
            { value: "trending", label: "Im Trend" },
            { value: "votes", label: "Meiste Upvotes" },
            { value: "votes-least", label: "Wenigste Upvotes" },
            { value: "newest", label: "Neueste" },
            { value: "oldest", label: "Älteste" },
          ].map((s) => (
            <Link
              key={s.value}
              href={`/requests?sort=${s.value}${status ? `&status=${status}` : ""}${topic ? `&topic=${topic}` : ""}${q ? `&q=${q}` : ""}`}
              className="btn-ghost"
              style={{
                fontSize: "0.75rem",
                padding: "0.375rem 0.625rem",
                borderRadius: "9999px",
                border: "1px solid transparent",
                ...((!sort && s.value === "trending") || sort === s.value
                  ? {
                      background: "var(--accent-bg)",
                      color: "var(--color-primary-600)",
                      border: "1px solid var(--color-primary-300)",
                    }
                  : {}),
              }}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Request List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {requestsWithTrending.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
            <p>Keine Vorschläge gefunden</p>
          </div>
        ) : (
          requestsWithTrending.map((req) => {
            const hasVoted = userId
              ? (req.votes as { userId: string }[]).length > 0
              : false;
            const isTrending = (req.recentVoteCount || 0) >= 5;

            return (
              <div
                key={req.id}
                className="card"
                style={{
                  padding: "1rem 1.25rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}
              >
                {/* Vote button */}
                <VoteButton
                  requestId={req.id}
                  initialVoteCount={req._count.votes}
                  initialHasVoted={hasVoted}
                  userId={userId}
                />

                {/* Content */}
                <Link
                  href={`/requests/${req.id}`}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textDecoration: "none",
                    color: "var(--foreground)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.375rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <h3
                      style={{ fontWeight: 600, fontSize: "1rem" }}
                    >
                      {req.title}
                    </h3>
                    {isTrending && (
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "#f97316",
                          fontWeight: 600,
                        }}
                        title={`${req.recentVoteCount || 0} Stimmen in den letzten 7 Tagen`}
                      >
                        🔥
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: "1.5",
                    }}
                  >
                    {req.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                      fontSize: "0.6875rem",
                      color: "var(--muted-foreground)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{req.isAnonymous ? "Anonym" : req.createdBy.email.split("@")[0]}</span>
                    <span>·</span>
                    <span>
                      {new Date(req.createdAt).toLocaleDateString("de-DE")}
                    </span>
                    {req.topics.map((t) => (
                      <span key={t.id} className="badge badge-topic" style={{ fontSize: "0.625rem", padding: "0.125rem 0.4rem" }}>
                        {t.topic.emoji} {t.topic.name}
                      </span>
                    ))}
                    {req.status && (
                      <span
                        className={`badge ${statusConfig[req.status]?.class || ""}`}
                        style={{ fontSize: "0.625rem", padding: "0.125rem 0.4rem" }}
                      >
                        {statusConfig[req.status]?.emoji}{" "}
                        {statusConfig[req.status]?.label || req.status}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
