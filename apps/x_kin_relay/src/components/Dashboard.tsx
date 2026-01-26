"use client";
import { useState } from "react";
import { ActivityForm } from "./ActivityForm";
import { ActivityLogCards } from "./ActivityLogCards";
import { DataManagement } from "./DataManagement";

export function Dashboard() {
  const [tab, setTab] = useState<"overview" | "data">("overview");

  return (
    <div style={mainContainer}>
      {/* Header with title and tabs */}
      <div style={headerRow}>
        <h1 style={pageTitle} aria-label="Dashboard">
          Dashboard
        </h1>
        <div style={tabsContainer}>
          <button
            onClick={() => setTab("overview")}
            style={tab === "overview" ? tabBtnActive : tabBtn}
          >
            Overview
          </button>
          <button
            onClick={() => setTab("data")}
            style={tab === "data" ? tabBtnActive : tabBtn}
          >
            Data Management
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <ActivityForm />
          <ActivityLogCards />
        </div>
      )}

      {tab === "data" && <DataManagementContent />}
    </div>
  );
}

// Inline DataManagement content to avoid layout nesting issues
function DataManagementContent() {
  return <DataManagement embedded />;
}

// Styles
const mainContainer: React.CSSProperties = {
  padding: "100px 24px 60px",
  width: "100%",
  maxWidth: "95vw",
  margin: "0 auto",
  boxSizing: "border-box",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  marginBottom: 24,
  flexWrap: "wrap",
};

const pageTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(24px, 4vw, 32px)",
  fontWeight: 700,
};

const tabsContainer: React.CSSProperties = {
  display: "flex",
  gap: 4,
  background: "rgba(20, 26, 35, 0.8)",
  padding: 4,
  borderRadius: 10,
};

const tabBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  padding: "8px 16px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const tabBtnActive: React.CSSProperties = {
  ...tabBtn,
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff",
};
