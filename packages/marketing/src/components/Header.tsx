import type { ReactNode } from "react";
import Link from "next/link";
import type { NavLink } from "../types";

interface HeaderProps {
  brand: {
    name: string;
    logo?: string;
    logoComponent?: ReactNode;
  };
  navigation: {
    links: NavLink[];
    ctaText: string;
    ctaHref: string;
    loginText?: string;
    loginHref?: string;
  };
}

export function Header({ brand, navigation }: HeaderProps) {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link href="/" style={styles.brand}>
          {brand.logoComponent || (
            brand.logo ? (
              <img src={brand.logo} alt={brand.name} style={styles.logo} />
            ) : (
              <span style={styles.brandName}>{brand.name}</span>
            )
          )}
        </Link>

        <nav style={styles.nav}>
          {navigation.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={styles.navLink}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={styles.actions}>
          {navigation.loginText && navigation.loginHref && (
            <Link href={navigation.loginHref} style={styles.loginLink}>
              {navigation.loginText}
            </Link>
          )}
          <Link href={navigation.ctaHref} style={styles.ctaButton}>
            {navigation.ctaText}
          </Link>
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid #e5e7eb",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    textDecoration: "none",
    color: "inherit",
  },
  brandName: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111827",
  },
  logo: {
    height: "2rem",
    width: "auto",
  },
  nav: {
    display: "flex",
    gap: "2rem",
  },
  navLink: {
    textDecoration: "none",
    color: "#4b5563",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "color 0.2s",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  loginLink: {
    textDecoration: "none",
    color: "#4b5563",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "0.5rem",
    textDecoration: "none",
    transition: "background-color 0.2s",
  },
};
