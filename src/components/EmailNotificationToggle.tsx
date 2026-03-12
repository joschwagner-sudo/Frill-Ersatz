"use client";

import { useState } from "react";

export default function EmailNotificationToggle({
  initialValue,
  userId,
}: {
  initialValue: boolean;
  userId: string;
}) {
  const [enabled, setEnabled] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);
    const newValue = !enabled;
    setEnabled(newValue);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications: newValue,
          userId,
        }),
      });

      if (!res.ok) {
        // Revert on error
        setEnabled(!newValue);
        alert("Fehler beim Speichern");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      setEnabled(!newValue);
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "3rem",
          height: "1.5rem",
          background: enabled ? "var(--color-primary-600)" : "#d1d5db",
          borderRadius: "9999px",
          transition: "background 0.2s",
          opacity: saving ? 0.6 : 1,
        }}
      >
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          disabled={saving}
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0.125rem",
            left: enabled ? "1.625rem" : "0.125rem",
            width: "1.25rem",
            height: "1.25rem",
            background: "white",
            borderRadius: "9999px",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        />
      </div>
      <div>
        <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
          E-Mail Benachrichtigungen
        </div>
      </div>
    </label>
  );
}
