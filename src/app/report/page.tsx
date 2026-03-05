"use client";

import { useState } from "react";

const categories = [
    "Kontoverwaltung",
    "Portfolio & Depots",
    "Datenimport",
    "Berechnungen & Auswertungen",
    "Benachrichtigungen",
    "Sonstiges",
];

const helpcenterArticles: Record<string, { title: string; url: string }[]> = {
    "Kontoverwaltung": [
        { title: "Passwort zurücksetzen", url: "#" },
        { title: "E-Mail-Adresse ändern", url: "#" },
        { title: "Konto löschen", url: "#" },
    ],
    "Portfolio & Depots": [
        { title: "Depot verknüpfen", url: "#" },
        { title: "Depot manuell anlegen", url: "#" },
        { title: "Transaktionen importieren", url: "#" },
    ],
    "Datenimport": [
        { title: "CSV-Import Anleitung", url: "#" },
        { title: "Unterstützte Banken & Broker", url: "#" },
        { title: "Importfehler beheben", url: "#" },
    ],
    "Berechnungen & Auswertungen": [
        { title: "Wie wird die Rendite berechnet?", url: "#" },
        { title: "Steuerliche Auswertungen", url: "#" },
    ],
    "Benachrichtigungen": [
        { title: "Push-Benachrichtigungen einrichten", url: "#" },
        { title: "E-Mail-Benachrichtigungen verwalten", url: "#" },
    ],
    "Sonstiges": [
        { title: "Häufig gestellte Fragen", url: "#" },
    ],
};

type Step = "category" | "articles" | "contact" | "submitted";

export default function ReportPage() {
    const [step, setStep] = useState<Step>("category");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const data = {
            type: "BUG",
            title: form.get("title"),
            description: `[${category}] ${form.get("description")}`,
            pageUrl: form.get("pageUrl") || undefined,
        };

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setStep("submitted");
            } else {
                alert("Fehler beim Senden. Bitte versuche es erneut.");
            }
        } catch {
            alert("Netzwerkfehler. Bitte versuche es erneut.");
        } finally {
            setLoading(false);
        }
    }

    if (step === "submitted") {
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
                    Nachricht gesendet!
                </h1>
                <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
                    Danke für deine Meldung. Unser Support-Team kümmert sich darum.
                </p>
                <button
                    className="btn-secondary"
                    onClick={() => {
                        setStep("category");
                        setCategory("");
                    }}
                >
                    Weitere Meldung
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in" style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Hilfe & Problem melden
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    Wir helfen dir weiter — schau zuerst, ob ein Helpcenter-Artikel dein Problem löst.
                </p>
            </div>

            {/* Step 1: Category */}
            {step === "category" && (
                <div className="card" style={{ padding: "1.5rem" }}>
                    <label
                        style={{
                            display: "block",
                            fontSize: "0.9375rem",
                            fontWeight: 600,
                            marginBottom: "1rem",
                        }}
                    >
                        Worum geht es?
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className="btn-secondary"
                                style={{
                                    justifyContent: "flex-start",
                                    padding: "0.75rem 1rem",
                                    textAlign: "left",
                                }}
                                onClick={() => {
                                    setCategory(cat);
                                    setStep("articles");
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Helpcenter Articles */}
            {step === "articles" && (
                <div>
                    <button
                        className="btn-ghost"
                        onClick={() => {
                            setStep("category");
                            setCategory("");
                        }}
                        style={{ marginBottom: "1rem" }}
                    >
                        ← Zurück
                    </button>

                    <div className="card" style={{ padding: "1.5rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                            Hilfreiche Artikel zu &quot;{category}&quot;
                        </h2>
                        <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem" }}>
                            Vielleicht findest du hier schon eine Lösung:
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                            {(helpcenterArticles[category] || []).map((article) => (
                                <a
                                    key={article.title}
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "0.75rem 1rem",
                                        borderRadius: "8px",
                                        border: "1px solid var(--card-border)",
                                        textDecoration: "none",
                                        color: "var(--foreground)",
                                        fontSize: "0.875rem",
                                        transition: "background 0.15s, border-color 0.15s",
                                    }}
                                    className="card"
                                >
                                    <span>📄 {article.title}</span>
                                    <span style={{ color: "var(--muted)" }}>→</span>
                                </a>
                            ))}
                        </div>

                        <div
                            style={{
                                borderTop: "1px solid var(--card-border)",
                                paddingTop: "1rem",
                                textAlign: "center",
                            }}
                        >
                            <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
                                Das hat dir nicht geholfen?
                            </p>
                            <button
                                className="btn-primary"
                                onClick={() => setStep("contact")}
                            >
                                Support kontaktieren
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Contact Form */}
            {step === "contact" && (
                <div>
                    <button
                        className="btn-ghost"
                        onClick={() => setStep("articles")}
                        style={{ marginBottom: "1rem" }}
                    >
                        ← Zurück
                    </button>

                    <form onSubmit={handleSubmit} className="card" style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div
                                style={{
                                    padding: "0.5rem 0.75rem",
                                    background: "var(--accent-bg)",
                                    borderRadius: "8px",
                                    fontSize: "0.8125rem",
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                Kategorie: <strong>{category}</strong>
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
                                    Betreff
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    maxLength={80}
                                    placeholder="Kurze Zusammenfassung..."
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
                                    Beschreibung
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={5}
                                    placeholder="Beschreibe das Problem möglichst genau..."
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
                                    Seiten-URL <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
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
                                {loading ? "Wird gesendet..." : "Nachricht senden"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
