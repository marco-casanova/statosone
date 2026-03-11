"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import {
  Calendar,
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
  const [recipientMap, setRecipientMap] = useState<Record<string, string>>({});
  const [caregiverMap, setCaregiverMap] = useState<Record<string, string>>({});
  const search = "";
  const autoOpen = false;
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
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

  function primaryLabel(a: ActivityRow) {
    // Prefer saved subcategory label (human-readable, already translated)
    if (a.details?.subcategory_label) return a.details.subcategory_label;
    const subK = subtypeKeyFor(a);
    const subtype = subK ? a[subK] : null;
    if (subtype) return prettyKey(subtype);
    return prettyKey(a.category);
  }

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
  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Client selector */}
      <div className="flex items-center gap-2.5 rounded-[14px] border border-black/10 bg-white/90 px-3.5 py-2.5 backdrop-blur-[12px]">
        <User size={18} className="shrink-0 opacity-70" />
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="min-w-0 flex-1 cursor-pointer appearance-auto bg-transparent py-1 text-base font-bold text-[#1A1A1A] outline-none"
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          className={`inline-flex w-fit max-w-full items-center rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-[8px] ${
            hasDateFilter
              ? "border-green-600/35 bg-green-500/20 text-green-800"
              : "border-black/15 bg-white/70 text-slate-700"
          }`}
        >
          {dateFilterLabel}
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white/75 p-1.5 backdrop-blur-[12px]"
            role="group"
            aria-label="Change task view"
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-[#F5D547] text-[#1A1A1A] shadow-[0_2px_8px_rgba(245,213,71,0.35)]"
                  : "text-slate-600 hover:bg-black/5"
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-[#F5D547] text-[#1A1A1A] shadow-[0_2px_8px_rgba(245,213,71,0.35)]"
                  : "text-slate-600 hover:bg-black/5"
              }`}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>

          <div ref={calendarRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCalendarOpen((open) => !open)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                isCalendarOpen || hasDateFilter
                  ? "bg-[#F5D547] text-[#1A1A1A] shadow-[0_2px_8px_rgba(245,213,71,0.35)]"
                  : "text-slate-600 hover:bg-black/5"
              }`}
              aria-label="Date filter"
              aria-pressed={isCalendarOpen}
              title="Date filter"
            >
              <Calendar size={16} />
            </button>

            {isCalendarOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-[60] flex w-[min(20.5rem,calc(100vw-2rem))] flex-col gap-2.5 rounded-[14px] border border-black/10 bg-white/95 p-3 shadow-[0_14px_34px_rgba(0,0,0,0.16)] backdrop-blur-[14px] sm:left-auto sm:right-0 sm:w-80">
                <div className="text-sm font-bold text-slate-900">
                  Filter by date
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
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
                      className="w-full rounded-lg border border-black/15 bg-white px-2 py-1.5 text-xs text-slate-900"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
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
                      className="w-full rounded-lg border border-black/15 bg-white px-2 py-1.5 text-xs text-slate-900"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-black/15 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-black/5"
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
                    className="rounded-lg border border-black/15 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-black/5"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/15 bg-white text-slate-700 transition-colors hover:bg-black/5"
                    aria-label="Previous month"
                    onClick={() =>
                      setCalendarMonth((current) =>
                        startOfMonth(addMonths(current, -1)),
                      )
                    }
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="text-xs font-bold capitalize text-slate-800">
                    {monthYearLabel(calendarMonth)}
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/15 bg-white text-slate-700 transition-colors hover:bg-black/5"
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

                <div className="grid grid-cols-7 gap-1.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-[10px] font-bold text-slate-500"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
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
                        className={calendarDayCellClass(
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

                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full border border-green-500/80 bg-green-500/55" />
                  Green days have activities.
                  Click a day to filter a single day.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/15 px-3.5 py-2.5 text-sm text-red-600">
          Error: {error}
        </div>
      )}

      <div
        className={
          viewMode === "grid"
            ? "grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            : "flex w-full flex-col gap-2.5"
        }
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
              className="relative flex flex-col overflow-hidden rounded-[14px] border border-black/5 bg-white/85 shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-[12px]"
              style={{ background: colors.bg, borderLeft: `4px solid ${colors.color}` }}
              aria-label={`Activity card ${a.category}`}
            >
              {/* Main clickable area */}
              <button
                type="button"
                onClick={() => toggleExpand(a.id)}
                className="flex w-full cursor-pointer flex-col gap-1.5 border-0 bg-transparent px-3 py-3 text-left text-inherit sm:px-4 sm:py-3.5"
                title="Toggle details"
              >
                {/* Top row: icon + label ... date + time */}
                <div className="flex w-full items-start gap-2.5">
                  <span
                    className="inline-flex shrink-0 items-center justify-center leading-none opacity-85"
                    role="img"
                    aria-label={a11yLabel(
                      a.category,
                      subtypesAll[0] as string | undefined,
                    )}
                  >
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1 truncate text-sm font-extrabold uppercase tracking-[0.03em] sm:text-[15px]">
                    {displayLabel}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs font-semibold text-slate-700 sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
                    <span>{fmtDate(a.observed_at)}</span>
                    <span className="font-bold">
                      {sleepRange || fmtTime(new Date(a.observed_at))}
                    </span>
                  </div>
                </div>

                {/* Detail lines below */}
                {detailLines.length > 0 && (
                  <div className="pl-7 text-sm font-medium leading-6 text-slate-700">
                    {detailLines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                )}
              </button>

              {/* Expanded raw details */}
              {isOpen && (
                <div className="flex flex-col gap-2 border-t border-black/5 bg-black/5 px-4 pb-4 pt-3">
                  {a.details && (
                    <pre className="m-0 max-h-40 overflow-auto rounded-[10px] bg-black/5 p-2.5 text-xs leading-6 text-slate-700">
                      {JSON.stringify(a.details, null, 2)}
                    </pre>
                  )}
                  {!a.details && (
                    <div className="text-xs text-black/60">
                      No additional details.
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
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
          <div className="py-5 text-center text-sm text-black/55">
            {selectedClientId
              ? "No activities found for this client."
              : "Select a client to view their activity logs."}
          </div>
        )}
        {loading && <div className="text-xs text-black/60">Loading…</div>}
      </div>
      {!hasSupabase && (
        <div className="text-[11px] text-black/55">Demo mode (mock data)</div>
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

function calendarDayCellClass(
  inCurrentMonth: boolean,
  hasActivity: boolean,
  inRange: boolean,
  singleDay: boolean,
): string {
  const stateClass = singleDay
    ? "border-yellow-500/90 bg-[#F5D547]/65"
    : inRange
      ? "border-black/10 bg-emerald-500/30"
      : hasActivity
        ? "border-black/10 bg-green-500/20"
        : "border-black/10 bg-white/90";
  const monthClass = inCurrentMonth ? "text-slate-900" : "text-slate-400";
  const weightClass = singleDay ? "font-bold" : "font-semibold";

  return `h-8 rounded-lg border text-xs ${stateClass} ${monthClass} ${weightClass} transition-colors`;
}
