"use client";

import { useState } from "react";
import Script from "next/script";
import {
  Mail,
  MessageCircle,
  Calendar,
  Github,
  Linkedin,
  Twitter,
  Send,
  Clock,
  MapPin,
  FileText,
} from "lucide-react";
import styles from "./ContactSection.module.css";
import { ProjectBriefModal } from "./ProjectBriefModal";

interface ContactSectionProps {
  email?: string;
  calendlyUrl?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  location?: string;
  timezone?: string;
}

declare global {
  interface Window {
    Calendly: any;
  }
}

export function ContactSection({
  email = "hello@stratos.one",
  calendlyUrl = "https://calendly.com/m-casanova-dev/it-consultation",
  twitter = "https://twitter.com/stratosone",
  linkedin = "https://linkedin.com/company/stratosone",
  github = "https://github.com/stratosone",
  location = "Europe",
  timezone = "CET (GMT+1)",
}: ContactSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCalendly = () => {
    if (typeof window !== "undefined" && window.Calendly) {
      window.Calendly.initPopupWidget({ url: calendlyUrl });
    }
  };

  return (
    <section id="contact" className={styles.section}>
      <link
        href="https://assets.calendly.com/assets/external/widget.css"
        rel="stylesheet"
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />

      <ProjectBriefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpenCalendly={openCalendly}
      />

      <div className={styles.container}>
        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.label}>Get in Touch</span>
          <h2 className={styles.title}>Start a Stratos One project</h2>
          <p className={styles.subtitle}>
            Bring your product idea to the Stratos One studio. We'll align on
            your roadmap, scope the milestones, and ship the next release
            together. Studio-led by default · Founder-led when needed.
          </p>
        </div>

        {/* Contact grid */}
        <div className={styles.grid}>
          {/* Left: Contact options */}
          <div className={styles.contactOptions}>
            {/* Project Brief */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.contactCard}
            >
              <div className={styles.cardIcon}>
                <FileText size={24} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Describe your project</h3>
                <p className={styles.cardValue}>Get a scoped estimate</p>
                <p className={styles.cardDescription}>
                  Share your vision and get realistic cost & timeline
                </p>
              </div>
            </button>

            {/* Schedule a call - Calendly Popup */}
            <button onClick={openCalendly} className={styles.contactCard}>
              <div className={styles.cardIcon}>
                <Calendar size={24} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Schedule a Call</h3>
                <p className={styles.cardValue}>30-min discovery call</p>
                <p className={styles.cardDescription}>
                  Free consultation to scope your build
                </p>
              </div>
            </button>

            {/* Quick chat */}
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactCard}
            >
              <div className={styles.cardIcon}>
                <MessageCircle size={24} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Quick Chat</h3>
                <p className={styles.cardValue}>DM on Twitter/X</p>
                <p className={styles.cardDescription}>
                  For quick questions before kickoff
                </p>
              </div>
            </a>
          </div>

          {/* Right: Info panel */}
          <div className={styles.infoPanel}>
            <div className={styles.infoPanelContent}>
              <h3 className={styles.infoPanelTitle}>
                Working with Stratos One
              </h3>

              <div className={styles.infoItems}>
                <div className={styles.infoItem}>
                  <Clock size={18} />
                  <div>
                    <strong>Response Time</strong>
                    <p>Usually within 24 hours</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <MapPin size={18} />
                  <div>
                    <strong>{location}</strong>
                    <p>{timezone}</p>
                  </div>
                </div>
              </div>

              <div className={styles.availability}>
                <span className={styles.availabilityDot} />
                <span>Currently accepting new projects</span>
              </div>

              {/* Social links */}
              <div className={styles.socialLinks}>
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
