import { LandingPage, createLandingConfig } from "@stratos/marketing";

const config = createLandingConfig({
  brand: {
    name: "StratosTalent",
  },
  navigation: {
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Developers", href: "#developers" },
      { label: "Pricing", href: "#pricing" },
    ],
    ctaText: "Get Started",
    ctaHref: "/signup",
    loginText: "Log in",
    loginHref: "/login",
  },
  hero: {
    title: "Rent Top Developers, Not Hire Them",
    subtitle:
      "Access a pool of pre-vetted senior developers for your project. No lengthy hiring processes, no long-term commitments. Just great talent when you need it.",
    ctaText: "Find Developers",
    ctaHref: "/signup",
    secondaryCtaText: "I'm a Developer",
    secondaryCtaHref: "/signup?role=developer",
  },
  features: {
    sectionTitle: "Why Companies Choose StratosTalent",
    sectionSubtitle: "We make accessing top talent simple and risk-free.",
    features: [
      {
        icon: "users",
        title: "Pre-Vetted Talent",
        description:
          "Every developer goes through our rigorous screening process. Only the top 5% make it to our platform.",
      },
      {
        icon: "zap",
        title: "Start in Days, Not Months",
        description:
          "Skip the lengthy hiring process. Browse profiles and start working with developers within days.",
      },
      {
        icon: "shield",
        title: "Risk-Free Trial",
        description:
          "Not satisfied? We offer a replacement guarantee within the first two weeks of engagement.",
      },
    ],
    columns: 3,
  },
  pricing: {
    sectionTitle: "Simple, Transparent Pricing",
    sectionSubtitle: "No hidden fees. Pay only for the talent you need.",
    tiers: [
      {
        name: "Part-Time",
        price: "€3,500",
        period: "month",
        description: "20 hours per week of dedicated developer time",
        features: [
          "Senior developer",
          "Direct communication",
          "Weekly reports",
          "Slack integration",
        ],
        ctaText: "Get Started",
        ctaHref: "/signup",
      },
      {
        name: "Full-Time",
        price: "€6,500",
        period: "month",
        description: "40 hours per week of dedicated developer time",
        features: [
          "Senior developer",
          "Direct communication",
          "Daily standups",
          "Priority support",
          "Slack integration",
        ],
        ctaText: "Get Started",
        ctaHref: "/signup",
        highlighted: true,
      },
      {
        name: "Team",
        price: "Custom",
        description: "Multiple developers for larger projects",
        features: [
          "Multiple developers",
          "Dedicated PM",
          "Custom workflow",
          "24/7 support",
          "On-site visits",
        ],
        ctaText: "Contact Us",
        ctaHref: "/contact",
      },
    ],
  },
  cta: {
    title: "Ready to Scale Your Team?",
    subtitle: "Join hundreds of companies already using StratosTalent.",
    ctaText: "Get Started Free",
    ctaHref: "/signup",
  },
  footer: {
    companyName: "StratosTalent",
    tagline: "Rent top developers, not hire them.",
    linkGroups: [
      {
        title: "Product",
        links: [
          { label: "How it works", href: "#how-it-works" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        title: "For Developers",
        links: [
          { label: "Join as Developer", href: "/signup?role=developer" },
          { label: "Requirements", href: "/developers/requirements" },
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
    socialLinks: {
      twitter: "https://twitter.com/stratostalent",
      linkedin: "https://linkedin.com/company/stratostalent",
    },
  },
});

export default function HomePage() {
  return <LandingPage config={config} />;
}
