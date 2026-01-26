"use client";
import { useState } from "react";
import { LoginForm } from "../../../components/LoginForm";
import RegisterForm from "../../../components/RegisterForm";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 24px 40px",
        background: "radial-gradient(circle at 40% 30%,#1e293b,#0f172a)",
        gap: 40,
      }}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href={`/${locale}`} style={{ color: "#cbd5e1", fontSize: 12 }}>
          ← Back
        </Link>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          background: "rgba(255,255,255,0.08)",
          padding: 6,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <button onClick={() => setTab("login")} style={tabBtn(tab === "login")}>
          Login
        </button>
        <button
          onClick={() => setTab("register")}
          style={tabBtn(tab === "register")}
        >
          Sign Up
        </button>
      </div>
      {tab === "login" ? <LoginForm /> : <RegisterForm />}
    </main>
  );
}

function tabBtn(active: boolean): React.CSSProperties {
  return {
    background: active
      ? "linear-gradient(120deg,#6366f1,#8b5cf6 60%,#ec4899)"
      : "transparent",
    border: "none",
    color: "#fff",
    padding: "10px 22px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: active ? "0 4px 18px -4px rgba(99,102,241,0.55)" : "none",
    transition: "background .3s, box-shadow .3s",
  };
}
