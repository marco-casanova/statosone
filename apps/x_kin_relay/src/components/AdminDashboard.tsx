"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";

type TimeRange = "7d" | "30d" | "90d";

interface StatsData {
  totalCarers: number;
  totalClients: number;
  totalActivities: number;
  totalMedications: number;
  totalIncidents: number;
  activeCircles: number;
  activityDeltaPct: number | null;
  incidentRatePer100: number;
  taskCompletionRate: number;
  medicationAdherenceRate: number;
}

interface ActivityByCategory {
  category: string;
  count: number;
  color: string;
}

interface CarerWorkload {
  name: string;
  hours: number;
  clients: number;
  activities: number;
}

interface MedicationStat {
  name: string;
  count: number;
}

interface IncidentTrend {
  date: string;
  count: number;
}

interface IncidentTypeStat {
  type: string;
  count: number;
}

interface SummaryMetrics {
  avgMedicationsPerClient: number;
  avgActivitiesPerActiveClient: number;
  medicationOnTimeRate: number;
  avgCarerRating: number;
  flaggedActivities: number;
  overdueTasks: number;
  medicationRefusalRate: number;
  upcomingRefills: number;
  clientsActiveLast24h: number;
}

interface AlertItem {
  id: string;
  title: string;
  meta: string;
  icon: string;
  color: string;
  badge?: string;
  timestamp: number;
}

interface CaregiverProfileRow {
  user_id: string | null;
  role: string | null;
  status: string | null;
  rating: number | null;
  total_reviews: number | null;
}

interface ClientRow {
  id: string;
  display_name: string | null;
  full_name: string | null;
}

interface MedicationRow {
  id: string;
  name: string | null;
  client_id: string | null;
  is_active: boolean | null;
  next_refill_date: string | null;
}

interface ActivityRow {
  id: string;
  category: string | null;
  observed_at: string | null;
  created_at: string | null;
  recorded_by: string | null;
  caregiver_id: string | null;
  recipient_id: string | null;
  client_id: string | null;
  duration_minutes: number | null;
  subtype_safety: string | null;
  is_flagged: boolean | null;
}

interface IncidentRow {
  id: string;
  incident_type: string | null;
  severity: string | null;
  incident_date: string | null;
  client_id: string | null;
  reported_by: string | null;
}

interface TaskRow {
  id: string;
  status: string | null;
  task_date: string | null;
  completed_time: string | null;
}

interface MedicationAdminRow {
  id: string;
  medication_id: string | null;
  client_id: string | null;
  administered_by: string | null;
  scheduled_time: string | null;
  actual_time: string | null;
  was_taken: boolean | null;
  was_refused: boolean | null;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
}

const DAY_MS = 86_400_000;

const RANGE_DAYS: Record<TimeRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const CATEGORY_COLORS: Record<string, string> = {
  adl: "#60a5fa",
  hydration: "#2dd4bf",
  medication_administration: "#8b5cf6",
  health_observation: "#14b8a6",
  safety: "#f97316",
  engagement: "#a78bfa",
  service: "#fbbf24",
  environment: "#34d399",
};

const DEFAULT_STATS: StatsData = {
  totalCarers: 0,
  totalClients: 0,
  totalActivities: 0,
  totalMedications: 0,
  totalIncidents: 0,
  activeCircles: 0,
  activityDeltaPct: null,
  incidentRatePer100: 0,
  taskCompletionRate: 0,
  medicationAdherenceRate: 0,
};

const DEFAULT_SUMMARY: SummaryMetrics = {
  avgMedicationsPerClient: 0,
  avgActivitiesPerActiveClient: 0,
  medicationOnTimeRate: 0,
  avgCarerRating: 0,
  flaggedActivities: 0,
  overdueTasks: 0,
  medicationRefusalRate: 0,
  upcomingRefills: 0,
  clientsActiveLast24h: 0,
};

function startOfUtcDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function dateOnlyUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseTs(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

function toTitleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function round(value: number, decimals = 1): number {
  const p = 10 ** decimals;
  return Math.round(value * p) / p;
}

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildIncidentTrend(
  incidents: IncidentRow[],
  currentStartMs: number,
  days: number,
): IncidentTrend[] {
  const bucketDays = days <= 10 ? 1 : days <= 45 ? 3 : 7;
  const bucketSizeMs = bucketDays * DAY_MS;
  const bucketCount = Math.max(1, Math.ceil(days / bucketDays));

  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    startMs: currentStartMs + i * bucketSizeMs,
    count: 0,
  }));

  incidents.forEach((incident) => {
    const ts = parseTs(incident.incident_date);
    if (ts === null || ts < currentStartMs) return;
    const idx = Math.floor((ts - currentStartMs) / bucketSizeMs);
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].count += 1;
    }
  });

  return buckets.map((bucket) => ({
    date: formatShortDate(bucket.startMs),
    count: bucket.count,
  }));
}

function trendDelta(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

function severityColor(severity: string | null): string {
  const key = severity?.toLowerCase() ?? "";
  if (key === "critical") return "#dc2626";
  if (key === "high") return "#f97316";
  if (key === "medium") return "#fbbf24";
  return "#22c55e";
}

function severityIcon(severity: string | null): string {
  const key = severity?.toLowerCase() ?? "";
  if (key === "critical" || key === "high") return "⚠️";
  if (key === "medium") return "🟠";
  return "✅";
}

function rangeLabel(timeRange: TimeRange): string {
  if (timeRange === "7d") return "7 days";
  if (timeRange === "30d") return "30 days";
  return "90 days";
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);
  const [summary, setSummary] = useState<SummaryMetrics>(DEFAULT_SUMMARY);
  const [activitiesByCategory, setActivitiesByCategory] = useState<
    ActivityByCategory[]
  >([]);
  const [carerWorkload, setCarerWorkload] = useState<CarerWorkload[]>([]);
  const [topMedications, setTopMedications] = useState<MedicationStat[]>([]);
  const [incidentTrend, setIncidentTrend] = useState<IncidentTrend[]>([]);
  const [incidentsByType, setIncidentsByType] = useState<IncidentTypeStat[]>(
    [],
  );
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    async function run() {
      setLoading(true);

      try {
        if (!hasSupabase || !supabase) {
          setUsingDemoData(true);
          setStats(DEFAULT_STATS);
          setSummary(DEFAULT_SUMMARY);
          setActivitiesByCategory([]);
          setCarerWorkload([]);
          setTopMedications([]);
          setIncidentTrend([]);
          setIncidentsByType([]);
          setAlerts([]);
          return;
        }

        setUsingDemoData(false);

        const days = RANGE_DAYS[timeRange];
        const now = new Date();
        const nowMs = now.getTime();
        const currentStart = startOfUtcDay(
          new Date(nowMs - (days - 1) * DAY_MS),
        );
        const previousStart = new Date(currentStart.getTime() - days * DAY_MS);

        const currentStartMs = currentStart.getTime();
        const previousStartMs = previousStart.getTime();
        const currentStartIso = currentStart.toISOString();
        const previousStartIso = previousStart.toISOString();
        const currentDate = dateOnlyUtc(now);
        const currentStartDate = dateOnlyUtc(currentStart);
        const previousStartDate = dateOnlyUtc(previousStart);

        const [
          caregiversRes,
          clientsRes,
          circlesRes,
          medicationsRes,
          activitiesRes,
          incidentsRes,
          tasksRes,
          medicationAdminsRes,
        ] = await Promise.all([
          supabase
            .from("kr_caregiver_profiles")
            .select("user_id, role, status, rating, total_reviews"),
          supabase.from("kr_clients").select("id, display_name, full_name"),
          supabase
            .from("kr_care_circles")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
          supabase
            .from("kr_medications")
            .select("id, name, client_id, is_active, next_refill_date"),
          supabase
            .from("kr_activities")
            .select(
              "id, category, observed_at, created_at, recorded_by, caregiver_id, recipient_id, client_id, duration_minutes, subtype_safety, is_flagged",
            )
            .gte("observed_at", previousStartIso)
            .lte("observed_at", now.toISOString()),
          supabase
            .from("kr_incidents")
            .select(
              "id, incident_type, severity, incident_date, client_id, reported_by",
            )
            .gte("incident_date", previousStartIso)
            .lte("incident_date", now.toISOString()),
          supabase
            .from("kr_tasks")
            .select("id, status, task_date, completed_time")
            .gte("task_date", previousStartDate)
            .lte("task_date", currentDate),
          supabase
            .from("kr_medication_administrations")
            .select(
              "id, medication_id, client_id, administered_by, scheduled_time, actual_time, was_taken, was_refused",
            )
            .gte("scheduled_time", previousStartIso)
            .lte("scheduled_time", now.toISOString()),
        ]);

        const queryError =
          caregiversRes.error ||
          clientsRes.error ||
          circlesRes.error ||
          medicationsRes.error ||
          activitiesRes.error ||
          incidentsRes.error ||
          tasksRes.error ||
          medicationAdminsRes.error;

        if (queryError) throw queryError;

        const caregivers =
          (caregiversRes.data as CaregiverProfileRow[] | null) ?? [];
        const clients = (clientsRes.data as ClientRow[] | null) ?? [];
        const medications =
          (medicationsRes.data as MedicationRow[] | null) ?? [];
        const activities = (activitiesRes.data as ActivityRow[] | null) ?? [];
        const incidents = (incidentsRes.data as IncidentRow[] | null) ?? [];
        const tasks = (tasksRes.data as TaskRow[] | null) ?? [];
        const medAdmins =
          (medicationAdminsRes.data as MedicationAdminRow[] | null) ?? [];

        const clientNameMap = new Map<string, string>();
        clients.forEach((client) => {
          const name = client.display_name || client.full_name || "Unknown client";
          clientNameMap.set(client.id, name);
        });

        const profileIds = new Set<string>();
        activities.forEach((a) => {
          if (a.recorded_by) profileIds.add(a.recorded_by);
          if (a.caregiver_id) profileIds.add(a.caregiver_id);
        });
        incidents.forEach((i) => {
          if (i.reported_by) profileIds.add(i.reported_by);
        });
        medAdmins.forEach((m) => {
          if (m.administered_by) profileIds.add(m.administered_by);
        });
        caregivers.forEach((c) => {
          if (c.user_id) profileIds.add(c.user_id);
        });

        const profileNameMap = new Map<string, string>();
        if (profileIds.size > 0) {
          const { data: profileRows, error: profileError } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", Array.from(profileIds));

          if (profileError) {
            console.error("Failed to load profile names:", profileError);
          } else {
            ((profileRows as ProfileRow[] | null) ?? []).forEach((profile) => {
              profileNameMap.set(
                profile.id,
                profile.full_name || profile.email || "Unknown",
              );
            });
          }
        }

        const activeMedicationRows = medications.filter(
          (m) => m.is_active !== false,
        );

        const medicationNameById = new Map<string, string>();
        activeMedicationRows.forEach((med) => {
          medicationNameById.set(med.id, med.name?.trim() || "Medication");
        });

        const currentActivities = activities.filter((activity) => {
          const ts = parseTs(activity.observed_at || activity.created_at);
          return ts !== null && ts >= currentStartMs && ts <= nowMs;
        });

        const previousActivities = activities.filter((activity) => {
          const ts = parseTs(activity.observed_at || activity.created_at);
          return ts !== null && ts >= previousStartMs && ts < currentStartMs;
        });

        const currentIncidents = incidents.filter((incident) => {
          const ts = parseTs(incident.incident_date);
          return ts !== null && ts >= currentStartMs && ts <= nowMs;
        });

        const currentTasks = tasks.filter((task) => {
          if (!task.task_date) return false;
          return task.task_date >= currentStartDate && task.task_date <= currentDate;
        });

        const currentMedAdmins = medAdmins.filter((admin) => {
          const ts = parseTs(admin.scheduled_time);
          return ts !== null && ts >= currentStartMs && ts <= nowMs;
        });

        const currentActivityCount = currentActivities.length;
        const previousActivityCount = previousActivities.length;
        const currentIncidentCount = currentIncidents.length;

        const professionalCaregivers = caregivers.filter((caregiver) => {
          const role = (caregiver.role ?? "").toLowerCase();
          const status = (caregiver.status ?? "").toLowerCase();
          const isProfessional =
            role === "caregiver" || role === "specialist" || role === "nurse";
          const isActive = status !== "inactive" && status !== "suspended";
          return isProfessional && isActive;
        });

        const totalCarers =
          professionalCaregivers.length > 0
            ? professionalCaregivers.length
            : caregivers.length;

        const categoryMap = new Map<string, number>();
        currentActivities.forEach((activity) => {
          const key = (activity.category ?? "other").toLowerCase();
          categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1);
        });

        const categoryStats: ActivityByCategory[] = Array.from(
          categoryMap.entries(),
        )
          .map(([category, count]) => ({
            category: toTitleCase(category),
            count,
            color: CATEGORY_COLORS[category] ?? "#6b7280",
          }))
          .sort((a, b) => b.count - a.count);

        const workloadMap = new Map<
          string,
          { minutes: number; activities: number; clients: Set<string> }
        >();

        currentActivities.forEach((activity) => {
          const caregiverId = activity.recorded_by || activity.caregiver_id;
          if (!caregiverId) return;

          const current = workloadMap.get(caregiverId) ?? {
            minutes: 0,
            activities: 0,
            clients: new Set<string>(),
          };

          const durationMinutes =
            activity.duration_minutes && activity.duration_minutes > 0
              ? activity.duration_minutes
              : 20;

          current.minutes += durationMinutes;
          current.activities += 1;

          const clientId = activity.recipient_id || activity.client_id;
          if (clientId) current.clients.add(clientId);

          workloadMap.set(caregiverId, current);
        });

        const workloadRows: CarerWorkload[] = Array.from(workloadMap.entries())
          .map(([caregiverId, value]) => ({
            name: profileNameMap.get(caregiverId) || "Unknown",
            hours: round(value.minutes / 60, 1),
            clients: value.clients.size,
            activities: value.activities,
          }))
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 8);

        const medicationMap = new Map<string, Set<string>>();
        activeMedicationRows.forEach((medication) => {
          const name = medication.name?.trim() || "Unspecified";
          const clientsForMedication =
            medicationMap.get(name) ?? new Set<string>();
          if (medication.client_id) clientsForMedication.add(medication.client_id);
          medicationMap.set(name, clientsForMedication);
        });

        const topMedicationRows: MedicationStat[] = Array.from(
          medicationMap.entries(),
        )
          .map(([name, clientsForMedication]) => ({
            name,
            count: clientsForMedication.size,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        const incidentsByTypeMap = new Map<string, number>();
        currentIncidents.forEach((incident) => {
          const type = incident.incident_type?.trim() || "Unspecified";
          incidentsByTypeMap.set(type, (incidentsByTypeMap.get(type) ?? 0) + 1);
        });

        if (incidentsByTypeMap.size === 0) {
          currentActivities.forEach((activity) => {
            if ((activity.category ?? "").toLowerCase() !== "safety") return;
            const type = activity.subtype_safety?.trim() || "Safety event";
            incidentsByTypeMap.set(type, (incidentsByTypeMap.get(type) ?? 0) + 1);
          });
        }

        const incidentTypeRows: IncidentTypeStat[] = Array.from(
          incidentsByTypeMap.entries(),
        )
          .map(([type, count]) => ({
            type: toTitleCase(type),
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        const incidentTrendRows = buildIncidentTrend(
          currentIncidents,
          currentStartMs,
          days,
        );

        const completedTaskCount = currentTasks.filter(
          (task) =>
            (task.status ?? "").toLowerCase() === "completed" ||
            Boolean(task.completed_time),
        ).length;

        const overdueTaskCount = currentTasks.filter((task) => {
          if (!task.task_date) return false;
          const status = (task.status ?? "").toLowerCase();
          const isDone = status === "completed" || status === "cancelled";
          return !isDone && task.task_date < currentDate;
        }).length;

        const medicationTakenCount = currentMedAdmins.filter(
          (admin) => admin.was_taken,
        ).length;
        const medicationRefusedCount = currentMedAdmins.filter(
          (admin) => admin.was_refused,
        ).length;

        const takenWithActual = currentMedAdmins.filter(
          (admin) => admin.was_taken && Boolean(admin.actual_time),
        );

        const onTimeMedicationCount = takenWithActual.filter((admin) => {
          const actualTs = parseTs(admin.actual_time);
          const scheduledTs = parseTs(admin.scheduled_time);
          if (actualTs === null || scheduledTs === null) return false;
          const diffMinutes = Math.abs(actualTs - scheduledTs) / 60_000;
          return diffMinutes <= 60;
        }).length;

        const clientsWithCurrentActivity = new Set<string>();
        const clientsActiveLast24h = new Set<string>();
        const active24hThreshold = nowMs - DAY_MS;

        currentActivities.forEach((activity) => {
          const clientId = activity.recipient_id || activity.client_id;
          if (!clientId) return;

          clientsWithCurrentActivity.add(clientId);

          const ts = parseTs(activity.observed_at || activity.created_at);
          if (ts !== null && ts >= active24hThreshold) {
            clientsActiveLast24h.add(clientId);
          }
        });

        const flaggedActivitiesCount = currentActivities.filter(
          (activity) => activity.is_flagged,
        ).length;

        const todayUtc = startOfUtcDay(now).getTime();
        const weekAheadUtc = todayUtc + 7 * DAY_MS;

        const upcomingRefillsCount = activeMedicationRows.filter((medication) => {
          if (!medication.next_refill_date) return false;
          const refillTs = Date.parse(`${medication.next_refill_date}T00:00:00Z`);
          if (!Number.isFinite(refillTs)) return false;
          return refillTs >= todayUtc && refillTs <= weekAheadUtc;
        }).length;

        const ratedCarers = professionalCaregivers.filter(
          (caregiver) =>
            (caregiver.total_reviews ?? 0) > 0 && (caregiver.rating ?? 0) > 0,
        );

        const avgCarerRating =
          ratedCarers.length > 0
            ? round(
                ratedCarers.reduce(
                  (sum, caregiver) => sum + (caregiver.rating ?? 0),
                  0,
                ) / ratedCarers.length,
                2,
              )
            : 0;

        const activityDeltaPct = trendDelta(
          currentActivityCount,
          previousActivityCount,
        );

        const medicationAdherenceRate = round(
          percent(medicationTakenCount, currentMedAdmins.length),
          1,
        );

        const incidentRatePer100 =
          currentActivityCount > 0
            ? round(percent(currentIncidentCount, currentActivityCount), 1)
            : 0;

        const taskCompletionRate = round(
          percent(completedTaskCount, currentTasks.length),
          1,
        );

        const summaryMetrics: SummaryMetrics = {
          avgMedicationsPerClient: round(
            activeMedicationRows.length / Math.max(clients.length, 1),
            2,
          ),
          avgActivitiesPerActiveClient: round(
            currentActivityCount / Math.max(clientsWithCurrentActivity.size, 1),
            1,
          ),
          medicationOnTimeRate: round(
            percent(onTimeMedicationCount, takenWithActual.length),
            1,
          ),
          avgCarerRating,
          flaggedActivities: flaggedActivitiesCount,
          overdueTasks: overdueTaskCount,
          medicationRefusalRate: round(
            percent(medicationRefusedCount, currentMedAdmins.length),
            1,
          ),
          upcomingRefills: upcomingRefillsCount,
          clientsActiveLast24h: clientsActiveLast24h.size,
        };

        const incidentAlerts: AlertItem[] = currentIncidents
          .map((incident) => {
            const ts = parseTs(incident.incident_date) ?? nowMs;
            const clientName = incident.client_id
              ? clientNameMap.get(incident.client_id)
              : undefined;
            const reporterName = incident.reported_by
              ? profileNameMap.get(incident.reported_by)
              : undefined;
            return {
              id: `incident-${incident.id}`,
              icon: severityIcon(incident.severity),
              color: severityColor(incident.severity),
              title: `${toTitleCase(incident.incident_type || "Incident")} - ${
                clientName || "Unknown client"
              }`,
              meta: `${formatDateTime(ts)}${reporterName ? ` • ${reporterName}` : ""}`,
              badge:
                ts >= nowMs - 12 * 60 * 60 * 1000
                  ? "New"
                  : incident.severity?.toUpperCase(),
              timestamp: ts,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 4);

        const refusalAlerts: AlertItem[] = currentMedAdmins
          .filter((admin) => admin.was_refused)
          .map((admin) => {
            const ts = parseTs(admin.scheduled_time) ?? nowMs;
            const clientName = admin.client_id
              ? clientNameMap.get(admin.client_id)
              : undefined;
            const medName = admin.medication_id
              ? medicationNameById.get(admin.medication_id)
              : undefined;
            return {
              id: `refusal-${admin.id}`,
              icon: "💊",
              color: "#f59e0b",
              title: `Medication refused - ${clientName || "Unknown client"}`,
              meta: `${medName || "Medication"} • ${formatDateTime(ts)}`,
              timestamp: ts,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 3);

        const flaggedAlerts: AlertItem[] = currentActivities
          .filter((activity) => activity.is_flagged)
          .map((activity) => {
            const ts = parseTs(activity.observed_at || activity.created_at) ?? nowMs;
            const clientId = activity.recipient_id || activity.client_id;
            const clientName = clientId ? clientNameMap.get(clientId) : undefined;
            return {
              id: `flagged-${activity.id}`,
              icon: "🚩",
              color: "#6366f1",
              title: `Flagged ${toTitleCase(activity.category || "activity")}`,
              meta: `${clientName || "Unknown client"} • ${formatDateTime(ts)}`,
              timestamp: ts,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 3);

        const combinedAlerts = [...incidentAlerts, ...refusalAlerts, ...flaggedAlerts]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 8);

        setStats({
          totalCarers,
          totalClients: clients.length,
          totalActivities: currentActivityCount,
          totalMedications: activeMedicationRows.length,
          totalIncidents: currentIncidentCount,
          activeCircles: circlesRes.count ?? 0,
          activityDeltaPct: activityDeltaPct === null ? null : round(activityDeltaPct, 1),
          incidentRatePer100,
          taskCompletionRate,
          medicationAdherenceRate,
        });
        setSummary(summaryMetrics);
        setActivitiesByCategory(categoryStats);
        setCarerWorkload(workloadRows);
        setTopMedications(topMedicationRows);
        setIncidentTrend(incidentTrendRows);
        setIncidentsByType(incidentTypeRows);
        setAlerts(combinedAlerts);

      } catch (error) {
        console.error("Failed to load admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [timeRange]);

  const maxActivityCount = useMemo(
    () => Math.max(1, ...activitiesByCategory.map((a) => a.count)),
    [activitiesByCategory],
  );

  const maxWorkloadHours = useMemo(
    () => Math.max(1, ...carerWorkload.map((c) => c.hours)),
    [carerWorkload],
  );

  const maxMedCount = useMemo(
    () => Math.max(1, ...topMedications.map((m) => m.count)),
    [topMedications],
  );

  const maxIncidentCount = useMemo(
    () => Math.max(1, ...incidentTrend.map((i) => i.count)),
    [incidentTrend],
  );

  const activityDeltaText = useMemo(() => {
    if (stats.activityDeltaPct === null) return "No baseline in previous period";
    if (stats.activityDeltaPct > 0) return `+${stats.activityDeltaPct}% vs previous`;
    if (stats.activityDeltaPct < 0) return `${stats.activityDeltaPct}% vs previous`;
    return "No change vs previous";
  }, [stats.activityDeltaPct]);

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h1 style={title}>Admin Dashboard</h1>
          <p style={subtitle}>Real-time analytics & operations for your care network</p>
          {usingDemoData && (
            <div style={demoBadge}>Supabase not connected: showing empty dashboard</div>
          )}
        </div>
        <div style={timeFilter}>
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={timeRange === range ? timeFilterActive : timeFilterBtn}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={loadingBox}>Loading analytics from Supabase...</div>
      ) : (
        <>
          <div style={metricsGrid}>
            <div style={metricCard}>
              <div style={metricIcon}>👩‍⚕️</div>
              <div style={metricValue}>{stats.totalCarers}</div>
              <div style={metricLabel}>Active Care Professionals</div>
              <div style={metricMeta}>Avg rating {summary.avgCarerRating || 0}</div>
            </div>

            <div style={metricCard}>
              <div style={metricIcon}>👥</div>
              <div style={metricValue}>{stats.totalClients}</div>
              <div style={metricLabel}>Clients</div>
              <div style={metricMeta}>
                {summary.clientsActiveLast24h} active in last 24h
              </div>
            </div>

            <div style={metricCard}>
              <div style={metricIcon}>📋</div>
              <div style={metricValue}>{stats.totalActivities.toLocaleString()}</div>
              <div style={metricLabel}>Activities ({rangeLabel(timeRange)})</div>
              <div style={metricMeta}>{activityDeltaText}</div>
            </div>

            <div style={metricCard}>
              <div style={metricIcon}>💊</div>
              <div style={metricValue}>{stats.totalMedications}</div>
              <div style={metricLabel}>Active Medications</div>
              <div style={metricMeta}>Adherence {stats.medicationAdherenceRate}%</div>
            </div>

            <div style={metricCard}>
              <div style={metricIcon}>⚠️</div>
              <div
                style={{
                  ...metricValue,
                  color: stats.totalIncidents > 0 ? "#f97316" : "#22c55e",
                }}
              >
                {stats.totalIncidents}
              </div>
              <div style={metricLabel}>Incidents ({rangeLabel(timeRange)})</div>
              <div style={metricMeta}>{stats.incidentRatePer100} per 100 activities</div>
            </div>

            <div style={metricCard}>
              <div style={metricIcon}>🔄</div>
              <div style={metricValue}>{stats.activeCircles}</div>
              <div style={metricLabel}>Active Circles</div>
              <div style={metricMeta}>Task completion {stats.taskCompletionRate}%</div>
            </div>
          </div>

          <div style={chartsRow}>
            <div style={chartCard}>
              <h3 style={chartTitle}>Activities by Category ({rangeLabel(timeRange)})</h3>
              {activitiesByCategory.length === 0 ? (
                <div style={emptyState}>No activities logged in this period.</div>
              ) : (
                <div style={barChart}>
                  {activitiesByCategory.map((item) => (
                    <div key={item.category} style={barRow}>
                      <div style={barLabel}>{item.category}</div>
                      <div style={barContainer}>
                        <div
                          style={{
                            ...barFill,
                            width: `${(item.count / maxActivityCount) * 100}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                      <div style={barValue}>{item.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={chartCard}>
              <h3 style={chartTitle}>Incident Trend ({rangeLabel(timeRange)})</h3>
              {incidentTrend.length === 0 ? (
                <div style={emptyState}>No incident data in this period.</div>
              ) : (
                <div style={lineChart}>
                  {incidentTrend.map((item) => (
                    <div key={item.date} style={lineChartBar}>
                      <div
                        style={{
                          ...lineChartFill,
                          height: `${(item.count / maxIncidentCount) * 100}%`,
                          background: item.count > 0 ? "#f97316" : "#9ca3af",
                        }}
                      />
                      <div style={lineChartLabel}>{item.date}</div>
                      <div style={lineChartValue}>{item.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={chartsRow}>
            <div style={chartCard}>
              <h3 style={chartTitle}>Caregiver Workload ({rangeLabel(timeRange)})</h3>
              {carerWorkload.length === 0 ? (
                <div style={emptyState}>No caregiver activity in this period.</div>
              ) : (
                <div style={tableContainer}>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={th}>Caregiver</th>
                        <th style={th}>Hours</th>
                        <th style={th}>Clients</th>
                        <th style={th}>Activities</th>
                        <th style={th}>Load</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carerWorkload.map((carer) => (
                        <tr key={carer.name}>
                          <td style={td}>{carer.name}</td>
                          <td style={td}>{carer.hours}h</td>
                          <td style={td}>{carer.clients}</td>
                          <td style={td}>{carer.activities}</td>
                          <td style={td}>
                            <div style={miniBar}>
                              <div
                                style={{
                                  ...miniBarFill,
                                  width: `${(carer.hours / maxWorkloadHours) * 100}%`,
                                  background:
                                    carer.hours > 40
                                      ? "#f97316"
                                      : carer.hours > 25
                                        ? "#fbbf24"
                                        : "#22c55e",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={chartCard}>
              <h3 style={chartTitle}>Top Medications by Clients</h3>
              {topMedications.length === 0 ? (
                <div style={emptyState}>No active medications recorded.</div>
              ) : (
                <div style={barChart}>
                  {topMedications.map((med) => (
                    <div key={med.name} style={barRow}>
                      <div style={{ ...barLabel, minWidth: 140 }}>{med.name}</div>
                      <div style={barContainer}>
                        <div
                          style={{
                            ...barFill,
                            width: `${(med.count / maxMedCount) * 100}%`,
                            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                          }}
                        />
                      </div>
                      <div style={barValue}>{med.count} clients</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={chartsRow}>
            <div style={chartCard}>
              <h3 style={chartTitle}>Incidents by Type ({rangeLabel(timeRange)})</h3>
              {incidentsByType.length === 0 ? (
                <div style={emptyState}>No incidents captured for this range.</div>
              ) : (
                <div style={incidentGrid}>
                  {incidentsByType.map((incident) => (
                    <div key={incident.type} style={incidentCard}>
                      <div style={incidentCount}>{incident.count}</div>
                      <div style={incidentType}>{incident.type}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={chartCard}>
              <h3 style={chartTitle}>Operational Summary</h3>
              <div style={summaryGrid}>
                <div style={summaryItem}>
                  <div style={summaryValue}>{summary.avgMedicationsPerClient}</div>
                  <div style={summaryLabel}>Avg meds per client</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>{summary.avgActivitiesPerActiveClient}</div>
                  <div style={summaryLabel}>Avg activities per active client</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>{summary.medicationOnTimeRate}%</div>
                  <div style={summaryLabel}>Medication on-time rate</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>{summary.avgCarerRating}</div>
                  <div style={summaryLabel}>Average carer rating</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>{summary.flaggedActivities}</div>
                  <div style={summaryLabel}>Flagged activities</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>{summary.overdueTasks}</div>
                  <div style={summaryLabel}>Overdue tasks</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>{summary.medicationRefusalRate}%</div>
                  <div style={summaryLabel}>Medication refusal rate</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>{summary.upcomingRefills}</div>
                  <div style={summaryLabel}>Refills due in 7 days</div>
                </div>
              </div>
            </div>
          </div>

          <div style={chartCard}>
            <h3 style={chartTitle}>Recent Alerts & Notifications</h3>
            {alerts.length === 0 ? (
              <div style={emptyState}>No recent alerts in the selected time range.</div>
            ) : (
              <div style={alertList}>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{ ...alertItem, borderLeftColor: alert.color }}
                  >
                    <span style={alertIcon}>{alert.icon}</span>
                    <div>
                      <div style={alertTitle}>{alert.title}</div>
                      <div style={alertMeta}>{alert.meta}</div>
                    </div>
                    {alert.badge ? <span style={alertBadge}>{alert.badge}</span> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const container: React.CSSProperties = {
  padding: "100px 20px 60px",
  maxWidth: 1400,
  margin: "0 auto",
  background: "#88B9B0",
  minHeight: "100vh",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 32,
  flexWrap: "wrap",
  gap: 16,
};

const title: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 4,
  color: "#1A1A1A",
};

const subtitle: React.CSSProperties = {
  fontSize: 14,
  color: "#6B7280",
};

const demoBadge: React.CSSProperties = {
  marginTop: 10,
  display: "inline-block",
  background: "rgba(245, 158, 11, 0.15)",
  color: "#92400e",
  border: "1px solid rgba(245, 158, 11, 0.35)",
  borderRadius: 999,
  fontSize: 12,
  padding: "4px 10px",
  fontWeight: 600,
};

const timeFilter: React.CSSProperties = {
  display: "flex",
  gap: 8,
  background: "rgba(0,0,0,0.06)",
  padding: 4,
  borderRadius: 12,
};

const timeFilterBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#6B7280",
  padding: "8px 16px",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
};

const timeFilterActive: React.CSSProperties = {
  ...timeFilterBtn,
  background: "#F5D547",
  color: "#1A1A1A",
  fontWeight: 600,
};

const loadingBox: React.CSSProperties = {
  textAlign: "center",
  padding: 60,
  opacity: 0.6,
};

const emptyState: React.CSSProperties = {
  color: "#6B7280",
  fontSize: 14,
  padding: "12px 0",
};

const metricsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const metricCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 20,
  textAlign: "center",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};

const metricIcon: React.CSSProperties = {
  fontSize: 28,
  marginBottom: 8,
};

const metricValue: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  marginBottom: 4,
  color: "#1A1A1A",
};

const metricLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const metricMeta: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: "#4B5563",
};

const chartsRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: 20,
  marginBottom: 20,
};

const chartCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};

const chartTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 20,
  color: "#1A1A1A",
};

const barChart: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const barRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const barLabel: React.CSSProperties = {
  minWidth: 140,
  fontSize: 13,
  color: "#374151",
};

const barContainer: React.CSSProperties = {
  flex: 1,
  height: 8,
  background: "rgba(0,0,0,0.08)",
  borderRadius: 4,
  overflow: "hidden",
};

const barFill: React.CSSProperties = {
  height: "100%",
  borderRadius: 4,
  transition: "width 0.5s ease",
};

const barValue: React.CSSProperties = {
  minWidth: 70,
  fontSize: 13,
  fontWeight: 600,
  textAlign: "right",
};

const lineChart: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  height: 190,
  gap: 8,
  paddingTop: 20,
};

const lineChartBar: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100%",
  position: "relative",
};

const lineChartFill: React.CSSProperties = {
  width: "100%",
  maxWidth: 32,
  borderRadius: "4px 4px 0 0",
  marginTop: "auto",
  transition: "height 0.4s ease",
};

const lineChartLabel: React.CSSProperties = {
  fontSize: 10,
  color: "#6B7280",
  marginTop: 8,
  textAlign: "center",
};

const lineChartValue: React.CSSProperties = {
  position: "absolute",
  top: 0,
  fontSize: 12,
  fontWeight: 600,
  color: "#1f2937",
};

const tableContainer: React.CSSProperties = {
  overflowX: "auto",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  opacity: 0.7,
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  color: "#6B7280",
};

const td: React.CSSProperties = {
  padding: "12px",
  fontSize: 13,
  color: "#374151",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
};

const miniBar: React.CSSProperties = {
  width: 90,
  height: 6,
  background: "rgba(0,0,0,0.08)",
  borderRadius: 3,
  overflow: "hidden",
};

const miniBarFill: React.CSSProperties = {
  height: "100%",
  borderRadius: 3,
};

const incidentGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 12,
};

const incidentCard: React.CSSProperties = {
  background: "rgba(249, 115, 22, 0.1)",
  border: "1px solid rgba(249, 115, 22, 0.2)",
  borderRadius: 12,
  padding: 16,
  textAlign: "center",
};

const incidentCount: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: "#f97316",
};

const incidentType: React.CSSProperties = {
  fontSize: 11,
  color: "#6B7280",
  marginTop: 4,
};

const summaryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
};

const summaryItem: React.CSSProperties = {
  background: "rgba(0,0,0,0.03)",
  borderRadius: 12,
  padding: 14,
  textAlign: "center",
};

const summaryValue: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: "#4A7A72",
};

const summaryLabel: React.CSSProperties = {
  fontSize: 11,
  color: "#6B7280",
  marginTop: 4,
};

const alertList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const alertItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  background: "rgba(0,0,0,0.02)",
  borderRadius: 12,
  padding: "14px 16px",
  borderLeft: "3px solid",
};

const alertIcon: React.CSSProperties = {
  fontSize: 20,
};

const alertTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#1A1A1A",
};

const alertMeta: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 2,
};

const alertBadge: React.CSSProperties = {
  marginLeft: "auto",
  background: "rgba(15, 23, 42, 0.08)",
  color: "#334155",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
};
