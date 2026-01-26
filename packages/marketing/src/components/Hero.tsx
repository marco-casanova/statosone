import type { ReactNode } from "react";
import Link from "next/link";
import type { HeroConfig } from "../types";

export function Hero({
  title,
  subtitle,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  backgroundImage,
  illustration,
}: HeroConfig) {
  return (
    <section
      style={{
        ...styles.hero,
        ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}),
      }}
    >
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{subtitle}</p>
          <div style={styles.actions}>
            <Link href={ctaHref} style={styles.primaryCta}>
              {ctaText}
            </Link>
            {secondaryCtaText && secondaryCtaHref && (
              <Link href={secondaryCtaHref} style={styles.secondaryCta}>
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
        {illustration && <div style={styles.illustration}>{illustration}</div>}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    padding: "6rem 1.5rem",
    backgroundColor: "#f9fafb",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "4rem",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1.1,
    marginBottom: "1.5rem",
  },
  subtitle: {
    fontSize: "1.25rem",
    color: "#4b5563",
    lineHeight: 1.6,
    marginBottom: "2rem",
    maxWidth: "600px",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap" as const,
  },
  primaryCta: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.875rem 1.75rem",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: "0.5rem",
    textDecoration: "none",
    transition: "background-color 0.2s",
  },
  secondaryCta: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.875rem 1.75rem",
    backgroundColor: "transparent",
    color: "#2563eb",
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: "0.5rem",
    textDecoration: "none",
    border: "2px solid #2563eb",
    transition: "background-color 0.2s",
  },
  illustration: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
};
