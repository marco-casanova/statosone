import type { LandingPageConfig } from "../types";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Helper to create a landing page config with defaults
 * Apps use this to configure their landing pages
 */
export function createLandingConfig(
  config: DeepPartial<LandingPageConfig> & {
    brand: LandingPageConfig["brand"];
    navigation: LandingPageConfig["navigation"];
    hero: LandingPageConfig["hero"];
    footer: LandingPageConfig["footer"];
  }
): LandingPageConfig {
  return {
    brand: config.brand,
    navigation: {
      links: config.navigation.links || [],
      ctaText: config.navigation.ctaText || "Get Started",
      ctaHref: config.navigation.ctaHref || "/signup",
      loginText: config.navigation.loginText || "Log in",
      loginHref: config.navigation.loginHref || "/login",
    },
    hero: {
      title: config.hero.title || "Welcome",
      subtitle: config.hero.subtitle || "",
      ctaText: config.hero.ctaText || "Get Started",
      ctaHref: config.hero.ctaHref || "/signup",
      secondaryCtaText: config.hero.secondaryCtaText,
      secondaryCtaHref: config.hero.secondaryCtaHref,
      backgroundImage: config.hero.backgroundImage,
      illustration: config.hero.illustration,
    },
    features: config.features as LandingPageConfig["features"],
    testimonials: config.testimonials as LandingPageConfig["testimonials"],
    pricing: config.pricing as LandingPageConfig["pricing"],
    cta: config.cta as LandingPageConfig["cta"],
    footer: {
      companyName: config.footer.companyName || config.brand.name,
      tagline: config.footer.tagline,
      linkGroups: config.footer.linkGroups || [],
      socialLinks: config.footer.socialLinks,
      copyright: config.footer.copyright,
    },
  };
}
