"use client";

import {
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  Rocket,
  Sparkles,
  Wand2,
  Mail,
  User,
  Code2,
} from "lucide-react";
import styles from "./HireMeSection.module.css";

const capabilities = [
  {
    icon: User,
    title: "Exceptional access",
    description:
      "Founder-led, senior execution reserved for the highest-impact product work.",
  },
  {
    icon: Code2,
    title: "Hands-on execution",
    description: "Strategy, design, and code — no hand-offs, no layers.",
  },
  {
    icon: Wand2,
    title: "Zero-to-one MVPs (4–6 weeks)",
    description: "Rapid cycles to validate ideas and ship something real.",
  },
  {
    icon: Briefcase,
    title: "Architecture & product leadership",
    description: "Fractional CTO-level support for complex decisions.",
  },
];

export function FounderLedSection() {
  return (
    <section id="founder-led" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>FOUNDER-LED</span>
          <h2 className={styles.title}>Founder-led engagements</h2>
          <p className={styles.subtitle}>
            Limited founder-led engagements for teams that need senior, hands-on
            execution from the founder of Stratos One. Reserved for zero-to-one
            builds, critical architecture, or product leadership at key moments.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.badge}>
                <Sparkles size={16} />
                <span>Founder-led, limited availability</span>
              </div>
              <p className={styles.cardKicker}>
                Exceptional access to the founder who built Stratos One's
                products, working directly on your project.
              </p>
            </div>

            <ul className={styles.list}>
              {capabilities.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className={styles.listItem}>
                    <div className={styles.icon}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      <p className={styles.itemDescription}>
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <p className={styles.sidebarTitle}>Limited founder-led slots</p>
              <p className={styles.sidebarHighlight}>
                Europe-based · CET-friendly · Fast kickoff once scope is aligned
              </p>

              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <Clock size={18} />
                  <div>
                    <strong>Fast kickoffs</strong>
                    <p>Start quickly once we align on scope.</p>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <Calendar size={18} />
                  <div>
                    <strong>Clear sprints</strong>
                    <p>Weekly deliverables and demo checkpoints.</p>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <Briefcase size={18} />
                  <div>
                    <strong>End-to-end</strong>
                    <p>Strategy, design, and code handled directly.</p>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <a href="/founder-led" className={styles.primaryAction}>
                  <Mail size={18} />
                  <span>Request founder-led engagement</span>
                  <ArrowRight size={16} className={styles.actionArrow} />
                </a>
                <a href="/contact" className={styles.secondaryAction}>
                  Start a studio-led project
                </a>
              </div>
            </div>

            <div className={styles.note}>
              Studio-led builds are the default. Founder involvement remains
              throughout to maintain momentum.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Legacy export for backward compatibility
export const HireMeSection = FounderLedSection;
