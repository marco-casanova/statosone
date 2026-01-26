"use client";

import { useAuth } from "@stratos/auth";
import { Card, Button, Avatar, Badge } from "@stratos/ui";
import { LogOut, Search, Users } from "lucide-react";

export default function AppDashboard() {
  const { user, signOut } = useAuth();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>StratosTalent</h1>
        <div style={styles.headerRight}>
          <Avatar fallback={user?.email || "U"} size="sm" />
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </header>

      <main style={styles.main}>
        <h2 style={styles.title}>Welcome to StratosTalent</h2>
        <p style={styles.subtitle}>Find and manage your developer engagements</p>

        <div style={styles.grid}>
          <Card padding="lg">
            <div style={styles.cardIcon}>
              <Search size={24} color="#2563eb" />
            </div>
            <h3 style={styles.cardTitle}>Browse Developers</h3>
            <p style={styles.cardDescription}>
              Search our pool of pre-vetted developers by skills, experience, and availability.
            </p>
            <Button style={{ marginTop: "1rem" }}>
              Find Developers
            </Button>
          </Card>

          <Card padding="lg">
            <div style={styles.cardIcon}>
              <Users size={24} color="#10b981" />
            </div>
            <h3 style={styles.cardTitle}>Your Team</h3>
            <p style={styles.cardDescription}>
              Manage your current developer engagements and track progress.
            </p>
            <Badge variant="info">Coming Soon</Badge>
          </Card>
        </div>

        <Card padding="lg" style={{ marginTop: "2rem" }}>
          <h3 style={styles.cardTitle}>Developer Profiles</h3>
          <p style={styles.cardDescription}>
            This is a placeholder for the developer listing. In the MVP, companies can browse read-only developer profiles and request contact.
          </p>
          <div style={styles.placeholder}>
            <p>Developer profiles will appear here</p>
          </div>
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
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#111827",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
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
  cardIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3rem",
    height: "3rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "0.75rem",
    marginBottom: "1rem",
  },
  cardTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  cardDescription: {
    fontSize: "0.875rem",
    color: "#6b7280",
    lineHeight: 1.6,
  },
  placeholder: {
    marginTop: "1rem",
    padding: "3rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.5rem",
    textAlign: "center",
    color: "#9ca3af",
  },
};
