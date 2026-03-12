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
                  <span>⚙️</span>
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
