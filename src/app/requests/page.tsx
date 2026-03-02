import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; class: string }> = {
    UNDER_REVIEW: { label: "Under Review", class: "badge-review" },
    PLANNED: { label: "Planned", class: "badge-planned" },
    IN_PROGRESS: { label: "In Progress", class: "badge-progress" },
    DONE: { label: "Done", class: "badge-done" },
    NOT_PLANNED: { label: "Not Planned", class: "badge-rejected" },
};

const typeConfig: Record<string, { label: string; class: string }> = {
    FEATURE: { label: "Feature", class: "badge-feature" },
    BUG: { label: "Bug", class: "badge-bug" },
};

export default async function RequestsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; type?: string; sort?: string; q?: string }>;
}) {
    const params = await searchParams;
    const { status, type, sort, q } = params;

    // Build filters
    const where: Record<string, unknown> = { archived: false };
    if (status && status !== "all") where.status = status;
    if (type && type !== "all") where.type = type;
    if (q) {
        where.OR = [
            { title: { contains: q } },
            { description: { contains: q } },
        ];
    }

    const requests = await prisma.featureRequest.findMany({
        where,
        include: {
            createdBy: { select: { email: true } },
            _count: { select: { votes: true } },
        },
        orderBy:
            sort === "votes"
                ? { votes: { _count: "desc" } }
                : sort === "oldest"
                    ? { createdAt: "asc" }
                    : { createdAt: "desc" },
    });

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
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                        Feature Requests
                    </h1>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                        {requests.length} request{requests.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link href="/requests/new" className="btn-primary">
                    + New Request
                </Link>
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
                <form style={{ flex: "1 1 200px" }}>
                    <input
                        type="text"
                        name="q"
                        placeholder="Search requests..."
                        defaultValue={q}
                        className="input"
                    />
                    {status && <input type="hidden" name="status" value={status} />}
                    {type && <input type="hidden" name="type" value={type} />}
                    {sort && <input type="hidden" name="sort" value={sort} />}
                </form>

                {/* Status filter */}
                <div style={{ display: "flex", gap: "0.25rem" }}>
                    {["all", "UNDER_REVIEW", "PLANNED", "IN_PROGRESS", "DONE"].map((s) => (
                        <Link
                            key={s}
                            href={`/requests?status=${s}${type ? `&type=${type}` : ""}${sort ? `&sort=${sort}` : ""}${q ? `&q=${q}` : ""}`}
                            className={`btn-ghost ${(!status && s === "all") || status === s ? "active" : ""}`}
                            style={{
                                fontSize: "0.75rem",
                                padding: "0.375rem 0.625rem",
                                ...((!status && s === "all") || status === s
                                    ? { background: "var(--accent-bg)", color: "var(--color-primary-600)" }
                                    : {}),
                            }}
                        >
                            {s === "all" ? "All" : statusConfig[s]?.label || s}
                        </Link>
                    ))}
                </div>

                {/* Sort */}
                <div style={{ display: "flex", gap: "0.25rem" }}>
                    {[
                        { value: "newest", label: "Newest" },
                        { value: "votes", label: "Top Voted" },
                    ].map((s) => (
                        <Link
                            key={s.value}
                            href={`/requests?sort=${s.value}${status ? `&status=${status}` : ""}${type ? `&type=${type}` : ""}${q ? `&q=${q}` : ""}`}
                            className={`btn-ghost ${(!sort && s.value === "newest") || sort === s.value ? "active" : ""}`}
                            style={{
                                fontSize: "0.75rem",
                                padding: "0.375rem 0.625rem",
                                ...((!sort && s.value === "newest") || sort === s.value
                                    ? { background: "var(--accent-bg)", color: "var(--color-primary-600)" }
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
                {requests.length === 0 ? (
                    <div
                        className="card"
                        style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}
                    >
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
                        <p>No requests found</p>
                    </div>
                ) : (
                    requests.map((req) => (
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
                            <div className="vote-btn" style={{ pointerEvents: "none" }}>
                                <span style={{ fontSize: "0.875rem" }}>▲</span>
                                <span style={{ fontSize: "1rem", fontWeight: 700 }}>{req._count.votes}</span>
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
                                    <h3 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{req.title}</h3>
                                    <span className={`badge ${typeConfig[req.type]?.class || ""}`}>
                                        {typeConfig[req.type]?.label || req.type}
                                    </span>
                                    <span className={`badge ${statusConfig[req.status]?.class || ""}`}>
                                        {statusConfig[req.status]?.label || req.status}
                                    </span>
                                </div>
                                <p
                                    style={{
                                        fontSize: "0.8125rem",
                                        color: "var(--muted)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {req.description.substring(0, 120)}
                                    {req.description.length > 120 ? "..." : ""}
                                </p>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "0.75rem",
                                        marginTop: "0.5rem",
                                        fontSize: "0.75rem",
                                        color: "var(--muted-foreground)",
                                    }}
                                >
                                    <span>{req.createdBy.email.split("@")[0]}</span>
                                    <span>·</span>
                                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                    {req.tags && (
                                        <>
                                            <span>·</span>
                                            <span>
                                                {req.tags.split(",").map((t) => (
                                                    <span key={t} style={{ marginRight: "0.25rem" }}>
                                                        #{t.trim()}
                                                    </span>
                                                ))}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
