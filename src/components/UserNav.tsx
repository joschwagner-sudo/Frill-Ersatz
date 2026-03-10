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
            <span>👤</span>
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
