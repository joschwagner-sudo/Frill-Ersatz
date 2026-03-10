"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => setUnreadCount(0));
  }, []);

  return (
    <Link
      href="/account/notifications"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem",
        borderRadius: "8px",
        transition: "background 0.2s",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--hover-bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: "1.25rem" }}>🔔</span>
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "0.25rem",
            right: "0.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "1.125rem",
            height: "1.125rem",
            padding: "0 0.25rem",
            background: "#ef4444",
            color: "white",
            fontSize: "0.625rem",
            fontWeight: 700,
            borderRadius: "9999px",
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
