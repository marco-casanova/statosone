"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, Badge, Avatar, useToast } from "@stratos/ui";
import {
  Users,
  Building2,
  FileText,
  Euro,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  LayoutDashboard,
  Settings,
  BarChart3,
  MapPin,
  Ruler,
} from "lucide-react";
import { approveSpace, rejectSpace } from "@/actions";
import type { AdminStats, Space, KellerProfile, SpaceType } from "@/types";

interface AdminDashboardProps {
  stats: AdminStats;
  pendingSpaces: Space[];
  users: KellerProfile[];
}

const spaceTypeLabels: Record<SpaceType, string> = {
  basement: "Basement",
  garage: "Garage",
  attic: "Attic",
  storage_room: "Storage Room",
  warehouse: "Warehouse",
  parking: "Parking",
  other: "Other",
};

export function AdminDashboard({
  stats,
  pendingSpaces,
  users,
}: AdminDashboardProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "pending" | "users">(
    "overview",
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleApprove(spaceId: string) {
    setProcessingId(spaceId);
    const result = await approveSpace(spaceId);
    setProcessingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Space approved successfully");
    }
  }

  async function handleReject(spaceId: string) {
    setProcessingId(spaceId);
    const result = await rejectSpace(spaceId);
    setProcessingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Space rejected");
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "pending",
      label: "Pending Review",
      icon: AlertTriangle,
      count: stats.pendingReviews,
    },
    { id: "users", label: "Users", icon: Users, count: stats.totalUsers },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏠</span>
          <span style={styles.logoText}>KellerSharer</span>
        </div>

        <Badge variant="warning" style={styles.adminBadge}>
          Admin Panel
        </Badge>

        <nav style={styles.nav}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  ...styles.navItem,
                  backgroundColor:
                    activeTab === tab.id ? "#f3f4f6" : "transparent",
                  color: activeTab === tab.id ? "#111827" : "#6b7280",
                }}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge
                    variant={tab.id === "pending" ? "warning" : "default"}
                    size="sm"
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <Link href="/app" style={styles.backLink}>
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "pending" && "Pending Reviews"}
              {activeTab === "users" && "User Management"}
            </h1>
            <p style={styles.subtitle}>
              {activeTab === "overview" &&
                "Monitor platform activity and key metrics"}
              {activeTab === "pending" &&
                "Review and approve new space listings"}
              {activeTab === "users" && "Manage registered users"}
            </p>
          </div>
        </header>

        <div style={styles.content}>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              <div style={styles.statsGrid}>
                <Card padding="lg" style={styles.statCard}>
                  <div
                    style={{ ...styles.statIcon, backgroundColor: "#dbeafe" }}
                  >
                    <Users size={24} color="#3b82f6" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Total Users</span>
                    <span style={styles.statValue}>{stats.totalUsers}</span>
                  </div>
                </Card>

                <Card padding="lg" style={styles.statCard}>
                  <div
                    style={{ ...styles.statIcon, backgroundColor: "#dcfce7" }}
                  >
                    <Building2 size={24} color="#16a34a" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Total Spaces</span>
                    <span style={styles.statValue}>{stats.totalSpaces}</span>
                  </div>
                </Card>

                <Card padding="lg" style={styles.statCard}>
                  <div
                    style={{ ...styles.statIcon, backgroundColor: "#fef3c7" }}
                  >
                    <AlertTriangle size={24} color="#d97706" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Pending Review</span>
                    <span style={styles.statValue}>{stats.pendingReviews}</span>
                  </div>
                </Card>

                <Card padding="lg" style={styles.statCard}>
                  <div
                    style={{ ...styles.statIcon, backgroundColor: "#ede9fe" }}
                  >
                    <FileText size={24} color="#7c3aed" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Active Rentals</span>
                    <span style={styles.statValue}>{stats.activeRentals}</span>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card padding="lg" style={{ marginTop: "1.5rem" }}>
                <h3 style={styles.cardTitle}>Recent Pending Reviews</h3>
                {pendingSpaces.length === 0 ? (
                  <p style={styles.emptyText}>No spaces pending review</p>
                ) : (
                  <div style={styles.pendingList}>
                    {pendingSpaces.slice(0, 5).map((space) => (
                      <div key={space.id} style={styles.pendingItem}>
                        <div style={styles.pendingInfo}>
                          <span style={styles.pendingTitle}>{space.title}</span>
                          <span style={styles.pendingMeta}>
                            {space.city} • {space.size_m2} m² • €
                            {space.total_price}/mo
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("pending")}
                        >
                          Review
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {/* Pending Reviews Tab */}
          {activeTab === "pending" && (
            <>
              {pendingSpaces.length === 0 ? (
                <Card padding="lg" style={styles.emptyCard}>
                  <CheckCircle size={48} color="#10b981" />
                  <h3 style={styles.emptyTitle}>All caught up!</h3>
                  <p style={styles.emptyDesc}>
                    No spaces pending review at the moment.
                  </p>
                </Card>
              ) : (
                <div style={styles.reviewGrid}>
                  {pendingSpaces.map((space) => (
                    <Card key={space.id} padding="lg" style={styles.reviewCard}>
                      <div style={styles.reviewHeader}>
                        <Badge variant="warning">Pending Review</Badge>
                        <span style={styles.reviewDate}>
                          {new Date(space.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 style={styles.reviewTitle}>{space.title}</h3>

                      <div style={styles.reviewDetails}>
                        <div style={styles.reviewDetail}>
                          <MapPin size={16} color="#6b7280" />
                          <span>
                            {space.address}, {space.city} {space.postal_code}
                          </span>
                        </div>
                        <div style={styles.reviewDetail}>
                          <Ruler size={16} color="#6b7280" />
                          <span>
                            {space.size_m2} m² • {spaceTypeLabels[space.type]}
                          </span>
                        </div>
                        <div style={styles.reviewDetail}>
                          <Euro size={16} color="#6b7280" />
                          <span>
                            €{space.total_price}/month (€{space.price_per_m2}
                            /m²)
                          </span>
                        </div>
                      </div>

                      <p style={styles.reviewDescription}>
                        {space.description}
                      </p>

                      {space.amenities.length > 0 && (
                        <div style={styles.amenities}>
                          {space.amenities.map((amenity) => (
                            <Badge key={amenity} variant="default" size="sm">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {space.owner && (
                        <div style={styles.ownerInfo}>
                          <Avatar
                            fallback={space.owner.full_name || "U"}
                            size="sm"
                          />
                          <div>
                            <span style={styles.ownerName}>
                              {space.owner.full_name}
                            </span>
                            <span style={styles.ownerMeta}>Space Owner</span>
                          </div>
                        </div>
                      )}

                      <div style={styles.reviewActions}>
                        <Button
                          variant="outline"
                          onClick={() => handleReject(space.id)}
                          loading={processingId === space.id}
                          style={{ color: "#ef4444", borderColor: "#ef4444" }}
                        >
                          <XCircle size={18} /> Reject
                        </Button>
                        <Button
                          onClick={() => handleApprove(space.id)}
                          loading={processingId === space.id}
                        >
                          <CheckCircle size={18} /> Approve
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <Card padding="lg">
              <div style={styles.tableHeader}>
                <h3 style={styles.cardTitle}>Registered Users</h3>
                <Badge variant="default">{users.length} total</Badge>
              </div>

              {users.length === 0 ? (
                <p style={styles.emptyText}>No users registered yet</p>
              ) : (
                <div style={styles.usersList}>
                  {users.map((user) => (
                    <div key={user.id} style={styles.userRow}>
                      <div style={styles.userInfo}>
                        <Avatar fallback={user.full_name || "U"} size="sm" />
                        <div>
                          <span style={styles.userName}>{user.full_name}</span>
                          <span style={styles.userMeta}>
                            {user.location || "Location not set"}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          user.user_type === "renter" ? "success" : "info"
                        }
                        size="sm"
                      >
                        {user.user_type === "renter"
                          ? "Space Owner"
                          : "Space Seeker"}
                      </Badge>
                      <span style={styles.userDate}>
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Eye size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#1f2937",
    color: "#ffffff",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  logoIcon: {
    fontSize: "1.5rem",
  },
  logoText: {
    fontSize: "1.125rem",
    fontWeight: 700,
  },
  adminBadge: {
    alignSelf: "flex-start",
    marginBottom: "2rem",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    textAlign: "left",
    width: "100%",
  },
  sidebarFooter: {
    paddingTop: "1rem",
    borderTop: "1px solid #374151",
  },
  backLink: {
    color: "#9ca3af",
    textDecoration: "none",
    fontSize: "0.875rem",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "1.5rem 2rem",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0.25rem 0 0 0",
  },
  content: {
    padding: "2rem",
    flex: 1,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIcon: {
    padding: "0.75rem",
    borderRadius: "10px",
  },
  statContent: {
    display: "flex",
    flexDirection: "column",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111827",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    padding: "2rem",
    margin: 0,
  },
  pendingList: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  pendingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  pendingInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
  },
  pendingTitle: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#111827",
  },
  pendingMeta: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  emptyCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "3rem",
    gap: "1rem",
  },
  emptyTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  emptyDesc: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: 0,
  },
  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "1.5rem",
  },
  reviewCard: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewDate: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  reviewTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  reviewDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  reviewDetail: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  reviewDescription: {
    fontSize: "0.875rem",
    color: "#6b7280",
    lineHeight: 1.5,
    margin: 0,
  },
  amenities: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  ownerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  ownerName: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#111827",
  },
  ownerMeta: {
    display: "block",
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  reviewActions: {
    display: "flex",
    gap: "0.75rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  usersList: {
    display: "flex",
    flexDirection: "column",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem 0",
    borderBottom: "1px solid #e5e7eb",
  },
  userInfo: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  userName: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#111827",
  },
  userMeta: {
    display: "block",
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  userDate: {
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
};
