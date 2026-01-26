"use client";

import { ArrowRight, Sparkles, Code2, Rocket } from "lucide-react";
import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  name?: string;
  title?: string;
  subtitle?: string;
  highlight?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export function HeroSection({
  name = "Stratos One",
  title = "We build and launch digital products — from MVPs to scalable platforms.",
  subtitle = "Stratos One is a product studio designing, building, and shipping real products end-to-end. Engage the studio for full builds, or work directly with the founder when senior hands-on execution is required.",
  highlight = "Product studio led by the founder",
  primaryCtaLabel = "Start a Stratos One project",
  primaryCtaHref = "/contact",
  secondaryCtaLabel = "Explore founder-led engagement",
  secondaryCtaHref = "/founder-led",
}: HeroSectionProps) {
  return (
    <section className={styles.hero}>
      {/* Animated background */}
      <div className={styles.backgroundGradient} />
      <div className={styles.backgroundOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      <div className={styles.container}>
        {/* Announcement badge */}
        <div className={styles.badge}>
          <Sparkles size={14} className={styles.badgeIcon} />
          <span>{highlight}</span>
        </div>

        {/* Main heading */}
        <h1 className={styles.title}>
          <span className={styles.brandName}>{name}</span>
          <span className={styles.titleText}>{title}</span>
        </h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>{subtitle}</p>

        {/* CTA buttons */}
        <div className={styles.ctaGroup}>
          <a href={primaryCtaHref} className={styles.primaryCta}>
            <Code2 size={18} />
            <span>{primaryCtaLabel}</span>
            <ArrowRight size={16} className={styles.ctaArrow} />
          </a>
          <a href={secondaryCtaHref} className={styles.secondaryCta}>
            <Rocket size={18} />
            <span>{secondaryCtaLabel}</span>
          </a>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>5+</span>
            <span className={styles.statLabel}>Products Shipped</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>Europe</span>
            <span className={styles.statLabel}>Based</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>Next.js</span>
            <span className={styles.statLabel}>React / Supabase</span>
          </div>
        </div>
      </div>
    </section>
  );
}
