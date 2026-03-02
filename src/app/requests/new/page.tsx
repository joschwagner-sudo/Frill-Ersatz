"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = new FormData(e.currentTarget);

        // For MVP: get userId from session
        let userId = "";
        try {
            const sessionRes = await fetch("/api/auth/session");
            const sessionData = await sessionRes.json();
            if (sessionData.user?.userId) {
                userId = sessionData.user.userId;
            } else {
                alert("Please sign in to submit a request.");
                router.push("/login");
                return;
            }
        } catch {
            alert("Please sign in first.");
            router.push("/login");
            return;
        }

        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.get("title"),
                    description: form.get("description"),
                    type: form.get("type"),
                    tags: form.get("tags"),
                    userId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/requests/${data.id}`);
            } else if (res.status === 429) {
                alert("Rate limit: You can only submit 3 requests per day.");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to submit request");
            }
        } catch {
            alert("Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-in" style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    New Feature Request
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    Share your idea or report a bug
                </p>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Type */}
                    <div>
                        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                            Type
                        </label>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {["FEATURE", "BUG"].map((t) => (
                                <label
                                    key={t}
                                    style={{
                                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                        gap: "0.375rem", padding: "0.5rem", border: "1px solid var(--input-border)",
                                        borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500,
                                    }}
                                >
                                    <input type="radio" name="type" value={t} defaultChecked={t === "FEATURE"}
                                        style={{ accentColor: "var(--color-primary-600)" }} />
                                    {t === "FEATURE" ? "💡 Feature" : "🐛 Bug"}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label htmlFor="title" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                            Title <span style={{ fontWeight: 400, color: "var(--muted)" }}>(max 80 chars)</span>
                        </label>
                        <input id="title" name="title" type="text" required maxLength={80} placeholder="Brief summary..." className="input" />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                            Description <span style={{ fontWeight: 400, color: "var(--muted)" }}>(supports Markdown)</span>
                        </label>
                        <textarea id="description" name="description" required rows={6} placeholder="Describe your idea or the bug in detail..."
                            className="input" style={{ resize: "vertical" }} />
                    </div>

                    {/* Tags */}
                    <div>
                        <label htmlFor="tags" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                            Tags <span style={{ fontWeight: 400, color: "var(--muted)" }}>(comma separated, optional)</span>
                        </label>
                        <input id="tags" name="tags" type="text" placeholder="ui, performance, api" className="input" />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>
        </div>
    );
}
