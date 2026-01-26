import { ArrowRight, CalendarRange, Flag, Target } from "lucide-react";
import styles from "./pricing.module.css";

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.label}>Pricing Philosophy</p>
          <h1 className={styles.title}>Outcomes over hours.</h1>
          <p className={styles.subtitle}>
            Milestone-based delivery, clear ownership, and scoped commitments.
            No hourly surprises—just aligned incentives to ship.
          </p>
          <div className={styles.actions}>
            <a href="/contact" className={styles.primaryCta}>
              Start a Stratos One project
              <ArrowRight size={16} />
            </a>
            <a href="https://cal.com/" className={styles.secondaryCta}>
              Schedule a Call
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.icon}>
                <Target size={18} />
              </div>
              <h3 className={styles.cardTitle}>Milestone-based</h3>
              <p className={styles.cardText}>
                Work is structured around milestones with clear outcomes,
                acceptance criteria, and demos.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>
                <Flag size={18} />
              </div>
              <h3 className={styles.cardTitle}>What affects pricing</h3>
              <p className={styles.cardText}>
                Scope clarity, integrations, team size, and timelines. We’ll
                co-define the minimal, valuable version before kickoff.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>
                <CalendarRange size={18} />
              </div>
              <h3 className={styles.cardTitle}>Who it’s for / not for</h3>
              <p className={styles.cardText}>
                For founders and teams ready to ship. Not a fit for endless
                discovery loops or unmanaged scope creep.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to scope your build?</h2>
            <p className={styles.ctaSubtitle}>
              Tell us about your product, and we’ll propose milestones and
              ownership next steps.
            </p>
            <div className={styles.actions}>
              <a href="/contact" className={styles.primaryCta}>
                Start a Stratos One project
                <ArrowRight size={16} />
              </a>
              <a href="https://cal.com/" className={styles.secondaryCta}>
                Schedule a Call
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
