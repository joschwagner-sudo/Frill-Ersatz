import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Markdown from "@/components/Markdown";
import ReactionButtons from "@/components/ReactionButtons";

export const dynamic = "force-dynamic";

const categoryConfig: Record<
  string,
  { color: string; textColor: string }
> = {
  Verbesserung: { color: "#63C8D9", textColor: "#0e7490" },
  "New Feature": { color: "#6392D9", textColor: "#1e40af" },
  Bugfix: { color: "#87eb5e", textColor: "#15803d" },
  Announcement: { color: "#FF3C3C", textColor: "#dc2626" },
};

const SUPPORTED_EMOJIS = ["🔥", "❤️", "👍"];

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

export default async function AnnouncementsPage() {
  const userId = await getCurrentUser();

  const announcements = await prisma.announcement.findMany({
    where: { publishedAt: { not: null } },
    include: {
      createdBy: { select: { email: true } },
      category: true,
      reactions: userId
        ? {
            where: {
              OR: SUPPORTED_EMOJIS.map((emoji) => ({ emoji })),
            },
          }
        : {
            where: {
              OR: SUPPORTED_EMOJIS.map((emoji) => ({ emoji })),
            },
            select: {
              id: true,
              emoji: true,
              userId: true,
            },
          },
    },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="animate-in" style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          📣 Neuigkeiten
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--muted)",
            marginTop: "0.5rem",
          }}
        >
          Updates, neue Features und Verbesserungen
        </p>
      </div>

      {announcements.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "3rem",
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📣</div>
          <p>Noch keine Neuigkeiten</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {announcements.map((ann) => {
            const categoryStyle = ann.category?.name
              ? categoryConfig[ann.category.name]
              : null;

            // Aggregate reactions by emoji
            const reactionsByEmoji = SUPPORTED_EMOJIS.map((emoji) => {
              const matching = (
                ann.reactions as { emoji: string; userId: string }[]
              ).filter((r) => r.emoji === emoji);
              return {
                emoji,
                count: matching.length,
                hasReacted: userId
                  ? matching.some((r) => r.userId === userId)
                  : false,
              };
            });

            return (
              <article
                key={ann.id}
                className="card"
                style={{
                  padding: "1.5rem",
                  ...(ann.pinned
                    ? {
                        borderLeft: "4px solid var(--color-primary-500)",
                      }
                    : {}),
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  {ann.pinned && (
                    <span
                      className="badge"
                      style={{
                        background: "#dbeafe",
                        color: "var(--color-primary-600)",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      📌 Angepinnt
                    </span>
                  )}
                  {categoryStyle && ann.category && (
                    <span
                      className="badge"
                      style={{
                        background: `${categoryStyle.color}20`,
                        color: categoryStyle.textColor,
                        border: `1px solid ${categoryStyle.color}50`,
                      }}
                    >
                      {ann.category.emoji} {ann.category.name}
                    </span>
                  )}
                  <span
                    style={{ fontSize: "0.875rem", color: "var(--muted)" }}
                  >
                    {ann.publishedAt
                      ? new Date(ann.publishedAt).toLocaleDateString("de-DE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Entwurf"}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    marginBottom: "0.75rem",
                  }}
                >
                  {ann.title}
                </h2>

                <div
                  className="markdown-content"
                  style={{
                    fontSize: "0.9375rem",
                    lineHeight: 1.7,
                    marginBottom: "1rem",
                  }}
                >
                  <Markdown content={ann.body} />
                </div>

                {/* Reactions */}
                <div
                  style={{
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--card-border)",
                  }}
                >
                  <ReactionButtons
                    announcementId={ann.id}
                    initialReactions={reactionsByEmoji}
                    userId={userId}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
