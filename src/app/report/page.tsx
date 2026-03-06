"use client";

import { useState } from "react";

const categories = [
    { label: "Dashboard & Übersicht", icon: "📊" },
    { label: "Import & Daten", icon: "📥" },
    { label: "Portfolios & Konten", icon: "🏦" },
    { label: "Investments & Wertpapiere", icon: "📈" },
    { label: "Dividenden", icon: "💰" },
    { label: "Rendite & Berechnungen", icon: "🧮" },
    { label: "Budget", icon: "💳" },
    { label: "Konto & Sicherheit", icon: "🔒" },
    { label: "Sonstiges", icon: "❓" },
];

const helpcenterArticles: Record<string, { title: string; url: string }[]> = {
    "Dashboard & Übersicht": [
        { title: "Dashboard", url: "https://www.finanzfluss.de/copilot/hilfe/dashboard/" },
        { title: "Das Dashboard in der Copilot App", url: "https://www.finanzfluss.de/copilot/hilfe/dashboard-app/" },
        { title: "Abweichende Werte im Dashboard", url: "https://www.finanzfluss.de/copilot/hilfe/abweichende-werte-im-dashboard/" },
        { title: "Breakdown", url: "https://www.finanzfluss.de/copilot/hilfe/breakdown/" },
        { title: "Analyse", url: "https://www.finanzfluss.de/copilot/hilfe/analyse/" },
    ],
    "Import & Daten": [
        { title: "Automatischer Import", url: "https://www.finanzfluss.de/copilot/hilfe/auto-import/" },
        { title: "Autoimport: Schritt-für-Schritt-Anleitungen", url: "https://www.finanzfluss.de/copilot/hilfe/automatischer-import/" },
        { title: "CSV Import", url: "https://www.finanzfluss.de/copilot/hilfe/csv-import/" },
        { title: "PDF Import", url: "https://www.finanzfluss.de/copilot/hilfe/pdf-import/" },
        { title: "Manueller Import", url: "https://www.finanzfluss.de/copilot/hilfe/auto-import-nicht-unterstutzt/" },
        { title: "Fehlerhafte Importe", url: "https://www.finanzfluss.de/copilot/hilfe/importe/" },
        { title: "Unterstützte Anbieter", url: "https://www.finanzfluss.de/copilot/hilfe/unterstuetzte-anbieter/" },
        { title: "Unterstützte Konten für Auto-Import", url: "https://www.finanzfluss.de/copilot/hilfe/unterstutzte-konten-fur-auto-import/" },
        { title: "Backup via CSV", url: "https://www.finanzfluss.de/copilot/hilfe/backup/" },
    ],
    "Portfolios & Konten": [
        { title: "Portfolios & Konten", url: "https://www.finanzfluss.de/copilot/hilfe/portfolios-und-konten/" },
        { title: "Depots/Konten ein- und ausblenden", url: "https://www.finanzfluss.de/copilot/hilfe/depot-ausblenden/" },
        { title: "Konto aktualisieren", url: "https://www.finanzfluss.de/copilot/hilfe/konto-aktualisieren/" },
        { title: "Konto oder Depot löschen", url: "https://www.finanzfluss.de/copilot/hilfe/konto-loschen/" },
        { title: "Bankverbindung aufheben", url: "https://www.finanzfluss.de/copilot/hilfe/bankverbindung-aufheben/" },
        { title: "Verrechnungskonto ändern", url: "https://www.finanzfluss.de/copilot/hilfe/falsches-verrechnungskonto/" },
        { title: "Depot teilen", url: "https://www.finanzfluss.de/copilot/hilfe/teilen/" },
    ],
    "Investments & Wertpapiere": [
        { title: "Investments", url: "https://www.finanzfluss.de/copilot/hilfe/investment-seite/" },
        { title: "Watchlist", url: "https://www.finanzfluss.de/copilot/hilfe/watchlist/" },
        { title: "Watchlist anpassen", url: "https://www.finanzfluss.de/copilot/hilfe/watchlist-anpassen/" },
        { title: "Manueller Wertpapierkauf und -verkauf", url: "https://www.finanzfluss.de/copilot/hilfe/manueller-kauf/" },
        { title: "Manuellen Depotübertrag einrichten", url: "https://www.finanzfluss.de/copilot/hilfe/depotuebertrag-manuell/" },
        { title: "Manueller Aktiensplit", url: "https://www.finanzfluss.de/copilot/hilfe/aktiensplit/" },
        { title: "Manueller Aktientausch", url: "https://www.finanzfluss.de/copilot/hilfe/aktientausch/" },
        { title: "Manueller Spin-off", url: "https://www.finanzfluss.de/copilot/hilfe/spinoff/" },
        { title: "Börsenplatz bearbeiten", url: "https://www.finanzfluss.de/copilot/hilfe/boersenplatz-bearbeiten/" },
        { title: "Fehlendes Wertpapier", url: "https://www.finanzfluss.de/copilot/hilfe/fehlendes-wertpapier/" },
        { title: "Edelmetalle manuell hinzufügen", url: "https://www.finanzfluss.de/copilot/hilfe/edelmetalle-manuell-hinzufugen/" },
        { title: "Sonstige Vermögenswerte hinzufügen", url: "https://www.finanzfluss.de/copilot/hilfe/sonstige/" },
        { title: "Kauf vs Einbuchung", url: "https://www.finanzfluss.de/copilot/hilfe/kauf-vs-einbuchung/" },
        { title: "Unterstützte Börsenplätze", url: "https://www.finanzfluss.de/copilot/hilfe/unterstutzte-borsenplatze/" },
    ],
    "Dividenden": [
        { title: "Dividenden", url: "https://www.finanzfluss.de/copilot/hilfe/dividenden-seite/" },
        { title: "Dividendenimport", url: "https://www.finanzfluss.de/copilot/hilfe/dividendenimport/" },
        { title: "Dividenden manuell hinzufügen", url: "https://www.finanzfluss.de/copilot/hilfe/dividenden-manuell-hinzufugen/" },
        { title: "Inkorrekter Wert im Dividendenkalender", url: "https://www.finanzfluss.de/copilot/hilfe/dividendenkalender-inkorrekt/" },
    ],
    "Rendite & Berechnungen": [
        { title: "Zeitgewichtete Rendite (TWROR)", url: "https://www.finanzfluss.de/copilot/hilfe/zeitgewichtete-rendite/" },
        { title: "Interner Zinsfuß (IZF)", url: "https://www.finanzfluss.de/copilot/hilfe/izf/" },
        { title: "Vorabpauschale", url: "https://www.finanzfluss.de/copilot/hilfe/vorabpauschale/" },
        { title: "Freistellungsauftrag", url: "https://www.finanzfluss.de/copilot/hilfe/freistellungsauftrag/" },
        { title: "Unterschiedliche Performance-Kennzahlen", url: "https://www.finanzfluss.de/copilot/hilfe/unterschied-twror-kursgewinn/" },
        { title: "Warum steigt investiertes Kapital bei Umschichtung?", url: "https://www.finanzfluss.de/copilot/hilfe/warum-steigt-investiertes-kapital-bei-umschichtung/" },
        { title: "Ausgleichsbuchungen", url: "https://www.finanzfluss.de/copilot/hilfe/korrekturbuchungen/" },
    ],
    "Budget": [
        { title: "Budget", url: "https://www.finanzfluss.de/copilot/hilfe/budget/" },
        { title: "Individuelle Budgets", url: "https://www.finanzfluss.de/copilot/hilfe/individuelle-budgets/" },
        { title: "Kategorien", url: "https://www.finanzfluss.de/copilot/hilfe/kategorien/" },
        { title: "Tags", url: "https://www.finanzfluss.de/copilot/hilfe/tags/" },
    ],
    "Konto & Sicherheit": [
        { title: "Wie lösche ich meinen Account?", url: "https://www.finanzfluss.de/copilot/hilfe/account-loeschen/" },
        { title: "Zwei-Faktor-Authentifizierung (2FA)", url: "https://www.finanzfluss.de/copilot/hilfe/2fa/" },
        { title: "Sicherheit im Finanzfluss Copilot", url: "https://www.finanzfluss.de/copilot/hilfe/sicherheit-beim-finanzfluss-copilot/" },
        { title: "Auto-Logout", url: "https://www.finanzfluss.de/copilot/hilfe/auto-logout/" },
        { title: "Backup-Codes verloren?", url: "https://www.finanzfluss.de/copilot/hilfe/backup-codes-verloren/" },
        { title: "TAN von deinem Broker erhalten", url: "https://www.finanzfluss.de/copilot/hilfe/keine-tan-vom-broker-erhalten/" },
        { title: "TAN-Abfrage", url: "https://www.finanzfluss.de/copilot/hilfe/wieso-fordert-dei-bank-eine-tan/" },
    ],
    "Sonstiges": [
        { title: "Copilot Rolle im Discord bekommen", url: "https://www.finanzfluss.de/copilot/hilfe/discord/" },
        { title: "Feature Request", url: "https://www.finanzfluss.de/copilot/hilfe/feature-request/" },
        { title: "Kostenlose Probeversion von Copilot PLUS", url: "https://www.finanzfluss.de/copilot/hilfe/probeabonnement/" },
        { title: "Familienfreigabe", url: "https://www.finanzfluss.de/copilot/hilfe/familienfregabe/" },
        { title: "Krypto-Transfer von Börse zu Coldwallet", url: "https://www.finanzfluss.de/copilot/hilfe/krypto-transfer-coldwallet/" },
        { title: "Immobilien im Copilot erfassen", url: "https://www.finanzfluss.de/copilot/hilfe/immobilien-im-copilot-erfassen/" },
        { title: "Fusionen im Copilot eintragen", url: "https://www.finanzfluss.de/copilot/hilfe/fusionen-im-copilot-eintragen/" },
        { title: "Kredite im Copilot eintragen", url: "https://www.finanzfluss.de/copilot/hilfe/kredit-im-copilot-richtig-eintragen/" },
        { title: "Unterschiede Verrechnungskonto Trade Republic", url: "https://www.finanzfluss.de/copilot/hilfe/unterschiedliche-betrage-auf-dem-verechnungskonto-von-tr-und-im-copiloten/" },
        { title: "Fehlersuche Scalable Capital", url: "https://www.finanzfluss.de/copilot/hilfe/fehlersuche-scalable-capital/" },
        { title: "Fehlerhafter Datenabgleich flatex/DEGIRO", url: "https://www.finanzfluss.de/copilot/hilfe/fehlerhafter-datenabgleich-flatex-degiro/" },
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
                    Problem melden
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    Wähle eine Kategorie — vielleicht hilft dir schon ein Artikel aus unserem Helpcenter weiter.
                </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {["Kategorie", "Helpcenter", "Kontakt"].map((label, i) => {
                    const stepIndex = i === 0 ? "category" : i === 1 ? "articles" : "contact";
                    const steps: Step[] = ["category", "articles", "contact"];
                    const currentIndex = steps.indexOf(step);
                    const isActive = i <= currentIndex;
                    return (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: i < 2 ? 1 : undefined }}>
                            <div
                                style={{
                                    width: "1.75rem",
                                    height: "1.75rem",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    background: isActive ? "var(--color-primary-500)" : "var(--card-border)",
                                    color: isActive ? "white" : "var(--muted)",
                                    transition: "all 0.2s",
                                    flexShrink: 0,
                                }}
                            >
                                {i + 1}
                            </div>
                            <span style={{ fontSize: "0.8125rem", color: isActive ? "var(--foreground)" : "var(--muted)", fontWeight: isActive ? 600 : 400 }}>
                                {label}
                            </span>
                            {i < 2 && (
                                <div style={{ flex: 1, height: "1px", background: isActive && i < currentIndex ? "var(--color-primary-500)" : "var(--card-border)", margin: "0 0.25rem" }} />
                            )}
                        </div>
                    );
                })}
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
                                key={cat.label}
                                className="btn-secondary"
                                style={{
                                    justifyContent: "flex-start",
                                    padding: "0.75rem 1rem",
                                    textAlign: "left",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.625rem",
                                }}
                                onClick={() => {
                                    setCategory(cat.label);
                                    setStep("articles");
                                }}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
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
                                    key={article.url}
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
                                    <span style={{ color: "var(--muted)" }}>↗</span>
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
                                Das hat dir nicht weitergeholfen?
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

            {/* Step 3: Contact Form → Intercom */}
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
                                {loading ? "Wird gesendet..." : "Nachricht an Support senden"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
