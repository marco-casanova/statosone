"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@stratos/auth";
import { Button, Card, Badge, Input } from "@stratos/ui";
import { 
  Search, 
  Building2, 
  Euro, 
  MapPin, 
  Plus, 
  Filter,
  Heart,
  MessageSquare,
  ArrowRight,
  Ruler
} from "lucide-react";
import { Sidebar, Header, StatCard } from "@/components/dashboard";
import { getAvailableSpaces, getMySearches, getMyRentals } from "@/actions";
import type { KellerProfile, Space, SpaceSearch, SpaceType } from "@/types";

interface SearcherDashboardProps {
  profile: KellerProfile;
}

const spaceTypeIcons: Record<SpaceType, string> = {
  basement: "🏚️",
  garage: "🚗",
  attic: "🏠",
  storage_room: "📦",
  warehouse: "🏭",
  parking: "🅿️",
  other: "📍",
};

export function SearcherDashboard({ profile }: SearcherDashboardProps) {
  const { signOut } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [searches, setSearches] = useState<SpaceSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      const [spacesData, searchesData] = await Promise.all([
        getAvailableSpaces(),
        getMySearches(),
      ]);
      setSpaces(spacesData);
      setSearches(searchesData);
      setLoading(false);
    }
    loadData();
  }, []);

  const activeSearches = searches.filter(s => s.status === "active").length;

  return (
    <>
      <Sidebar userType="searcher" />
      
      <div style={styles.mainContent}>
        <Header 
          title={`Welcome back, ${profile.full_name.split(" ")[0]}! 👋`}
          subtitle="Find the perfect space for your needs"
          actions={
            <Link href="/app/searches/new">
              <Button>
                <Plus size={18} /> Create Search
              </Button>
            </Link>
          }
        />

        <main style={styles.main}>
          {/* Stats Overview */}
          <div style={styles.statsGrid}>
            <StatCard 
              icon={<Building2 size={24} color="#3b82f6" />}
              label="Available Spaces"
              value={spaces.length}
              variant="default"
            />
            <StatCard 
              icon={<Search size={24} color="#16a34a" />}
              label="Active Searches"
              value={activeSearches}
              variant="success"
            />
            <StatCard 
              icon={<Heart size={24} color="#ef4444" />}
              label="Saved Spaces"
              value={0}
              variant="default"
            />
            <StatCard 
              icon={<MessageSquare size={24} color="#f59e0b" />}
              label="Messages"
              value={0}
              variant="warning"
            />
          </div>

          {/* Search Bar */}
          <Card padding="lg" style={styles.searchCard}>
            <h3 style={styles.searchTitle}>Find Your Perfect Space</h3>
            <div style={styles.searchBar}>
              <div style={styles.searchInput}>
                <MapPin size={20} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Enter city or neighborhood..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.input}
                />
              </div>
              <Button>
                <Search size={18} /> Search
              </Button>
            </div>
            <div style={styles.quickFilters}>
              <Badge variant="default" size="sm" style={styles.filterBadge}>
                🏚️ Basement
              </Badge>
              <Badge variant="default" size="sm" style={styles.filterBadge}>
                🚗 Garage
              </Badge>
              <Badge variant="default" size="sm" style={styles.filterBadge}>
                📦 Storage
              </Badge>
              <Badge variant="default" size="sm" style={styles.filterBadge}>
                🅿️ Parking
              </Badge>
            </div>
          </Card>

          {/* My Active Searches */}
          {searches.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>My Active Searches</h2>
                <Link href="/app/searches">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
              <div style={styles.searchesList}>
                {searches.slice(0, 2).map((search) => (
                  <Card key={search.id} padding="md" style={styles.searchItemCard}>
                    <div style={styles.searchItemHeader}>
                      <h4 style={styles.searchItemTitle}>{search.title}</h4>
                      <Badge variant="success" size="sm">Active</Badge>
                    </div>
                    <p style={styles.searchItemMeta}>
                      {search.preferred_location} • {search.min_size_m2}-{search.max_size_m2} m² • Max €{search.max_budget}/mo
                    </p>
                    <div style={styles.matchInfo}>
                      <span style={styles.matchCount}>3 potential matches</span>
                      <Button variant="outline" size="sm">View Matches</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Spaces */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Available Spaces Near You</h2>
              <Link href="/app/browse">
                <Button variant="ghost" size="sm">
                  Browse All <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            
            {loading ? (
              <Card padding="lg">
                <p style={styles.loadingText}>Loading available spaces...</p>
              </Card>
            ) : spaces.length === 0 ? (
              <Card padding="lg" style={styles.emptyCard}>
                <Search size={48} color="#9ca3af" />
                <h3 style={styles.emptyTitle}>No spaces available yet</h3>
                <p style={styles.emptyText}>
                  Create a search profile and we'll notify you when matching spaces become available.
                </p>
                <Link href="/app/searches/new">
                  <Button>
                    <Plus size={18} /> Create Search Profile
                  </Button>
                </Link>
              </Card>
            ) : (
              <div style={styles.spacesGrid}>
                {spaces.slice(0, 6).map((space) => (
                  <Card key={space.id} padding="md" style={styles.spaceCard}>
                    <div style={styles.spaceImage}>
                      <span style={styles.spaceIcon}>{spaceTypeIcons[space.type]}</span>
                      <button style={styles.favoriteBtn}>
                        <Heart size={18} />
                      </button>
                    </div>
                    <div style={styles.spaceContent}>
                      <div style={styles.spaceHeader}>
                        <h4 style={styles.spaceTitle}>{space.title}</h4>
                        <Badge variant="success" size="sm">{space.type}</Badge>
                      </div>
                      <p style={styles.spaceLocation}>
                        <MapPin size={14} /> {space.city}
                      </p>
                      <div style={styles.spaceDetails}>
                        <span><Ruler size={14} /> {space.size_m2} m²</span>
                        <span><Euro size={14} /> €{space.price_per_m2}/m²</span>
                      </div>
                      <div style={styles.spaceFooter}>
                        <div style={styles.priceSection}>
                          <span style={styles.price}>€{space.total_price}</span>
                          <span style={styles.priceLabel}>/month</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Create Search Profile CTA */}
          {searches.length === 0 && (
            <Card padding="lg" style={styles.ctaCard}>
              <div style={styles.ctaContent}>
                <div>
                  <h3 style={styles.ctaTitle}>Let landlords find you!</h3>
                  <p style={styles.ctaText}>
                    Create a search profile with your preferences and get notified when matching spaces become available.
                  </p>
                </div>
                <Link href="/app/searches/new">
                  <Button>
                    <Plus size={18} /> Create Search Profile
                  </Button>
                </Link>
              </div>
            </Card>
          )}
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
  searchCard: {
    marginBottom: "2rem",
    background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
  },
  searchTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "1rem",
  },
  searchBar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  searchInput: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "0.9rem",
    color: "#111827",
    backgroundColor: "transparent",
  },
  quickFilters: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  filterBadge: {
    cursor: "pointer",
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
  searchesList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "1rem",
  },
  searchItemCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  searchItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchItemTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  searchItemMeta: {
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: 0,
  },
  matchInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #e5e7eb",
  },
  matchCount: {
    fontSize: "0.85rem",
    color: "#16a34a",
    fontWeight: 500,
  },
  spacesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  spaceCard: {
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  spaceImage: {
    position: "relative",
    height: "140px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  spaceIcon: {
    fontSize: "3rem",
  },
  favoriteBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    padding: "0.5rem",
    backgroundColor: "#ffffff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  spaceContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  spaceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  spaceTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  spaceLocation: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: 0,
  },
  spaceDetails: {
    display: "flex",
    gap: "1rem",
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  spaceFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #e5e7eb",
  },
  priceSection: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.125rem",
  },
  price: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#10b981",
  },
  priceLabel: {
    fontSize: "0.75rem",
    color: "#6b7280",
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
  loadingText: {
    color: "#6b7280",
    textAlign: "center",
    margin: 0,
  },
  ctaCard: {
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
  },
  ctaContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "2rem",
  },
  ctaTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "0.5rem",
  },
  ctaText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: 0,
  },
};
