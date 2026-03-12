"use client";

import Link from "next/link";
import NotificationBell from "./NotificationBell";

export default function UserNav({ hasUser }: { hasUser: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {hasUser ? (
        <>
          <NotificationBell />
          <Link
            href="/account"
            className="btn-secondary"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="hidden sm:inline">Mein Bereich</span>
          </Link>
        </>
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
  );
}
