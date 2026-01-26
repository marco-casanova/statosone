import Link from "next/link";
import type { FooterConfig } from "../types";

export function Footer({
  companyName,
  tagline,
  linkGroups,
  socialLinks,
  copyright,
}: FooterConfig) {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.top}>
          <div style={styles.brand}>
            <div style={styles.companyName}>{companyName}</div>
            {tagline && <p style={styles.tagline}>{tagline}</p>}
          </div>

          <div style={styles.links}>
            {linkGroups.map((group, index) => (
              <div key={index} style={styles.linkGroup}>
                <h4 style={styles.groupTitle}>{group.title}</h4>
                <ul style={styles.linkList}>
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        style={styles.link}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>
            {copyright || `© ${year} ${companyName}. All rights reserved.`}
          </p>

          {socialLinks && (
            <div style={styles.social}>
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialLink}
                >
                  Twitter
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialLink}
                >
                  LinkedIn
                </a>
              )}
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialLink}
                >
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    padding: "4rem 1.5rem 2rem",
    backgroundColor: "#111827",
    color: "#ffffff",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    gap: "4rem",
    marginBottom: "3rem",
    flexWrap: "wrap" as const,
  },
  brand: {
    maxWidth: "300px",
  },
  companyName: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  tagline: {
    fontSize: "0.875rem",
    color: "#9ca3af",
    lineHeight: 1.6,
  },
  links: {
    display: "flex",
    gap: "4rem",
    flexWrap: "wrap" as const,
  },
  linkGroup: {},
  groupTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    marginBottom: "1rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  link: {
    display: "block",
    color: "#9ca3af",
    textDecoration: "none",
    fontSize: "0.875rem",
    marginBottom: "0.5rem",
    transition: "color 0.2s",
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "2rem",
    borderTop: "1px solid #374151",
    flexWrap: "wrap" as const,
    gap: "1rem",
  },
  copyright: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  social: {
    display: "flex",
    gap: "1.5rem",
  },
  socialLink: {
    color: "#9ca3af",
    textDecoration: "none",
    fontSize: "0.875rem",
  },
};
