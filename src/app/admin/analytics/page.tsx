import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getCurrentUser();
  if (!session?.isAdmin) {
    redirect("/login");
  }

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const previousThirtyDays = new Date();
  previousThirtyDays.setDate(previousThirtyDays.getDate() - 60);

  // ─── Overview KPIs (last 30 days) ───────────────────
  const [
    votesThisMonth,
    votesPrevMonth,
    ideasThisMonth,
    ideasPrevMonth,
    commentsThisMonth,
  ] = await Promise.all([
    prisma.vote.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.vote.count({ where: { createdAt: { gte: previousThirtyDays, lt: thirtyDaysAgo } } }),
    prisma.featureRequest.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.featureRequest.count({ where: { createdAt: { gte: previousThirtyDays, lt: thirtyDaysAgo } } }),
    prisma.comment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  // ─── Ideas by type: Verbesserung vs Neues Feature ───
  // We use topics to distinguish
  const ideasByTopic = await prisma.topic.findMany({
    include: {
      _count: { select: { ideas: true } },
    },
    orderBy: { ideas: { _count: "desc" } },
  });

  const maxTopicCount = Math.max(...ideasByTopic.map((t) => t._count.ideas), 1);

  // ─── Ideas by status ────────────────────────────────
  const ideasByStatus = await prisma.featureRequest.groupBy({
    by: ["status"],
    where: { approvalStatus: "APPROVED" },
    _count: true,
  });

  const statusLabels: Record<string, string> = {
    UNDER_REVIEW: "In Prüfung 🔎",
    PLANNED: "To Do 📋",
    IN_PROGRESS: "In Arbeit 🧑‍💻",
    DONE: "Erledigt 🎉",
    NOT_PLANNED: "Nicht geplant",
  };

  const totalIdeasByStatus = ideasByStatus.reduce((sum, s) => sum + s._count, 0);

  // ─── Votes trend (last 30 days) ─────────────────────
  const votesPerDay = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
    SELECT DATE("createdAt") as date, COUNT(*) as count
    FROM "Vote"
    WHERE "createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  const maxVoteCount = Math.max(...votesPerDay.map((v) => Number(v.count)), 1);

  // ─── Top 10 populärste Ideas (by votes, last 30 days) ─
  const popularIdeas = await prisma.featureRequest.findMany({
    where: {
      approvalStatus: "APPROVED",
      archived: false,
    },
    include: {
      _count: { select: { votes: true, comments: true } },
      topics: { include: { topic: { select: { name: true, emoji: true } } } },
    },
    orderBy: { votes: { _count: "desc" } },
    take: 10,
  });

  // ─── Most active users ──────────────────────────────
  const topUsers = await prisma.user.findMany({
    select: {
      email: true,
      _count: { select: { votes: true, createdRequests: true } },
    },
    orderBy: [{ votes: { _count: "desc" } }],
    take: 10,
  });

  const maxUserActivity = Math.max(
    ...topUsers.map((u) => u._count.votes + u._count.createdRequests),
    1
  );

  // ─── Ideas per topic last 30 days (for "where is most input") ─
  const recentIdeasByTopic = await prisma.$queryRaw<{ topicName: string; count: bigint }[]>`
    SELECT t."name" as "topicName", COUNT(DISTINCT it."featureRequestId") as count
    FROM "IdeaTopics" it
    JOIN "Topic" t ON t."id" = it."topicId"
    JOIN "FeatureRequest" fr ON fr."id" = it."featureRequestId"
    WHERE fr."createdAt" >= ${thirtyDaysAgo}
    GROUP BY t."name"
    ORDER BY count DESC
  `;

  const kpiCards = [
    { label: "Votes (30 Tage)", value: votesThisMonth, prev: votesPrevMonth, color: "var(--color-primary-600)" },
    { label: "Neue Ideen (30 Tage)", value: ideasThisMonth, prev: ideasPrevMonth, color: "#14c57e" },
    { label: "Kommentare (30 Tage)", value: commentsThisMonth, prev: null, color: "#ff6b4a" },
  ];

  return (
    <div className="animate-in">
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <Link href="/admin" style={{ fontSize: "0.875rem", color: "var(--muted)", textDecoration: "none" }}>
            ← Admin Dashboard
          </Link>
        </div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          📊 Analytics
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--muted)", marginTop: "0.25rem" }}>
          Einblicke für Product Manager: Votes, Trends und Community-Input
        </p>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {kpiCards.map((kpi) => {
          const change = kpi.prev !== null && kpi.prev > 0
            ? Math.round(((kpi.value - kpi.prev) / kpi.prev) * 100)
            : null;
          return (
            <div key={kpi.label} className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {kpi.label}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.5rem" }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                {change !== null && (
                  <span style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: change >= 0 ? "#14c57e" : "#ef4444",
                  }}>
                    {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
                  </span>
                )}
              </div>
              {kpi.prev !== null && (
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                  Vormonat: {kpi.prev}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>

        {/* Input per Topic (last 30 days) */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Input nach Bereich (30 Tage)
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
            In welchen Bereichen kommt am meisten Feedback?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recentIdeasByTopic.map((t) => {
              const maxRecent = Math.max(...recentIdeasByTopic.map((r) => Number(r.count)), 1);
              return (
                <div key={t.topicName}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                    <span>{t.topicName}</span>
                    <span style={{ fontWeight: 600 }}>{Number(t.count)}</span>
                  </div>
                  <div style={{ height: "0.5rem", background: "var(--accent-bg)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#ff6b4a", width: `${(Number(t.count) / maxRecent) * 100}%`, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
            {recentIdeasByTopic.length === 0 && (
              <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Keine Daten im letzten Monat</div>
            )}
          </div>
        </div>

        {/* Ideas per Topic (all time) */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Ideen pro Topic (gesamt)
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Gesamtverteilung aller eingereichten Ideen
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ideasByTopic.map((topic) => (
              <div key={topic.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  <span>{topic.emoji} {topic.name}</span>
                  <span style={{ fontWeight: 600 }}>{topic._count.ideas}</span>
                </div>
                <div style={{ height: "0.5rem", background: "var(--accent-bg)", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--color-primary-600)", width: `${(topic._count.ideas / maxTopicCount) * 100}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ideas by Status */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Ideen nach Status
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ideasByStatus.map((s) => {
              const percentage = totalIdeasByStatus > 0 ? (s._count / totalIdeasByStatus) * 100 : 0;
              return (
                <div key={s.status || "null"}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                    <span>{s.status ? statusLabels[s.status] || s.status : "Kein Status"}</span>
                    <span style={{ fontWeight: 600 }}>{s._count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: "0.5rem", background: "var(--accent-bg)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      background: s.status === "DONE" ? "#14c57e" : s.status === "IN_PROGRESS" ? "#4d6bdd" : s.status === "PLANNED" ? "#ffd749" : "#ff6b4a",
                      width: `${percentage}%`,
                      transition: "width 0.3s",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Votes Trend */}
        <div className="card" style={{ padding: "1.5rem", gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Votes Trend (letzte 30 Tage)
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.25rem", height: "150px" }}>
            {votesPerDay.map((v) => {
              const height = (Number(v.count) / maxVoteCount) * 100;
              return (
                <div
                  key={v.date}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}
                  title={`${v.date}: ${v.count} Votes`}
                >
                  <div style={{
                    width: "100%",
                    height: `${height}%`,
                    background: "var(--color-primary-600)",
                    borderRadius: "4px 4px 0 0",
                    minHeight: "2px",
                    transition: "height 0.3s",
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem", textAlign: "center" }}>
            {votesPerDay.length} Tage · {votesPerDay.reduce((sum, v) => sum + Number(v.count), 0)} Votes gesamt
          </div>
        </div>

        {/* Top 10 populärste Ideas */}
        <div className="card" style={{ padding: "1.5rem", gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            🏆 Top 10 populärste Ideen
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {popularIdeas.map((idea, index) => (
              <div key={idea.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                background: index < 3 ? "#fef3c710" : "transparent",
                borderRadius: "8px",
                borderLeft: index < 3 ? `3px solid ${index === 0 ? "#ffd749" : index === 1 ? "#c0c0c0" : "#cd7f32"}` : "3px solid transparent",
              }}>
                <span style={{ fontWeight: 700, color: "var(--muted)", width: "1.5rem", textAlign: "center", fontSize: "0.875rem" }}>
                  {index + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/requests/${idea.id}`} style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)", textDecoration: "none" }}>
                    {idea.title}
                  </Link>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.125rem", fontSize: "0.6875rem", color: "var(--muted)" }}>
                    {idea.topics.map((t) => (
                      <span key={t.topic.name}>{t.topic.emoji} {t.topic.name}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem", color: "var(--muted)", flexShrink: 0 }}>
                  <span style={{ fontWeight: 600, color: "var(--color-primary-600)" }}>{idea._count.votes} 👍</span>
                  <span>{idea._count.comments} 💬</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Users */}
        <div className="card" style={{ padding: "1.5rem", gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Top 10 Aktivste Nutzer
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {topUsers.map((user, index) => {
              const totalActivity = user._count.votes + user._count.createdRequests;
              const percentage = (totalActivity / maxUserActivity) * 100;
              return (
                <div key={user.email}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                    <span>
                      <span style={{ display: "inline-block", width: "1.5rem", color: "var(--muted)" }}>#{index + 1}</span>
                      {user.email}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {user._count.votes} Votes · {user._count.createdRequests} Ideen
                    </span>
                  </div>
                  <div style={{ height: "0.5rem", background: "var(--accent-bg)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      background: index === 0 ? "#ffd749" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "var(--color-primary-600)",
                      width: `${percentage}%`,
                      transition: "width 0.3s",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
