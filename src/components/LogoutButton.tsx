"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/session", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="btn-ghost"
      style={{
        padding: "0.375rem 0.75rem",
        fontSize: "0.8125rem",
      }}
    >
      Abmelden
    </button>
  );
}
