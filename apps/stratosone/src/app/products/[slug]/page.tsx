import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { getProductBySlug, PRODUCT_LIST } from "@/data/products";
import styles from "./product-detail.module.css";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PRODUCT_LIST.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
    return null;
  }

  const primaryCtaLabel =
    product.status === "Live" ? `Visit ${product.name}` : "Join Waitlist";
  const primaryCtaHref = product.externalUrl;

  return (
    <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.badge}>Built by Stratos One</p>
            <div className={styles.heroHeader}>
              <div>
                <h1 className={styles.title}>{product.name}</h1>
                <p className={styles.value}>{product.valueProp}</p>
              </div>
              <span className={styles.status}>{product.status}</span>
            </div>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.heroActions}>
              <a
                href={primaryCtaHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryCta}
              >
                {primaryCtaLabel}
                <ExternalLink size={16} />
              </a>
              <Link href="/contact" className={styles.secondaryCta}>
                Start a Studio Build
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.container}>
            <div className={styles.columns}>
              <div className={styles.column}>
                <h2 className={styles.sectionTitle}>Problem</h2>
                <p className={styles.body}>{product.problem}</p>
              </div>
              <div className={styles.column}>
                <h2 className={styles.sectionTitle}>Solution</h2>
                <p className={styles.body}>{product.solution}</p>
              </div>
            </div>

            <div className={styles.columns}>
              <div className={styles.column}>
                <h3 className={styles.subTitle}>Who it's for</h3>
                <ul className={styles.list}>
                  {product.audience.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.column}>
                <h3 className={styles.subTitle}>Key capabilities</h3>
                <ul className={styles.list}>
                  {product.capabilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.builtSection}>
          <div className={styles.container}>
            <div className={styles.builtCard}>
              <div className={styles.builtHeader}>
                <ShieldCheck size={20} />
                <p className={styles.builtLabel}>Built by Stratos One</p>
              </div>
              <h3 className={styles.builtTitle}>
                Studio-built products with clear ownership
              </h3>
              <p className={styles.body}>
                Every product listed here is designed, engineered, and launched
                by Stratos One. Need your own product built? Engage the studio,
                with founder-led engagement available for senior, hands-on
                execution when it's the right fit.
              </p>
              <div className={styles.builtActions}>
                <Link href="/contact" className={styles.primaryCta}>
                  Start a Stratos One project
                  <ArrowRight size={16} />
                </Link>
                <Link href="/founder-led" className={styles.secondaryCtaAlt}>
                  Explore founder-led engagement
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
