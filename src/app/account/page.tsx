import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import EmailNotificationToggle from "@/components/EmailNotificationToggle";

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

const approvalConfig: Record<string, { label: string; class: string }> = {
  NEEDS_APPROVAL: { label: "Prüfung ausstehend", class: "badge-review" },
  APPROVED: { label: "Freigegeben", class: "badge-done" },
  REJECTED: { label: "Abgelehnt", class: "badge-rejected" },
};

export default async function AccountPage() {
  const sessionUser = await getCurrentUser();
  const userId = sessionUser?.userId || null;

  if (!userId) {
    redirect("/login");
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      createdRequests: {
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      votes: {
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
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="animate-in" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          👤 Mein Bereich
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--muted)",
            marginTop: "0.5rem",
          }}
        >
          {user.email}
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted-foreground)",
            marginTop: "0.25rem",
          }}
        >
          Mitglied seit{" "}
          {new Date(user.createdAt).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          className="card"
          style={{
            padding: "1.25rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--color-primary-600)",
            }}
          >
            {user.createdRequests.length}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Eingereichte Ideen
          </div>
        </div>
        <div
          className="card"
          style={{
            padding: "1.25rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--color-primary-600)",
            }}
          >
            {user.votes.length}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Votes abgegeben
          </div>
        </div>
      </div>

      {/* My Ideas */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          💡 Meine Ideen
        </h2>

        {user.createdRequests.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p>Du hast noch keine Ideen eingereicht.</p>
            <Link
              href="/requests/new"
              className="btn-primary"
              style={{ marginTop: "1rem" }}
            >
              + Erste Idee einreichen
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {user.createdRequests.map((req) => (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="card"
                style={{
                  padding: "1rem 1.25rem",
                  display: "flex",
                  gap: "1rem",
                  textDecoration: "none",
                  color: "var(--foreground)",
                  alignItems: "flex-start",
                }}
              >
                {/* Vote count */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    minWidth: "3rem",
                  }}
                >
                  <span style={{ fontSize: "0.875rem" }}>▲</span>
                  <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                    {req._count.votes}
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.375rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <h3 style={{ fontWeight: 600, fontSize: "1rem" }}>
                      {req.title}
                    </h3>
                    {req.topics.map((t) => (
                      <span key={t.id} className="badge badge-topic">
                        {t.topic.emoji} {t.topic.name}
                      </span>
                    ))}
                    <span
                      className={`badge ${
                        approvalConfig[req.approvalStatus]?.class || ""
                      }`}
                    >
                      {approvalConfig[req.approvalStatus]?.label ||
                        req.approvalStatus}
                    </span>
                    {req.status && (
                      <span
                        className={`badge ${statusConfig[req.status]?.class || ""}`}
                      >
                        {statusConfig[req.status]?.emoji}{" "}
                        {statusConfig[req.status]?.label || req.status}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {req.description.substring(0, 100)}
                    {req.description.length > 100 ? "..." : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* My Votes */}
      <section>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          ▲ Meine Votes
        </h2>

        {user.votes.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p>Du hast noch keine Ideen gevoted.</p>
            <Link
              href="/requests"
              className="btn-secondary"
              style={{ marginTop: "1rem" }}
            >
              Ideen entdecken
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {user.votes.map((vote) => {
              const req = vote.featureRequest;
              return (
                <Link
                  key={vote.id}
                  href={`/requests/${req.id}`}
                  className="card"
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex",
                    gap: "1rem",
                    textDecoration: "none",
                    color: "var(--foreground)",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Vote count */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.25rem",
                      minWidth: "3rem",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "var(--color-primary-600)" }}>▲</span>
                    <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                      {req._count.votes}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.375rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3 style={{ fontWeight: 600, fontSize: "1rem" }}>
                        {req.title}
                      </h3>
                      {req.topics.map((t) => (
                        <span key={t.id} className="badge badge-topic">
                          {t.topic.emoji} {t.topic.name}
                        </span>
                      ))}
                      {req.status && (
                        <span
                          className={`badge ${statusConfig[req.status]?.class || ""}`}
                        >
                          {statusConfig[req.status]?.emoji}{" "}
                          {statusConfig[req.status]?.label || req.status}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {req.description.substring(0, 100)}
                      {req.description.length > 100 ? "..." : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Settings */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          ⚙️ Einstellungen
        </h2>
        <div className="card" style={{ padding: "1.5rem" }}>
          <EmailNotificationToggle
            initialValue={user.emailNotifications}
            userId={user.id}
          />
        </div>
      </section>
    </div>
  );
}
