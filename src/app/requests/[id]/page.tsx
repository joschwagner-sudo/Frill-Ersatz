import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Markdown from "@/components/Markdown";
import CommentSection from "@/components/CommentSection";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; class: string }> = {
    UNDER_REVIEW: { label: "Wird geprüft", class: "badge-review" },
    PLANNED: { label: "Geplant", class: "badge-planned" },
    IN_PROGRESS: { label: "In Arbeit", class: "badge-progress" },
    DONE: { label: "Umgesetzt", class: "badge-done" },
    NOT_PLANNED: { label: "Nicht geplant", class: "badge-rejected" },
};

const typeConfig: Record<string, { label: string; class: string }> = {
    FEATURE: { label: "Feature", class: "badge-feature" },
    BUG: { label: "Bug", class: "badge-bug" },
};

export default async function RequestDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    let currentUser = null;

    if (session?.value) {
        try {
            const decoded = Buffer.from(session.value, "base64").toString("utf-8");
            currentUser = JSON.parse(decoded);
        } catch (e) {
            console.error("Session decode error:", e);
        }
    }

    const request = await prisma.featureRequest.findUnique({
        where: { id },
        include: {
            createdBy: { select: { email: true } },
            votes: { select: { userId: true } },
            roadmapItem: true,
        },
    });

    if (!request) notFound();

    const voteCount = request.votes.length;

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
                    <div className="vote-btn" style={{ cursor: "default" }}>
                        <span style={{ fontSize: "1rem" }}>▲</span>
                        <span style={{ fontSize: "1.25rem", fontWeight: 800 }}>{voteCount}</span>
                        <span style={{ fontSize: "0.625rem", color: "var(--muted)" }}>Stimmen</span>
                    </div>

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
                            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                                {request.title}
                            </h1>
                            <span className={`badge ${typeConfig[request.type]?.class || ""}`}>
                                {typeConfig[request.type]?.label || request.type}
                            </span>
                            {request.status && (
                                <span className={`badge ${statusConfig[request.status]?.class || ""}`}>
                                    {statusConfig[request.status]?.label || request.status}
                                </span>
                            )}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                fontSize: "0.8125rem",
                                color: "var(--muted)",
                            }}
                        >
                            <span>von {request.createdBy.email.split("@")[0]}</span>
                            <span>·</span>
                            <span>{new Date(request.createdAt).toLocaleDateString("de-DE")}</span>
                            {request.tags && (
                                <>
                                    <span>·</span>
                                    <span>
                                        {request.tags.split(",").map((t) => (
                                            <span key={t} style={{ marginRight: "0.375rem" }}>
                                                #{t.trim()}
                                            </span>
                                        ))}
                                    </span>
                                </>
                            )}
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
                            padding: "0.375rem 0.75rem",
                            background: "var(--accent-bg)",
                            borderRadius: "8px",
                            fontSize: "0.8125rem",
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
            <CommentSection requestId={id} currentUser={currentUser} />
        </div>
    );
}
