import { LandingPage, createLandingConfig } from "@stratos/marketing";

const config = createLandingConfig({
  brand: {
    name: "KellerSharer",
  },
  navigation: {
    links: [
      { label: "Browse Spaces", href: "#spaces" },
      { label: "List Your Space", href: "#list" },
      { label: "How It Works", href: "#how-it-works" },
    ],
    ctaText: "Get Started",
    ctaHref: "/signup",
    loginText: "Log in",
    loginHref: "/login",
  },
  hero: {
    title: "Your Unused Space, Someone's Solution",
    subtitle:
      "Turn your empty basement, garage, or storage room into extra income. Connect with people looking for affordable storage and workspace solutions in your neighborhood.",
    ctaText: "List Your Space",
    ctaHref: "/signup?intent=list",
    secondaryCtaText: "Find a Space",
    secondaryCtaHref: "/signup?intent=rent",
  },
  features: {
    sectionTitle: "How KellerSharer Works",
    sectionSubtitle: "Simple, secure, and local.",
    features: [
      {
        icon: "home",
        title: "List Your Space",
        description:
          "Create a listing in minutes. Add photos, set your price, and describe your space.",
      },
      {
        icon: "users",
        title: "Connect Locally",
        description:
          "Browse spaces in your area or let renters find you. Direct messaging makes it easy.",
      },
      {
        icon: "shield",
        title: "Secure Transactions",
        description:
          "All payments are handled securely through our platform. Peace of mind for everyone.",
      },
    ],
    columns: 3,
  },
  testimonials: {
    sectionTitle: "What Our Users Say",
    testimonials: [
      {
        quote: "I turned my empty basement into €200/month extra income. The process was incredibly simple.",
        author: "Maria S.",
        role: "Space Owner",
      },
      {
        quote: "Found affordable storage for my business just two blocks from my office. Perfect!",
        author: "Thomas K.",
        role: "Renter",
      },
    ],
  },
  cta: {
    title: "Start Sharing Today",
    subtitle: "Join thousands of users already earning or saving with KellerSharer.",
    ctaText: "Create Free Account",
    ctaHref: "/signup",
  },
  footer: {
    companyName: "KellerSharer",
    tagline: "Your unused space, someone's solution.",
    linkGroups: [
      {
        title: "Product",
        links: [
          { label: "Browse Spaces", href: "#spaces" },
          { label: "List Your Space", href: "#list" },
          { label: "How It Works", href: "#how-it-works" },
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
