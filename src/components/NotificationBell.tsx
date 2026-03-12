"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => setUnreadCount(0));
  };

  useEffect(() => {
    fetchUnreadCount();

    // Listen for custom event when notifications are marked as read
    const handleNotificationsRead = () => {
      setUnreadCount(0);
    };

    window.addEventListener("notifications-read", handleNotificationsRead);

    return () => {
      window.removeEventListener("notifications-read", handleNotificationsRead);
    };
  }, []);

  return (
    <Link
      href="/notifications"
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
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
