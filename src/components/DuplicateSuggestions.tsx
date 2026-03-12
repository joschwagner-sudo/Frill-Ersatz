"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SimilarIdea = {
  id: string;
  number: number;
  title: string;
  _count: { votes: number };
};

export default function DuplicateSuggestions({ title }: { title: string }) {
  const [suggestions, setSuggestions] = useState<SimilarIdea[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!title || title.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/ideas/search?q=${encodeURIComponent(title)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [title]);

  if (suggestions.length === 0) return null;

  return (
    <div
      style={{
        padding: "0.875rem",
        background: "#fef3c7",
        border: "1px solid #fbbf24",
        borderRadius: "8px",
        marginTop: "0.75rem",
      }}
    >
      <div
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "#92400e",
          marginBottom: "0.5rem",
        }}
      >
        💡 Ähnliche Ideen gefunden!
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {suggestions.map((idea) => (
          <Link
            key={idea.id}
            href={`/requests/${idea.id}`}
            target="_blank"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5rem",
              background: "white",
              borderRadius: "6px",
              textDecoration: "none",
              color: "var(--foreground)",
              fontSize: "0.8125rem",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fef3c7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
            }}
          >
            <span style={{ fontWeight: 500 }}>
              #{idea.number} {idea.title}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--muted)",
                fontWeight: 600,
              }}
            >
              {idea._count.votes} 👍
            </span>
          </Link>
        ))}
      </div>
      <div
        style={{
          fontSize: "0.75rem",
          color: "#92400e",
          marginTop: "0.5rem",
          fontStyle: "italic",
        }}
      >
        Um die Sichtbarkeit zu erhöhen, kann es sich für dich mehr lohnen, einer bestehenden Idee einen Upvote zu geben und ergänzend zu kommentieren, was noch nicht abgedeckt ist.
      </div>
    </div>
  );
}
