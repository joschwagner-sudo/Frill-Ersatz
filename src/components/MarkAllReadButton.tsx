"use client";

import { useRouter } from "next/navigation";

export default function MarkAllReadButton() {
  const router = useRouter();

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        // Dispatch custom event to update NotificationBell
        window.dispatchEvent(new CustomEvent("notifications-read"));
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  return (
    <button onClick={handleMarkAllRead} className="btn-secondary" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
      Alle als gelesen markieren
    </button>
  );
}
