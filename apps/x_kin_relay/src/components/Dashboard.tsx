"use client";
import { useState, useEffect } from "react";
import { ActivityForm } from "./ActivityForm";
import { ActivityLogCards } from "./ActivityLogCards";
import { DataManagement } from "./DataManagement";
type DashboardTab = "overview" | "logs" | "data";

export function Dashboard({ initialTab }: { initialTab?: string }) {
  const [tab, setTab] = useState<DashboardTab>(
    (initialTab as DashboardTab) || "overview",
  );

  useEffect(() => {
    if (initialTab && ["overview", "logs", "data"].includes(initialTab)) {
      setTab(initialTab as DashboardTab);
    }
  }, [initialTab]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[95vw] bg-[#88B9B0] px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
      {/* Header with title and tabs */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1
          className="m-0 text-2xl font-bold text-[#1A1A1A] sm:text-3xl"
          aria-label="Dashboard"
        >
          Dashboard
        </h1>
        <div className="flex w-full flex-wrap gap-1 rounded-xl bg-black/10 p-1 sm:w-auto sm:flex-nowrap">
          <button
            onClick={() => setTab("overview")}
            className={`min-h-9 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${
              tab === "overview"
                ? "bg-[#F5D547] font-semibold text-[#1A1A1A]"
                : "bg-transparent text-[#4A4A4A] hover:bg-black/5"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`min-h-9 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${
              tab === "logs"
                ? "bg-[#F5D547] font-semibold text-[#1A1A1A]"
                : "bg-transparent text-[#4A4A4A] hover:bg-black/5"
            }`}
          >
            Recent Tasks
          </button>
          <button
            onClick={() => setTab("data")}
            className={`min-h-9 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${
              tab === "data"
                ? "bg-[#F5D547] font-semibold text-[#1A1A1A]"
                : "bg-transparent text-[#4A4A4A] hover:bg-black/5"
            }`}
          >
            Data Management
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === "overview" && (
        <div className="flex flex-col gap-8">
          <ActivityForm />
        </div>
      )}

      {tab === "logs" && <ActivityLogCards />}

      {tab === "data" && <DataManagement embedded />}
    </div>
  );
}
