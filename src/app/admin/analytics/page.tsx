import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(session.value, "base64").toString("utf-8")
    );
    return parsed?.isAdmin ? parsed : null;
  } catch {
    return null;
  }
}

export default async function AnalyticsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  // 1. Ideas per topic
  const ideasByTopic = await prisma.topic.findMany({
    include: {
      _count: {
        select: { ideas: true },
      },
    },
    orderBy: {
      ideas: {
        _count: "desc",
      },
    },
  });

  const maxTopicCount = Math.max(
    ...ideasByTopic.map((t) => t._count.ideas),
    1
  );

  // 2. Ideas by status
  const ideasByStatus = await prisma.featureRequest.groupBy({
    by: ["status"],
    where: {
      approvalStatus: "APPROVED",
    },
    _count: true,
  });

  const statusLabels: Record<string, string> = {
    UNDER_REVIEW: "In Prüfung 🔎",
    PLANNED: "To Do 📋",
    IN_PROGRESS: "In Arbeit 🧑‍💻",
    DONE: "Erledigt 🎉",
    NOT_PLANNED: "Nicht geplant",
  };

  const totalIdeasByStatus = ideasByStatus.reduce(
    (sum, s) => sum + s._count,
    0
  );

  // 3. Votes trend over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const votesPerDay = await prisma.$queryRaw<
    { date: string; count: bigint }[]
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM "Vote"
    WHERE created_at >= ${thirtyDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  const maxVoteCount = Math.max(
    ...votesPerDay.map((v) => Number(v.count)),
    1
  );

  // 4. Most active users (by votes + ideas)
  const topUsers = await prisma.user.findMany({
    select: {
      email: true,
      _count: {
        select: {
          votes: true,
          createdRequests: true,
        },
      },
    },
    orderBy: [
      {
        votes: {
          _count: "desc",
        },
      },
    ],
    take: 10,
  });

  const maxUserActivity = Math.max(
    ...topUsers.map(
      (u) => u._count.votes + u._count.createdRequests
    ),
    1
  );

  return (
    <div className="animate-in">
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <Link
            href="/admin"
            style={{
              fontSize: "0.875rem",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← Admin Dashboard
          </Link>
        </div>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          📊 Analytics
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--muted)",
            marginTop: "0.25rem",
          }}
        >
          Einblicke in Aktivität, Trends und Community
        </p>
      </div>

      {/* Grid Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Ideas per Topic */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Ideen pro Topic
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ideasByTopic.map((topic) => (
              <div key={topic.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.25rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>
                    {topic.emoji} {topic.name}
                  </span>
                  <span style={{ fontWeight: 600 }}>{topic._count.ideas}</span>
                </div>
                <div
                  style={{
                    height: "0.5rem",
                    background: "var(--accent-bg)",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "var(--color-primary-600)",
                      width: `${(topic._count.ideas / maxTopicCount) * 100}%`,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ideas by Status */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Ideen nach Status
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ideasByStatus.map((s) => {
              const percentage =
                totalIdeasByStatus > 0
                  ? (s._count / totalIdeasByStatus) * 100
                  : 0;
              return (
                <div key={s.status || "null"}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span>
                      {s.status
                        ? statusLabels[s.status] || s.status
                        : "Kein Status"}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {s._count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: "0.5rem",
                      background: "var(--accent-bg)",
                      borderRadius: "9999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background:
                          s.status === "DONE"
                            ? "#14c57e"
                            : s.status === "IN_PROGRESS"
                              ? "#4d6bdd"
                              : s.status === "PLANNED"
                                ? "#ffd749"
                                : "#ff6b4a",
                        width: `${percentage}%`,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Votes Trend (Last 30 Days) */}
        <div
          className="card"
          style={{ padding: "1.5rem", gridColumn: "1 / -1" }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Votes Trend (letzte 30 Tage)
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.25rem",
              height: "150px",
            }}
          >
            {votesPerDay.map((v) => {
              const height = (Number(v.count) / maxVoteCount) * 100;
              return (
                <div
                  key={v.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                  title={`${v.date}: ${v.count} Votes`}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${height}%`,
                      background: "var(--color-primary-600)",
                      borderRadius: "4px 4px 0 0",
                      minHeight: "2px",
                      transition: "height 0.3s",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--muted)",
              marginTop: "0.5rem",
              textAlign: "center",
            }}
          >
            {votesPerDay.length} Tage · {votesPerDay.reduce(
              (sum, v) => sum + Number(v.count),
              0
            )}{" "}
            Votes gesamt
          </div>
        </div>

        {/* Most Active Users */}
        <div
          className="card"
          style={{ padding: "1.5rem", gridColumn: "1 / -1" }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Top 10 Aktivste Nutzer
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {topUsers.map((user, index) => {
              const totalActivity =
                user._count.votes + user._count.createdRequests;
              const percentage = (totalActivity / maxUserActivity) * 100;
              return (
                <div key={user.email}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span>
                      <span
                        style={{
                          display: "inline-block",
                          width: "1.5rem",
                          color: "var(--muted)",
                        }}
                      >
                        #{index + 1}
                      </span>
                      {user.email}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {user._count.votes} Votes · {user._count.createdRequests}{" "}
                      Ideen
                    </span>
                  </div>
                  <div
                    style={{
                      height: "0.5rem",
                      background: "var(--accent-bg)",
                      borderRadius: "9999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background:
                          index === 0
                            ? "#ffd749"
                            : index === 1
                              ? "#c0c0c0"
                              : index === 2
                                ? "#cd7f32"
                                : "var(--color-primary-600)",
                        width: `${percentage}%`,
                        transition: "width 0.3s",
                      }}
                    />
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
