"use client";

import { Card, Badge, Button, Avatar } from "@stratos/ui";
import { MapPin, Ruler, Euro, Calendar, MessageSquare } from "lucide-react";
import type { SpaceSearch, SpaceType } from "@/types";

interface SearchCardProps {
  search: SpaceSearch;
  onContact?: () => void;
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

export function SearchCard({ search, onContact }: SearchCardProps) {
  return (
    <Card padding="lg" style={styles.card}>
      <div style={styles.header}>
        <div style={styles.userSection}>
          <Avatar fallback={search.searcher?.full_name || "U"} size="md" />
          <div style={styles.userInfo}>
            <h3 style={styles.userName}>
              {search.searcher?.full_name || "Anonymous"}
            </h3>
            <p style={styles.location}>
              <MapPin size={14} />
              Looking in {search.preferred_location}
            </p>
          </div>
        </div>
        <Badge
          variant={search.status === "active" ? "success" : "default"}
          size="sm"
        >
          {search.status === "active" ? "Actively Looking" : search.status}
        </Badge>
      </div>

      <h4 style={styles.title}>{search.title}</h4>
      <p style={styles.description}>{search.description}</p>

      <div style={styles.preferences}>
        <div style={styles.prefItem}>
          <span style={styles.prefLabel}>Space Types</span>
          <div style={styles.tags}>
            {search.preferred_types.map((type) => (
              <Badge key={type} variant="default" size="sm">
                {spaceTypeLabels[type]}
              </Badge>
            ))}
          </div>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <Ruler size={16} color="#6b7280" />
            <span>
              {search.min_size_m2} - {search.max_size_m2} m²
            </span>
          </div>
          <div style={styles.stat}>
            <Euro size={16} color="#6b7280" />
            <span>Max €{search.max_budget}/mo</span>
          </div>
          <div style={styles.stat}>
            <Calendar size={16} color="#6b7280" />
            <span>{search.rental_duration_months} months</span>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <span style={styles.date}>
          Posted {new Date(search.created_at).toLocaleDateString()}
        </span>
        <Button variant="outline" onClick={onContact}>
          <MessageSquare size={16} /> Contact
        </Button>
      </div>
    </Card>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
  },
  userName: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  location: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: 0,
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  description: {
    fontSize: "0.875rem",
    color: "#4b5563",
    lineHeight: 1.5,
    margin: 0,
  },
  preferences: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  prefItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  prefLabel: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  statsRow: {
    display: "flex",
    gap: "1.5rem",
    marginTop: "0.5rem",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    fontSize: "0.85rem",
    color: "#4b5563",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  date: {
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
};
