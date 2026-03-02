import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session?.value) return null;
    try {
        return JSON.parse(Buffer.from(session.value, "base64").toString("utf-8"));
    } catch {
        return null;
    }
}

export default async function AdminPage() {
    const session = await getSession();
    if (!session?.isAdmin) redirect("/login");

    const [
        pendingRequests,
        failedReports,
        draftAnnouncements,
        recentRequests,
        userCount,
    ] = await Promise.all([
        prisma.featureRequest.count({ where: { status: "UNDER_REVIEW" } }),
        prisma.reportToIntercom.count({ where: { intercomDeliveryStatus: "FAILED" } }),
        prisma.announcement.count({ where: { publishedAt: null } }),
        prisma.featureRequest.findMany({
            where: { archived: false },
            include: { createdBy: { select: { email: true } }, _count: { select: { votes: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
        }),
        prisma.user.count(),
    ]);

    return (
        <div className="animate-in">
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Admin Dashboard
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    Manage requests, announcements, and reports
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { label: "Pending Review", value: pendingRequests, color: "var(--color-status-review)" },
                    { label: "Failed Reports", value: failedReports, color: "var(--color-error)" },
                    { label: "Draft Announcements", value: draftAnnouncements, color: "var(--color-info)" },
                    { label: "Total Users", value: userCount, color: "var(--color-success)" },
                ].map((stat) => (
                    <div key={stat.label} className="card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Requests */}
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
                Recent Requests
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {recentRequests.map((req) => (
                    <div key={req.id} className="card" style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{req.title}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                                {req.createdBy.email} · {req.status} · {req._count.votes} votes
                            </div>
                        </div>
                        <Link href={`/requests/${req.id}`} className="btn-ghost" style={{ fontSize: "0.75rem" }}>
                            View →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
