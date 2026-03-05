import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; color: string }> = {
    UNDER_REVIEW: { label: "Wird geprüft", color: "var(--color-status-review)" },
    PLANNED: { label: "Geplant", color: "var(--color-status-planned)" },
    IN_PROGRESS: { label: "In Arbeit", color: "var(--color-status-progress)" },
    DONE: { label: "Umgesetzt", color: "var(--color-status-done)" },
    NOT_PLANNED: { label: "Nicht geplant", color: "var(--color-status-rejected)" },
};

export default async function RoadmapPage() {
    const roadmapItems = await prisma.roadmapItem.findMany({
        include: {
            featureRequest: {
                include: {
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
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Roadmap
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    Woran wir arbeiten und was als Nächstes kommt
                </p>
            </div>

            {sortedQuarters.length === 0 ? (
                <div
                    className="card"
                    style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}
                >
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🗺️</div>
                    <p>Noch keine Roadmap-Einträge</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
                                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{quarter}</h2>
                                    <span
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "var(--muted)",
                                            padding: "0.125rem 0.5rem",
                                            background: "var(--hover-bg)",
                                            borderRadius: "9999px",
                                        }}
                                    >
                                        {doneCount} / {items.length} umgesetzt
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div
                                    style={{
                                        height: "4px",
                                        background: "var(--card-border)",
                                        borderRadius: "2px",
                                        marginBottom: "1rem",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "100%",
                                            width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%`,
                                            background: "var(--color-status-done)",
                                            borderRadius: "2px",
                                            transition: "width 0.3s ease",
                                        }}
                                    />
                                </div>

                                {/* Items */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {items.map((item) => {
                                        const req = item.featureRequest;
                                        const statusInfo = statusConfig[req.status] || {
                                            label: req.status,
                                            color: "var(--muted)",
                                        };

                                        return (
                                            <div
                                                key={item.id}
                                                className="card"
                                                style={{
                                                    padding: "1rem 1.25rem",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "1rem",
                                                    borderLeft: `3px solid ${statusInfo.color}`,
                                                }}
                                            >
                                                {/* Priority */}
                                                <div
                                                    style={{
                                                        width: "1.75rem",
                                                        height: "1.75rem",
                                                        borderRadius: "50%",
                                                        background: "var(--hover-bg)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        color: "var(--muted)",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {item.priority}
                                                </div>

                                                {/* Content */}
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{req.title}</h3>
                                                    <p
                                                        style={{
                                                            fontSize: "0.8125rem",
                                                            color: "var(--muted)",
                                                            marginTop: "0.25rem",
                                                        }}
                                                    >
                                                        {req.description.substring(0, 100)}
                                                        {req.description.length > 100 ? "..." : ""}
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
                                                    <span
                                                        className={`badge ${req.status === "DONE" ? "badge-done" : req.status === "IN_PROGRESS" ? "badge-progress" : req.status === "PLANNED" ? "badge-planned" : "badge-review"}`}
                                                    >
                                                        {statusInfo.label}
                                                    </span>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "0.25rem",
                                                            fontSize: "0.8125rem",
                                                            color: "var(--muted)",
                                                        }}
                                                    >
                                                        <span>▲</span>
                                                        <span style={{ fontWeight: 600 }}>{req._count.votes}</span>
                                                    </div>
                                                </div>
                                            </div>
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
