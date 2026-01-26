import { Card, Badge } from "@stratos/ui";
import { Users, Building, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>StratosTalent Admin</h1>
        <Badge variant="warning">Admin</Badge>
      </header>

      <main style={styles.main}>
        <h2 style={styles.title}>Admin Dashboard</h2>
        <p style={styles.subtitle}>Moderate developers and company accounts</p>

        <div style={styles.grid}>
          <Card padding="lg">
            <div style={styles.cardHeader}>
              <Users size={20} color="#8b5cf6" />
              <h3 style={styles.cardTitle}>Developer Moderation</h3>
            </div>
            <p style={styles.cardDescription}>
              Review and approve developer applications.
            </p>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>Pending reviews</span>
            </div>
          </Card>

          <Card padding="lg">
            <div style={styles.cardHeader}>
              <Building size={20} color="#3b82f6" />
              <h3 style={styles.cardTitle}>Companies</h3>
            </div>
            <p style={styles.cardDescription}>
              Manage company accounts and verify legitimacy.
            </p>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>Active companies</span>
            </div>
          </Card>

          <Card padding="lg">
            <div style={styles.cardHeader}>
              <AlertTriangle size={20} color="#f59e0b" />
              <h3 style={styles.cardTitle}>Reports</h3>
            </div>
            <p style={styles.cardDescription}>
              Handle reported issues and disputes.
            </p>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>Open reports</span>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
  },
  cardDescription: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "1rem",
  },
  stat: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#111827",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
};
