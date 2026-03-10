"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [devCode, setDevCode] = useState("");

    async function handleRequestCode(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/request-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.devCode) setDevCode(data.devCode);
                setStep("code");
            } else {
                const data = await res.json();
                setError(data.error || "Fehler beim Senden des Codes");
            }
        } catch {
            setError("Netzwerkfehler");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyCode(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });

            if (res.ok) {
                router.push("/requests");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Ungültiger Code");
            }
        } catch {
            setError("Netzwerkfehler");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="animate-in"
            style={{
                maxWidth: "400px",
                margin: "4rem auto",
            }}
        >
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔐</div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Anmelden
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.375rem" }}>
                    {step === "email"
                        ? "Gib deine E-Mail-Adresse ein, um einen Anmeldecode zu erhalten"
                        : `Wir haben einen 6-stelligen Code an ${email} gesendet${devCode ? "" : ""}`}
                </p>
            </div>

            <div className="card" style={{ padding: "1.5rem" }}>
                {step === "email" ? (
                    <form onSubmit={handleRequestCode}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label
                                htmlFor="email"
                                style={{
                                    display: "block",
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    marginBottom: "0.375rem",
                                }}
                            >
                                E-Mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="du@beispiel.de"
                                className="input"
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p style={{ fontSize: "0.8125rem", color: "var(--color-error)", marginBottom: "1rem" }}>
                                {error}
                            </p>
                        )}
                        <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
                            {loading ? "Wird gesendet..." : "Code senden"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode}>
                        {devCode && (
                            <div style={{
                                background: "var(--accent-bg)",
                                borderRadius: "8px",
                                padding: "0.75rem",
                                marginBottom: "1rem",
                                textAlign: "center",
                            }}>
                                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                                    Dein Code (Dev-Modus)
                                </div>
                                <div style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.3em", color: "var(--color-primary-600)" }}>
                                    {devCode}
                                </div>
                            </div>
                        )}
                        <div style={{ marginBottom: "1rem" }}>
                            <label
                                htmlFor="code"
                                style={{
                                    display: "block",
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    marginBottom: "0.375rem",
                                }}
                            >
                                6-stelliger Code
                            </label>
                            <input
                                id="code"
                                type="text"
                                required
                                maxLength={6}
                                pattern="[0-9]{6}"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="000000"
                                className="input"
                                style={{
                                    fontSize: "1.5rem",
                                    textAlign: "center",
                                    letterSpacing: "0.75em",
                                    fontWeight: 700,
                                }}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p style={{ fontSize: "0.8125rem", color: "var(--color-error)", marginBottom: "1rem" }}>
                                {error}
                            </p>
                        )}
                        <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
                            {loading ? "Wird überprüft..." : "Code bestätigen"}
                        </button>
                        <button
                            type="button"
                            className="btn-ghost"
                            style={{ width: "100%", marginTop: "0.5rem" }}
                            onClick={() => {
                                setStep("email");
                                setCode("");
                                setError("");
                            }}
                        >
                            Andere E-Mail verwenden
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
