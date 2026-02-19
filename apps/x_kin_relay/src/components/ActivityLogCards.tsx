"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { iconFor, a11yLabel } from "./activityIcons";

interface ActivityRow {
  id: string;
  circle_id: string;
  recipient_id: string;
  category: string;
  observed_at: string;
  recorded_by: string;
  details?: any;
  [k: string]: any; // subtype_* keys, etc
}

interface RecipientRow {
  id: string;
  display_name: string;
}

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  safety: { color: "#F97316", bg: "rgba(249, 115, 22, 0.18)" },
  health_observation: { color: "#2DD4BF", bg: "rgba(45, 212, 191, 0.18)" },
  adl: { color: "#60A5FA", bg: "rgba(96, 165, 250, 0.18)" },
  environment: { color: "#34D399", bg: "rgba(52, 211, 153, 0.18)" },
  service: { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.18)" },
  engagement: { color: "#C084FC", bg: "rgba(192, 132, 252, 0.18)" },
};

export function ActivityLogCards() {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [recipientMap, setRecipientMap] = useState<Record<string, string>>({});
  const [autoOpen, setAutoOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as any)) {
        setSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function load() {
    if (!hasSupabase || !supabase) {
      // fallback mock data
      const now = new Date();
      const mock: ActivityRow[] = Array.from({ length: 8 }).map((_, i) => ({
        id: "mock-" + i,
        circle_id: "demo-circle",
        recipient_id: "demo-recipient",
        category: i % 2 ? "adl" : "safety",
        observed_at: new Date(now.getTime() - i * 3600_000).toISOString(),
        recorded_by: "demo-user",
        subtype_safety: i % 2 ? null : "fall_prevented",
        subtype_adl: i % 2 ? "meal" : null,
        details: { note: i % 2 ? "Completed meal" : "Risk mitigated" },
      }));
      setActivities(mock);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("kr_activities")
      .select("*")
      .order("observed_at", { ascending: false })
      .limit(200);
    if (error) setError(error.message);
    else setActivities(data || []);
    setLoading(false);
  }

  // Load recipients for name mapping
  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    const recipientIds = Array.from(
      new Set(activities.map((a) => a.recipient_id).filter(Boolean)),
    );
    if (!recipientIds.length) return;
    supabase
      .from("care_recipients")
      .select("id,display_name")
      .in("id", recipientIds)
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data || []).forEach((r: any) => (map[r.id] = r.display_name));
        setRecipientMap((m) => ({ ...m, ...map }));
      });
  }, [activities]);

  useEffect(() => {
    load();
  }, []);

  const subtypeKeyFor = (a: ActivityRow) => {
    const k = Object.keys(a).find(
      (k) => k.startsWith("subtype_") && a[k] && typeof a[k] === "string",
    );
    return k;
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activities;
    return activities.filter((a) => {
      const subK = subtypeKeyFor(a);
      const subtype = subK ? a[subK] : "";
      const recipient = recipientMap[a.recipient_id];
      const hay = [
        a.category,
        subtype,
        recipient,
        a.details && JSON.stringify(a.details),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [activities, search, recipientMap]);

  const suggestions = useMemo(() => {
    const pool = new Set<string>();
    activities.forEach((a) => {
      const subK = subtypeKeyFor(a);
      if (subK && a[subK]) pool.add(String(a[subK]));
      pool.add(a.category);
      if (recipientMap[a.recipient_id]) pool.add(recipientMap[a.recipient_id]);
    });
    const arr = Array.from(pool).sort();
    if (!search) return arr.slice(0, 15);
    return arr.filter((s) => s.toLowerCase().includes(search.toLowerCase()));
  }, [activities, search, recipientMap]);

  function toggleExpand(id: string) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  function formattedTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }

  function primaryLabel(a: ActivityRow) {
    const subK = subtypeKeyFor(a);
    const subtype = subK ? a[subK] : null;
    if (subtype) return subtype;
    return a.category;
  }

  const gridCols =
    filtered.length < 3
      ? `repeat(${filtered.length},1fr)`
      : "repeat(auto-fill,minmax(240px,1fr))";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative" }} ref={suggestRef}>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSuggestOpen(true);
            }}
            onFocus={() => setSuggestOpen(true)}
            placeholder="Filter by category / subtype / recipient"
            style={searchBox}
          />
          {suggestOpen && suggestions.length > 0 && (
            <div style={suggestList}>
              {suggestions.slice(0, 30).map((s) => (
                <div
                  key={s}
                  style={suggestItem}
                  onClick={() => {
                    setSearch(s);
                    setSuggestOpen(false);
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          style={smallBtn}
          onClick={() => {
            setSearch("");
            setSuggestOpen(false);
          }}
        >
          Clear
        </button>
        <button style={smallBtn} onClick={load} disabled={loading}>
          {loading ? "…" : "Reload"}
        </button>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          <input
            type="checkbox"
            checked={autoOpen}
            onChange={(e) => setAutoOpen(e.target.checked)}
          />
          Auto expand
        </label>
      </div>
      {error && <div style={errBox}>Error: {error}</div>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: 16,
          width: "100%",
        }}
      >
        {filtered.map((a) => {
          const color =
            CATEGORY_COLORS[a.category] ||
            "linear-gradient(135deg,#475569,#1e293b)";
          const subK = subtypeKeyFor(a);
          const subtype = subK ? a[subK] : null;
          const isOpen = expanded[a.id] || (autoOpen && !!a.details);
          const recName = recipientMap[a.recipient_id];
          const subtypesAll = Object.keys(a)
            .filter((k) => k.startsWith("subtype_") && a[k])
            .map((k) => a[k]);
          const icon = iconFor(
            a.category,
            subtypesAll[0] as string | undefined,
          );
          const colors = CATEGORY_COLORS[a.category] || {
            color: "#4A7A72",
            bg: "rgba(136, 185, 176, 0.18)",
          };
          return (
            <div
              key={a.id}
              style={{
                ...card,
                background: colors.bg,
                borderColor: colors.color,
              }}
              aria-label={`Activity card ${a.category}`}
            >
              <button
                onClick={() => toggleExpand(a.id)}
                style={cardInnerBtn}
                title="Toggle details"
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  <span
                    style={cardIcon}
                    role="img"
                    aria-label={a11yLabel(
                      a.category,
                      subtypesAll[0] as string | undefined,
                    )}
                  >
                    {icon}
                  </span>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.85,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {a.category}
                  </div>
                  <div
                    style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25 }}
                  >
                    {primaryLabel(a)}
                  </div>
                  {recName && (
                    <div style={{ fontSize: 11, opacity: 0.9 }}>
                      👤 {recName}
                    </div>
                  )}
                  <div style={{ fontSize: 11, opacity: 0.7 }}>
                    {formattedTime(a.observed_at)}
                  </div>
                  {subtypesAll.length > 1 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                        marginTop: 4,
                      }}
                    >
                      {subtypesAll.map((s) => (
                        <span key={s} style={chip}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 20, opacity: 0.6 }}>
                  {isOpen ? "−" : "+"}
                </div>
              </button>
              {isOpen && (
                <div style={detailsBox}>
                  {a.details && (
                    <pre style={detailsPre}>
                      {JSON.stringify(a.details, null, 2)}
                    </pre>
                  )}
                  {!a.details && (
                    <div style={{ fontSize: 12, opacity: 0.6 }}>
                      No additional details.
                    </div>
                  )}
                  <div style={metaRow}>
                    <span>ID: {a.id}</span>
                    {subtype && <span>Subtype: {subtype}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && !filtered.length && (
          <div style={{ fontSize: 12, opacity: 0.6 }}>No activities</div>
        )}
        {loading && <div style={{ fontSize: 12, opacity: 0.6 }}>Loading…</div>}
      </div>
      {!hasSupabase && (
        <div style={{ fontSize: 11, opacity: 0.55 }}>Demo mode (mock data)</div>
      )}
    </div>
  );
}

const searchBox: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(16px)",
  border: "2px solid rgba(0, 0, 0, 0.15)",
  padding: "14px 18px",
  borderRadius: 12,
  color: "#1A1A1A",
  minWidth: 280,
  outline: "none",
  fontSize: 15,
  fontWeight: 500,
  minHeight: 48,
  transition: "all 0.2s ease",
};
const suggestList: React.CSSProperties = {
  position: "absolute",
  top: "105%",
  left: 0,
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(24px)",
  border: "2px solid rgba(0, 0, 0, 0.1)",
  borderRadius: 14,
  padding: 8,
  zIndex: 40,
  width: "100%",
  maxHeight: 280,
  overflowY: "auto",
  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
};
const suggestItem: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 500,
  color: "#1A1A1A",
};
Object.assign(suggestItem, {
  ["--hover-bg"]: "rgba(0,0,0,0.06)",
});
const smallBtn: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(12px)",
  border: "2px solid rgba(0, 0, 0, 0.15)",
  padding: "12px 18px",
  borderRadius: 12,
  color: "#1A1A1A",
  fontSize: 14,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 48,
  transition: "all 0.2s ease",
};
const card: React.CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  borderRadius: 16,
  padding: 0,
  color: "#1A1A1A",
  minHeight: 140,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(12px)",
};
const cardIcon: React.CSSProperties = {
  fontSize: 24,
  lineHeight: 1,
  marginBottom: 2,
};
const cardInnerBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  textAlign: "left",
  padding: "16px 18px",
  display: "flex",
  gap: 14,
  cursor: "pointer",
  color: "inherit",
  font: "inherit",
  width: "100%",
  alignItems: "flex-start",
  minHeight: 44,
};
const detailsBox: React.CSSProperties = {
  background: "rgba(0,0,0,0.03)",
  padding: "12px 16px 16px",
  borderTop: "1px solid rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};
const detailsPre: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.5,
  background: "rgba(0,0,0,0.04)",
  padding: 10,
  borderRadius: 10,
  maxHeight: 160,
  overflow: "auto",
  color: "#374151",
};
const metaRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  fontSize: 12,
  color: "#6B7280",
};
const chip: React.CSSProperties = {
  background: "rgba(0,0,0,0.06)",
  color: "#374151",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: 0.3,
  textTransform: "uppercase",
};
const errBox: React.CSSProperties = {
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.3)",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: 13,
  color: "#EF4444",
};
