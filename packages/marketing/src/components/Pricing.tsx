import Link from "next/link";
import { Check } from "lucide-react";
import type { PricingConfig } from "../types";

export function Pricing({
  sectionTitle,
  sectionSubtitle,
  tiers,
}: PricingConfig) {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{sectionTitle}</h2>
          {sectionSubtitle && <p style={styles.subtitle}>{sectionSubtitle}</p>}
        </div>

        <div style={styles.grid}>
          {tiers.map((tier, index) => (
            <div
              key={index}
              style={{
                ...styles.card,
                ...(tier.highlighted ? styles.highlighted : {}),
              }}
            >
              <h3 style={styles.tierName}>{tier.name}</h3>
              <div style={styles.priceWrapper}>
                <span style={styles.price}>{tier.price}</span>
                {tier.period && (
                  <span style={styles.period}>/{tier.period}</span>
                )}
              </div>
              <p style={styles.description}>{tier.description}</p>

              <ul style={styles.features}>
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} style={styles.featureItem}>
                    <Check size={16} color="#10b981" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                style={{
                  ...styles.cta,
                  ...(tier.highlighted ? styles.ctaHighlighted : {}),
                }}
              >
                {tier.ctaText}
              </Link>
            </div>
          ))}
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
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "2rem",
    alignItems: "stretch",
  },
  card: {
    padding: "2rem",
    backgroundColor: "#f9fafb",
    borderRadius: "1rem",
    display: "flex",
    flexDirection: "column" as const,
  },
  highlighted: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    transform: "scale(1.05)",
  },
  tierName: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "1rem",
  },
  priceWrapper: {
    marginBottom: "1rem",
  },
  price: {
    fontSize: "3rem",
    fontWeight: 700,
  },
  period: {
    fontSize: "1rem",
    opacity: 0.7,
  },
  description: {
    fontSize: "0.875rem",
    opacity: 0.8,
    marginBottom: "1.5rem",
  },
  features: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 2rem 0",
    flex: 1,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
    fontSize: "0.875rem",
  },
  cta: {
    display: "block",
    textAlign: "center" as const,
    padding: "0.875rem 1.5rem",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderRadius: "0.5rem",
    textDecoration: "none",
    fontWeight: 600,
    transition: "background-color 0.2s",
  },
  ctaHighlighted: {
    backgroundColor: "#ffffff",
    color: "#2563eb",
  },
};
