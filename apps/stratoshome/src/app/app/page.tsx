"use client";

import { useAuth } from "@stratos/auth";
import { Card, Button, Avatar, Badge, Input } from "@stratos/ui";
import { LogOut, Mail, MapPin, Euro, Calendar, Edit } from "lucide-react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>🏠 StratosHome</h1>
        <div style={styles.headerRight}>
          <Button variant="outline" size="sm">
            <Mail size={16} /> Messages
            <Badge variant="info" size="sm">0</Badge>
          </Button>
          <Avatar fallback={user?.email || "U"} size="sm" />
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          <Card padding="lg" style={styles.profileCard}>
            <div style={styles.profileHeader}>
              <Avatar fallback={user?.email || "U"} size="xl" />
              <Button variant="ghost" size="sm">
                <Edit size={14} /> Edit
              </Button>
            </div>
            <h2 style={styles.profileName}>Your Profile</h2>
            <p style={styles.profileEmail}>{user?.email}</p>

            <div style={styles.tags}>
              <Badge variant="info">Looking</Badge>
              <Badge variant="success">Verified</Badge>
            </div>

            <div style={styles.profileStats}>
              <div style={styles.stat}>
                <MapPin size={16} color="#6b7280" />
                <span>Berlin (flexible)</span>
              </div>
              <div style={styles.stat}>
                <Euro size={16} color="#6b7280" />
                <span>Up to €1,200/month</span>
              </div>
              <div style={styles.stat}>
                <Calendar size={16} color="#6b7280" />
                <span>Move-in: Flexible</span>
              </div>
            </div>
          </Card>

          <div style={styles.content}>
            <Card padding="lg">
              <h3 style={styles.sectionTitle}>Your Preferences</h3>
              <p style={styles.description}>
                Complete your profile to help landlords find you. The more details you provide,
                the better your matches will be.
              </p>

              <div style={styles.form}>
                <Input label="Preferred Location" placeholder="e.g., Berlin Mitte, Kreuzberg" />
                <Input label="Max Budget" type="number" placeholder="1200" />
                <Input label="Move-in Date" type="date" />
              </div>

              <Button style={{ marginTop: "1.5rem" }}>Save Preferences</Button>
            </Card>

            <Card padding="lg" style={{ marginTop: "1.5rem" }}>
              <h3 style={styles.sectionTitle}>Contact Requests</h3>
              <p style={styles.placeholder}>
                When landlords are interested in your profile, their messages will appear here.
                You don't need to apply — they come to you!
              </p>
            </Card>
          </div>
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
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1d4ed8",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "2rem",
  },
  profileCard: {
    textAlign: "center",
  },
  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  profileName: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "0.25rem",
  },
  profileEmail: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "1rem",
  },
  tags: {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  profileStats: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    textAlign: "left",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "#374151",
  },
  content: {},
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  description: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  placeholder: {
    color: "#6b7280",
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.5rem",
  },
};
