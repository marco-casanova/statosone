import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import styles from "./services.module.css";

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.label}>Services</p>
          <h1 className={styles.title}>
            Studio services to build and launch products.
          </h1>
          <p className={styles.subtitle}>
            Engage Stratos One for studio-led end-to-end delivery, or request
            founder-led engagement when you need senior hands-on execution.
          </p>
          <div className={styles.actions}>
            <a href="/contact" className={styles.primaryCta}>
              Start a Stratos One project
              <ArrowRight size={16} />
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
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className={styles.card}>
                  <div
                    className={styles.iconWrapper}
                    style={{ backgroundColor: `${service.color}20` }}
                  >
                    <Icon size={22} color={service.color} />
                  </div>
                  <p className={styles.badge}>Built by Stratos One</p>
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardDescription}>
                    {service.description}
                  </p>
                  <div className={styles.highlights}>
                    {service.highlights.map((item) => (
                      <span
                        key={item}
                        className={styles.highlight}
                        style={{ color: service.color }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
