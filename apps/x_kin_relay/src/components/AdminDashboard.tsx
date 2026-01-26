"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";

interface StatsData {
  totalCarers: number;
  totalClients: number;
  totalActivities: number;
  totalMedications: number;
  totalIncidents: number;
  activeCircles: number;
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

// Demo data for when Supabase is not connected
const DEMO_STATS: StatsData = {
  totalCarers: 12,
  totalClients: 28,
  totalActivities: 1456,
  totalMedications: 87,
  totalIncidents: 23,
  activeCircles: 15,
};

const DEMO_ACTIVITIES_BY_CATEGORY: ActivityByCategory[] = [
  { category: "ADL", count: 534, color: "#60a5fa" },
  { category: "Health Observation", count: 312, color: "#2dd4bf" },
  { category: "Safety", count: 89, color: "#f97316" },
  { category: "Engagement", count: 287, color: "#a78bfa" },
  { category: "Service", count: 156, color: "#fbbf24" },
  { category: "Environment", count: 78, color: "#34d399" },
];

const DEMO_CARER_WORKLOAD: CarerWorkload[] = [
  { name: "Elena M.", hours: 156, clients: 4, activities: 234 },
  { name: "Jonas K.", hours: 124, clients: 3, activities: 189 },
  { name: "Maria S.", hours: 198, clients: 5, activities: 312 },
  { name: "Thomas B.", hours: 142, clients: 3, activities: 198 },
  { name: "Sophie H.", hours: 168, clients: 4, activities: 256 },
  { name: "Aisha R.", hours: 112, clients: 2, activities: 145 },
];

const DEMO_TOP_MEDICATIONS: MedicationStat[] = [
  { name: "Metformin", count: 12 },
  { name: "Lisinopril", count: 10 },
  { name: "Amlodipine", count: 9 },
  { name: "Omeprazole", count: 8 },
  { name: "Aspirin", count: 7 },
  { name: "Simvastatin", count: 6 },
  { name: "Levothyroxine", count: 5 },
  { name: "Gabapentin", count: 4 },
];

const DEMO_INCIDENT_TREND: IncidentTrend[] = [
  { date: "Jan 20", count: 3 },
  { date: "Jan 21", count: 1 },
  { date: "Jan 22", count: 2 },
  { date: "Jan 23", count: 0 },
  { date: "Jan 24", count: 4 },
  { date: "Jan 25", count: 2 },
  { date: "Jan 26", count: 1 },
];

const DEMO_INCIDENTS_BY_TYPE = [
  { type: "Falls", count: 8, severity: "moderate" },
  { type: "Medication Error", count: 5, severity: "low" },
  { type: "Skin Breakdown", count: 4, severity: "low" },
  { type: "Behaviour Change", count: 3, severity: "low" },
  { type: "Near Miss", count: 3, severity: "low" },
];

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>(DEMO_STATS);
  const [activitiesByCategory, setActivitiesByCategory] = useState<
    ActivityByCategory[]
  >(DEMO_ACTIVITIES_BY_CATEGORY);
  const [carerWorkload, setCarerWorkload] =
    useState<CarerWorkload[]>(DEMO_CARER_WORKLOAD);
  const [topMedications, setTopMedications] =
    useState<MedicationStat[]>(DEMO_TOP_MEDICATIONS);
  const [incidentTrend, setIncidentTrend] =
    useState<IncidentTrend[]>(DEMO_INCIDENT_TREND);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    loadData();
  }, [timeRange]);

  async function loadData() {
    setLoading(true);
    try {
      if (!hasSupabase || !supabase) {
        // Use demo data
        await new Promise((r) => setTimeout(r, 500));
        setLoading(false);
        return;
      }

      // Fetch real data from Supabase
      const [carersRes, clientsRes, activitiesRes, medsRes, circlesRes] =
        await Promise.all([
          supabase
            .from("kr_caregiver_profiles")
            .select("id", { count: "exact" }),
          supabase.from("kr_clients").select("id", { count: "exact" }),
          supabase
            .from("kr_activities")
            .select("id, category", { count: "exact" }),
          supabase
            .from("kr_medications")
            .select("id, name", { count: "exact" }),
          supabase
            .from("kr_care_circles")
            .select("id", { count: "exact" })
            .eq("is_active", true),
        ]);

      // Count safety incidents
      const incidentsRes = await supabase
        .from("kr_activities")
        .select("id", { count: "exact" })
        .eq("category", "safety");

      setStats({
        totalCarers: carersRes.count || DEMO_STATS.totalCarers,
        totalClients: clientsRes.count || DEMO_STATS.totalClients,
        totalActivities: activitiesRes.count || DEMO_STATS.totalActivities,
        totalMedications: medsRes.count || DEMO_STATS.totalMedications,
        totalIncidents: incidentsRes.count || DEMO_STATS.totalIncidents,
        activeCircles: circlesRes.count || DEMO_STATS.activeCircles,
      });

      // Aggregate activities by category
      if (activitiesRes.data) {
        const categoryMap: Record<string, number> = {};
        activitiesRes.data.forEach((a: any) => {
          categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
        });
        const categoryColors: Record<string, string> = {
          adl: "#60a5fa",
          health_observation: "#2dd4bf",
          safety: "#f97316",
          engagement: "#a78bfa",
          service: "#fbbf24",
          environment: "#34d399",
        };
        const aggregated = Object.entries(categoryMap).map(([cat, count]) => ({
          category: cat
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          count,
          color: categoryColors[cat] || "#6b7280",
        }));
        if (aggregated.length > 0) {
          setActivitiesByCategory(aggregated);
        }
      }

      // Top medications
      if (medsRes.data) {
        const medMap: Record<string, number> = {};
        medsRes.data.forEach((m: any) => {
          if (m.name) {
            medMap[m.name] = (medMap[m.name] || 0) + 1;
          }
        });
        const topMeds = Object.entries(medMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        if (topMeds.length > 0) {
          setTopMedications(topMeds);
        }
      }
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  }

  const maxActivityCount = useMemo(
    () => Math.max(...activitiesByCategory.map((a) => a.count)),
    [activitiesByCategory],
  );

  const maxWorkloadHours = useMemo(
    () => Math.max(...carerWorkload.map((c) => c.hours)),
    [carerWorkload],
  );

  const maxMedCount = useMemo(
    () => Math.max(...topMedications.map((m) => m.count)),
    [topMedications],
  );

  const maxIncidentCount = useMemo(
    () => Math.max(...incidentTrend.map((i) => i.count), 1),
    [incidentTrend],
  );

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h1 style={title}>Admin Dashboard</h1>
          <p style={subtitle}>Analytics & insights for your care network</p>
        </div>
        <div style={timeFilter}>
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={timeRange === range ? timeFilterActive : timeFilterBtn}
            >
              {range === "7d"
                ? "7 Days"
                : range === "30d"
                  ? "30 Days"
                  : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={loadingBox}>Loading analytics...</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div style={metricsGrid}>
            <div style={metricCard}>
              <div style={metricIcon}>👩‍⚕️</div>
              <div style={metricValue}>{stats.totalCarers}</div>
              <div style={metricLabel}>Total Carers</div>
            </div>
            <div style={metricCard}>
              <div style={metricIcon}>👥</div>
              <div style={metricValue}>{stats.totalClients}</div>
              <div style={metricLabel}>Clients</div>
            </div>
            <div style={metricCard}>
              <div style={metricIcon}>📋</div>
              <div style={metricValue}>
                {stats.totalActivities.toLocaleString()}
              </div>
              <div style={metricLabel}>Activities Logged</div>
            </div>
            <div style={metricCard}>
              <div style={metricIcon}>💊</div>
              <div style={metricValue}>{stats.totalMedications}</div>
              <div style={metricLabel}>Active Medications</div>
            </div>
            <div style={metricCard}>
              <div style={metricIcon}>⚠️</div>
              <div
                style={{
                  ...metricValue,
                  color: stats.totalIncidents > 20 ? "#f97316" : "#22c55e",
                }}
              >
                {stats.totalIncidents}
              </div>
              <div style={metricLabel}>Incidents</div>
            </div>
            <div style={metricCard}>
              <div style={metricIcon}>🔄</div>
              <div style={metricValue}>{stats.activeCircles}</div>
              <div style={metricLabel}>Active Circles</div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div style={chartsRow}>
            {/* Activities by Category */}
            <div style={chartCard}>
              <h3 style={chartTitle}>Activities by Category</h3>
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
            </div>

            {/* Incident Trend */}
            <div style={chartCard}>
              <h3 style={chartTitle}>Incident Trend (7 Days)</h3>
              <div style={lineChart}>
                {incidentTrend.map((item, idx) => (
                  <div key={idx} style={lineChartBar}>
                    <div
                      style={{
                        ...lineChartFill,
                        height: `${(item.count / maxIncidentCount) * 100}%`,
                        background: item.count > 2 ? "#f97316" : "#22c55e",
                      }}
                    />
                    <div style={lineChartLabel}>{item.date}</div>
                    <div style={lineChartValue}>{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={chartsRow}>
            {/* Carer Workload */}
            <div style={chartCard}>
              <h3 style={chartTitle}>Carer Workload (Hours this month)</h3>
              <div style={tableContainer}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Carer</th>
                      <th style={th}>Hours</th>
                      <th style={th}>Clients</th>
                      <th style={th}>Activities</th>
                      <th style={th}>Workload</th>
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
                                  carer.hours > 180
                                    ? "#f97316"
                                    : carer.hours > 140
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
            </div>

            {/* Top Medications */}
            <div style={chartCard}>
              <h3 style={chartTitle}>Most Prescribed Medications</h3>
              <div style={barChart}>
                {topMedications.map((med) => (
                  <div key={med.name} style={barRow}>
                    <div style={{ ...barLabel, minWidth: 120 }}>{med.name}</div>
                    <div style={barContainer}>
                      <div
                        style={{
                          ...barFill,
                          width: `${(med.count / maxMedCount) * 100}%`,
                          background:
                            "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        }}
                      />
                    </div>
                    <div style={barValue}>{med.count} clients</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 3 */}
          <div style={chartsRow}>
            {/* Incidents by Type */}
            <div style={chartCard}>
              <h3 style={chartTitle}>Incidents by Type</h3>
              <div style={incidentGrid}>
                {DEMO_INCIDENTS_BY_TYPE.map((incident) => (
                  <div key={incident.type} style={incidentCard}>
                    <div style={incidentCount}>{incident.count}</div>
                    <div style={incidentType}>{incident.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Health Summary */}
            <div style={chartCard}>
              <h3 style={chartTitle}>Client Health Summary</h3>
              <div style={summaryGrid}>
                <div style={summaryItem}>
                  <div style={summaryValue}>3.1</div>
                  <div style={summaryLabel}>Avg Medications per Client</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>52</div>
                  <div style={summaryLabel}>Avg Activities per Client</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>78%</div>
                  <div style={summaryLabel}>ADL Independence Rate</div>
                </div>
                <div style={summaryItem}>
                  <div style={summaryValue}>4.6</div>
                  <div style={summaryLabel}>Avg Carer Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div style={chartCard}>
            <h3 style={chartTitle}>Recent Alerts & Notifications</h3>
            <div style={alertList}>
              <div style={{ ...alertItem, borderLeftColor: "#f97316" }}>
                <span style={alertIcon}>⚠️</span>
                <div>
                  <div style={alertTitle}>Fall reported - Maria Schmidt</div>
                  <div style={alertMeta}>Today at 14:32 • Elena M.</div>
                </div>
                <span style={alertBadge}>New</span>
              </div>
              <div style={{ ...alertItem, borderLeftColor: "#fbbf24" }}>
                <span style={alertIcon}>💊</span>
                <div>
                  <div style={alertTitle}>
                    Medication refill needed - Hans Weber
                  </div>
                  <div style={alertMeta}>
                    Metformin - 3 days supply remaining
                  </div>
                </div>
              </div>
              <div style={{ ...alertItem, borderLeftColor: "#22c55e" }}>
                <span style={alertIcon}>✓</span>
                <div>
                  <div style={alertTitle}>
                    Care review completed - Family Novak
                  </div>
                  <div style={alertMeta}>Yesterday at 16:45 • Anna P.</div>
                </div>
              </div>
              <div style={{ ...alertItem, borderLeftColor: "#60a5fa" }}>
                <span style={alertIcon}>👤</span>
                <div>
                  <div style={alertTitle}>New carer registered - Marco V.</div>
                  <div style={alertMeta}>
                    Pending verification • Wound care specialist
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Styles
const container: React.CSSProperties = {
  padding: "100px 20px 60px",
  maxWidth: 1400,
  margin: "0 auto",
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
};

const subtitle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.6,
};

const timeFilter: React.CSSProperties = {
  display: "flex",
  gap: 8,
  background: "rgba(255,255,255,0.05)",
  padding: 4,
  borderRadius: 12,
};

const timeFilterBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  padding: "8px 16px",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
};

const timeFilterActive: React.CSSProperties = {
  ...timeFilterBtn,
  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
  color: "#fff",
};

const loadingBox: React.CSSProperties = {
  textAlign: "center",
  padding: 60,
  opacity: 0.6,
};

const metricsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const metricCard: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(30,32,45,0.9), rgba(20,22,30,0.95))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 20,
  textAlign: "center",
};

const metricIcon: React.CSSProperties = {
  fontSize: 28,
  marginBottom: 8,
};

const metricValue: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  marginBottom: 4,
};

const metricLabel: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.6,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const chartsRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: 20,
  marginBottom: 20,
};

const chartCard: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(30,32,45,0.9), rgba(20,22,30,0.95))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 24,
};

const chartTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 20,
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
  opacity: 0.85,
};

const barContainer: React.CSSProperties = {
  flex: 1,
  height: 8,
  background: "rgba(255,255,255,0.08)",
  borderRadius: 4,
  overflow: "hidden",
};

const barFill: React.CSSProperties = {
  height: "100%",
  borderRadius: 4,
  transition: "width 0.5s ease",
};

const barValue: React.CSSProperties = {
  minWidth: 60,
  fontSize: 13,
  fontWeight: 600,
  textAlign: "right",
};

const lineChart: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  height: 180,
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
  maxWidth: 40,
  borderRadius: "4px 4px 0 0",
  marginTop: "auto",
  transition: "height 0.5s ease",
};

const lineChartLabel: React.CSSProperties = {
  fontSize: 10,
  opacity: 0.6,
  marginTop: 8,
};

const lineChartValue: React.CSSProperties = {
  position: "absolute",
  top: 0,
  fontSize: 12,
  fontWeight: 600,
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
  opacity: 0.6,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const td: React.CSSProperties = {
  padding: "12px",
  fontSize: 13,
  borderBottom: "1px solid rgba(255,255,255,0.05)",
};

const miniBar: React.CSSProperties = {
  width: 80,
  height: 6,
  background: "rgba(255,255,255,0.08)",
  borderRadius: 3,
  overflow: "hidden",
};

const miniBarFill: React.CSSProperties = {
  height: "100%",
  borderRadius: 3,
};

const incidentGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
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
  opacity: 0.7,
  marginTop: 4,
};

const summaryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 16,
};

const summaryItem: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  borderRadius: 12,
  padding: 16,
  textAlign: "center",
};

const summaryValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: "#60a5fa",
};

const summaryLabel: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.6,
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
  background: "rgba(255,255,255,0.03)",
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
};

const alertMeta: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.6,
  marginTop: 2,
};

const alertBadge: React.CSSProperties = {
  marginLeft: "auto",
  background: "rgba(239, 68, 68, 0.2)",
  color: "#f87171",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
};
