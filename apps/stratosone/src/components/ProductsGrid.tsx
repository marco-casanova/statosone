import { STRATOS_APPS } from "@stratos/config";
import {
  Heart,
  Users,
  BookOpen,
  Home,
  Building,
  type LucideIcon,
} from "lucide-react";

const productIcons: Record<string, LucideIcon> = {
  kinrelay: Heart,
  stratostalent: Users,
  dreamnest: BookOpen,
  kellersharer: Building,
  stratoshome: Home,
};

const productColors: Record<string, string> = {
  kinrelay: "#ec4899",
  stratostalent: "#8b5cf6",
  dreamnest: "#f59e0b",
  kellersharer: "#10b981",
  stratoshome: "#3b82f6",
};

export function ProductsGrid() {
  // Filter out stratosone (this app) from the products
  const products = Object.entries(STRATOS_APPS).filter(
    ([slug]) => slug !== "stratosone"
  );

  return (
    <div style={styles.grid}>
      {products.map(([slug, app]) => {
        const Icon = productIcons[slug] || Heart;
        const color = productColors[slug] || "#2563eb";

        return (
          <a
            key={slug}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.card}
          >
            <div
              style={{
                ...styles.iconWrapper,
                backgroundColor: `${color}15`,
              }}
            >
              <Icon size={28} color={color} />
            </div>
            <h3 style={styles.name}>{app.name}</h3>
            <p style={styles.description}>{app.description}</p>
            <span style={{ ...styles.badge, color }}>
              {app.hasAuth ? "Platform" : "Website"}
            </span>
          </a>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    padding: "2rem",
    backgroundColor: "#f9fafb",
    borderRadius: "1rem",
    textDecoration: "none",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  iconWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3.5rem",
    height: "3.5rem",
    borderRadius: "0.75rem",
    marginBottom: "1.25rem",
  },
  name: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "0.5rem",
  },
  description: {
    fontSize: "0.875rem",
    color: "#6b7280",
    lineHeight: 1.6,
    flex: 1,
    marginBottom: "1rem",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: 500,
  },
};
