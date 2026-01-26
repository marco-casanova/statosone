import type { ReactNode } from "react";

/**
 * Navigation link configuration
 */
export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

/**
 * Hero section configuration
 */
export interface HeroConfig {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  illustration?: ReactNode;
}

/**
 * Feature item configuration
 */
export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

/**
 * Features section configuration
 */
export interface FeaturesConfig {
  sectionTitle: string;
  sectionSubtitle?: string;
  features: FeatureItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Testimonial configuration
 */
export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
}

/**
 * Testimonials section configuration
 */
export interface TestimonialsConfig {
  sectionTitle: string;
  testimonials: TestimonialItem[];
}

/**
 * Pricing tier configuration
 */
export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  highlighted?: boolean;
}

/**
 * Pricing section configuration
 */
export interface PricingConfig {
  sectionTitle: string;
  sectionSubtitle?: string;
  tiers: PricingTier[];
}

/**
 * CTA section configuration
 */
export interface CTAConfig {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaHref: string;
}

/**
 * Footer link group
 */
export interface FooterLinkGroup {
  title: string;
  links: NavLink[];
}

/**
 * Footer configuration
 */
export interface FooterConfig {
  companyName: string;
  tagline?: string;
  linkGroups: FooterLinkGroup[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  copyright?: string;
}

/**
 * Complete landing page configuration
 */
export interface LandingPageConfig {
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
  hero: HeroConfig;
  features?: FeaturesConfig;
  testimonials?: TestimonialsConfig;
  pricing?: PricingConfig;
  cta?: CTAConfig;
  footer: FooterConfig;
}

/**
 * Theme configuration for landing pages
 */
export interface LandingTheme {
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  borderRadius?: string;
}
