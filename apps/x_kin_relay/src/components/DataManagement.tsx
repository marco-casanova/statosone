"use client";
import { CrudTable } from "./crud/CrudTable";
import { ActivityReviewList } from "./ActivityReviewList";
import { useState, useEffect } from "react";
import MedicationSearch from "./MedicationSearch";
import { supabase, hasSupabase } from "@/lib/supabaseClient";

// Client selector component for recipient_id fields (supports multi-select)
function ClientSelector({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  const [clients, setClients] = useState<
    { id: string; display_name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const selectedIds = value ? value.split(",").filter(Boolean) : [];

  useEffect(() => {
    async function loadClients() {
      if (!hasSupabase || !supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("kr_clients")
        .select("id, display_name")
        .order("display_name");
      setClients(data || []);
      setLoading(false);
    }
    loadClients();
  }, []);

  const toggleClient = (clientId: string) => {
    const newSelected = selectedIds.includes(clientId)
      ? selectedIds.filter((id) => id !== clientId)
      : [...selectedIds, clientId];
    onChange(newSelected.join(","));
  };

  const selectedNames = clients
    .filter((c) => selectedIds.includes(c.id))
    .map((c) => c.display_name);

  return (
    <div style={{ position: "relative", minWidth: 160 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          border: "1px solid rgba(209, 213, 219, 0.6)",
          borderRadius: 8,
          padding: "10px 14px",
          color: "#1A1A1A",
          fontSize: 14,
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {selectedNames.length > 0
            ? selectedNames.length === 1
              ? selectedNames[0]
              : `${selectedNames.length} clients selected`
            : "— Select Clients —"}
        </span>
        <span style={{ opacity: 0.5, color: "#6B7280" }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.98)",
            border: "1px solid rgba(209, 213, 219, 0.5)",
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 200,
            overflowY: "auto",
            zIndex: 100,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          }}
        >
          {clients.length === 0 ? (
            <div
              style={{
                padding: 12,
                opacity: 0.6,
                fontSize: 13,
                color: "#6B7280",
              }}
            >
              No clients found. Add clients first.
            </div>
          ) : (
            clients.map((c) => (
              <label
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(209, 213, 219, 0.2)",
                  background: selectedIds.includes(c.id)
                    ? "rgba(245, 213, 71, 0.15)"
                    : "transparent",
                  color: "#1A1A1A",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = selectedIds.includes(c.id)
                    ? "rgba(245, 213, 71, 0.25)"
                    : "rgba(136, 185, 176, 0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = selectedIds.includes(c.id)
                    ? "rgba(245, 213, 71, 0.15)"
                    : "transparent")
                }
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(c.id)}
                  onChange={() => toggleClient(c.id)}
                  style={{ accentColor: "#F5D547" }}
                />
                <span style={{ fontSize: 14 }}>{c.display_name}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Tab config
const TABS = [
  { key: "review", label: "Activity Logs", icon: "📋" },
  { key: "kr_clients", label: "Clients", icon: "👥" },
  { key: "kr_care_circles", label: "Care Circles", icon: "🔄" },
  { key: "kr_medications", label: "Medications", icon: "💊" },
  { key: "kr_activities", label: "All Activities", icon: "📊" },
];

const TAB_DESCRIPTIONS: Record<string, string> = {
  review:
    "Review and edit all logged activities. Filter, search, and make corrections.",
  kr_care_circles:
    "Care coordination groups. Create circles to organize caregivers around a client.",
  kr_clients:
    "People receiving care. Add and manage client profiles and care requirements.",
  kr_medications:
    "Medication management. Track prescriptions, dosages, and schedules.",
  kr_activities:
    "Full activity log database. View, filter, and export all care activities.",
};

function SectionHeader({ tabKey }: { tabKey: string }) {
  const [show, setShow] = useState(false);
  const tab = TABS.find((t) => t.key === tabKey);
  const description = TAB_DESCRIPTIONS[tabKey];
  if (!tab) return null;

  return (
    <div style={sectionHeaderStyle}>
      <h2 style={sectionTitleStyle}>{tab.label}</h2>
      <span style={{ position: "relative", display: "inline-flex" }}>
        <span
          style={helpIcon}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          onClick={() => setShow(!show)}
          role="button"
          aria-label="Show section description"
          tabIndex={0}
        >
          ?
        </span>
        {show && <span style={tooltipBox}>{description}</span>}
      </span>
    </div>
  );
}

export function DataManagement({ embedded = false }: { embedded?: boolean }) {
  const [tab, setTab] = useState("kr_clients");

  return (
    <div style={embedded ? embeddedContainer : mainContainer}>
      {!embedded && (
        <div style={headerRow}>
          <div>
            <h1 style={pageTitle}>Data Management</h1>
            <p style={subtitle}>
              Manage clients, medications, care circles and activity logs
            </p>
          </div>
        </div>
      )}

      {/* Sidebar + Content Layout */}
      <div style={layoutContainer}>
        {/* Sidebar Navigation */}
        <nav style={sidebar}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={t.key === tab ? sidebarBtnActive : sidebarBtn}
            >
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div style={contentArea}>
          {tab === "review" && (
            <>
              <SectionHeader tabKey="review" />
              <ActivityReviewList />
            </>
          )}

          {tab === "kr_care_circles" && (
            <>
              <SectionHeader tabKey="kr_care_circles" />
              <CrudTable
                table="kr_care_circles"
                title=""
                columns={[
                  { key: "id", label: "ID", editable: false },
                  { key: "name", label: "Name", sortable: true },
                  {
                    key: "type",
                    label: "Type",
                    options: [
                      { value: "family", color: "rgba(96,165,250,0.25)" },
                      {
                        value: "senior_wg",
                        label: "Senior WG",
                        color: "rgba(167,139,250,0.25)",
                      },
                      {
                        value: "ambulant_service",
                        label: "Ambulant",
                        color: "rgba(125,211,252,0.25)",
                      },
                    ],
                    sortable: true,
                  },
                  { key: "created_by", label: "Creator" },
                  { key: "created_at", label: "Created", editable: false },
                ]}
              />
            </>
          )}

          {tab === "kr_clients" && (
            <>
              <SectionHeader tabKey="kr_clients" />
              <CrudTable
                table="kr_clients"
                title=""
                columns={[
                  { key: "id", label: "ID", editable: false },
                  { key: "circle_id", label: "Circle" },
                  { key: "display_name", label: "Name" },
                  { key: "birth_year", label: "Birth Year", type: "number" },
                  {
                    key: "primary_language",
                    label: "Lang",
                    options: ["de", "en", "tr", "ar", "pl", "ru", "uk", "es"],
                  },
                  { key: "created_at", label: "Created", editable: false },
                ]}
              />
            </>
          )}

          {tab === "kr_medications" && (
            <>
              <SectionHeader tabKey="kr_medications" />
              <CrudTable
                table="kr_medications"
                title=""
                columns={[
                  { key: "id", label: "ID", editable: false },
                  {
                    key: "recipient_id",
                    label: "Recipient",
                    renderInput: ({ value, onChange }) => (
                      <ClientSelector value={value} onChange={onChange} />
                    ),
                  },
                  {
                    key: "name",
                    label: "Name",
                    width: "clamp(200px, 25vw, 320px)",
                    renderInput: ({ value, onChange }) => (
                      <div style={{ minWidth: 180, width: "100%" }}>
                        <MedicationSearch
                          initialQuery={value ?? ""}
                          onSelect={(p) => onChange(p.name_display)}
                          onCreate={(name) => onChange(name)}
                          maxResults={8}
                          placeholder="Search medication..."
                          hideLabel
                        />
                      </div>
                    ),
                  },
                  {
                    key: "form",
                    label: "Form",
                    options: [
                      "tablet",
                      "capsule",
                      "liquid",
                      "patch",
                      "cream",
                      "inhaler",
                      "drops",
                      "other",
                    ],
                  },
                  {
                    key: "route",
                    label: "Route",
                    options: [
                      "oral",
                      "sublingual",
                      "topical",
                      "transdermal",
                      "inhalation",
                      "ocular",
                      "otic",
                      "nasal",
                      "rectal",
                      "other",
                    ],
                  },
                  { key: "dose", label: "Dose" },
                  { key: "unit", label: "Unit" },
                  {
                    key: "active",
                    label: "Active",
                    options: [
                      {
                        value: "true",
                        label: "Yes",
                        color: "rgba(16,185,129,0.35)",
                      },
                      {
                        value: "false",
                        label: "No",
                        color: "rgba(239,68,68,0.35)",
                      },
                    ],
                  },
                  { key: "created_at", label: "Created", editable: false },
                ]}
              />
            </>
          )}

          {tab === "kr_activities" && (
            <>
              <SectionHeader tabKey="kr_activities" />
              <CrudTable
                table="kr_activities"
                title=""
                columns={[
                  { key: "id", label: "ID", editable: false },
                  { key: "circle_id", label: "Circle" },
                  { key: "recipient_id", label: "Recipient" },
                  {
                    key: "category",
                    label: "Category",
                    options: [
                      { value: "adl", color: "rgba(96,165,250,0.3)" },
                      {
                        value: "health_observation",
                        label: "Health",
                        color: "rgba(45,212,191,0.3)",
                      },
                      { value: "safety", color: "rgba(249,115,22,0.3)" },
                      { value: "engagement", color: "rgba(167,139,250,0.3)" },
                      { value: "service", color: "rgba(251,191,36,0.3)" },
                      { value: "environment", color: "rgba(52,211,153,0.3)" },
                    ],
                  },
                  { key: "subtype", label: "Subtype" },
                  { key: "notes", label: "Notes" },
                  { key: "recorded_by", label: "By" },
                  { key: "recorded_at", label: "Recorded", editable: false },
                ]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles
const mainContainer: React.CSSProperties = {
  padding: "100px 24px 60px",
  maxWidth: 1400,
  margin: "0 auto",
};

const embeddedContainer: React.CSSProperties = {
  width: "100%",
};

const headerRow: React.CSSProperties = {
  marginBottom: 32,
};

const pageTitle: React.CSSProperties = {
  fontSize: "clamp(24px, 4vw, 32px)",
  marginBottom: 8,
  fontWeight: 700,
};

const subtitle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.6,
  margin: 0,
};

const layoutContainer: React.CSSProperties = {
  display: "flex",
  gap: 24,
  minHeight: "calc(100vh - 280px)",
};

const sidebar: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  background: "rgba(255, 255, 255, 0.92)",
  backdropFilter: "blur(16px)",
  borderRadius: 16,
  padding: 10,
  minWidth: 220,
  height: "fit-content",
  position: "sticky",
  top: 100,
  border: "1px solid rgba(0, 0, 0, 0.1)",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
};

const sidebarBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 16px",
  background: "transparent",
  border: "none",
  borderLeft: "3px solid transparent",
  borderRadius: 0,
  color: "#374151",
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.15s ease",
};

const sidebarBtnActive: React.CSSProperties = {
  ...sidebarBtn,
  background: "rgba(245, 213, 71, 0.2)",
  borderLeft: "3px solid #F5D547",
  color: "#1A1A1A",
  fontWeight: 600,
};

const contentArea: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 600,
  color: "#1A1A1A",
};

const helpIcon: React.CSSProperties = {
  width: 24,
  height: 24,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 700,
  background: "rgba(136, 185, 176, 0.3)",
  color: "#6DA19A",
  borderRadius: "50%",
  cursor: "help",
  border: "2px solid rgba(136, 185, 176, 0.5)",
};

const tooltipBox: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 10px)",
  left: 0,
  background: "rgba(255, 255, 255, 0.98)",
  border: "1px solid rgba(209, 213, 219, 0.5)",
  borderRadius: 12,
  padding: "14px 16px",
  minWidth: 260,
  maxWidth: 320,
  zIndex: 1000,
  boxShadow: "0 8px 28px rgba(0, 0, 0, 0.12)",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#374151",
  whiteSpace: "normal",
};
