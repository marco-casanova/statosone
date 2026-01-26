"use client";

import { useState, FormEvent } from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";
import styles from "./contact.module.css";

const intents = [
  { value: "studio", label: "Studio-led project (default)" },
  { value: "founder", label: "Founder-led engagement (limited)" },
];

export default function ContactPage() {
  const [intent, setIntent] = useState("studio");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [timeline, setTimeline] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject =
      intent === "studio" ? "Start a Studio Build" : "Hire Marco Availability";
    const body = `Intent: ${intent === "studio" ? "Studio build" : "Hire Marco"}\nName: ${name}\nEmail: ${email}\nTimeline: ${timeline}\nProject: ${project}`;
    window.location.href = `mailto:hello@stratos.one?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.label}>Contact</p>
          <h1 className={styles.title}>Start a Stratos One project.</h1>
          <p className={styles.subtitle}>
            Select studio-led (default) or founder-led engagement. We'll respond
            within 24 hours.
          </p>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.container}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Project type</label>
              <div className={styles.radioGroup}>
                {intents.map((option) => (
                  <label key={option.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="intent"
                      value={option.value}
                      checked={intent === option.value}
                      onChange={(e) => setIntent(e.target.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Timeline</label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g., Kickoff in 2 weeks"
              />
            </div>

            <div className={styles.field}>
              <label>Project details</label>
              <textarea
                required
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="What are we building? What outcome do you need?"
              />
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.primaryCta}>
                {intent === "studio"
                  ? "Start a Stratos One project"
                  : "Request founder-led engagement"}
                <ArrowRight size={16} />
              </button>
              <a href="/founder-led" className={styles.secondaryCta}>
                Learn about founder-led engagements
              </a>
            </div>
          </form>

          <div className={styles.contactCards}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <Mail size={18} />
              </div>
              <p className={styles.cardTitle}>Email</p>
              <a href="mailto:hello@stratos.one" className={styles.cardLink}>
                hello@stratos.one
              </a>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <Phone size={18} />
              </div>
              <p className={styles.cardTitle}>Schedule</p>
              <a href="https://cal.com/" className={styles.cardLink}>
                Book a call →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
