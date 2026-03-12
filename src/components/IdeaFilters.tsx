"use client";

import Link from "next/link";
import FilterDropdown from "./FilterDropdown";

export default function IdeaFilters({
  status,
  topic,
  sort,
  q,
}: {
  status?: string;
  topic?: string;
  sort?: string;
  q?: string;
}) {
  const buildFilterHref = (value: string) =>
    `/requests?status=${value}${topic ? `&topic=${topic}` : ""}${sort ? `&sort=${sort}` : ""}${q ? `&q=${q}` : ""}`;

  const buildSortHref = (value: string) =>
    `/requests?sort=${value}${status ? `&status=${status}` : ""}${topic ? `&topic=${topic}` : ""}${q ? `&q=${q}` : ""}`;

  const effectiveStatus = status || "all";
  const effectiveSort = sort || "trending";

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        marginBottom: "1.5rem",
        alignItems: "center",
      }}
    >
      {/* Search */}
      <form style={{ flex: "1 1 200px", display: "flex", gap: "0.375rem" }} action="/requests">
        <input
          type="text"
          name="q"
          placeholder="Vorschläge durchsuchen..."
          defaultValue={q}
          className="input"
          style={{ flex: 1 }}
        />
        {status && <input type="hidden" name="status" value={status} />}
        {topic && <input type="hidden" name="topic" value={topic} />}
        {sort && <input type="hidden" name="sort" value={sort} />}
        <button type="submit" className="btn-primary" style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </form>
      {q && (
        <Link
          href="/requests"
          className="btn-secondary"
          style={{ fontSize: "0.8rem", padding: "0.5rem 0.875rem", whiteSpace: "nowrap" }}
        >
          ✕ Suche zurücksetzen
        </Link>
      )}

      {/* Filter */}
      <FilterDropdown
        label="Filter"
        currentValue={effectiveStatus}
        badge={status && status !== "all" ? 1 : 0}
        options={[
          { value: "all", label: "Alle Status" },
          { value: "UNDER_REVIEW", label: "🔎 In Prüfung" },
          { value: "PLANNED", label: "📋 To Do" },
          { value: "IN_PROGRESS", label: "🧑‍💻 In Arbeit" },
          { value: "DONE", label: "🎉 Erledigt" },
        ]}
        buildHref={buildFilterHref}
      />

      {/* Sort */}
      <FilterDropdown
        label="Sortieren"
        currentValue={effectiveSort}
        options={[
          { value: "trending", label: "🔥 Im Trend" },
          { value: "votes", label: "👍 Meiste Upvotes" },
          { value: "votes-least", label: "👎 Wenigste Upvotes" },
          { value: "newest", label: "🆕 Neueste Vorschläge" },
          { value: "oldest", label: "📅 Älteste Vorschläge" },
        ]}
        buildHref={buildSortHref}
      />
    </div>
  );
}
