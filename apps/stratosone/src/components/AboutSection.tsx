"use client";

import { Target, Users, Lightbulb, Award } from "lucide-react";
import styles from "./AboutSection.module.css";

export function AboutSection() {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left: Story */}
          <div className={styles.story}>
            <span className={styles.label}>About Stratos One</span>
            <h2 className={styles.title}>A product studio that ships</h2>
            <div className={styles.content}>
              <p>
                Stratos One is a product studio focused on building and
                launching digital products. We design, build, and ship real
                products end-to-end — from MVPs to scalable platforms.
              </p>
              <p>
                Our approach is straightforward: understand the problem deeply,
                design for the user, build with modern technology, and ship
                fast. No unnecessary complexity, no bloated features.
              </p>
              <p>
                Products come first. Everything we build is designed to solve
                real problems for real users. Founder involvement is available
                as a capability for teams that need senior hands-on execution.
              </p>
            </div>
          </div>

          {/* Right: Values */}
          <div className={styles.values}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Target size={22} />
              </div>
              <h3 className={styles.valueTitle}>Focus</h3>
              <p className={styles.valueDescription}>
                One problem, one solution. We don't build everything — we build
                what matters.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Lightbulb size={22} />
              </div>
              <h3 className={styles.valueTitle}>Simplicity</h3>
              <p className={styles.valueDescription}>
                Complex problems deserve simple solutions. Less is more.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Users size={22} />
              </div>
              <h3 className={styles.valueTitle}>User-First</h3>
              <p className={styles.valueDescription}>
                Every decision is made with the end user in mind. UX over ego.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Award size={22} />
              </div>
              <h3 className={styles.valueTitle}>Quality</h3>
              <p className={styles.valueDescription}>
                Ship fast, but never compromise on code quality or user
                experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
