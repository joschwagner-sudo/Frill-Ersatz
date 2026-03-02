"use client";

import { useState } from "react";

export default function ReportPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const data = {
            type: form.get("type"),
            title: form.get("title"),
            description: form.get("description"),
            pageUrl: form.get("pageUrl") || undefined,
            userEmail: form.get("userEmail"),
        };

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setSubmitted(true);
            } else {
                alert("Failed to submit report. Please try again.");
            }
        } catch {
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div
                className="animate-in"
                style={{
                    maxWidth: "480px",
                    margin: "4rem auto",
                    textAlign: "center",
                }}
            >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Report submitted!
                </h1>
                <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
                    Thank you for your feedback. We&apos;ll look into it.
                </p>
                <button className="btn-secondary" onClick={() => setSubmitted(false)}>
                    Submit another
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in" style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Report an Issue
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    Found a bug or have a feature idea? Let us know.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Type */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                marginBottom: "0.375rem",
                            }}
                        >
                            Type
                        </label>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {["BUG", "FEATURE"].map((t) => (
                                <label
                                    key={t}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.375rem",
                                        padding: "0.5rem",
                                        border: "1px solid var(--input-border)",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={t}
                                        defaultChecked={t === "BUG"}
                                        style={{ accentColor: "var(--color-primary-600)" }}
                                    />
                                    {t === "BUG" ? "🐛 Bug" : "💡 Feature"}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="userEmail"
                            style={{
                                display: "block",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                marginBottom: "0.375rem",
                            }}
                        >
                            Your Email
                        </label>
                        <input
                            id="userEmail"
                            name="userEmail"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="input"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            style={{
                                display: "block",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                marginBottom: "0.375rem",
                            }}
                        >
                            Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            maxLength={80}
                            placeholder="Brief summary..."
                            className="input"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            style={{
                                display: "block",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                marginBottom: "0.375rem",
                            }}
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={5}
                            placeholder="Describe the issue or feature idea in detail..."
                            className="input"
                            style={{ resize: "vertical" }}
                        />
                    </div>

                    {/* URL */}
                    <div>
                        <label
                            htmlFor="pageUrl"
                            style={{
                                display: "block",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                marginBottom: "0.375rem",
                            }}
                        >
                            Page URL <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
                        </label>
                        <input
                            id="pageUrl"
                            name="pageUrl"
                            type="url"
                            placeholder="https://..."
                            className="input"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Report"}
                    </button>
                </div>
            </form>
        </div>
    );
}
