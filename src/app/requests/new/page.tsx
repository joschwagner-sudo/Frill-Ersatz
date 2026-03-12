"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DuplicateSuggestions from "@/components/DuplicateSuggestions";

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ideaType, setIdeaType] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
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
          isAnonymous,
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
          {/* Step 1: Art des Vorschlags */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Was möchtest du einreichen?{" "}
              <span style={{ color: "var(--color-primary-600)" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { value: "improvement", label: "👌 Verbesserung", desc: "Bestehendes Feature verbessern" },
                { value: "feature", label: "⭐ Neues Feature", desc: "Komplett neue Funktion" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIdeaType(opt.value)}
                  className={ideaType === opt.value ? "btn-primary" : "btn-secondary"}
                  style={{ flex: 1, flexDirection: "column", padding: "0.75rem", fontSize: "0.8125rem", textAlign: "center" }}
                >
                  <div style={{ fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: "0.125rem" }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Plattform */}
          {ideaType && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Welche Plattform betrifft es?{" "}
                <span style={{ color: "var(--color-primary-600)" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[
                  { value: "web", label: "🖥️ Web" },
                  { value: "app", label: "📱 App" },
                  { value: "both", label: "🔄 Beides" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPlatform(opt.value)}
                    className={platform === opt.value ? "btn-primary" : "btn-secondary"}
                    style={{ flex: 1, padding: "0.625rem", fontSize: "0.8125rem" }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Kategorie (Topic) */}
          {ideaType && platform && (
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
                Kategorie{" "}
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
              {/* Hidden fields for type and platform */}
              <input type="hidden" name="ideaType" value={ideaType} />
              <input type="hidden" name="platform" value={platform} />
            </div>
          )}

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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <DuplicateSuggestions title={title} />
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

          {/* Anonymous Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              background: "var(--accent-bg)",
              borderRadius: "8px",
              border: "1px solid var(--card-border)",
            }}
          >
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                Anonym einreichen
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {isAnonymous ? "Dein Name wird nicht angezeigt" : "Dein Name wird öffentlich angezeigt"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              style={{
                width: "3rem",
                height: "1.625rem",
                borderRadius: "9999px",
                border: "none",
                background: isAnonymous ? "var(--color-primary-500)" : "var(--card-border)",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: "0.1875rem",
                  left: isAnonymous ? "1.5625rem" : "0.1875rem",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
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
