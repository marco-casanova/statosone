"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Badge, Input, useToast } from "@stratos/ui";
import {
  Search,
  MapPin,
  Filter,
  Heart,
  Ruler,
  Euro,
  Calendar,
  ArrowRight,
  X,
} from "lucide-react";
import { Sidebar, Header } from "@/components/dashboard";
import {
  createCheckoutSession,
  createRentalSubscription,
} from "@/actions/stripe";
import type { KellerProfile, Space, SpaceType } from "@/types";

interface BrowseSpacesPageProps {
  profile: KellerProfile;
  spaces: Space[];
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

const spaceTypeLabels: Record<SpaceType, string> = {
  basement: "Basement",
  garage: "Garage",
  attic: "Attic",
  storage_room: "Storage Room",
  warehouse: "Warehouse",
  parking: "Parking",
  other: "Other",
};

export function BrowseSpacesPage({ profile, spaces }: BrowseSpacesPageProps) {
  const router = useRouter();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<SpaceType | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minSize, setMinSize] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [rentDuration, setRentDuration] = useState(3);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [renting, setRenting] = useState(false);

  // Filter spaces
  const filteredSpaces = spaces.filter((space) => {
    if (
      searchQuery &&
      !space.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !space.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (selectedType && space.type !== selectedType) return false;
    if (maxPrice && space.total_price > maxPrice) return false;
    if (minSize && space.size_m2 < minSize) return false;
    return true;
  });

  async function handleRent() {
    if (!selectedSpace) return;

    setRenting(true);

    // Create Stripe checkout session
    const result = await createRentalSubscription(selectedSpace.id, startDate);

    setRenting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Redirect to Stripe Checkout
    if (result.sessionUrl) {
      window.location.href = result.sessionUrl;
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedType(null);
    setMaxPrice(null);
    setMinSize(null);
  }

  const hasFilters = searchQuery || selectedType || maxPrice || minSize;

  return (
    <>
      <Sidebar userType={profile.user_type} />

      <div style={styles.mainContent}>
        <Header
          title="Browse Spaces"
          subtitle={`${filteredSpaces.length} spaces available`}
        />

        <main style={styles.main}>
          {/* Search & Filters */}
          <Card padding="lg" style={styles.searchCard}>
            <div style={styles.searchBar}>
              <div style={styles.searchInput}>
                <Search size={20} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search by city or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.input}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} /> Filters
                {hasFilters && (
                  <Badge
                    variant="info"
                    size="sm"
                    style={{ marginLeft: "0.5rem" }}
                  >
                    {
                      [searchQuery, selectedType, maxPrice, minSize].filter(
                        Boolean,
                      ).length
                    }
                  </Badge>
                )}
              </Button>
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X size={18} /> Clear
                </Button>
              )}
            </div>

            {/* Quick Type Filters */}
            <div style={styles.quickFilters}>
              {Object.entries(spaceTypeLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setSelectedType(
                      selectedType === value ? null : (value as SpaceType),
                    )
                  }
                  style={{
                    ...styles.filterBtn,
                    backgroundColor:
                      selectedType === value ? "#dcfce7" : "#f3f4f6",
                    color: selectedType === value ? "#16a34a" : "#4b5563",
                    borderColor:
                      selectedType === value ? "#10b981" : "transparent",
                  }}
                >
                  {spaceTypeIcons[value as SpaceType]} {label}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div style={styles.advancedFilters}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Max Price (€/month)</label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={maxPrice || ""}
                    onChange={(e) =>
                      setMaxPrice(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    style={styles.filterInput}
                  />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Min Size (m²)</label>
                  <input
                    type="number"
                    placeholder="Any size"
                    value={minSize || ""}
                    onChange={(e) =>
                      setMinSize(e.target.value ? Number(e.target.value) : null)
                    }
                    style={styles.filterInput}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Spaces Grid */}
          {filteredSpaces.length === 0 ? (
            <Card padding="lg" style={styles.emptyCard}>
              <Search size={48} color="#9ca3af" />
              <h3 style={styles.emptyTitle}>No spaces found</h3>
              <p style={styles.emptyText}>
                Try adjusting your filters or search in a different area.
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <div style={styles.spacesGrid}>
              {filteredSpaces.map((space) => (
                <Card
                  key={space.id}
                  padding="md"
                  style={styles.spaceCard}
                  onClick={() => setSelectedSpace(space)}
                >
                  <div style={styles.spaceImage}>
                    <span style={styles.spaceIcon}>
                      {spaceTypeIcons[space.type]}
                    </span>
                    <button
                      style={styles.favoriteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success("Added to favorites");
                      }}
                    >
                      <Heart size={18} />
                    </button>
                    <Badge variant="success" size="sm" style={styles.typeBadge}>
                      {spaceTypeLabels[space.type]}
                    </Badge>
                  </div>

                  <div style={styles.spaceContent}>
                    <h4 style={styles.spaceTitle}>{space.title}</h4>
                    <p style={styles.spaceLocation}>
                      <MapPin size={14} /> {space.city}
                    </p>

                    <div style={styles.spaceDetails}>
                      <span>
                        <Ruler size={14} /> {space.size_m2} m²
                      </span>
                      <span>
                        <Euro size={14} /> €{space.price_per_m2}/m²
                      </span>
                      <span>
                        <Calendar size={14} /> Min {space.minimum_rental_months}
                        mo
                      </span>
                    </div>

                    {space.amenities?.length > 0 && (
                      <div style={styles.amenities}>
                        {space.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="default" size="sm">
                            {amenity}
                          </Badge>
                        ))}
                        {space.amenities.length > 3 && (
                          <Badge variant="default" size="sm">
                            +{space.amenities.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div style={styles.spaceFooter}>
                      <div style={styles.priceSection}>
                        <span style={styles.price}>€{space.total_price}</span>
                        <span style={styles.priceLabel}>/month</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View <ArrowRight size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Space Detail Modal */}
          {selectedSpace && (
            <div style={styles.modal} onClick={() => setSelectedSpace(null)}>
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalHeader}>
                  <div style={styles.modalImage}>
                    <span style={{ fontSize: "4rem" }}>
                      {spaceTypeIcons[selectedSpace.type]}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSpace(null)}
                    style={styles.closeBtn}
                  >
                    ✕
                  </Button>
                </div>

                <div style={styles.modalBody}>
                  <Badge variant="success">
                    {spaceTypeLabels[selectedSpace.type]}
                  </Badge>
                  <h2 style={styles.modalTitle}>{selectedSpace.title}</h2>
                  <p style={styles.modalLocation}>
                    <MapPin size={16} /> {selectedSpace.address},{" "}
                    {selectedSpace.city}
                  </p>

                  <p style={styles.modalDescription}>
                    {selectedSpace.description}
                  </p>

                  <div style={styles.modalStats}>
                    <div style={styles.stat}>
                      <Ruler size={20} />
                      <span style={styles.statValue}>
                        {selectedSpace.size_m2} m²
                      </span>
                      <span style={styles.statLabel}>Size</span>
                    </div>
                    <div style={styles.stat}>
                      <Euro size={20} />
                      <span style={styles.statValue}>
                        €{selectedSpace.price_per_m2}
                      </span>
                      <span style={styles.statLabel}>per m²</span>
                    </div>
                    <div style={styles.stat}>
                      <Calendar size={20} />
                      <span style={styles.statValue}>
                        {selectedSpace.minimum_rental_months}
                      </span>
                      <span style={styles.statLabel}>Min months</span>
                    </div>
                  </div>

                  {selectedSpace.amenities?.length > 0 && (
                    <div style={styles.modalAmenities}>
                      <h4 style={styles.amenitiesTitle}>Amenities</h4>
                      <div style={styles.amenitiesList}>
                        {selectedSpace.amenities.map((amenity) => (
                          <Badge key={amenity} variant="default">
                            ✓ {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={styles.rentSection}>
                    <h4 style={styles.rentTitle}>Rent This Space</h4>
                    <div style={styles.rentForm}>
                      <div style={styles.rentField}>
                        <label style={styles.rentLabel}>Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setStartDate(e.target.value)}
                          style={styles.rentInput}
                        />
                      </div>
                      <div style={styles.rentField}>
                        <label style={styles.rentLabel}>
                          Duration (months)
                        </label>
                        <select
                          value={rentDuration}
                          onChange={(e) =>
                            setRentDuration(Number(e.target.value))
                          }
                          style={styles.rentInput}
                        >
                          {[3, 6, 9, 12, 18, 24].map((m) => (
                            <option
                              key={m}
                              value={m}
                              disabled={m < selectedSpace.minimum_rental_months}
                            >
                              {m} months
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={styles.rentSummary}>
                      <div style={styles.rentRow}>
                        <span>Monthly rent</span>
                        <span>€{selectedSpace.total_price}</span>
                      </div>
                      <div style={styles.rentRow}>
                        <span>Duration</span>
                        <span>{rentDuration} months</span>
                      </div>
                      <div style={{ ...styles.rentRow, ...styles.rentTotal }}>
                        <span>First payment</span>
                        <span>€{selectedSpace.total_price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.modalActions}>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSpace(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleRent} loading={renting}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
            </div>
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
  searchCard: {
    marginBottom: "2rem",
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
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
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
  filterBtn: {
    padding: "0.5rem 0.75rem",
    border: "1px solid transparent",
    borderRadius: "20px",
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
  },
  advancedFilters: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  filterLabel: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#6b7280",
  },
  filterInput: {
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.875rem",
    width: "140px",
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
  spacesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  spaceCard: {
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  spaceImage: {
    position: "relative",
    height: "160px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  spaceIcon: {
    fontSize: "3.5rem",
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
  typeBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
  },
  spaceContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  spaceTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  spaceLocation: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.85rem",
    color: "#6b7280",
    margin: 0,
  },
  spaceDetails: {
    display: "flex",
    gap: "1rem",
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  amenities: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.375rem",
  },
  spaceFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.75rem",
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
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    position: "relative",
    height: "200px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px 16px 0 0",
  },
  closeBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
  },
  modalBody: {
    padding: "1.5rem",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111827",
    margin: "0.5rem 0",
  },
  modalLocation: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    fontSize: "0.9rem",
    color: "#6b7280",
    margin: "0 0 1rem 0",
  },
  modalDescription: {
    fontSize: "0.9rem",
    color: "#4b5563",
    lineHeight: 1.6,
    margin: "0 0 1.5rem 0",
  },
  modalStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  statValue: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#111827",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  modalAmenities: {
    marginBottom: "1.5rem",
  },
  amenitiesTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "0.75rem",
  },
  amenitiesList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  rentSection: {
    padding: "1.5rem",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
  },
  rentTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "1rem",
  },
  rentForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  rentField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  rentLabel: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#6b7280",
  },
  rentInput: {
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  rentSummary: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  rentRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  rentTotal: {
    paddingTop: "0.5rem",
    borderTop: "1px solid #e5e7eb",
    fontWeight: 600,
    color: "#111827",
  },
  modalActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
  },
};
