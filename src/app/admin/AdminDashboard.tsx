"use client";

import { useState } from "react";
import Link from "next/link";

type Idea = {
  id: string;
  number: number;
  title: string;
  status: string | null;
  approvalStatus: string;
  isPinned: boolean;
  isPrivate: boolean;
  isShortlisted: boolean;
  archived: boolean;
  createdAt: string;
  createdBy: { email: string };
  _count: { votes: number; comments: number };
};

type Announcement = {
  id: string;
  title: string;
  publishedAt: string | null;
  createdAt: string;
  createdBy: { email: string };
};

type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  _count: { createdRequests: number; votes: number };
};

type Stats = {
  totalIdeas: number;
  needsApproval: number;
  approved: number;
  rejected: number;
  totalUsers: number;
  totalVotes: number;
  totalComments: number;
  draftAnnouncements: number;
  publishedAnnouncements: number;
};

type Props = {
  initialIdeas: Idea[];
  initialAnnouncements: Announcement[];
  initialUsers: User[];
  initialStats: Stats;
  currentTab: string;
  currentFilter: string;
};

export default function AdminDashboard({
  initialIdeas,
  initialAnnouncements,
  initialUsers,
  initialStats,
  currentTab,
  currentFilter,
}: Props) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState<string | null>(null);
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", content: "", category: "update" });

  const handleApprove = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/ideas/${id}/approve`, { method: "POST" });
      if (res.ok) {
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === id ? { ...idea, approvalStatus: "APPROVED", status: "UNDER_REVIEW" } : idea
          )
        );
        refreshStats();
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/ideas/${id}/reject`, { method: "POST" });
      if (res.ok) {
        setIdeas((prev) =>
          prev.map((idea) => (idea.id === id ? { ...idea, approvalStatus: "REJECTED" } : idea))
        );
        refreshStats();
      }
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/ideas/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, status } : idea)));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleToggleFlag = async (id: string, flag: string, value: boolean) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/ideas/${id}/flags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [flag]: value }),
      });
      if (res.ok) {
        setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, [flag]: value } : idea)));
      }
    } catch (error) {
      console.error("Failed to toggle flag:", error);
    } finally {
      setLoading(null);
    }
  };

  const handlePublishAnnouncement = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/announcements/${id}/publish`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements((prev) =>
          prev.map((ann) =>
            ann.id === id ? { ...ann, publishedAt: data.announcement.publishedAt } : ann
          )
        );
        refreshStats();
      }
    } catch (error) {
      console.error("Failed to publish announcement:", error);
    } finally {
      setLoading(null);
    }
  };

  const refreshStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to refresh stats:", error);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnn.title || !newAnn.content) {
      alert("Titel und Inhalt sind erforderlich");
      return;
    }
    setLoading("create");
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnn),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setNewAnn({ title: "", content: "", category: "update" });
        setShowCreateModal(false);
        refreshStats();
      } else {
        const data = await res.json();
        alert(data.error || "Fehler beim Erstellen");
      }
    } catch (error) {
      console.error("Failed to create announcement:", error);
      alert("Fehler beim Erstellen");
    } finally {
      setLoading(null);
    }
  };

  const handleMerge = async () => {
    if (!mergeSourceId || !mergeTargetId) {
      alert("Bitte wähle eine Ziel-Idee aus");
      return;
    }

    if (!confirm("Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      return;
    }

    setLoading(mergeSourceId);
    try {
      const res = await fetch(`/api/admin/ideas/${mergeSourceId}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: mergeTargetId }),
      });

      if (res.ok) {
        alert("Ideen erfolgreich zusammengeführt");
        setMergeSourceId(null);
        setMergeTargetId("");
        window.location.reload(); // Simple reload to refresh data
      } else {
        const data = await res.json();
        alert(data.error || "Fehler beim Zusammenführen");
      }
    } catch (error) {
      console.error("Failed to merge:", error);
      alert("Fehler beim Zusammenführen");
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="badge" style={{ background: "#f3f4f6", color: "#6b7280" }}>Kein Status</span>;
    const statusMap: Record<string, { label: string; color: string }> = {
      UNDER_REVIEW: { label: "In Prüfung 🔎", color: "#ff6b4a" },
      PLANNED: { label: "To Do 📋", color: "#ffd749" },
      IN_PROGRESS: { label: "In Arbeit 🧑‍💻", color: "#4d6bdd" },
      DONE: { label: "Erledigt 🎉", color: "#14c57e" },
      NOT_PLANNED: { label: "Nicht geplant", color: "#8A93A5" },
    };
    const s = statusMap[status] || { label: status, color: "#8A93A5" };
    return (
      <span className="badge" style={{ background: s.color + "33", color: s.color, fontWeight: 600 }}>
        {s.label}
      </span>
    );
  };

  const getApprovalBadge = (approvalStatus: string) => {
    const approvalMap: Record<string, { label: string; color: string }> = {
      NEEDS_APPROVAL: { label: "Prüfung ausstehend", color: "#D87C13" },
      APPROVED: { label: "Freigegeben", color: "#10b981" },
      REJECTED: { label: "Abgelehnt", color: "#ef4444" },
    };
    const a = approvalMap[approvalStatus] || { label: approvalStatus, color: "#8A93A5" };
    return (
      <span className="badge" style={{ background: a.color + "22", color: a.color, fontWeight: 600 }}>
        {a.label}
      </span>
    );
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (currentFilter === "needs-approval") return idea.approvalStatus === "NEEDS_APPROVAL";
    if (currentFilter === "approved") return idea.approvalStatus === "APPROVED";
    if (currentFilter === "rejected") return idea.approvalStatus === "REJECTED";
    return true;
  });

  const countsByFilter = {
    all: ideas.length,
    "needs-approval": ideas.filter((i) => i.approvalStatus === "NEEDS_APPROVAL").length,
    approved: ideas.filter((i) => i.approvalStatus === "APPROVED").length,
    rejected: ideas.filter((i) => i.approvalStatus === "REJECTED").length,
  };

  return (
    <div className="animate-in">
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
              Verwalte Vorschläge, Ankündigungen und Nutzer
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="btn-primary"
            style={{ fontSize: "0.875rem", padding: "0.5rem 1rem", textDecoration: "none" }}
          >
            📊 Analytics
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Gesamt Ideen", value: stats.totalIdeas, color: "var(--color-primary-600)" },
          { label: "Prüfung ausstehend", value: stats.needsApproval, color: "#D87C13" },
          { label: "Freigegeben", value: stats.approved, color: "#10b981" },
          { label: "Nutzer", value: stats.totalUsers, color: "var(--color-info)" },
          { label: "Votes", value: stats.totalVotes, color: "var(--color-primary-500)" },
          { label: "Kommentare", value: stats.totalComments, color: "var(--muted)" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
        {[
          { label: "Ideen", value: "ideas" },
          { label: "Neuigkeiten", value: "announcements" },
          { label: "Nutzer", value: "users" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin?tab=${tab.value}`}
            className={currentTab === tab.value ? "nav-link active" : "nav-link"}
            style={{ textDecoration: "none" }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Ideas Tab */}
      {currentTab === "ideas" && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            {[
              { label: "Alle", value: "all" },
              { label: "Prüfung ausstehend", value: "needs-approval" },
              { label: "Freigegeben", value: "approved" },
              { label: "Abgelehnt", value: "rejected" },
            ].map((filter) => (
              <Link
                key={filter.value}
                href={`/admin?tab=ideas&filter=${filter.value}`}
                className={currentFilter === filter.value ? "btn-primary" : "btn-secondary"}
                style={{
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  padding: "0.4rem 0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {filter.label}
                <span
                  style={{
                    background: currentFilter === filter.value ? "rgba(255,255,255,0.3)" : "var(--hover-bg)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "9999px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  {countsByFilter[filter.value as keyof typeof countsByFilter]}
                </span>
              </Link>
            ))}
          </div>

          {/* Ideas Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--card-border)" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Nr</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Titel</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Autor</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Freigabe</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Votes</th>
                  <th style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>💬</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Flags</th>
                  <th style={{ padding: "0.75rem", textAlign: "right", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredIdeas.map((idea) => (
                  <tr key={idea.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "var(--muted)" }}>#{idea.number}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", maxWidth: "300px" }}>
                      <Link href={`/requests/${idea.id}`} style={{ color: "var(--foreground)", textDecoration: "none", fontWeight: 500 }}>
                        {idea.title.length > 50 ? idea.title.slice(0, 50) + "..." : idea.title}
                      </Link>
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "var(--muted)" }}>{idea.createdBy.email}</td>
                    <td style={{ padding: "0.75rem" }}>{getApprovalBadge(idea.approvalStatus)}</td>
                    <td style={{ padding: "0.75rem" }}>
                      {idea.approvalStatus === "APPROVED" ? (
                        <select
                          value={idea.status || ""}
                          onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                          disabled={loading === idea.id}
                          className="input"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", width: "auto" }}
                        >
                          <option value="">Status wählen</option>
                          <option value="UNDER_REVIEW">In Prüfung</option>
                          <option value="PLANNED">To Do</option>
                          <option value="IN_PROGRESS">In Arbeit</option>
                          <option value="DONE">Erledigt</option>
                          <option value="NOT_PLANNED">Nicht geplant</option>
                        </select>
                      ) : (
                        getStatusBadge(idea.status)
                      )}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600 }}>{idea._count.votes}</td>
                    <td style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.875rem", color: "var(--muted)" }}>{idea._count.comments}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleToggleFlag(idea.id, "isPinned", !idea.isPinned)}
                          disabled={loading === idea.id}
                          style={{
                            background: idea.isPinned ? "#ffd74933" : "transparent",
                            border: "1px solid var(--card-border)",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                          title="Pin"
                        >
                          📌
                        </button>
                        <button
                          onClick={() => handleToggleFlag(idea.id, "isPrivate", !idea.isPrivate)}
                          disabled={loading === idea.id}
                          style={{
                            background: idea.isPrivate ? "#4d6bdd33" : "transparent",
                            border: "1px solid var(--card-border)",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                          title="Privat"
                        >
                          🔒
                        </button>
                        <button
                          onClick={() => handleToggleFlag(idea.id, "isShortlisted", !idea.isShortlisted)}
                          disabled={loading === idea.id}
                          style={{
                            background: idea.isShortlisted ? "#14c57e33" : "transparent",
                            border: "1px solid var(--card-border)",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                          title="Shortlist"
                        >
                          ⭐
                        </button>
                        <button
                          onClick={() => handleToggleFlag(idea.id, "archived", !idea.archived)}
                          disabled={loading === idea.id}
                          style={{
                            background: idea.archived ? "#ef444433" : "transparent",
                            border: "1px solid var(--card-border)",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                          title="Archiv"
                        >
                          🗃️
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {idea.approvalStatus === "NEEDS_APPROVAL" && (
                          <>
                            <button
                              onClick={() => handleApprove(idea.id)}
                              disabled={loading === idea.id}
                              className="btn-primary"
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                            >
                              ✅ Freigeben
                            </button>
                            <button
                              onClick={() => handleReject(idea.id)}
                              disabled={loading === idea.id}
                              className="btn-secondary"
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                            >
                              ❌ Ablehnen
                            </button>
                          </>
                        )}
                        {idea.approvalStatus === "APPROVED" && (
                          <button
                            onClick={() => setMergeSourceId(idea.id)}
                            disabled={loading === idea.id}
                            className="btn-secondary"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                          >
                            🔀 Zusammenführen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredIdeas.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
              <p>Keine Ideen gefunden</p>
            </div>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {currentTab === "announcements" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div></div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
            >
              + Neue Neuigkeit
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {announcements.map((ann) => (
              <div key={ann.id} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{ann.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {ann.createdBy.email} · {new Date(ann.createdAt).toLocaleDateString("de-DE")}
                  </div>
                </div>
                <div>
                  {ann.publishedAt ? (
                    <span className="badge" style={{ background: "#10b98133", color: "#10b981" }}>
                      Veröffentlicht
                    </span>
                  ) : (
                    <>
                      <span className="badge" style={{ background: "#D87C1333", color: "#D87C13", marginRight: "0.5rem" }}>
                        Entwurf
                      </span>
                      <button
                        onClick={() => handlePublishAnnouncement(ann.id)}
                        disabled={loading === ann.id}
                        className="btn-primary"
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
                      >
                        Veröffentlichen
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {announcements.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
              <p>Keine Neuigkeiten gefunden</p>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {currentTab === "users" && (
        <div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--card-border)" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>E-Mail</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Admin</th>
                  <th style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Requests</th>
                  <th style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Votes</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Registriert</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Letzter Login</th>
                </tr>
              </thead>
              <tbody>
                {initialUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>{user.email}</td>
                    <td style={{ padding: "0.75rem" }}>
                      {user.isAdmin ? (
                        <span className="badge" style={{ background: "#4d6bdd33", color: "#4d6bdd" }}>Admin</span>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.875rem" }}>{user._count.createdRequests}</td>
                    <td style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.875rem" }}>{user._count.votes}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "var(--muted)" }}>
                      {new Date(user.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "var(--muted)" }}>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("de-DE") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {initialUsers.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
              <p>Keine Nutzer gefunden</p>
            </div>
          )}
        </div>
      )}

      {/* Merge Modal */}
      {mergeSourceId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setMergeSourceId(null)}
        >
          <div
            className="card"
            style={{
              padding: "1.5rem",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
              🔀 Idee zusammenführen
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1rem" }}>
              Wähle die Ziel-Idee aus, in die diese Idee zusammengeführt werden soll. Alle Votes
              und Kommentare werden übertragen.
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="mergeTarget"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Ziel-Idee (ID oder Nummer)
              </label>
              <select
                id="mergeTarget"
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="input"
                style={{ width: "100%" }}
              >
                <option value="">— Bitte wählen —</option>
                {filteredIdeas
                  .filter((i) => i.id !== mergeSourceId && i.approvalStatus === "APPROVED")
                  .map((idea) => (
                    <option key={idea.id} value={idea.id}>
                      #{idea.number} {idea.title}
                    </option>
                  ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setMergeSourceId(null)}
                className="btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleMerge}
                className="btn-primary"
                disabled={!mergeTargetId || loading === mergeSourceId}
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                {loading === mergeSourceId ? "Wird zusammengeführt..." : "Zusammenführen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card"
            style={{
              padding: "1.5rem",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
              📣 Neue Neuigkeit erstellen
            </h3>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="annTitle" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Titel
              </label>
              <input
                id="annTitle"
                type="text"
                value={newAnn.title}
                onChange={(e) => setNewAnn((prev) => ({ ...prev, title: e.target.value }))}
                className="input"
                placeholder="z.B. Neues Feature: Dark Mode"
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="annContent" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Inhalt (Markdown unterstützt)
              </label>
              <textarea
                id="annContent"
                value={newAnn.content}
                onChange={(e) => setNewAnn((prev) => ({ ...prev, content: e.target.value }))}
                className="input"
                rows={8}
                placeholder="Beschreibe die Neuigkeit..."
                style={{ width: "100%", fontFamily: "monospace" }}
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="annCategory" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Kategorie
              </label>
              <select
                id="annCategory"
                value={newAnn.category}
                onChange={(e) => setNewAnn((prev) => ({ ...prev, category: e.target.value }))}
                className="input"
                style={{ width: "100%" }}
              >
                <option value="new">✨ Neu</option>
                <option value="update">🔄 Update</option>
                <option value="fix">🐛 Bugfix</option>
                <option value="info">ℹ️ Info</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewAnn({ title: "", content: "", category: "update" });
                }}
                className="btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="btn-primary"
                disabled={loading === "create"}
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                {loading === "create" ? "Wird erstellt..." : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
