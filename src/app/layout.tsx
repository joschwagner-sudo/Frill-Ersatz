import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frill Ersatz — Feature Requests & Roadmap",
  description: "Submit feature requests, vote on ideas, and track our product roadmap.",
};

const navItems = [
  { href: "/requests", label: "Requests", icon: "💡" },
  { href: "/roadmap", label: "Roadmap", icon: "🗺️" },
  { href: "/announcements", label: "Changelog", icon: "📣" },
  { href: "/report", label: "Report", icon: "🐛" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
              height: "3.5rem",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                color: "var(--foreground)",
                fontWeight: 700,
                fontSize: "1.125rem",
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>✦</span>
              Feedback Hub
            </Link>

            {/* Nav Links */}
            <nav style={{ display: "flex", gap: "0.25rem" }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link"
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Auth placeholder */}
            <Link href="/login" className="btn-primary" style={{ fontSize: "0.8125rem" }}>
              Sign In
            </Link>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem 1.5rem",
            minHeight: "calc(100vh - 3.5rem)",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
