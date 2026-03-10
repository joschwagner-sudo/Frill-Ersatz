import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusConfig: Record<
  string,
  { label: string; emoji: string; color: string; class: string }
> = {
  UNDER_REVIEW: {
    label: "In Prüfung",
    emoji: "🔎",
    color: "#ff6b4a",
    class: "badge-review",
  },
  PLANNED: {
    label: "To Do",
    emoji: "📋",
    color: "#ffd749",
    class: "badge-planned",
  },
  IN_PROGRESS: {
    label: "In Arbeit",
    emoji: "🧑‍💻",
    color: "#4d6bdd",
    class: "badge-progress",
  },
  DONE: {
    label: "Erledigt",
    emoji: "🎉",
    color: "#14c57e",
    class: "badge-done",
  },
};

export default async function RoadmapPage() {
  // Only show items that are APPROVED
  const roadmapItems = await prisma.roadmapItem.findMany({
    where: {
      featureRequest: {
        approvalStatus: "APPROVED",
      },
    },
    include: {
      featureRequest: {
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
          _count: { select: { votes: true } },
        },
      },
    },
    orderBy: [{ quarter: "asc" }, { priority: "asc" }],
  });

  // Group by quarter
  const quarters = roadmapItems.reduce(
    (acc, item) => {
      if (!acc[item.quarter]) acc[item.quarter] = [];
      acc[item.quarter].push(item);
      return acc;
    },
    {} as Record<string, typeof roadmapItems>
  );

  const sortedQuarters = Object.keys(quarters).sort();

  return (
    <div className="animate-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          🗺️ Roadmap
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--muted)",
            marginTop: "0.5rem",
          }}
        >
          Woran wir arbeiten und was als Nächstes kommt
        </p>
      </div>

      {sortedQuarters.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "3rem",
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🗺️</div>
          <p>Noch keine Roadmap-Einträge</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {sortedQuarters.map((quarter) => {
            const items = quarters[quarter];
            const doneCount = items.filter(
              (i) => i.featureRequest.status === "DONE"
            ).length;

            return (
              <div key={quarter}>
                {/* Quarter header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--foreground)",
                    }}
                  >
                    {quarter}
                  </h2>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      padding: "0.25rem 0.625rem",
                      background: "var(--accent-bg)",
                      borderRadius: "9999px",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    {doneCount} / {items.length} umgesetzt
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: "6px",
                    background: "var(--card-border)",
                    borderRadius: "3px",
                    marginBottom: "1rem",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%`,
                      background: statusConfig.DONE.color,
                      borderRadius: "3px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                {/* Items */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
                >
                  {items.map((item) => {
                    const req = item.featureRequest;
                    const statusInfo = req.status
                      ? statusConfig[req.status] || {
                          label: req.status,
                          emoji: "",
                          color: "var(--muted)",
                          class: "",
                        }
                      : {
                          label: "Kein Status",
                          emoji: "",
                          color: "var(--muted)",
                          class: "",
                        };

                    return (
                      <Link
                        href={`/requests/${req.id}`}
                        key={item.id}
                        className="card"
                        style={{
                          padding: "1rem 1.25rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          borderLeft: `4px solid ${statusInfo.color}`,
                          textDecoration: "none",
                          color: "var(--foreground)",
                        }}
                      >
                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                              marginBottom: "0.375rem",
                            }}
                          >
                            <h3
                              style={{ fontWeight: 600, fontSize: "1rem" }}
                            >
                              {req.title}
                            </h3>
                            {req.topics.map((t) => (
                              <span key={t.id} className="badge badge-topic">
                                {t.topic.emoji} {t.topic.name}
                              </span>
                            ))}
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
                        </div>

                        {/* Status + Votes */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexShrink: 0,
                          }}
                        >
                          <span className={`badge ${statusInfo.class}`}>
                            {statusInfo.emoji} {statusInfo.label}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.875rem",
                              color: "var(--muted)",
                            }}
                          >
                            <span>▲</span>
                            <span style={{ fontWeight: 600 }}>
                              {req._count.votes}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
