"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface ReactionButtonsProps {
  announcementId: string;
  initialReactions: Reaction[];
  userId: string | null;
}

const SUPPORTED_EMOJIS = ["🔥", "❤️", "👍"];

export default function ReactionButtons({
  announcementId,
  initialReactions,
  userId,
}: ReactionButtonsProps) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const router = useRouter();

  const handleReaction = async (emoji: string) => {
    if (!userId) {
      router.push("/login");
      return;
    }

    const existing = reactions.find((r) => r.emoji === emoji);
    const wasReacted = existing?.hasReacted || false;

    // Optimistic update
    setReactions((prev) =>
      prev.map((r) =>
        r.emoji === emoji
          ? {
              ...r,
              count: wasReacted ? r.count - 1 : r.count + 1,
              hasReacted: !wasReacted,
            }
          : r
      )
    );

    try {
      const response = await fetch(
        `/api/announcements/${announcementId}/react`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
        }
      );

      if (!response.ok) {
        // Rollback on error
        setReactions((prev) =>
          prev.map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: wasReacted ? r.count + 1 : r.count - 1,
                  hasReacted: wasReacted,
                }
              : r
          )
        );

        if (response.status === 401) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Reaction error:", error);
      // Rollback on error
      setReactions((prev) =>
        prev.map((r) =>
          r.emoji === emoji
            ? {
                ...r,
                count: wasReacted ? r.count + 1 : r.count - 1,
                hasReacted: wasReacted,
              }
            : r
        )
      );
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReaction(reaction.emoji)}
          className={`reaction-btn ${reaction.hasReacted ? "reacted" : ""}`}
          aria-label={`React with ${reaction.emoji}`}
        >
          <span style={{ fontSize: "1rem" }}>{reaction.emoji}</span>
          {reaction.count > 0 && (
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {reaction.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
