"use client";

import { useState, useEffect } from "react";

type EmailBroadcast = {
  id: string;
  subject: string;
  body: string;
  recipientType: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: string;
  sentAt: string | null;
  createdAt: string;
  sentBy: { email: string };
};

type Idea = {
  id: string;
  number: number;
  title: string;
};

const TEMPLATES = [
  {
    name: "Status-Update",
    subject: "Update zu deiner Idee: {title}",
    body: "Hey,\n\nwir haben ein Update zu der Idee **\"{title}\"**:\n\n**Neuer Status: {status}**\n\nVielen Dank für deinen Beitrag!\n\nDein Copilot-Team",
  },
  {
    name: "Neue Ankündigung",
    subject: "Neuigkeiten von Copilot",
    body: "Hey,\n\nes gibt Neuigkeiten:\n\n**{title}**\n\n{description}\n\nSchau dir die Details auf unserer Feedback-Plattform an.\n\nDein Copilot-Team",
  },
  {
    name: "Custom",
    subject: "",
    body: "",
  },
];

export default function AdminEmails({ ideas }: { ideas: Idea[] }) {
  const [history, setHistory] = useState<EmailBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientType, setRecipientType] = useState("ALL");
  const [recipientFilter, setRecipientFilter] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/admin/emails");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.emails);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (index: number) => {
    setSelectedTemplate(index);
    setSubject(TEMPLATES[index].subject);
    setBody(TEMPLATES[index].body);
    setPreviewHtml(null);
  };

  const handlePreview = async () => {
    try {
      const res = await fetch("/api/admin/emails/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (testOnly: boolean) => {
    if (!subject.trim() || !body.trim()) {
      alert("Betreff und Inhalt sind erforderlich");
      return;
    }

    if (!testOnly && !confirm(`E-Mail an ${recipientType === "ALL" ? "alle Nutzer" : recipientType === "ADMINS" ? "alle Admins" : "Voter der ausgewählten Idee"} senden?`)) {
      return;
    }

    setSending(true);
    try {
      // Get rendered HTML
      const previewRes = await fetch("/api/admin/emails/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const { html: bodyHtml } = await previewRes.json();

      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          bodyHtml,
          recipientType,
          recipientFilter: recipientType === "IDEA_VOTERS" ? recipientFilter : undefined,
          testOnly,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (testOnly) {
          alert(`✅ Test-E-Mail gesendet an deine Admin-Adresse!${data.devMode ? " (Dev-Modus: E-Mail nur geloggt)" : ""}`);
        } else {
          alert(`✅ E-Mail an ${data.broadcast.sentCount} Empfänger gesendet!${data.broadcast.failedCount > 0 ? ` (${data.broadcast.failedCount} fehlgeschlagen)` : ""}${data.devMode ? " (Dev-Modus: E-Mails nur geloggt)" : ""}`);
          setShowEditor(false);
          setSubject("");
          setBody("");
          setPreviewHtml(null);
          setSelectedTemplate(null);
          fetchHistory();
        }
      } else {
        const data = await res.json();
        alert(data.error || "Fehler beim Senden");
      }
    } catch (err) {
      console.error(err);
      alert("Fehler beim Senden");
    } finally {
      setSending(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      DRAFT: { label: "Entwurf", bg: "#f3f4f6", color: "#6b7280" },
      SENDING: { label: "Wird gesendet...", bg: "#fef3c7", color: "#92400e" },
      SENT: { label: "Gesendet", bg: "#d1fae5", color: "#065f46" },
      FAILED: { label: "Fehlgeschlagen", bg: "#fef2f2", color: "#991b1b" },
      TEST: { label: "Test", bg: "#dbeafe", color: "#1e40af" },
    };
    const s = map[status] || { label: status, bg: "#f3f4f6", color: "#6b7280" };
    return (
      <span style={{ display: "inline-flex", padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 600, background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div></div>
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="btn-primary"
          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
        >
          {showEditor ? "✕ Schließen" : "📧 Neue E-Mail"}
        </button>
      </div>

      {/* Editor */}
      {showEditor && (
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>📧 E-Mail erstellen</h3>

          {/* Template Selection */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Vorlage wählen
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {TEMPLATES.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => handleTemplateSelect(i)}
                  className={selectedTemplate === i ? "btn-primary" : "btn-secondary"}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Type */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Empfänger
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[
                { value: "ALL", label: "👥 Alle Nutzer" },
                { value: "IDEA_VOTERS", label: "👍 Voter einer Idee" },
                { value: "ADMINS", label: "🛡️ Nur Admins" },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRecipientType(r.value)}
                  className={recipientType === r.value ? "btn-primary" : "btn-secondary"}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {recipientType === "IDEA_VOTERS" && (
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
                className="input"
                style={{ marginTop: "0.5rem" }}
              >
                <option value="">— Idee wählen —</option>
                {ideas.map((idea) => (
                  <option key={idea.id} value={idea.id}>
                    #{idea.number} {idea.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Subject */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="email-subject" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Betreff
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input"
              placeholder="z.B. Update zu eurer Idee..."
            />
          </div>

          {/* Body */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="email-body" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Inhalt <span style={{ fontWeight: 400, color: "var(--muted)" }}>(Markdown: **fett**, *kursiv*)</span>
            </label>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="input"
              rows={10}
              placeholder="Schreibe deine E-Mail..."
              style={{ fontFamily: "monospace", resize: "vertical" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={handlePreview}
              className="btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
            >
              👁️ Vorschau
            </button>
            <button
              onClick={() => handleSend(true)}
              className="btn-secondary"
              disabled={sending}
              style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
            >
              {sending ? "..." : "📨 Test senden (an mich)"}
            </button>
            <button
              onClick={() => handleSend(false)}
              className="btn-primary"
              disabled={sending || (recipientType === "IDEA_VOTERS" && !recipientFilter)}
              style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
            >
              {sending ? "Wird gesendet..." : "🚀 An alle senden"}
            </button>
          </div>

          {/* Preview */}
          {previewHtml && (
            <div style={{ marginTop: "1.5rem" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Vorschau:</h4>
              <div
                style={{
                  border: "1px solid var(--card-border)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                <iframe
                  srcDoc={previewHtml}
                  style={{ width: "100%", height: "450px", border: "none" }}
                  title="Email Preview"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email History */}
      <div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Versand-Historie</h3>
        {loading ? (
          <div style={{ color: "var(--muted)", padding: "2rem", textAlign: "center" }}>Wird geladen...</div>
        ) : history.length === 0 ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            Noch keine E-Mails versendet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--card-border)" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Datum</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Betreff</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Empfänger</th>
                  <th style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Gesendet</th>
                  <th style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Fehler</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Von</th>
                </tr>
              </thead>
              <tbody>
                {history.map((email) => (
                  <tr key={email.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.8125rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(email.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.8125rem", fontWeight: 500, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {email.subject}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "var(--muted)" }}>
                      {email.recipientType === "ALL" ? "Alle Nutzer" : email.recipientType === "ADMINS" ? "Admins" : email.recipientType === "TEST" ? "Test" : "Idea-Voter"}
                      <span style={{ marginLeft: "0.25rem", fontWeight: 600 }}>({email.recipientCount})</span>
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "#065f46" }}>
                      {email.sentCount}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: email.failedCount > 0 ? "#991b1b" : "var(--muted)" }}>
                      {email.failedCount}
                    </td>
                    <td style={{ padding: "0.75rem" }}>{statusBadge(email.status)}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "var(--muted)" }}>{email.sentBy.email.split("@")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
