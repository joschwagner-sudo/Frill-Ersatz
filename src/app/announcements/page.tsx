import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
    const announcements = await prisma.announcement.findMany({
        where: { publishedAt: { not: null } },
        include: {
            createdBy: { select: { email: true } },
        },
        orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    });

    return (
        <div className="animate-in" style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Changelog
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    Updates, new features, and improvements
                </p>
            </div>

            {announcements.length === 0 ? (
                <div
                    className="card"
                    style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}
                >
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📣</div>
                    <p>No announcements yet</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {announcements.map((ann) => (
                        <article
                            key={ann.id}
                            className="card"
                            style={{
                                padding: "1.5rem",
                                ...(ann.pinned
                                    ? {
                                        borderLeft: "3px solid var(--color-primary-500)",
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
                                }}
                            >
                                {ann.pinned && (
                                    <span
                                        style={{
                                            fontSize: "0.6875rem",
                                            fontWeight: 600,
                                            padding: "0.125rem 0.375rem",
                                            background: "var(--accent-bg)",
                                            color: "var(--color-primary-600)",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        📌 PINNED
                                    </span>
                                )}
                                <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                                    {ann.publishedAt
                                        ? new Date(ann.publishedAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                        : "Draft"}
                                </span>
                            </div>

                            <h2
                                style={{
                                    fontSize: "1.125rem",
                                    fontWeight: 700,
                                    letterSpacing: "-0.01em",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                {ann.title}
                            </h2>

                            {/* Body (rendered as plain text for now, markdown later) */}
                            <div
                                style={{
                                    fontSize: "0.9375rem",
                                    lineHeight: 1.7,
                                    color: "var(--muted)",
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {ann.body}
                            </div>

                            {/* Footer */}
                            <div
                                style={{
                                    marginTop: "1rem",
                                    paddingTop: "0.75rem",
                                    borderTop: "1px solid var(--card-border)",
                                    fontSize: "0.75rem",
                                    color: "var(--muted-foreground)",
                                }}
                            >
                                Posted by {ann.createdBy.email.split("@")[0]}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
