import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import MarkAllReadButton from "@/components/MarkAllReadButton";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="animate-in" style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          🔔 Benachrichtigungen
        </h1>
        {notifications.some((n) => !n.read) && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
          <p>Keine Benachrichtigungen</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                padding: "1rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                opacity: notif.read ? 0.6 : 1,
                background: notif.read ? "var(--card-bg)" : "var(--accent-bg)",
              }}
            >
              <div style={{ fontSize: "1.5rem" }}>
                {notif.type === "IDEA_APPROVED" && "✅"}
                {notif.type === "IDEA_COMMENTED" && "💬"}
                {notif.type === "IDEA_REJECTED" && "❌"}
                {notif.type === "ANNOUNCEMENT" && "📣"}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>{notif.message}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {new Date(notif.createdAt).toLocaleString("de-DE")}
                </p>
                {notif.ideaId && (
                  <Link
                    href={`/requests/${notif.ideaId}`}
                    style={{ fontSize: "0.75rem", color: "var(--color-primary-600)", marginTop: "0.5rem", display: "inline-block" }}
                  >
                    Idee ansehen →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
