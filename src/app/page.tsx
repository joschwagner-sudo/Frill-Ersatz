import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [requestCount, totalVotes, userCount] = await Promise.all([
    prisma.featureRequest.count({ where: { archived: false } }),
    prisma.vote.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="animate-in" style={{ maxWidth: "720px", margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "3rem 0 2rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          Gestalte den Copilot
          <br />
          <span style={{ color: "var(--color-primary-500)" }}>mit</span>
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--muted)",
            maxWidth: "520px",
            margin: "0 auto 2rem",
            lineHeight: 1.6,
          }}
        >
          Hier siehst du, woran wir arbeiten — und kannst mitbestimmen, was als Nächstes kommt.
          Reiche eigene Ideen ein oder stimme für bestehende Vorschläge ab.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Link href="/requests" className="btn-primary" style={{ padding: "0.625rem 1.5rem" }}>
            💡 Ideen ansehen
          </Link>
          <Link href="/roadmap" className="btn-secondary" style={{ padding: "0.625rem 1.5rem" }}>
            🗺️ Roadmap
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          margin: "2rem 0",
        }}
      >
        {[
          { label: "Vorschläge", value: requestCount, icon: "💡" },
          { label: "Abstimmungen", value: totalVotes, icon: "▲" },
          { label: "Mitglieder", value: userCount, icon: "👥" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ padding: "1.25rem", textAlign: "center" }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{stat.icon}</div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--color-primary-600)",
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          margin: "2rem 0",
        }}
      >
        {[
          {
            href: "/announcements",
            icon: "📣",
            title: "Neuigkeiten",
            desc: "Was gibt's Neues und was kommt als Nächstes",
          },
          {
            href: "/report",
            icon: "🛟",
            title: "Problem melden",
            desc: "Bug gefunden? Wir helfen dir weiter",
          },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="card"
            style={{
              padding: "1.25rem",
              textDecoration: "none",
              color: "var(--foreground)",
              display: "block",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{link.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{link.title}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
