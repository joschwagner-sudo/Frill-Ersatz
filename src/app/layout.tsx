import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import UserNav from "@/components/UserNav";
import Logo from "@/components/Logo";
import { getCurrentUser } from "@/lib/session";
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
  { href: "/requests", label: "Ideen", icon: "" },
  { href: "/report", label: "Probleme", icon: "" },
  { href: "/roadmap", label: "Roadmap", icon: "" },
  { href: "/announcements", label: "Neuigkeiten", icon: "" },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.userId || null;
  const isAdmin = currentUser?.isAdmin || false;

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
            <Logo />

            {/* Nav Links */}
            <nav style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="nav-link" style={{ fontWeight: 600, color: "var(--color-primary-600)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
            </nav>

            {/* Account / Login */}
            <UserNav hasUser={!!userId} />
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
