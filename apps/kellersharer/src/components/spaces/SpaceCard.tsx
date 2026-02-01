"use client";

import { Card, Badge, Button } from "@stratos/ui";
import { MapPin, Ruler, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import type { Space, SpaceStatus, SpaceType } from "@/types";

interface SpaceCardProps {
  space: Space;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
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

const spaceTypeIcons: Record<SpaceType, string> = {
  basement: "🏚️",
  garage: "🚗",
  attic: "🏠",
  storage_room: "📦",
  warehouse: "🏭",
  parking: "🅿️",
  other: "📍",
};

const statusVariants: Record<
  SpaceStatus,
  "info" | "warning" | "success" | "danger" | "default"
> = {
  draft: "default",
  pending_review: "warning",
  active: "success",
  rented: "info",
  inactive: "danger",
};

const statusLabels: Record<SpaceStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  active: "Active",
  rented: "Rented",
  inactive: "Inactive",
};

export function SpaceCard({
  space,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}: SpaceCardProps) {
  return (
    <Card padding="md" style={styles.card}>
      <div style={styles.imageSection}>
        <div style={styles.imagePlaceholder}>
          <span style={styles.typeIcon}>{spaceTypeIcons[space.type]}</span>
        </div>
        <Badge
          variant={statusVariants[space.status]}
          size="sm"
          style={styles.statusBadge}
        >
          {statusLabels[space.status]}
        </Badge>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h3 style={styles.title}>{space.title}</h3>
          <Badge variant="default" size="sm">
            {spaceTypeLabels[space.type]}
          </Badge>
        </div>

        <p style={styles.location}>
          <MapPin size={14} />
          {space.city}
        </p>

        <div style={styles.details}>
          <span style={styles.detail}>
            <Ruler size={14} />
            {space.size_m2} m²
          </span>
          <span style={styles.detail}>
            <Calendar size={14} />
            Min {space.minimum_rental_months} months
          </span>
        </div>

        <div style={styles.footer}>
          <div style={styles.price}>
            <span style={styles.priceAmount}>€{space.total_price}</span>
            <span style={styles.priceLabel}>/month</span>
          </div>
          <span style={styles.pricePerM2}>€{space.price_per_m2}/m²</span>
        </div>

        {showActions && (
          <div style={styles.actions}>
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye size={14} /> View
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              style={{ color: "#ef4444" }}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  imageSection: {
    position: "relative",
  },
  imagePlaceholder: {
    width: "100%",
    height: "140px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  typeIcon: {
    fontSize: "3rem",
  },
  statusBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
  title: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
    lineHeight: 1.3,
  },
  location: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: 0,
  },
  details: {
    display: "flex",
    gap: "1rem",
  },
  detail: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  footer: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: "0.5rem",
  },
  price: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.125rem",
  },
  priceAmount: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#10b981",
  },
  priceLabel: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  pricePerM2: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.75rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #e5e7eb",
  },
};
