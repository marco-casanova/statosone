"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@stratos/auth";
import { Button, Card, Badge } from "@stratos/ui";
import {
  Building2,
  Users,
  Euro,
  TrendingUp,
  Plus,
  Eye,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Sidebar, Header, StatCard } from "@/components/dashboard";
import { SpaceCard } from "@/components/spaces";
import { getMySpaces, getActiveSearchers } from "@/actions";
import type { KellerProfile, Space, SpaceSearch } from "@/types";

interface RenterDashboardProps {
  profile: KellerProfile;
}

export function RenterDashboard({ profile }: RenterDashboardProps) {
  const { signOut } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [searchers, setSearchers] = useState<SpaceSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [spacesData, searchersData] = await Promise.all([
        getMySpaces(),
        getActiveSearchers(),
      ]);
      setSpaces(spacesData);
      setSearchers(searchersData.slice(0, 3)); // Show top 3
      setLoading(false);
    }
    loadData();
  }, []);

  const activeSpaces = spaces.filter((s) => s.status === "active").length;
  const totalRevenue = spaces
    .filter((s) => s.status === "rented")
    .reduce((sum, s) => sum + s.total_price, 0);
  const pendingSpaces = spaces.filter(
    (s) => s.status === "pending_review",
  ).length;

  return (
    <>
      <Sidebar userType="renter" />

      <div style={styles.mainContent}>
        <Header
          title={`Welcome back, ${profile.full_name.split(" ")[0]}! 👋`}
          subtitle="Here's what's happening with your spaces"
          actions={
            <Link href="/app/spaces/new">
              <Button>
                <Plus size={18} /> Add Space
              </Button>
            </Link>
          }
        />

        <main style={styles.main}>
          {/* Stats Overview */}
          <div style={styles.statsGrid}>
            <StatCard
              icon={<Building2 size={24} color="#16a34a" />}
              label="Active Listings"
              value={activeSpaces}
              variant="success"
            />
            <StatCard
              icon={<Users size={24} color="#3b82f6" />}
              label="Active Searchers"
              value={searchers.length}
              variant="default"
            />
            <StatCard
              icon={<Euro size={24} color="#f59e0b" />}
              label="Monthly Revenue"
              value={`€${totalRevenue}`}
              variant="warning"
            />
            <StatCard
              icon={<TrendingUp size={24} color="#8b5cf6" />}
              label="Pending Review"
              value={pendingSpaces}
              variant="default"
            />
          </div>

          {/* Quick Actions */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Quick Actions</h2>
            </div>
            <div style={styles.actionsGrid}>
              <Link href="/app/spaces/new" style={styles.actionCard}>
                <Plus size={24} color="#10b981" />
                <span style={styles.actionLabel}>Add New Space</span>
              </Link>
              <Link href="/app/searchers" style={styles.actionCard}>
                <Users size={24} color="#3b82f6" />
                <span style={styles.actionLabel}>Browse Searchers</span>
              </Link>
              <Link href="/app/messages" style={styles.actionCard}>
                <MessageSquare size={24} color="#f59e0b" />
                <span style={styles.actionLabel}>Messages</span>
              </Link>
            </div>
          </div>

          {/* My Spaces */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>My Spaces</h2>
              <Link href="/app/spaces">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            {loading ? (
              <Card padding="lg">
                <p style={styles.loadingText}>Loading your spaces...</p>
              </Card>
            ) : spaces.length === 0 ? (
              <Card padding="lg" style={styles.emptyCard}>
                <Building2 size={48} color="#9ca3af" />
                <h3 style={styles.emptyTitle}>No spaces yet</h3>
                <p style={styles.emptyText}>
                  Start earning by listing your unused basement, garage, or
                  storage room.
                </p>
                <Link href="/app/spaces/new">
                  <Button>
                    <Plus size={18} /> Add Your First Space
                  </Button>
                </Link>
              </Card>
            ) : (
              <div style={styles.spacesGrid}>
                {spaces.slice(0, 3).map((space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    onView={() =>
                      (window.location.href = `/app/spaces/${space.id}`)
                    }
                    onEdit={() =>
                      (window.location.href = `/app/spaces/${space.id}/edit`)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* People Looking for Space */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>People Looking for Space</h2>
              <Link href="/app/searchers">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            {searchers.length === 0 ? (
              <Card padding="lg">
                <p style={styles.emptySmall}>
                  No active searchers at the moment.
                </p>
              </Card>
            ) : (
              <div style={styles.searchersList}>
                {searchers.map((search) => (
                  <Card
                    key={search.id}
                    padding="md"
                    style={styles.searcherCard}
                  >
                    <div style={styles.searcherHeader}>
                      <div>
                        <h4 style={styles.searcherTitle}>{search.title}</h4>
                        <p style={styles.searcherLocation}>
                          {search.preferred_location}
                        </p>
                      </div>
                      <Badge variant="success" size="sm">
                        Up to €{search.max_budget}/mo
                      </Badge>
                    </div>
                    <p style={styles.searcherDesc}>{search.description}</p>
                    <div style={styles.searcherMeta}>
                      <span>
                        {search.min_size_m2}-{search.max_size_m2} m²
                      </span>
                      <span>•</span>
                      <span>{search.rental_duration_months} months</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ marginTop: "0.75rem" }}
                    >
                      <MessageSquare size={14} /> Contact
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainContent: {
    marginLeft: "260px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  main: {
    padding: "2rem",
    maxWidth: "1400px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  section: {
    marginBottom: "2rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
  },
  actionCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1.5rem",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  actionLabel: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#374151",
  },
  spacesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  emptyCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "1rem",
    padding: "3rem",
  },
  emptyTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  emptyText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    maxWidth: "300px",
    margin: 0,
  },
  emptySmall: {
    color: "#6b7280",
    textAlign: "center",
    margin: 0,
  },
  loadingText: {
    color: "#6b7280",
    textAlign: "center",
    margin: 0,
  },
  searchersList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1rem",
  },
  searcherCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  searcherHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  searcherTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  searcherLocation: {
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: 0,
  },
  searcherDesc: {
    fontSize: "0.875rem",
    color: "#4b5563",
    margin: 0,
    lineHeight: 1.4,
  },
  searcherMeta: {
    display: "flex",
    gap: "0.5rem",
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
};
