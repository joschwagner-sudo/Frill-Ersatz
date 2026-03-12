"use client";

import { useState, useEffect } from "react";

type Reaction = {
    emoji: string;
    user: { id: string };
};

type Comment = {
    id: string;
    body: string;
    isOfficial: boolean;
    parentId?: string | null;
    createdAt: string;
    user: { email: string; isAdmin: boolean };
    reactions: Reaction[];
    replies?: Comment[];
};

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "🤔", "👀"];

function CommentCard({
    comment,
    requestId,
    currentUser,
    onReply,
    isReply = false,
}: {
    comment: Comment;
    requestId: string;
    currentUser: { id: string; email: string } | null;
    onReply: (parentId: string) => void;
    isReply?: boolean;
}) {
    const [reactions, setReactions] = useState<Reaction[]>(comment.reactions || []);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleReact = async (emoji: string) => {
        if (!currentUser) return;
        try {
            const res = await fetch(`/api/requests/${requestId}/comments/${comment.id}/react`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emoji }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.action === "added") {
                    setReactions((prev) => [...prev, { emoji, user: { id: currentUser.id } }]);
                } else {
                    setReactions((prev) =>
                        prev.filter((r) => !(r.emoji === emoji && r.user.id === currentUser.id))
                    );
                }
            }
        } catch (err) {
            console.error(err);
        }
        setShowEmojiPicker(false);
    };

    // Group reactions by emoji
    const reactionCounts = reactions.reduce<Record<string, { count: number; hasOwn: boolean }>>((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasOwn: false };
        acc[r.emoji].count++;
        if (currentUser && r.user.id === currentUser.id) acc[r.emoji].hasOwn = true;
        return acc;
    }, {});

    return (
        <div
            style={{
                padding: "0.75rem 1rem",
                background: comment.isOfficial ? "#eff6ff" : "var(--accent-bg)",
                borderLeft: comment.isOfficial ? "4px solid var(--color-primary-600)" : "none",
                borderRadius: isReply ? "6px" : "12px",
                border: isReply ? "none" : "1px solid var(--card-border)",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.75rem", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--color-primary-600)" }}>
                        {comment.user.email.split("@")[0]}
                    </span>
                    {comment.isOfficial && (
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                background: "var(--color-primary-600)",
                                color: "white",
                                padding: "0.125rem 0.5rem",
                                borderRadius: "9999px",
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                            }}
                        >
                            ⭐ Finanzfluss Team
                        </span>
                    )}
                </div>
                <span style={{ color: "var(--muted)" }}>
                    {new Date(comment.createdAt).toLocaleDateString("de-DE")}
                </span>
            </div>
            <div style={{ fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                {comment.body}
            </div>

            {/* Reactions + Reply button */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                {Object.entries(reactionCounts).map(([emoji, { count, hasOwn }]) => (
                    <button
                        key={emoji}
                        onClick={() => handleReact(emoji)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "9999px",
                            border: hasOwn ? "1px solid var(--color-primary-500)" : "1px solid var(--card-border)",
                            background: hasOwn ? "#dbeafe" : "var(--card-bg)",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            transition: "all 0.15s",
                        }}
                    >
                        {emoji} {count}
                    </button>
                ))}
                {currentUser && (
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            style={{
                                padding: "0.125rem 0.375rem",
                                borderRadius: "9999px",
                                border: "1px dashed var(--card-border)",
                                background: "transparent",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                color: "var(--muted)",
                            }}
                        >
                            +😊
                        </button>
                        {showEmojiPicker && (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "100%",
                                    left: 0,
                                    background: "var(--card-bg)",
                                    border: "1px solid var(--card-border)",
                                    borderRadius: "8px",
                                    padding: "0.375rem",
                                    display: "flex",
                                    gap: "0.25rem",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    zIndex: 10,
                                }}
                            >
                                {REACTION_EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReact(emoji)}
                                        style={{
                                            padding: "0.25rem",
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",
                                            fontSize: "1.125rem",
                                            borderRadius: "4px",
                                            transition: "background 0.1s",
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {currentUser && !isReply && (
                    <button
                        onClick={() => onReply(comment.id)}
                        style={{
                            padding: "0.125rem 0.5rem",
                            border: "none",
                            background: "transparent",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            color: "var(--muted)",
                            fontWeight: 500,
                        }}
                    >
                        ↩ Antworten
                    </button>
                )}
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginTop: "0.75rem", marginLeft: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "2px solid var(--card-border)", paddingLeft: "0.75rem" }}>
                    {comment.replies.map((reply) => (
                        <CommentCard
                            key={reply.id}
                            comment={reply}
                            requestId={requestId}
                            currentUser={currentUser}
                            onReply={onReply}
                            isReply
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CommentSection({
    requestId,
    currentUser,
    mergedFrom,
}: {
    requestId: string;
    currentUser: { id: string; email: string } | null;
    mergedFrom?: { id: string; number: number; title: string }[];
}) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyToId, setReplyToId] = useState<string | null>(null);
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
                body: JSON.stringify({
                    body: newComment,
                    userId: currentUser.id,
                    parentId: replyToId || undefined,
                }),
            });

            if (res.ok) {
                const comment = await res.json();
                if (replyToId) {
                    // Add reply to parent
                    setComments((prev) =>
                        prev.map((c) =>
                            c.id === replyToId
                                ? { ...c, replies: [...(c.replies || []), comment] }
                                : c
                        )
                    );
                } else {
                    setComments((prev) => [...prev, { ...comment, replies: [] }]);
                }
                setNewComment("");
                setReplyToId(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (parentId: string) => {
        setReplyToId(parentId);
        // Focus the textarea
        const textarea = document.getElementById("comment-input") as HTMLTextAreaElement;
        if (textarea) textarea.focus();
    };

    const replyToComment = replyToId ? comments.find((c) => c.id === replyToId) : null;

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
                Kommentare ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
            </h3>

            {/* Merged ideas notice */}
            {mergedFrom && mergedFrom.length > 0 && (
                <div
                    style={{
                        padding: "0.75rem 1rem",
                        background: "#dbeafe",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                        fontSize: "0.8125rem",
                        color: "var(--color-primary-600)",
                    }}
                >
                    <span style={{ fontWeight: 600 }}>🔀 Zusammengeführte Ideen:</span>{" "}
                    {mergedFrom.map((m, i) => (
                        <span key={m.id}>
                            {i > 0 && ", "}
                            <a href={`/requests/${m.id}`} style={{ color: "var(--color-primary-600)", textDecoration: "underline" }}>
                                #{m.number} {m.title}
                            </a>
                        </span>
                    ))}
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                {fetching ? (
                    <div className="pulse-subtle" style={{ color: "var(--muted)" }}>Kommentare werden geladen...</div>
                ) : comments.length === 0 ? (
                    <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Noch keine Kommentare. Starte die Diskussion!</div>
                ) : (
                    comments.map((comment) => (
                        <CommentCard
                            key={comment.id}
                            comment={comment}
                            requestId={requestId}
                            currentUser={currentUser}
                            onReply={handleReply}
                        />
                    ))
                )}
            </div>

            {currentUser ? (
                <form onSubmit={handleSubmit} className="card" style={{ padding: "1rem" }}>
                    {replyToId && replyToComment && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.5rem 0.75rem",
                            background: "var(--accent-bg)",
                            borderRadius: "6px",
                            marginBottom: "0.75rem",
                            fontSize: "0.8125rem",
                        }}>
                            <span style={{ color: "var(--muted)" }}>
                                ↩ Antwort auf <strong>{replyToComment.user.email.split("@")[0]}</strong>
                            </span>
                            <button
                                type="button"
                                onClick={() => setReplyToId(null)}
                                style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)", fontSize: "0.875rem" }}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <textarea
                        id="comment-input"
                        className="input"
                        placeholder={replyToId ? "Antwort schreiben..." : "Kommentar schreiben..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        style={{ width: "100%", marginBottom: "0.75rem", resize: "none" }}
                        disabled={loading}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className="btn-primary" type="submit" disabled={loading || !newComment.trim()}>
                            {loading ? "Wird gesendet..." : replyToId ? "Antwort senden" : "Kommentar senden"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="card" style={{ padding: "1rem", textAlign: "center", background: "var(--accent-bg)" }}>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                        Melde dich an, um mitzudiskutieren.
                    </p>
                    <a href="/login" className="btn-secondary" style={{ textDecoration: "none" }}>Anmelden</a>
                </div>
            )}
        </div>
    );
}
