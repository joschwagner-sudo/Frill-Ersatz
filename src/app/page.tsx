import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
      </div>

      {/* Two Cards: Ideen + Probleme */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          margin: "2rem 0",
        }}
      >
        <Link
          href="/requests"
          className="card"
          style={{
            padding: "2rem 1.5rem",
            textDecoration: "none",
            color: "var(--foreground)",
            display: "block",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💡</div>
          <div style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.5rem" }}>Ideen</div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Eigene Ideen einreichen oder für bestehende Vorschläge abstimmen
          </div>
        </Link>

        <Link
          href="/report"
          className="card"
          style={{
            padding: "2rem 1.5rem",
            textDecoration: "none",
            color: "var(--foreground)",
            display: "block",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}></div>
          <div style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.5rem" }}>Probleme</div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Bug gefunden? Melde dein Problem und wir helfen dir weiter
          </div>
        </Link>
      </div>
    </div>
  );
}
