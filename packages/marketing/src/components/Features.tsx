import type { FeaturesConfig } from "../types";
import {
  Heart,
  Shield,
  Zap,
  Users,
  Clock,
  Star,
  Globe,
  Lock,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  shield: Shield,
  zap: Zap,
  users: Users,
  clock: Clock,
  star: Star,
  globe: Globe,
  lock: Lock,
  sparkles: Sparkles,
};

export function Features({
  sectionTitle,
  sectionSubtitle,
  features,
  columns = 3,
}: FeaturesConfig) {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{sectionTitle}</h2>
          {sectionSubtitle && <p style={styles.subtitle}>{sectionSubtitle}</p>}
        </div>

        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
          }}
        >
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon.toLowerCase()] || Sparkles;
            return (
              <div key={index} style={styles.card}>
                <div style={styles.iconWrapper}>
                  <IconComponent size={24} color="#2563eb" />
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding: "6rem 1.5rem",
    backgroundColor: "#ffffff",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "4rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1.125rem",
    color: "#6b7280",
    maxWidth: "600px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gap: "2rem",
  },
  card: {
    padding: "2rem",
    backgroundColor: "#f9fafb",
    borderRadius: "1rem",
    textAlign: "center" as const,
  },
  iconWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3rem",
    height: "3rem",
    backgroundColor: "#eff6ff",
    borderRadius: "0.75rem",
    marginBottom: "1rem",
  },
  featureTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "0.5rem",
  },
  featureDescription: {
    fontSize: "0.875rem",
    color: "#6b7280",
    lineHeight: 1.6,
  },
};
