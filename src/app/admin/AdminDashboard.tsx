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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
          Verwalte Vorschläge, Ankündigungen und Nutzer
        </p>
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
          { label: "Ankündigungen", value: "announcements" },
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
                      {idea.approvalStatus === "NEEDS_APPROVAL" && (
                        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "flex-end" }}>
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
                        </div>
                      )}
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
              <p>Keine Ankündigungen gefunden</p>
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
    </div>
  );
}
