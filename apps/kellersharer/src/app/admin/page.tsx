import { Card, Badge } from "@stratos/ui";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>KellerSharer Admin</h1>
        <Badge variant="warning">Admin</Badge>
      </header>

      <main style={styles.main}>
        <h2 style={styles.title}>Fraud Review Dashboard</h2>
        <p style={styles.subtitle}>Review flagged listings and user reports</p>

        <div style={styles.grid}>
          <Card padding="lg">
            <div style={styles.cardHeader}>
              <AlertTriangle size={20} color="#f59e0b" />
              <h3 style={styles.cardTitle}>Pending Reviews</h3>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>flagged listings</span>
            </div>
          </Card>

          <Card padding="lg">
            <div style={styles.cardHeader}>
              <CheckCircle size={20} color="#10b981" />
              <h3 style={styles.cardTitle}>Approved Today</h3>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>listings</span>
            </div>
          </Card>

          <Card padding="lg">
            <div style={styles.cardHeader}>
              <XCircle size={20} color="#ef4444" />
              <h3 style={styles.cardTitle}>Rejected</h3>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>this week</span>
            </div>
          </Card>
        </div>

        <Card padding="lg" style={{ marginTop: "2rem" }}>
          <h3 style={styles.cardTitle}>Listings to Review</h3>
          <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
            No listings pending review
          </p>
        </Card>
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
