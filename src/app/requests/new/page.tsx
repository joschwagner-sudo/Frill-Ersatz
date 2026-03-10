"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<
    { id: string; name: string; emoji: string }[]
  >([]);

  useEffect(() => {
    // Fetch topics
    fetch("/api/admin/topics")
      .then((res) => res.json())
      .then((data) => setTopics(data.topics || []))
      .catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    let userId = "";
    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      if (sessionData.user?.userId) {
        userId = sessionData.user.userId;
      } else {
        alert("Bitte melde dich an, um einen Vorschlag einzureichen.");
        router.push("/login");
        return;
      }
    } catch {
      alert("Bitte melde dich zuerst an.");
      router.push("/login");
      return;
    }

    const topicId = form.get("topic");
    if (!topicId) {
      alert("Bitte wähle ein Topic aus.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          topicId,
          userId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/requests/${data.id}`);
      } else if (res.status === 429) {
        alert("Du kannst maximal 3 Vorschläge pro Tag einreichen.");
      } else {
        const data = await res.json();
        alert(data.error || "Fehler beim Einreichen");
      }
    } catch {
      alert("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in" style={{ maxWidth: "560px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Idee einreichen
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--muted)",
            marginTop: "0.5rem",
          }}
        >
          Teile deinen Feature-Vorschlag mit uns. Nach Prüfung wird deine Idee
          für alle sichtbar.
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted)",
            marginTop: "0.5rem",
            padding: "0.75rem",
            background: "var(--accent-bg)",
            borderRadius: "8px",
            border: "1px solid var(--card-border)",
          }}
        >
          🐛 Bugs bitte{" "}
          <a
            href="/report"
            style={{
              color: "var(--color-primary-600)",
              textDecoration: "underline",
            }}
          >
            über den Bug-Report
          </a>{" "}
          melden, nicht hier.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ padding: "1.5rem" }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Topic Selection (Required) */}
          <div>
            <label
              htmlFor="topic"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Topic{" "}
              <span style={{ color: "var(--color-primary-600)" }}>*</span>
            </label>
            <select
              id="topic"
              name="topic"
              required
              className="input"
              style={{
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                paddingRight: "2.5rem",
              }}
            >
              <option value="">— Bitte wählen —</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.emoji} {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Titel{" "}
              <span style={{ color: "var(--color-primary-600)" }}>*</span>
              <span
                style={{ fontWeight: 400, color: "var(--muted)", marginLeft: "0.25rem" }}
              >
                (max. 80 Zeichen)
              </span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={80}
              placeholder="z.B. CSV-Import für Transaktionen"
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Beschreibung{" "}
              <span style={{ color: "var(--color-primary-600)" }}>*</span>
              <span
                style={{ fontWeight: 400, color: "var(--muted)", marginLeft: "0.25rem" }}
              >
                (Markdown möglich)
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={8}
              placeholder="Beschreibe deine Idee im Detail. Was möchtest du erreichen? Warum wäre das hilfreich?"
              className="input"
              style={{ resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ fontSize: "0.9375rem", padding: "0.75rem 1.5rem" }}
          >
            {loading ? "Wird eingereicht..." : "Idee einreichen"}
          </button>

          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
              textAlign: "center",
            }}
          >
            Deine Idee wird nach Prüfung durch unser Team veröffentlicht.
          </p>
        </div>
      </form>
    </div>
  );
}
