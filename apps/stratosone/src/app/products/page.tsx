import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import { PRODUCT_LIST } from "@/data/products";
import styles from "./products.module.css";

export default function ProductsPage() {
  return (
    <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.label}>Products</p>
            <h1 className={styles.title}>Products built inside Stratos One</h1>
            <p className={styles.subtitle}>
              These are real products — built, shipped, and operated inside
              Stratos One. View details or head to the product to try it.
            </p>
            <div className={styles.heroActions}>
              <a href="/contact" className={styles.primaryCta}>
                Start a Stratos One project
                <ArrowRight size={16} className={styles.ctaArrow} />
              </a>
              <a href="/founder-led" className={styles.secondaryCta}>
                Founder-led option
              </a>
            </div>
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {PRODUCT_LIST.map((product) => {
                const isLive = product.status === "Live";
                const externalCta = isLive ? "Visit Product" : "Join Waitlist";
                return (
                  <article key={product.slug} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div>
                        <p className={styles.badge}>Built by Stratos One</p>
                        <h2 className={styles.cardTitle}>{product.name}</h2>
                        <p className={styles.cardSubtitle}>
                          {product.valueProp}
                        </p>
                      </div>
                      <span className={styles.status}>{product.status}</span>
                    </div>

                    <p className={styles.description}>{product.description}</p>

                    <div className={styles.meta}>
                      {product.capabilities.slice(0, 3).map((capability) => (
                        <span key={capability} className={styles.metaChip}>
                          {capability}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className={styles.viewDetails}
                    >
                      View details →
                    </Link>

                    <div className={styles.actions}>
                      <a
                        href={product.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.externalCta}
                      >
                        {externalCta} <ExternalLink size={16} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
  );
}
