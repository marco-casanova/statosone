import Link from "next/link";
import type { CTAConfig } from "../types";

export function CTA({ title, subtitle, ctaText, ctaHref }: CTAConfig) {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>{title}</h2>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        <Link href={ctaHref} style={styles.cta}>
          {ctaText}
        </Link>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding: "6rem 1.5rem",
    backgroundColor: "#2563eb",
    color: "#ffffff",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center" as const,
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1.125rem",
    opacity: 0.9,
    marginBottom: "2rem",
  },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#ffffff",
    color: "#2563eb",
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: "0.5rem",
    textDecoration: "none",
    transition: "transform 0.2s",
  },
};
