import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Nilpferd Icon - Finanzfluss Style */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Blauer Kreis Background */}
        <circle cx="50" cy="50" r="48" fill="#4D6BDD" />
        {/* Nilpferd Silhouette - stilisiert */}
        <path
          d="M25 55 
             C20 50, 20 40, 30 38 
             C35 37, 35 32, 35 28 
             C35 22, 40 20, 45 22 
             C50 24, 52 30, 52 35 
             C52 38, 55 38, 58 38 
             C70 38, 75 45, 75 55 
             C75 65, 65 72, 50 72 
             C35 72, 25 65, 25 55 Z"
          fill="white"
        />
        {/* Auge */}
        <circle cx="42" cy="32" r="3" fill="#4D6BDD" />
        {/* Ohr */}
        <ellipse cx="48" cy="26" rx="4" ry="6" fill="white" transform="rotate(-20 48 26)" />
      </svg>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {/* finanzfluss */}
        <span
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#4D6BDD",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          finanzfluss
        </span>

        {/* COPILOT + Feedback Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "2px" }}>
          {/* COPILOT Badge */}
          <span
            style={{
              background: "#4D6BDD",
              color: "white",
              fontSize: "0.625rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "4px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            COPILOT
          </span>

          {/* + Feedback */}
          <span
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              color: "#6D778B",
              letterSpacing: "0.03em",
            }}
          >
            Feedback
          </span>
        </div>
      </div>
    </Link>
  );
}
