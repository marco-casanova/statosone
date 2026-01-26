import { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  Rocket,
  User,
  Briefcase,
  Wand2,
} from "lucide-react";
import { AboutSection } from "@/components/AboutSection";
import styles from "./founder-led.module.css";

export const metadata: Metadata = {
  title: "Founder-led Engagements",
  description:
    "Direct, hands-on work with the founder of Stratos One. Limited availability for zero-to-one MVPs, critical architecture, and product leadership.",
};

const offerings = [
  {
    title: "Zero-to-one MVPs",
    description:
      "Ship a working product in 4–6 weeks with Next.js, React, and Supabase.",
  },
  {
    title: "Architecture & acceleration",
    description:
      "Strengthen your stack, improve UX, and ship faster on an existing product.",
  },
  {
    title: "Fractional product leadership",
    description:
      "CTO-level guidance, code reviews, and technical direction for early teams.",
  },
];

const process = [
  {
    title: "Align",
    description: "Scope the problem, audience, and success metrics.",
  },
  {
    title: "Build",
    description: "Weekly sprints with demos and transparent delivery.",
  },
  {
    title: "Launch",
    description: "Ship, measure, and iterate with a stable handoff.",
  },
];

export default function FounderLedPage() {
  const schedulingUrl = "https://cal.com/";

  return (
    <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.label}>FOUNDER-LED</p>
            <h1 className={styles.title}>Founder-led engagements</h1>
            <p className={styles.subtitle}>
              For teams that need senior, hands-on execution directly from the
              founder of Stratos One. These engagements are limited and reserved
              for zero-to-one builds, critical architecture, or product
              leadership at key moments.
            </p>
            <div className={styles.actions}>
              <a href="/contact" className={styles.primaryCta}>
                Request a founder-led engagement
                <ArrowRight size={16} />
              </a>
              <a
                href={schedulingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryCta}
              >
                Schedule a Call
              </a>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {offerings.map((item) => (
                <div key={item.title} className={styles.card}>
                  <div className={styles.icon}>
                    <Code2 size={18} />
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardText}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.processHeader}>
              <p className={styles.labelAlt}>Process</p>
              <h2 className={styles.subTitle}>How we work together</h2>
              <p className={styles.subtitle}>
                Clear steps, weekly visibility, and direct access. No layers.
              </p>
            </div>
            <div className={styles.processGrid}>
              {process.map((step, index) => (
                <div key={step.title} className={styles.processCard}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.cardText}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AboutSection />

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.availability}>
              <div className={styles.availabilityHeader}>
                <Clock size={18} />
                <span>Limited founder-led slots</span>
              </div>
              <h3 className={styles.subTitle}>
                Europe-based · CET-friendly · Fast kickoff once scope is aligned
              </h3>
              <p className={styles.cardText}>
                Weekly sprints, demos, and code shipped directly by the founder.
                You get senior execution, not a hand-off.
              </p>
              <ul className={styles.list}>
                <li>
                  <CheckCircle2 size={16} /> Zero-to-one MVPs and acceleration
                </li>
                <li>
                  <CheckCircle2 size={16} /> Fractional product leadership for
                  early teams
                </li>
                <li>
                  <CheckCircle2 size={16} /> Direct, async-friendly
                  collaboration
                </li>
              </ul>
              <div className={styles.actions}>
                <a href="/contact" className={styles.primaryCta}>
                  Request a founder-led engagement
                  <Rocket size={16} />
                </a>
                <a href="/contact" className={styles.secondaryCta}>
                  Start a studio-led project
                </a>
              </div>
              <p className={styles.note}>
                Studio-led builds are the default. Founder involvement remains
                throughout to maintain momentum.
              </p>
            </div>
          </div>
        </section>
      </main>
  );
}
