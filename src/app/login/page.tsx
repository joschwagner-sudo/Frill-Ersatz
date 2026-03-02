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
                setStep("code");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to send code");
            }
        } catch {
            setError("Network error");
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
                setError(data.error || "Invalid code");
            }
        } catch {
            setError("Network error");
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
                    Sign In
                </h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.375rem" }}>
                    {step === "email"
                        ? "Enter your email to receive a sign-in code"
                        : `We sent a 6-digit code to ${email}`}
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
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
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
                            {loading ? "Sending..." : "Send Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode}>
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
                                6-Digit Code
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
                            {loading ? "Verifying..." : "Verify Code"}
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
                            Use a different email
                        </button>
                    </form>
                )}

                <p
                    style={{
                        marginTop: "1rem",
                        fontSize: "0.75rem",
                        color: "var(--muted-foreground)",
                        textAlign: "center",
                    }}
                >
                    💡 In dev mode, check the terminal for the code
                </p>
            </div>
        </div>
    );
}
