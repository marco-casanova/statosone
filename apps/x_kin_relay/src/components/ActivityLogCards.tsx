"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  User,
} from "lucide-react";
import { iconFor, a11yLabel } from "./activityIcons";
import { getActivitySubtypeValues } from "./activitySubtypeValues";

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

interface CaregiverProfileRow {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  safety: { color: "#F97316", bg: "rgba(249, 115, 22, 0.18)" },
  health_observation: { color: "#2DD4BF", bg: "rgba(45, 212, 191, 0.18)" },
  adl: { color: "#60A5FA", bg: "rgba(96, 165, 250, 0.18)" },
  environment: { color: "#34D399", bg: "rgba(52, 211, 153, 0.18)" },
  service: { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.18)" },
  engagement: { color: "#C084FC", bg: "rgba(192, 132, 252, 0.18)" },
};

interface ClientRow {
  id: string;
  display_name: string;
}

export function ActivityLogCards() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loadingClients, setLoadingClients] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(new Date()));
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [recipientMap, setRecipientMap] = useState<Record<string, string>>({});
  const [caregiverMap, setCaregiverMap] = useState<Record<string, string>>({});
  const [autoOpen, setAutoOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as any)) {
        setSuggestOpen(false);
      }
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as any)
      ) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load clients on mount
  useEffect(() => {
    async function loadClients() {
      if (!hasSupabase || !supabase) {
        const demo: ClientRow[] = [
          { id: "demo-client-1", display_name: "Maria Schmidt" },
          { id: "demo-client-2", display_name: "Hans Müller" },
        ];
        setClients(demo);
        setSelectedClientId(demo[0].id);
        return;
      }
      setLoadingClients(true);
      const { data, error } = await supabase
        .from("kr_clients")
        .select("id, display_name")
        .order("display_name");
      if (!error && data) {
        setClients(data);
        if (data.length > 0) setSelectedClientId(data[0].id);
      }
      setLoadingClients(false);
    }
    loadClients();
  }, []);

  async function load(clientId?: string) {
    const cid = clientId || selectedClientId;
    if (!cid) {
      setActivities([]);
      return;
    }
    if (!hasSupabase || !supabase) {
      // fallback mock data
      const now = new Date();
      const mock: ActivityRow[] = Array.from({ length: 8 }).map((_, i) => ({
        id: "mock-" + i,
        circle_id: "demo-circle",
        recipient_id: cid,
        category: i % 2 ? "adl" : "safety",
        observed_at: new Date(now.getTime() - i * 3600_000).toISOString(),
        recorded_by: i % 2 ? "demo-caregiver-1" : "demo-caregiver-2",
        subtype_safety: i % 2 ? null : "fall_prevented",
        subtype_adl: i % 2 ? "meal" : null,
        details: { note: i % 2 ? "Completed meal" : "Risk mitigated" },
      }));
      setActivities(mock);
      setCaregiverMap({
        "demo-caregiver-1": "Alex Morgan",
        "demo-caregiver-2": "jamie.carter@example.com",
      });
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("kr_activities")
      .select("*")
      .eq("recipient_id", cid)
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

  // Load caregivers (name first, otherwise email fallback) for activity attribution
  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    const caregiverIds = Array.from(
      new Set(activities.map((a) => a.recorded_by).filter(Boolean)),
    );
    if (!caregiverIds.length) return;
    supabase
      .from("profiles")
      .select("id,full_name,email")
      .in("id", caregiverIds)
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data as CaregiverProfileRow[] | null)?.forEach((row) => {
          const preferred =
            row.full_name?.trim() || row.email?.trim() || row.id;
          map[row.id] = preferred;
        });
        setCaregiverMap((current) => ({ ...current, ...map }));
      });
  }, [activities]);

  // Reload activities when selected client changes
  useEffect(() => {
    if (selectedClientId) load(selectedClientId);
  }, [selectedClientId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("kr-activity-log-view-mode");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("kr-activity-log-view-mode", viewMode);
  }, [viewMode]);

  const subtypeKeyFor = (a: ActivityRow) => {
    const k = Object.keys(a).find(
      (k) => k.startsWith("subtype_") && a[k] && typeof a[k] === "string",
    );
    return k;
  };

  const filtered = useMemo(() => {
    const dateFiltered = activities.filter((activity) => {
      const activityDate = toDateKey(new Date(activity.observed_at));
      if (!activityDate) return false;
      if (startDate && activityDate < startDate) return false;
      if (endDate && activityDate > endDate) return false;
      return true;
    });

    const term = search.trim().toLowerCase();
    if (!term) return dateFiltered;
    return dateFiltered.filter((a) => {
      const subK = subtypeKeyFor(a);
      const subtype = subK ? a[subK] : "";
      const recipient = recipientMap[a.recipient_id];
      const caregiver = caregiverMap[a.recorded_by] || a.recorded_by;
      const hay = [
        a.category,
        subtype,
        recipient,
        caregiver,
        a.details && JSON.stringify(a.details),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [activities, search, recipientMap, caregiverMap, startDate, endDate]);

  const suggestions = useMemo(() => {
    const pool = new Set<string>();
    activities.forEach((a) => {
      const subK = subtypeKeyFor(a);
      if (subK && a[subK]) pool.add(String(a[subK]));
      pool.add(a.category);
      if (recipientMap[a.recipient_id]) pool.add(recipientMap[a.recipient_id]);
      if (caregiverMap[a.recorded_by]) pool.add(caregiverMap[a.recorded_by]);
    });
    const arr = Array.from(pool).sort();
    if (!search) return arr.slice(0, 15);
    return arr.filter((s) => s.toLowerCase().includes(search.toLowerCase()));
  }, [activities, search, recipientMap, caregiverMap]);

  const activityDaySet = useMemo(() => {
    const days = new Set<string>();
    activities.forEach((activity) => {
      const key = toDateKey(new Date(activity.observed_at));
      if (key) days.add(key);
    });
    return days;
  }, [activities]);

  const calendarCells = useMemo(
    () => buildCalendarCells(calendarMonth),
    [calendarMonth],
  );

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
    // Prefer saved subcategory label (human-readable, already translated)
    if (a.details?.subcategory_label) return a.details.subcategory_label;
    const subK = subtypeKeyFor(a);
    const subtype = subK ? a[subK] : null;
    if (subtype) return prettyKey(subtype);
    return prettyKey(a.category);
  }

  const gridCols =
    filtered.length < 3
      ? `repeat(${filtered.length},1fr)`
      : "repeat(auto-fill,minmax(240px,1fr))";

  const hasDateFilter = Boolean(startDate || endDate);
  const dateFilterLabel = hasDateFilter
    ? startDate && endDate
      ? startDate === endDate
        ? `On ${formatDateKey(startDate)}`
        : `${formatDateKey(startDate)} - ${formatDateKey(endDate)}`
      : startDate
        ? `From ${formatDateKey(startDate)}`
        : `Until ${formatDateKey(endDate)}`
    : "All dates";

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
      {/* Client selector */}
      <div style={clientSelectorRow}>
        <User size={18} style={{ opacity: 0.7, flexShrink: 0 }} />
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          style={clientSelect}
          aria-label="Select client"
          disabled={loadingClients}
        >
          {loadingClients ? (
            <option>Loading…</option>
          ) : clients.length === 0 ? (
            <option value="">No clients</option>
          ) : (
            clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.display_name || c.id}
              </option>
            ))
          )}
        </select>
      </div>

      <div style={topBar}>
        <div style={dateFilterPill(hasDateFilter)}>{dateFilterLabel}</div>
        <div style={topBarActions}>
          <div
            style={viewToggleGroup}
            role="group"
            aria-label="Change task view"
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              style={toggleBtn(viewMode === "grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              style={toggleBtn(viewMode === "list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>

          <div ref={calendarRef} style={calendarWrap}>
            <button
              type="button"
              onClick={() => setIsCalendarOpen((open) => !open)}
              style={calendarToggleBtn(isCalendarOpen || hasDateFilter)}
              aria-label="Date filter"
              aria-pressed={isCalendarOpen}
              title="Date filter"
            >
              <Calendar size={16} />
            </button>

            {isCalendarOpen && (
              <div style={calendarPanel}>
                <div style={calendarPanelTitle}>Filter by date</div>
                <div style={calendarInputRow}>
                  <label style={calendarLabel}>
                    Start
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (
                          endDate &&
                          e.target.value &&
                          endDate < e.target.value
                        ) {
                          setEndDate(e.target.value);
                        }
                      }}
                      style={calendarInput}
                    />
                  </label>
                  <label style={calendarLabel}>
                    End
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (
                          startDate &&
                          e.target.value &&
                          startDate > e.target.value
                        ) {
                          setStartDate(e.target.value);
                        }
                      }}
                      style={calendarInput}
                    />
                  </label>
                </div>

                <div style={calendarQuickActions}>
                  <button
                    type="button"
                    style={calendarActionBtn}
                    onClick={() => {
                      const today = toDateKey(new Date());
                      setStartDate(today);
                      setEndDate(today);
                    }}
                  >
                    Today only
                  </button>
                  <button
                    type="button"
                    style={calendarActionBtn}
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div style={calendarMonthHeader}>
                  <button
                    type="button"
                    style={monthNavBtn}
                    aria-label="Previous month"
                    onClick={() =>
                      setCalendarMonth((current) =>
                        startOfMonth(addMonths(current, -1)),
                      )
                    }
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div style={calendarMonthLabel}>
                    {monthYearLabel(calendarMonth)}
                  </div>
                  <button
                    type="button"
                    style={monthNavBtn}
                    aria-label="Next month"
                    onClick={() =>
                      setCalendarMonth((current) =>
                        startOfMonth(addMonths(current, 1)),
                      )
                    }
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div style={weekHeaderGrid}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div key={day} style={weekHeaderCell}>
                        {day}
                      </div>
                    ),
                  )}
                </div>

                <div style={calendarDaysGrid}>
                  {calendarCells.map((cell) => {
                    const hasActivity = activityDaySet.has(cell.dateKey);
                    const isInRange =
                      Boolean(startDate && endDate) &&
                      cell.dateKey >= startDate &&
                      cell.dateKey <= endDate;
                    const isSingleDay =
                      Boolean(startDate && endDate && startDate === endDate) &&
                      cell.dateKey === startDate;

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        style={calendarDayCell(
                          cell.inCurrentMonth,
                          hasActivity,
                          isInRange,
                          isSingleDay,
                        )}
                        onClick={() => {
                          setStartDate(cell.dateKey);
                          setEndDate(cell.dateKey);
                        }}
                        aria-label={`Select ${formatDateKey(cell.dateKey)}`}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>

                <div style={calendarHint}>
                  <span style={calendarHintDot} /> Green days have activities.
                  Click a day to filter a single day.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {error && <div style={errBox}>Error: {error}</div>}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: viewMode === "grid" ? 14 : 10,
          width: "100%",
          ...(viewMode === "grid"
            ? {
                display: "grid",
                gridTemplateColumns: gridCols,
              }
            : {}),
        }}
      >
        {filtered.map((a) => {
          const subK = subtypeKeyFor(a);
          const subtype = subK ? a[subK] : null;
          const isOpen = expanded[a.id] || (autoOpen && !!a.details);
          const recName = recipientMap[a.recipient_id];
          const subtypesAll = getActivitySubtypeValues(a);
          const caregiverLabel = caregiverMap[a.recorded_by] || a.recorded_by;
          const icon = iconFor(
            a.category,
            subtypesAll[0] as string | undefined,
          );
          const colors = CATEGORY_COLORS[a.category] || {
            color: "#4A7A72",
            bg: "rgba(136, 185, 176, 0.18)",
          };
          const detailLines = extractDetailSummary(a.details);
          const displayLabel = primaryLabel(a);
          const sleepRange =
            a.details?.sleep_start && a.details?.sleep_end
              ? `${fmtTime(new Date(a.details.sleep_start))} a ${fmtTime(new Date(a.details.sleep_end))}`
              : null;
          return (
            <div
              key={a.id}
              style={{
                ...logCard,
                background: colors.bg,
                borderLeft: `4px solid ${colors.color}`,
              }}
              aria-label={`Activity card ${a.category}`}
            >
              {/* Main clickable area */}
              <button
                onClick={() => toggleExpand(a.id)}
                style={logCardBtn}
                title="Toggle details"
              >
                {/* Top row: icon + label ... date + time */}
                <div style={logCardTopRow}>
                  <span
                    style={logCardIconStyle}
                    role="img"
                    aria-label={a11yLabel(
                      a.category,
                      subtypesAll[0] as string | undefined,
                    )}
                  >
                    {icon}
                  </span>
                  <div style={logCardLabelStyle}>{displayLabel}</div>
                  <div style={logCardDateTimeStyle}>
                    <span>{fmtDate(a.observed_at)}</span>
                    <span style={{ fontWeight: 700 }}>
                      {sleepRange || fmtTime(new Date(a.observed_at))}
                    </span>
                  </div>
                </div>

                {/* Detail lines below */}
                {detailLines.length > 0 && (
                  <div style={logCardDetailLines}>
                    {detailLines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                )}
              </button>

              {/* Expanded raw details */}
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
                    {recName && <span>Client: {recName}</span>}
                    {caregiverLabel && <span>Caregiver: {caregiverLabel}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && !filtered.length && (
          <div
            style={{
              fontSize: 13,
              opacity: 0.5,
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            {selectedClientId
              ? "No activities found for this client."
              : "Select a client to view their activity logs."}
          </div>
        )}
        {loading && <div style={{ fontSize: 12, opacity: 0.6 }}>Loading…</div>}
      </div>
      {!hasSupabase && (
        <div style={{ fontSize: 11, opacity: 0.55 }}>Demo mode (mock data)</div>
      )}
    </div>
  );
}

interface CalendarCell {
  key: string;
  day: number;
  inCurrentMonth: boolean;
  dateKey: string;
}

function toDateKey(date: Date) {
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateKey(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function monthYearLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

// ── Formatting helpers ──────────────────────────────────────────
function prettyKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function extractDetailSummary(details: any): string[] {
  if (!details) return [];
  const lines: string[] = [];

  // Hydration: "200ml orange juice…"
  if (details.total && details.unit) {
    let h = `${details.total}${details.unit}`;
    if (details.fluid_type) h += ` ${details.fluid_type}`;
    lines.push(h);
  }

  // Medication: "PARACETAMOL 500mg, 1 tab"
  if (details.medication) {
    let m = (details.medication.name || "").toUpperCase();
    if (details.medication.dosage) m += ` ${details.medication.dosage}`;
    if (details.medication.route) m += `,  ${details.medication.route}`;
    if (m.trim()) lines.push(m);
  }

  // Vital sign readings
  if (details.readings && typeof details.readings === "object") {
    Object.entries(details.readings).forEach(([key, val]) => {
      if (val) lines.push(`${prettyKey(key)}: ${val}`);
    });
  }

  // Food type
  if (details.food_type) lines.push(details.food_type);

  // Equipment
  if (details.equipment_used?.length) {
    lines.push(details.equipment_used.map((e: any) => e.label).join(", "));
  }

  // Incident issues
  if (details.issue_types?.length) {
    lines.push(details.issue_types.map((i: any) => i.label).join(", "));
  }

  // Body locations
  if (details.body_locations?.length) {
    lines.push(
      "Location: " +
        details.body_locations.map((b: any) => b.label || b).join(", "),
    );
  }

  // Generic value + label (non-hydration)
  if (details.value && details.label && !details.total) {
    lines.push(`${details.label}: ${details.value}${details.unit || ""}`);
  }

  // Description / note
  if (details.description) lines.push(details.description);
  if (details.note) lines.push(details.note);

  return lines;
}

function buildCalendarCells(month: Date): CalendarCell[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const offset = (firstDay.getDay() + 6) % 7; // Monday-first grid
  const firstVisible = new Date(year, monthIndex, 1 - offset);

  return Array.from({ length: 42 }).map((_, index) => {
    const day = new Date(firstVisible);
    day.setDate(firstVisible.getDate() + index);
    const dateKey = toDateKey(day);
    return {
      key: `${dateKey}-${index}`,
      day: day.getDate(),
      inCurrentMonth: day.getMonth() === monthIndex,
      dateKey,
    };
  });
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
// ── New log card styles (screenshot-matching) ─────────────────
const logCard: React.CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  borderRadius: 14,
  padding: 0,
  color: "#1A1A1A",
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.06)",
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};
const logCardBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  textAlign: "left",
  padding: "14px 18px",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  cursor: "pointer",
  color: "inherit",
  font: "inherit",
  width: "100%",
};
const logCardTopRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
};
const logCardIconStyle: React.CSSProperties = {
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.85,
};
const logCardLabelStyle: React.CSSProperties = {
  flex: 1,
  fontWeight: 800,
  fontSize: 15,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  lineHeight: 1.3,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const logCardDateTimeStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexShrink: 0,
  fontSize: 14,
  fontWeight: 600,
  color: "#374151",
  whiteSpace: "nowrap",
};
const logCardDetailLines: React.CSSProperties = {
  paddingLeft: 34,
  fontSize: 14,
  lineHeight: 1.5,
  color: "#374151",
  fontWeight: 500,
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

const topBar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const topBarActions: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const dateFilterPill = (active: boolean): React.CSSProperties => ({
  fontSize: 12,
  fontWeight: 600,
  color: active ? "#166534" : "#374151",
  background: active ? "rgba(34, 197, 94, 0.18)" : "rgba(255,255,255,0.72)",
  border: active
    ? "1px solid rgba(34, 197, 94, 0.35)"
    : "1px solid rgba(0,0,0,0.12)",
  borderRadius: 999,
  padding: "7px 12px",
  backdropFilter: "blur(8px)",
});

const viewToggleGroup: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 12,
  padding: 6,
  backdropFilter: "blur(12px)",
};

const toggleBtn = (active: boolean): React.CSSProperties => ({
  border: "none",
  borderRadius: 8,
  width: 34,
  height: 34,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: active ? "#1A1A1A" : "#4B5563",
  background: active ? "#F5D547" : "transparent",
  boxShadow: active ? "0 2px 8px rgba(245,213,71,0.35)" : "none",
  transition: "all 0.15s ease",
});

const calendarWrap: React.CSSProperties = {
  position: "relative",
};

const calendarToggleBtn = (active: boolean): React.CSSProperties => ({
  ...toggleBtn(active),
  width: 36,
  height: 36,
});

const calendarPanel: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  width: 328,
  maxWidth: "90vw",
  background: "rgba(255, 255, 255, 0.97)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 14,
  boxShadow: "0 14px 34px rgba(0,0,0,0.16)",
  padding: 12,
  zIndex: 60,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const calendarPanelTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#111827",
};

const calendarInputRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const calendarLabel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 11,
  color: "#4B5563",
  fontWeight: 600,
};

const calendarInput: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(0,0,0,0.14)",
  borderRadius: 8,
  padding: "7px 8px",
  background: "#fff",
  fontSize: 12,
  color: "#111827",
};

const calendarQuickActions: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const calendarActionBtn: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 8,
  background: "rgba(255,255,255,0.9)",
  color: "#1F2937",
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 9px",
  cursor: "pointer",
};

const calendarMonthHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const monthNavBtn: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 8,
  width: 28,
  height: 28,
  background: "#fff",
  color: "#374151",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const calendarMonthLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#1F2937",
  textTransform: "capitalize",
};

const weekHeaderGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 6,
};

const weekHeaderCell: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#6B7280",
  textAlign: "center",
};

const calendarDaysGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 6,
};

const calendarDayCell = (
  inCurrentMonth: boolean,
  hasActivity: boolean,
  inRange: boolean,
  singleDay: boolean,
): React.CSSProperties => ({
  border: singleDay
    ? "1px solid rgba(234, 179, 8, 0.9)"
    : "1px solid rgba(0,0,0,0.08)",
  borderRadius: 8,
  height: 34,
  background: singleDay
    ? "rgba(245, 213, 71, 0.65)"
    : inRange
      ? "rgba(16, 185, 129, 0.28)"
      : hasActivity
        ? "rgba(34, 197, 94, 0.18)"
        : "rgba(255,255,255,0.9)",
  color: inCurrentMonth ? "#111827" : "#9CA3AF",
  fontSize: 12,
  fontWeight: singleDay ? 700 : 600,
  cursor: "pointer",
});

const calendarHint: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 11,
  color: "#4B5563",
};

const calendarHintDot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "rgba(34, 197, 94, 0.55)",
  border: "1px solid rgba(34, 197, 94, 0.8)",
};

const clientSelectorRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 16px",
  background: "rgba(255, 255, 255, 0.92)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(0, 0, 0, 0.10)",
  borderRadius: 14,
};
const clientSelect: React.CSSProperties = {
  flex: 1,
  border: "none",
  background: "transparent",
  fontSize: 16,
  fontWeight: 700,
  color: "#1A1A1A",
  outline: "none",
  cursor: "pointer",
  appearance: "auto",
  padding: "4px 0",
};

// legacy list styles removed — now using logCard* styles
