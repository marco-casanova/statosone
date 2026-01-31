"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { TopNav } from "../../../components/TopNav";
import { Explorer } from "../../../components/Explorer";
import { Dashboard } from "../../../components/Dashboard";

/**
 * App Entry - Main authenticated dashboard
 * Auth is handled by the layout, not here
 */
export default function AppEntry() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";
  const view = params.get("view") || "home";

  // Redirect to home page by default
  useEffect(() => {
    if (!params.get("view")) {
      router.replace(`/${locale}/app/home`);
    }
  }, [params, router, locale]);

  // Show home page view
  if (view === "home") {
    return null; // Will redirect
  }

  return (
    <>
      <TopNav />
      {view === "dashboard" ? <Dashboard /> : <Explorer />}
    </>
  );
}
