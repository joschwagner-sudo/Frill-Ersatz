"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface VoteButtonProps {
  requestId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  userId: string | null;
}

export default function VoteButton({
  requestId,
  initialVoteCount,
  initialHasVoted,
  userId,
}: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleVote = async () => {
    // Redirect to login if not authenticated
    if (!userId) {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    // Optimistic update
    const newHasVoted = !hasVoted;
    setHasVoted(newHasVoted);
    setVoteCount((prev) => (newHasVoted ? prev + 1 : prev - 1));

    try {
      const response = await fetch(`/api/requests/${requestId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        // Rollback on error
        setHasVoted(!newHasVoted);
        setVoteCount((prev) => (newHasVoted ? prev - 1 : prev + 1));
        
        if (response.status === 401) {
          router.push("/login");
        }
      } else {
        const data = await response.json();
        // Update with server response
        setVoteCount(data.voteCount);
        setHasVoted(data.hasVoted);
      }
    } catch (error) {
      console.error("Vote error:", error);
      // Rollback on error
      setHasVoted(!newHasVoted);
      setVoteCount((prev) => (newHasVoted ? prev - 1 : prev + 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={isLoading}
      className={`vote-btn ${hasVoted ? "voted" : ""}`}
      aria-label={hasVoted ? "Vote entfernen" : "Abstimmen"}
    >
      <span className="vote-icon">{hasVoted ? "▲" : "△"}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
        {voteCount}
      </span>
    </button>
  );
}
