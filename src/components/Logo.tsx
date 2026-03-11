import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link
      href="/"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Image
        src="/logo.png"
        alt="Finanzfluss Copilot"
        width={150}
        height={50}
        style={{ height: "2rem", width: "auto" }}
        priority
      />
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#6D778B",
          borderLeft: "1px solid #ccc",
          paddingLeft: "0.5rem",
          letterSpacing: "0.03em",
        }}
      >
        Feedback
      </span>
    </Link>
  );
}
