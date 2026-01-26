"use client";

import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import styles from "./ServicesSection.module.css";

export function ServicesSection() {
  return (
    <section id="services" className={styles.section}>
      <div className={styles.container}>
        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.label}>What Stratos One Is</span>
          <h2 className={styles.title}>Stratos One is a product studio.</h2>
          <p className={styles.subtitle}>
            We design, build, and ship digital products end-to-end. Every product
            in our portfolio is crafted inside the Stratos One studio — focused on
            one problem, built for scale, and launched fast.
          </p>
        </div>

        {/* Services grid */}
        <div className={styles.grid}>
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className={styles.card}>
                <div
                  className={styles.iconWrapper}
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <Icon size={24} color={service.color} />
                </div>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>
                <ul className={styles.highlights}>
                  {service.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className={styles.highlight}
                      style={{ color: service.color }}
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <a href="/services" className={styles.ctaButton}>
            <span>See all services</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
