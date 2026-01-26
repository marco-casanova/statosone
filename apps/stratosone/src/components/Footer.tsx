"use client";

import { STRATOS_APPS } from "@stratos/config";
import { Github, Linkedin, Twitter, Heart } from "lucide-react";
import styles from "./Footer.module.css";

interface FooterProps {
  twitter?: string;
  linkedin?: string;
  github?: string;
}

export function Footer({
  twitter = "https://twitter.com/stratosone",
  linkedin = "https://linkedin.com/company/stratosone",
  github = "https://github.com/stratosone",
}: FooterProps) {
  const products = Object.entries(STRATOS_APPS).filter(
    ([slug]) => slug !== "stratosone",
  );

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>S1</span>
              <span className={styles.logoText}>Stratos One</span>
            </div>
            <p className={styles.tagline}>
              Stratos One is a product studio that builds and launches digital
              products. We work studio-led by default, with founder-led
              engagement available for critical builds. Marco Casanova is the
              founder of Stratos One.
            </p>
            <div className={styles.socialLinks}>
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Products */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkGroupTitle}>Products</h4>
            <ul className={styles.linkList}>
              {products.map(([slug, app]) => (
                <li key={slug}>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {app.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkGroupTitle}>Services</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="#services" className={styles.link}>
                  MVP Development
                </a>
              </li>
              <li>
                <a href="#services" className={styles.link}>
                  Full-Stack Dev
                </a>
              </li>
              <li>
                <a href="#services" className={styles.link}>
                  UI/UX Design
                </a>
              </li>
              <li>
                <a href="#services" className={styles.link}>
                  Consulting
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkGroupTitle}>Company</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="#about" className={styles.link}>
                  About
                </a>
              </li>
              <li>
                <a href="/founder-led" className={styles.link}>
                  Founder-led
                </a>
              </li>
              <li>
                <a href="#contact" className={styles.link}>
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className={styles.link}>
                  Privacy
                </a>
              </li>
              <li>
                <a href="/terms" className={styles.link}>
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Stratos One. All rights reserved.
          </p>
          <p className={styles.madeWith}>
            Made with <Heart size={14} className={styles.heartIcon} /> in Europe
          </p>
        </div>
      </div>
    </footer>
  );
}
