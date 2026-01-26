import Link from "next/link";

export default function HomePage() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logo}>🌙 DreamNest</h1>
        <nav style={styles.nav}>
          <a href="#library" style={styles.navLink}>
            Library
          </a>
          <a href="#parents" style={styles.navLink}>
            For Parents
          </a>
          <a href="#pricing" style={styles.navLink}>
            Pricing
          </a>
          <Link href="/login" style={styles.navLink}>
            Log in
          </Link>
          <Link href="/signup" style={styles.ctaButton}>
            Start Free Trial
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h2 style={styles.heroTitle}>A Magical Library for Little Dreamers</h2>
        <p style={styles.heroSubtitle}>
          Discover a world of interactive digital books with beautiful
          illustrations, engaging stories, and soothing narration. Perfect for
          bedtime stories or quiet reading time.
        </p>
        <div style={styles.heroButtons}>
          <Link href="/signup" style={styles.primaryButton}>
            Start Free Trial
          </Link>
          <a href="#library" style={styles.secondaryButton}>
            Browse Library
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="parents" style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Parents Love DreamNest</h2>
        <p style={styles.sectionSubtitle}>
          Creating magical reading moments for families everywhere.
        </p>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>✨</span>
            <h3 style={styles.featureTitle}>Interactive Stories</h3>
            <p style={styles.featureDesc}>
              Beautiful digital books with text, images, and video that bring
              stories to life.
            </p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>💜</span>
            <h3 style={styles.featureTitle}>Auto Narration</h3>
            <p style={styles.featureDesc}>
              Soothing voice narration helps kids follow along and improves
              reading skills.
            </p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>🛡️</span>
            <h3 style={styles.featureTitle}>Safe &amp; Ad-Free</h3>
            <p style={styles.featureDesc}>
              A safe environment with no ads, no in-app purchases, and curated
              content.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={styles.pricing}>
        <h2 style={styles.sectionTitle}>Simple Pricing</h2>
        <p style={styles.sectionSubtitle}>
          Unlimited access to our entire library.
        </p>
        <div style={styles.pricingGrid}>
          <div style={styles.pricingCard}>
            <h3 style={styles.pricingName}>Monthly</h3>
            <div style={styles.price}>
              €4.99<span style={styles.period}>/month</span>
            </div>
            <p style={styles.pricingDesc}>Perfect for trying DreamNest</p>
            <ul style={styles.pricingFeatures}>
              <li>Unlimited books</li>
              <li>Auto narration</li>
              <li>Offline reading</li>
              <li>2 kid profiles</li>
            </ul>
            <Link href="/signup" style={styles.pricingCta}>
              Start Free Trial
            </Link>
          </div>
          <div style={{ ...styles.pricingCard, ...styles.pricingHighlighted }}>
            <h3 style={styles.pricingName}>Yearly</h3>
            <div style={styles.price}>
              €39.99<span style={styles.period}>/year</span>
            </div>
            <p style={styles.pricingDesc}>Best value — save 33%</p>
            <ul style={styles.pricingFeatures}>
              <li>Unlimited books</li>
              <li>Auto narration</li>
              <li>Offline reading</li>
              <li>5 kid profiles</li>
              <li>New releases first</li>
            </ul>
            <Link
              href="/signup"
              style={{ ...styles.pricingCta, ...styles.pricingCtaHighlighted }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Start Reading Tonight</h2>
        <p style={styles.ctaSubtitle}>
          7-day free trial. No credit card required.
        </p>
        <Link href="/signup" style={styles.primaryButton}>
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} DreamNest. A magical library for little
          dreamers.
        </p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    backgroundColor: "#fef3c7",
    borderBottom: "1px solid #fcd34d",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#92400e",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  navLink: {
    color: "#78350f",
    textDecoration: "none",
    fontSize: "0.875rem",
  },
  ctaButton: {
    backgroundColor: "#7c3aed",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  hero: {
    backgroundColor: "#fefce8",
    padding: "6rem 2rem",
    textAlign: "center" as const,
  },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: 800,
    color: "#92400e",
    marginBottom: "1.5rem",
    lineHeight: 1.1,
  },
  heroSubtitle: {
    fontSize: "1.25rem",
    color: "#78350f",
    maxWidth: "600px",
    margin: "0 auto 2rem",
  },
  heroButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#7c3aed",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1rem",
  },
  secondaryButton: {
    backgroundColor: "white",
    color: "#7c3aed",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1rem",
    border: "2px solid #7c3aed",
  },
  features: {
    padding: "5rem 2rem",
    backgroundColor: "white",
    textAlign: "center" as const,
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "0.5rem",
  },
  sectionSubtitle: {
    fontSize: "1rem",
    color: "#6b7280",
    marginBottom: "3rem",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
  },
  featureCard: {
    padding: "1.5rem",
  },
  featureIcon: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: "1rem",
  },
  featureTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#1f2937",
  },
  featureDesc: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  pricing: {
    padding: "5rem 2rem",
    backgroundColor: "#f9fafb",
    textAlign: "center" as const,
  },
  pricingGrid: {
    display: "flex",
    gap: "2rem",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  pricingCard: {
    backgroundColor: "white",
    borderRadius: "1rem",
    padding: "2rem",
    width: "280px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    textAlign: "left" as const,
  },
  pricingHighlighted: {
    border: "2px solid #7c3aed",
  },
  pricingName: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  price: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  period: {
    fontSize: "1rem",
    fontWeight: 400,
    color: "#6b7280",
  },
  pricingDesc: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "1.5rem",
  },
  pricingFeatures: {
    listStyle: "none",
    padding: 0,
    marginBottom: "1.5rem",
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  pricingCta: {
    display: "block",
    textAlign: "center" as const,
    padding: "0.75rem",
    backgroundColor: "#f3f4f6",
    color: "#1f2937",
    borderRadius: "0.5rem",
    textDecoration: "none",
    fontWeight: 500,
  },
  pricingCtaHighlighted: {
    backgroundColor: "#7c3aed",
    color: "white",
  },
  cta: {
    padding: "5rem 2rem",
    backgroundColor: "#fefce8",
    textAlign: "center" as const,
  },
  ctaTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#92400e",
    marginBottom: "0.5rem",
  },
  ctaSubtitle: {
    fontSize: "1rem",
    color: "#78350f",
    marginBottom: "1.5rem",
  },
  footer: {
    padding: "2rem",
    backgroundColor: "#1f2937",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#9ca3af",
    fontSize: "0.875rem",
  },
};
