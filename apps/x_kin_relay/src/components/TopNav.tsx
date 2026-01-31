"use client";
import { useState, useEffect } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

export function TopNav() {
  // Login inputs removed for in-app navigation (handled on landing page)
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  // No loading state needed (no inline login form)
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";
  const view = sp.get("view") || "explorer";

  useEffect(() => {
    if (!hasSupabase || !supabase) {
      // Demo fallback session so UI shows logout & nav
      setSession({ user: { email: "demo@local" } });
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then((r) => {
      setSession(r.data.session);
      setChecking(false);
      // If already logged in and no explicit view param, push dashboard
      const url = new URL(window.location.href);
      if (r.data.session && !url.searchParams.get("view")) {
        url.searchParams.set("view", "dashboard");
        router.replace(url.pathname + "?" + url.searchParams.toString());
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) {
        const url = new URL(window.location.href);
        url.searchParams.set("view", "dashboard");
        router.replace(url.pathname + "?" + url.searchParams.toString());
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  // Inline login handler removed.
  async function handleLogout() {
    if (hasSupabase && supabase) await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  }

  // Check if we're on the app page or admin page
  const isOnAppPage = pathname.includes("/app");
  const isOnAdminPage = pathname.includes("/admin");
  const isOnDataPage = pathname.includes("/data");

  function navigateToView(targetView: string) {
    // Always navigate to /app with the view param
    router.push(`/${locale}/app?view=${targetView}`);
  }

  return (
    <header style={bar}>
      <div style={left}>
        <Link
          href={`/${locale}/app`}
          style={{ textDecoration: "none", color: "#1A1A1A" }}
        >
          <strong style={{ fontSize: 16, fontWeight: 700 }}>Kin Relay</strong>
        </Link>
        {session && (
          <nav style={nav}>
            <button
              onClick={() => navigateToView("explorer")}
              style={isOnAppPage && view === "explorer" ? tabActive : tab}
            >
              Explorer
            </button>
            <button
              onClick={() => navigateToView("dashboard")}
              style={isOnAppPage && view === "dashboard" ? tabActive : tab}
            >
              Dashboard
            </button>
            <Link
              href={`/${locale}/admin`}
              style={isOnAdminPage ? { ...linkTab, ...linkTabActive } : linkTab}
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
      {session && (
        <div style={sessionBox}>
          <span style={{ fontSize: 12, color: "#4A4A4A" }}>
            {session.user.email}
          </span>
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        </div>
      )}
      {!session && !checking && (
        <div style={{ fontSize: 12, opacity: 0.6 }}>No session</div>
      )}
    </header>
  );
}

const bar: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 16px",
  backdropFilter: "blur(10px)",
  background: "rgba(136, 185, 176, 0.95)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
  zIndex: 70,
};
const left: React.CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
};
const nav: React.CSSProperties = { display: "flex", gap: 8 };
const tab: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.1)",
  color: "#1A1A1A",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  padding: "6px 14px",
  borderRadius: 20,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
};
const tabActive: React.CSSProperties = {
  ...tab,
  background: "#F5D547",
  border: "1px solid #F5D547",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};
const linkTab: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.05)",
  color: "#4A4A4A",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  padding: "6px 14px",
  borderRadius: 20,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: 4,
};
const linkTabActive: React.CSSProperties = {
  background: "#F5D547",
  color: "#1A1A1A",
  border: "1px solid #F5D547",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};
const form: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};
const input: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  padding: "6px 10px",
  borderRadius: 6,
  color: "#1A1A1A",
  fontSize: 13,
  width: 140,
};
const loginBtn: React.CSSProperties = {
  background: "#F5D547",
  color: "#1A1A1A",
  border: "none",
  padding: "6px 14px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};
const sessionBox: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};
const logoutBtn: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.1)",
  color: "#1A1A1A",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  padding: "4px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
};
