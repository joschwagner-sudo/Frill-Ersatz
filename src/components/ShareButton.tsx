"use client";

import { useState } from "react";

export default function ShareButton({ ideaId, title }: { ideaId: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/requests/${ideaId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = (platform: "twitter" | "whatsapp") => {
    const url = `${window.location.origin}/requests/${ideaId}`;
    const text = `${title} — Copilot Feedback`;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    };

    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <button
        onClick={handleCopyLink}
        className="btn-secondary"
        style={{
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
        }}
      >
        {copied ? (
          <>
            <span>✅</span>
            <span>Kopiert!</span>
          </>
        ) : (
          <>
            <span>🔗</span>
            <span>Link kopieren</span>
          </>
        )}
      </button>

      <button
        onClick={() => handleShare("twitter")}
        className="btn-ghost"
        style={{
          padding: "0.5rem",
          fontSize: "1.25rem",
          display: "flex",
          alignItems: "center",
        }}
        title="Auf Twitter teilen"
      >
        𝕏
      </button>

      <button
        onClick={() => handleShare("whatsapp")}
        className="btn-ghost"
        style={{
          padding: "0.5rem",
          fontSize: "1.25rem",
          display: "flex",
          alignItems: "center",
        }}
        title="Auf WhatsApp teilen"
      >
        💬
      </button>
    </div>
  );
}
