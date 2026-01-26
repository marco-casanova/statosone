import { LandingPage, createLandingConfig } from "@stratos/marketing";

const config = createLandingConfig({
  brand: {
    name: "StratosHome",
  },
  navigation: {
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "For Renters", href: "#renters" },
      { label: "For Landlords", href: "#landlords" },
    ],
    ctaText: "Create Profile",
    ctaHref: "/signup",
    loginText: "Log in",
    loginHref: "/login",
  },
  hero: {
    title: "Stop Applying. Start Getting Found.",
    subtitle:
      "The housing market, inverted. Create your profile with preferences, budget, and timeline. Landlords browse and contact you directly. No more endless applications.",
    ctaText: "Create Your Profile",
    ctaHref: "/signup",
    secondaryCtaText: "I'm a Landlord",
    secondaryCtaHref: "/signup?role=landlord",
  },
  features: {
    sectionTitle: "Why StratosHome is Different",
    sectionSubtitle: "We flipped the rental process. You register once, landlords come to you.",
    features: [
      {
        icon: "clock",
        title: "One Profile, Many Offers",
        description:
          "Create your profile once. No more copying the same information into dozens of applications.",
      },
      {
        icon: "users",
        title: "Direct Contact",
        description:
          "Landlords who like your profile reach out directly. Skip the queue.",
      },
      {
        icon: "shield",
        title: "Verified Landlords",
        description:
          "We verify landlords to protect you from scams and ensure legitimate offers.",
      },
    ],
    columns: 3,
  },
  testimonials: {
    sectionTitle: "Success Stories",
    testimonials: [
      {
        quote: "I found my dream apartment in 2 weeks. The landlord contacted me directly after seeing my profile.",
        author: "Sarah M.",
        role: "Renter",
      },
      {
        quote: "As a landlord, I can browse verified tenants and reach out to those who match my property. Much better than sorting through applications.",
        author: "Michael K.",
        role: "Landlord",
      },
    ],
  },
  cta: {
    title: "Ready to Find Your Next Home?",
    subtitle: "Join thousands of renters who found apartments without the application grind.",
    ctaText: "Create Free Profile",
    ctaHref: "/signup",
  },
  footer: {
    companyName: "StratosHome",
    tagline: "Stop applying. Start getting found.",
    linkGroups: [
      {
        title: "For Renters",
        links: [
          { label: "How It Works", href: "#how-it-works" },
          { label: "Create Profile", href: "/signup" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        title: "For Landlords",
        links: [
          { label: "Browse Renters", href: "#landlords" },
          { label: "Pricing", href: "/pricing" },
          { label: "Verification", href: "/verification" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
    ],
  },
});

export default function HomePage() {
  return <LandingPage config={config} />;
}
