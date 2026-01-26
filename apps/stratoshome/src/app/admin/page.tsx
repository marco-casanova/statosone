import { Card, Badge } from "@stratos/ui";
import { Users, Building, Shield, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>StratosHome Admin</h1>
        <Badge variant="warning">Admin</Badge>
      </header>

      <main style={styles.main}>
        <h2 style={styles.title}>Moderation Dashboard</h2>
        <p style={styles.subtitle}>Manage renters, landlords, and reported content</p>

        <div style={styles.grid}>
          <Card padding="lg">
            <div style={styles.cardHeader}>
              <Users size={20} color="#3b82f6" />
              <h3 style={styles.cardTitle}>Renters</h3>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>active profiles</span>
            </div>
          </Card>

          <Card padding="lg">
            <div style={styles.cardHeader}>
              <Building size={20} color="#8b5cf6" />
              <h3 style={styles.cardTitle}>Landlords</h3>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>registered</span>
            </div>
          </Card>

          <Card padding="lg">
            <div style={styles.cardHeader}>
              <Shield size={20} color="#10b981" />
              <h3 style={styles.cardTitle}>Verifications</h3>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>pending</span>
            </div>
          </Card>

          <Card padding="lg">
            <div style={styles.cardHeader}>
              <AlertTriangle size={20} color="#f59e0b" />
              <h3 style={styles.cardTitle}>Reports</h3>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>to review</span>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    backgroundColor: "#1f2937",
    color: "#ffffff",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 700,
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
  },
  stat: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
  },
  statNumber: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "#111827",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
};
