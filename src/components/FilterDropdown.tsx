"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Option = {
  value: string;
  label: string;
};

export default function FilterDropdown({
  label,
  options,
  currentValue,
  buildHref,
  badge,
}: {
  label: string;
  options: Option[];
  currentValue: string | null;
  buildHref: (value: string) => string;
  badge?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-secondary"
        style={{
          fontSize: "0.8125rem",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          ...(open ? { background: "var(--accent-bg)", borderColor: "var(--color-primary-300)" } : {}),
        }}
      >
        {label}
        {badge && badge > 0 ? (
          <span style={{
            background: "var(--color-primary-600)",
            color: "white",
            borderRadius: "9999px",
            padding: "0.0625rem 0.375rem",
            fontSize: "0.6875rem",
            fontWeight: 700,
          }}>{badge}</span>
        ) : null}
        <span style={{ fontSize: "0.625rem" }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: "0.25rem",
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          zIndex: 20,
          minWidth: "180px",
          padding: "0.375rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.125rem",
        }}>
          {options.map((opt) => (
            <Link
              key={opt.value}
              href={buildHref(opt.value)}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.8125rem",
                textDecoration: "none",
                color: "var(--foreground)",
                fontWeight: currentValue === opt.value ? 600 : 400,
                background: currentValue === opt.value ? "var(--accent-bg)" : "transparent",
              }}
              onMouseEnter={(e) => { if (currentValue !== opt.value) e.currentTarget.style.background = "var(--hover-bg)"; }}
              onMouseLeave={(e) => { if (currentValue !== opt.value) e.currentTarget.style.background = "transparent"; }}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
