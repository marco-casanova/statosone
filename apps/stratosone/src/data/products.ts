import { STRATOS_APPS } from "@stratos/config";

export type ProductStatus = "Live" | "In Development" | "Coming Soon";

export interface ProductDetail {
  slug: string;
  name: string;
  description: string;
  valueProp: string;
  status: ProductStatus;
  externalUrl: string;
  waitlistUrl?: string;
  audience: string[];
  capabilities: string[];
  problem: string;
  solution: string;
}

const OVERRIDES: Record<
  string,
  Partial<Omit<ProductDetail, "slug" | "name" | "externalUrl">> & {
    externalUrl?: string;
  }
> = {
  stratostalent: {
    status: "Live",
    externalUrl: "https://stratostalent.com",
    valueProp: "Developer access platform built by Stratos One.",
    problem: "Teams struggle to secure reliable engineers quickly.",
    solution:
      "Curated access to vetted developers with clear onboarding and delivery guardrails.",
    audience: ["Founders", "Engineering Leaders", "Product Teams"],
    capabilities: [
      "Vetted engineering partners",
      "Fast onboarding",
      "Outcome-aligned engagements",
    ],
  },
  kinrelay: {
    status: "In Development",
    valueProp: "Connects patients with families for care and support matching.",
    problem:
      "Families need trusted matches for patient care and support but lack a simple way to find them.",
    solution:
      "A guided matching flow with verified profiles and transparent availability.",
    audience: ["Patients", "Families", "Care Coordinators"],
    capabilities: [
      "Verified profiles",
      "Matching and scheduling",
      "Secure messaging",
    ],
  },
  dreamnest: {
    status: "Coming Soon",
    valueProp: "Netflix-style digital library for parents and kids.",
    problem:
      "Parents struggle to curate safe, engaging content their kids will love.",
    solution:
      "A guided library with age-appropriate content, playlists, and parent controls.",
    audience: ["Parents", "Kids", "Educators"],
    capabilities: [
      "Curated collections",
      "Profiles and parental controls",
      "Cross-device experience",
    ],
  },
  kellersharer: {
    status: "Coming Soon",
    valueProp: "List unused physical spaces for rent.",
    problem:
      "Owners sit on idle space; renters can’t find flexible, verified options.",
    solution:
      "A transparent marketplace for posting, discovering, and booking underused spaces.",
    audience: ["Space Owners", "Short-term Renters", "Local Businesses"],
    capabilities: [
      "Listings and verification",
      "Booking flows",
      "Messaging and availability",
    ],
  },
  stratoshome: {
    status: "Coming Soon",
    valueProp: "Real estate platform with an inverted flow.",
    problem:
      "Home seekers want control and clarity; existing platforms are noisy and seller-first.",
    solution:
      "An inverted flow that prioritizes buyer intent, matching, and transparent timelines.",
    audience: ["Home Seekers", "Agents", "Owners"],
    capabilities: [
      "Buyer-first journey",
      "Matching and alerts",
      "Guided decision tooling",
    ],
  },
};

export const PRODUCT_LIST: ProductDetail[] = Object.entries(STRATOS_APPS)
  .filter(([slug]) => slug !== "stratosone")
  .map(([slug, app]) => {
    const override = OVERRIDES[slug] || {};
    return {
      slug,
      name: app.name,
      description: override.description || app.description,
      valueProp: override.valueProp || app.description,
      status: override.status || "Coming Soon",
      externalUrl: override.externalUrl || app.url,
      waitlistUrl: override.waitlistUrl,
      audience: override.audience || ["Early adopters", "Product teams"],
      capabilities: override.capabilities || [
        "Core product",
        "Auth",
        "Launch support",
      ],
      problem:
        override.problem ||
        "Users lack a focused product that solves this specific problem.",
      solution:
        override.solution ||
        "A streamlined experience built by Stratos One to solve the core need.",
    } satisfies ProductDetail;
  });

export function getProductBySlug(slug: string): ProductDetail | undefined {
  return PRODUCT_LIST.find((product) => product.slug === slug);
}
