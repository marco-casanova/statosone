"use client";

import { ArrowRight, Code2, Rocket } from "lucide-react";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.label}>Ready to build?</p>
          <h2 className={styles.title}>Start a Stratos One project today.</h2>
          <p className={styles.subtitle}>
            One studio, two paths: engage Stratos One for studio-led builds, or
            request founder-led engagement when senior hands-on execution is
            required.
          </p>
          <div className={styles.actions}>
            <a href="/contact" className={styles.primary}>
              <Rocket size={18} />
              <span>Start a Stratos One project</span>
              <ArrowRight size={16} className={styles.arrow} />
            </a>
            <a href="/founder-led" className={styles.secondary}>
              <Code2 size={18} />
              <span>Founder-led option</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
