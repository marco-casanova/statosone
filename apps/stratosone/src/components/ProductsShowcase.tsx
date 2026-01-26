"use client";

import { useRouter } from "next/navigation";
import {
  Heart,
  Users,
  BookOpen,
  Home,
  Building,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { PRODUCT_LIST } from "@/data/products";
import styles from "./ProductsShowcase.module.css";

const productIcons: Record<string, LucideIcon> = {
  kinrelay: Heart,
  stratostalent: Users,
  dreamnest: BookOpen,
  kellersharer: Building,
  stratoshome: Home,
};

const productColors: Record<string, { primary: string; gradient: string }> = {
  kinrelay: {
    primary: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
  },
  stratostalent: {
    primary: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
  },
  dreamnest: {
    primary: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
  },
  kellersharer: {
    primary: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
  },
  stratoshome: {
    primary: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
  },
};

export function ProductsShowcase() {
  const router = useRouter();
  const products = PRODUCT_LIST;

  return (
    <section id="products" className={styles.section}>
      <div className={styles.container}>
        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.label}>Products</span>
          <h2 className={styles.title}>Products built inside Stratos One</h2>
          <p className={styles.subtitle}>
            These are real products — built, shipped, and operated inside
            Stratos One. Each one is designed, built, and maintained end-to-end
            by the studio.
          </p>
        </div>

        {/* Products grid */}
        <div className={styles.grid}>
          {products.map((product, index) => {
            const slug = product.slug;
            const Icon = productIcons[slug] || Heart;
            const colors = productColors[slug] || productColors.kinrelay;
            const status = product.status;
            const description = product.valueProp || product.description;
            const externalCta =
              status === "Live" ? `Visit ${product.name}` : "Join Waitlist";

            return (
              <div
                key={slug}
                className={styles.card}
                style={
                  {
                    animationDelay: `${index * 0.1}s`,
                    "--card-color": colors.primary,
                    "--card-gradient": colors.gradient,
                  } as React.CSSProperties
                }
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/products/${slug}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/products/${slug}`);
                  }
                }}
              >
                {/* Card background pattern */}
                <div className={styles.cardPattern} />

                {/* Icon */}
                <div className={styles.iconWrapper}>
                  <Icon size={28} strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className={styles.content}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{product.name}</h3>
                    <span className={styles.status}>{status}</span>
                  </div>
                  <p className={styles.cardDescription}>{description}</p>
                  <p className={styles.microCopy}>Built by Stratos One</p>

                  {/* Features */}
                  <div className={styles.features}>
                    <span className={styles.feature}>Studio-built</span>
                    <span className={styles.feature}>Next.js</span>
                    <span className={styles.feature}>Supabase</span>
                  </div>

                  <div className={styles.cardCta}>
                    View details <span className={styles.ctaArrow}>→</span>
                  </div>
                </div>

                <div className={styles.externalButtonRow}>
                  <a
                    href={product.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalButton}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {externalCta} <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom text */}
        <div className={styles.bottomText}>
          <p>
            <a href="/contact" className={styles.inlineLink}>
              Not sure where to start? Let's scope your project →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
