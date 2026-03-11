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

  function navigateToView(targetView: string) {
    // Always navigate to /app with the view param
    router.push(`/${locale}/app?view=${targetView}`);
  }

  const navButtonBaseClass =
    "inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors";
  const navButtonClass = `${navButtonBaseClass} border-black/10 bg-black/10 text-[#1A1A1A] hover:bg-black/15`;
  const navButtonActiveClass = `${navButtonBaseClass} border-[#F5D547] bg-[#F5D547] text-[#1A1A1A] shadow-sm`;
  const navLinkClass = `${navButtonBaseClass} border-black/10 bg-black/5 text-[#4A4A4A] hover:bg-black/10`;

  return (
    <header className="fixed inset-x-0 top-0 z-[70] border-b border-black/10 bg-[#88B9B0]/95 backdrop-blur-[10px]">
      <div className="mx-auto flex w-full max-w-[95vw] flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href={`/${locale}/app`}
            className="truncate text-base font-bold text-[#1A1A1A] no-underline"
          >
            Kin Relay
          </Link>
          {session && (
            <nav className="flex max-w-full items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => navigateToView("dashboard")}
                className={
                  isOnAppPage && !isOnAdminPage && view !== "network"
                    ? navButtonActiveClass
                    : navButtonClass
                }
              >
                Dashboard
              </button>
              <button
                onClick={() => navigateToView("network")}
                className={
                  isOnAppPage && view === "network"
                    ? navButtonActiveClass
                    : navButtonClass
                }
              >
                Care Network
              </button>
              <Link
                href={`/${locale}/admin`}
                className={
                  isOnAdminPage
                    ? navButtonActiveClass
                    : navLinkClass
                }
              >
                Admin
              </Link>
            </nav>
          )}
        </div>
        {session && (
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <span className="max-w-[11rem] truncate text-xs text-[#4A4A4A] sm:max-w-[14rem]">
              {session.user.email}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-md border border-black/10 bg-black/10 px-3 py-1 text-xs font-medium text-[#1A1A1A] transition-colors hover:bg-black/15"
            >
              Logout
            </button>
          </div>
        )}
        {!session && !checking && (
          <div className="text-xs text-black/60">No session</div>
        )}
      </div>
    </header>
  );
}
