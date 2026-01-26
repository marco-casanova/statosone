"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { iconFor, a11yLabel } from "./activityIcons";

interface ActivityRow {
  id: string;
  category: string;
  observed_at: string;
  recorded_by: string;
  recipient_id: string;
  [k: string]: any;
}

type RangeMode = "day" | "week";

export function ActivityReviewList() {
  const [mode, setMode] = useState<RangeMode>("day");
  const [refDate, setRefDate] = useState<string>(() => todayLocal());
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openActivity, setOpenActivity] = useState<string | null>(null);

  function dateRange(): { from: Date; to: Date } {
    const base = new Date(refDate + "T00:00:00");
    if (mode === "day") {
      const from = new Date(base);
      const to = new Date(base);
      to.setDate(to.getDate() + 1);
      return { from, to };
    }
    // week (Mon-Sun)
    const day = base.getDay();
    const diff = (day + 6) % 7; // days since Monday
    const monday = new Date(base);
    monday.setDate(base.getDate() - diff);
    const to = new Date(monday);
    to.setDate(monday.getDate() + 7);
    return { from: monday, to };
  }

  async function load() {
    if (!hasSupabase || !supabase) {
      // mock
      const { from } = dateRange();
      const mock: ActivityRow[] = Array.from({ length: 10 }).map((_, i) => ({
        id: "mock-r-" + i,
        category: i % 2 ? "adl" : "safety",
        observed_at: new Date(from.getTime() + i * 3600_000).toISOString(),
        recorded_by: "demo-user",
        recipient_id: "demo-recipient",
        subtype_adl: i % 2 ? "hydration" : null,
        subtype_safety: i % 2 ? null : "falls",
      }));
      setRows(mock);
      return;
    }
    const { from, to } = dateRange();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("kr_activities")
      .select("*")
      .gte("observed_at", from.toISOString())
      .lt("observed_at", to.toISOString())
      .order("observed_at", { ascending: false })
      .limit(500);
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [mode, refDate]);

  const groups = useMemo(() => {
    const map: Record<string, ActivityRow[]> = {};
    rows.forEach((r) => {
      const d = new Date(r.observed_at);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      map[key] = map[key] || [];
      map[key].push(r);
    });
    return Object.entries(map)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([day, items]) => ({ day, items }));
  }, [rows]);

  function labelFor(r: ActivityRow) {
    const sub = Object.keys(r).find(
      (k) => k.startsWith("subtype_") && r[k] && typeof r[k] === "string"
    );
    return (sub && r[sub]) || r.category;
  }
  function timeHM(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={wrap}>
      <div style={bar}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Review Logs</h3>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as RangeMode)}
          style={select}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
        </select>
        <input
          type="date"
          value={refDate}
          onChange={(e) => setRefDate(e.target.value)}
          style={dateInput}
        />
        <button style={reloadBtn} onClick={load} disabled={loading}>
          {loading ? "…" : "Reload"}
        </button>
      </div>
      {error && <div style={err}>{error}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {groups.map((g) => {
          const isOpen = openGroup === g.day;
          return (
            <div key={g.day} style={groupBox}>
              <button
                onClick={() => setOpenGroup(isOpen ? null : g.day)}
                style={groupHead}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <strong style={{ fontSize: 14 }}>{g.day}</strong>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>
                    {g.items.length} logs
                  </span>
                </div>
                <span style={{ fontSize: 20, opacity: 0.5 }}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "4px 4px 10px",
                  }}
                >
                  {g.items.map((r) => {
                    const open = openActivity === r.id;
                    const sub = Object.keys(r).find(
                      (k) => k.startsWith("subtype_") && r[k]
                    );
                    const icon = iconFor(r.category, sub ? r[sub] : undefined);
                    return (
                      <div key={r.id} style={row}>
                        <button
                          onClick={() => setOpenActivity(open ? null : r.id)}
                          style={rowBtn}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={iconGlyph}
                              role="img"
                              aria-label={a11yLabel(
                                r.category,
                                sub ? r[sub] : undefined
                              )}
                            >
                              {icon}
                            </span>
                            <span style={timeChip}>
                              {timeHM(r.observed_at)}
                            </span>
                            <span style={labelChip(r.category)}>
                              {labelFor(r)}
                            </span>
                          </div>
                          <span style={{ fontSize: 16, opacity: 0.5 }}>
                            {open ? "−" : "+"}
                          </span>
                        </button>
                        {open && (
                          <div style={rowDetails}>
                            <pre style={pre}>{JSON.stringify(r, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {!loading && !groups.length && (
          <div style={{ fontSize: 12, opacity: 0.6 }}>No logs</div>
        )}
      </div>
      {!hasSupabase && (
        <div style={{ fontSize: 11, opacity: 0.55 }}>Demo mode (mock data)</div>
      )}
    </div>
  );
}

function todayLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Styles - Design System
const wrap: React.CSSProperties = {
  background: "#141A23",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: 24,
  borderRadius: 20,
  boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
  display: "flex",
  flexDirection: "column",
  gap: 18,
};
const bar: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};
const select: React.CSSProperties = {
  background: "#141A23",
  border: "1px solid #2A3342",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: 14,
  minHeight: 44,
};
const dateInput: React.CSSProperties = { ...select };
const reloadBtn: React.CSSProperties = {
  background: "#141A23",
  border: "1px solid #2A3342",
  padding: "10px 16px",
  borderRadius: 12,
  color: "#B6C0D1",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  minHeight: 44,
};
const err: React.CSSProperties = {
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.3)",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: 13,
  color: "#EF4444",
};
const groupBox: React.CSSProperties = {
  background: "#141A23",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  overflow: "hidden",
};
const groupHead: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#1C2330",
  padding: "14px 18px",
  border: "none",
  cursor: "pointer",
  color: "#fff",
  textAlign: "left",
  minHeight: 44,
};
const row: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  overflow: "hidden",
};
const rowBtn: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  color: "inherit",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  cursor: "pointer",
  textAlign: "left",
  fontSize: 14,
  minHeight: 44,
};
const timeChip: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  color: "#B6C0D1",
};

// Semantic category colors for pills
const CATEGORY_PILL_COLORS: Record<string, { color: string; bg: string }> = {
  safety: { color: "#F97316", bg: "rgba(249, 115, 22, 0.18)" },
  health_observation: { color: "#2DD4BF", bg: "rgba(45, 212, 191, 0.18)" },
  adl: { color: "#60A5FA", bg: "rgba(96, 165, 250, 0.18)" },
  environment: { color: "#34D399", bg: "rgba(52, 211, 153, 0.18)" },
  service: { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.18)" },
  engagement: { color: "#C084FC", bg: "rgba(192, 132, 252, 0.18)" },
};

const labelChip = (cat: string): React.CSSProperties => {
  const colors = CATEGORY_PILL_COLORS[cat] || {
    color: "#6C7CFF",
    bg: "rgba(108, 124, 255, 0.18)",
  };
  return {
    background: colors.bg,
    color: colors.color,
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  };
};
const rowDetails: React.CSSProperties = {
  background: "rgba(0,0,0,0.2)",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  padding: "12px 16px",
};
const pre: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.5,
  background: "rgba(255,255,255,0.06)",
  padding: 12,
  borderRadius: 10,
  maxHeight: 240,
  overflow: "auto",
  color: "#B6C0D1",
};
const iconGlyph: React.CSSProperties = { fontSize: 20, lineHeight: 1 };
