"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  ideaId: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load notifications:", error);
        setLoading(false);
      });
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="animate-in" style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Benachrichtigungen
          </h1>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--muted)",
              marginTop: "0.25rem",
            }}
          >
            {unreadCount > 0 ? `${unreadCount} ungelesen` : "Alle gelesen"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-secondary"
            style={{ fontSize: "0.875rem" }}
          >
            Alle als gelesen markieren
          </button>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <div className="pulse-subtle" style={{ color: "var(--muted)" }}>
            Lade Benachrichtigungen...
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
          <p style={{ color: "var(--muted)" }}>Keine Benachrichtigungen</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                padding: "1rem",
                background: notif.read ? "var(--accent-bg)" : "#eff6ff",
                borderLeft: notif.read ? "none" : "4px solid var(--color-primary-600)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {notif.message}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span>
                      {new Date(notif.createdAt).toLocaleString("de-DE")}
                    </span>
                    {notif.ideaId && (
                      <>
                        <span>·</span>
                        <Link
                          href={`/requests/${notif.ideaId}`}
                          style={{
                            color: "var(--color-primary-600)",
                            textDecoration: "underline",
                          }}
                          onClick={() => {
                            if (!notif.read) handleMarkAsRead(notif.id);
                          }}
                        >
                          Idee ansehen
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-primary-600)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--hover-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Als gelesen markieren
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
