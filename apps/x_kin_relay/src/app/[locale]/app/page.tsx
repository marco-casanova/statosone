"use client";
import { useSearchParams } from "next/navigation";
import { TopNav } from "../../../components/TopNav";
import { Explorer } from "../../../components/Explorer";
import { Dashboard } from "../../../components/Dashboard";

/**
 * App Entry - Main authenticated dashboard
 * Auth is handled by the layout, not here
 */
export default function AppEntry() {
  const params = useSearchParams();
  const view = params.get("view") || "dashboard";

  return (
    <>
      <TopNav />
      {view === "dashboard" ? <Dashboard /> : <Explorer />}
    </>
  );
}
