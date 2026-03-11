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

  // Redirect to dashboard view by default
  useEffect(() => {
    if (!params.get("view")) {
      router.replace(`/${locale}/app?view=dashboard`);
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
        <div className="mx-auto min-h-screen w-full max-w-[95vw] bg-[#88B9B0] px-4 pb-12 pt-24 sm:px-6 sm:pt-28">
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
