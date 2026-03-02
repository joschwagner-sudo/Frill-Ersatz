"use client";

import { useState, useEffect } from "react";
import Markdown from "@/components/Markdown";

type Comment = {
    id: string;
    body: string;
    createdAt: string;
    user: { email: string };
};

export default function CommentSection({
    requestId,
    currentUser,
}: {
    requestId: string;
    currentUser: { id: string; email: string } | null;
}) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetch(`/api/requests/${requestId}/comments`)
            .then((res) => res.json())
            .then((data) => {
                setComments(data);
                setFetching(false);
            });
    }, [requestId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/requests/${requestId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: newComment, userId: currentUser.id }),
            });

            if (res.ok) {
                const comment = await res.json();
                setComments((prev) => [...prev, comment]);
                setNewComment("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
                Comments ({comments.length})
            </h3>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                {fetching ? (
                    <div className="pulse-subtle" style={{ color: "var(--muted)" }}>Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>No comments yet. Be the first to start the discussion!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="card" style={{ padding: "0.75rem 1rem", background: "var(--accent-bg)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.75rem" }}>
                                <span style={{ fontWeight: 600, color: "var(--color-primary-600)" }}>
                                    {comment.user.email.split("@")[0]}
                                </span>
                                <span style={{ color: "var(--muted)" }}>
                                    {new Date(comment.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                                {/* We use a simple div here because Markdown component is server-side. 
                    For a client component, we'd need a client version of Markdown or just plain text.
                    For this prototype, let's stick to plain text for client comments to keep it simple,
                    OR we just wrap it in a div if it's already safe. */}
                                {comment.body}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="card" style={{ padding: "1rem" }}>
                    <textarea
                        className="input"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        style={{ width: "100%", marginBottom: "0.75rem", resize: "none" }}
                        disabled={loading}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className="btn-primary" type="submit" disabled={loading || !newComment.trim()}>
                            {loading ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="card" style={{ padding: "1rem", textAlign: "center", background: "var(--accent-bg)" }}>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                        Sign in to join the discussion.
                    </p>
                    <a href="/login" className="btn-secondary" style={{ textDecoration: "none" }}>Sign In</a>
                </div>
            )}
        </div>
    );
}
