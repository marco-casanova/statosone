// @stratos/config - Shared configuration for Stratos apps

/**
 * App configuration type
 */
export interface AppConfig {
  name: string;
  slug: string;
  description: string;
  url: string;
  hasAuth: boolean;
  hasAdmin: boolean;
}

/**
 * All Stratos apps configuration
 */
export const STRATOS_APPS: Record<string, AppConfig> = {
  kinrelay: {
    name: "KinRelay",
    slug: "kinrelay",
    description: "Connect patients with families (care & support matching)",
    url: "https://kinrelay.stratos.one",
    hasAuth: true,
    hasAdmin: true,
  },
  stratostalent: {
    name: "StratosTalent",
    slug: "stratostalent",
    description: "Allow companies to rent developers",
    url: "https://stratostalent.com",
    hasAuth: true,
    hasAdmin: true,
  },
  dreamnest: {
    name: "DreamNest",
    slug: "dreamnest",
    description: "Netflix-style digital library for parents and kids",
    url: "https://dreamnest.stratos.one",
    hasAuth: true,
    hasAdmin: false,
  },
  kellersharer: {
    name: "KellerSharer",
    slug: "kellersharer",
    description: "List unused physical spaces for rent",
    url: "https://kellersharer.stratos.one",
    hasAuth: true,
    hasAdmin: true,
  },
  stratoshome: {
    name: "StratosHome",
    slug: "stratoshome",
    description: "Real estate platform with inverted flow",
    url: "https://home.stratos.one",
    hasAuth: true,
    hasAdmin: true,
  },
  stratosone: {
    name: "StratosOne",
    slug: "stratosone",
    description: "Holding company & product overview",
    url: "https://stratos.one",
    hasAuth: false,
    hasAdmin: false,
  },
};

/**
 * Route patterns used across all apps
 */
export const ROUTE_PATTERNS = {
  landing: "/",
  login: "/login",
  signup: "/signup",
  app: "/app",
  admin: "/admin",
} as const;

/**
 * Default theme colors
 */
export const DEFAULT_THEME = {
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  secondary: "#64748b",
  background: "#ffffff",
  surface: "#f9fafb",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
} as const;
