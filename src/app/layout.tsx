import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Copilot — Feedback & Roadmap",
  description:
    "Feature-Vorschläge einreichen, abstimmen und unsere Roadmap verfolgen.",
};

const navItems = [
  { href: "/requests", label: "Ideen", icon: "💡" },
  { href: "/roadmap", label: "Roadmap", icon: "🗺️" },
  { href: "/announcements", label: "Neuigkeiten", icon: "📣" },
];

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getCurrentUser();

  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        {/* ─── Top Navigation ─── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "var(--nav-bg)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--card-border)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "4rem",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                textDecoration: "none",
                color: "var(--foreground)",
                fontWeight: 700,
                fontSize: "1.125rem",
                letterSpacing: "-0.02em",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="24" height="24" rx="6" fill="#1a56db" />
                <path
                  d="M7 12.5C7 9.46 9.46 7 12.5 7H14V9.5H12.5C10.84 9.5 9.5 10.84 9.5 12.5C9.5 14.16 10.84 15.5 12.5 15.5H14V13H16.5V18H12.5C9.46 18 7 15.54 7 12.5Z"
                  fill="white"
                />
              </svg>
              Copilot
            </Link>

            {/* Nav Links */}
            <nav style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}

              {/* Bug Report Link */}
              <Link
                href="/report"
                className="nav-link"
                style={{
                  marginLeft: "0.5rem",
                  paddingLeft: "0.875rem",
                  borderLeft: "1px solid var(--card-border)",
                }}
              >
                <span>🐛</span>
                <span className="hidden sm:inline">Bug melden</span>
              </Link>
            </nav>

            {/* Account / Login */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {userId ? (
                <Link
                  href="/account"
                  className="btn-secondary"
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">Mein Bereich</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn-primary"
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  Anmelden
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2.5rem 1.5rem",
            minHeight: "calc(100vh - 4rem)",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
