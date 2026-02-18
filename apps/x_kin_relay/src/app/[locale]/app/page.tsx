"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { TopNav } from "../../../components/TopNav";
import { Dashboard } from "../../../components/Dashboard";
import { Explorer } from "../../../components/Explorer";

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

  // Care Network is a standalone view
  if (view === "network" || view === "explorer") {
    return (
      <>
        <TopNav />
        <div
          style={{
            padding: "80px 24px 60px",
            maxWidth: "95vw",
            margin: "0 auto",
            background: "#88B9B0",
            minHeight: "100vh",
          }}
        >
          <Explorer />
        </div>
      </>
    );
  }

  // Map view params to dashboard tabs
  const tabMap: Record<string, string> = {
    dashboard: "overview",
    data: "data",
    overview: "overview",
  };

  const dashboardTab = tabMap[view] || "overview";

  return (
    <>
      <TopNav />
      <Dashboard initialTab={dashboardTab} />
    </>
  );
}
