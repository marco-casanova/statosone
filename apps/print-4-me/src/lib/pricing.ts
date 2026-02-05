import type { Material, Quality } from "@/types/database";

// Base prices in cents (EUR)
const MATERIAL_BASE_PRICE: Record<Material, number> = {
  PLA: 1500, // €15 base
  PETG: 2000, // €20 base
  RESIN: 3500, // €35 base
};

const QUALITY_MULTIPLIER: Record<Quality, number> = {
  draft: 0.8,
  standard: 1.0,
  fine: 1.5,
};

const SHIPPING_COST_CENTS = 499; // €4.99 flat rate

export interface PriceBreakdown {
  basePriceCents: number;
  materialPriceCents: number;
  qualityMultiplier: number;
  qualityAddonCents: number;
  subtotalCents: number;
  quantityPriceCents: number;
  quantityTotal: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
}

export function calculatePrice(
  material: Material,
  quality: Quality,
  quantity: number,
  fileSizeBytes?: number,
): PriceBreakdown {
  // Base price from material
  const basePriceCents = MATERIAL_BASE_PRICE[material];

  // Add size factor if file size is provided (rough estimate)
  // Each MB adds about €2
  const sizeFactor = fileSizeBytes
    ? Math.ceil(fileSizeBytes / (1024 * 1024)) * 200
    : 0;

  const materialPriceCents = basePriceCents + sizeFactor;
  const qualityMultiplier = QUALITY_MULTIPLIER[quality];

  // Per-item price after quality adjustment
  const subtotalCents = Math.round(materialPriceCents * qualityMultiplier);

  // Total for all items
  const quantityTotal = subtotalCents * quantity;

  // Add shipping
  const totalCents = quantityTotal + SHIPPING_COST_CENTS;

  return {
    basePriceCents,
    materialPriceCents,
    qualityMultiplier,
    qualityAddonCents: subtotalCents - materialPriceCents,
    subtotalCents,
    quantityPriceCents: quantityTotal - subtotalCents,
    quantityTotal,
    shippingCents: SHIPPING_COST_CENTS,
    totalCents,
    currency: "EUR",
  };
}

export function formatPrice(cents: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export const MATERIALS: {
  value: Material;
  label: string;
  description: string;
}[] = [
  {
    value: "PLA",
    label: "PLA",
    description: "Best for prototypes, biodegradable",
  },
  {
    value: "PETG",
    label: "PETG",
    description: "Strong, heat-resistant, food-safe",
  },
  {
    value: "RESIN",
    label: "Resin",
    description: "Highest detail, smooth finish",
  },
];

export const QUALITIES: {
  value: Quality;
  label: string;
  description: string;
  layerHeight: string;
}[] = [
  {
    value: "draft",
    label: "Draft",
    description: "Fast print, visible layers",
    layerHeight: "0.3mm",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Good balance",
    layerHeight: "0.2mm",
  },
  {
    value: "fine",
    label: "Fine",
    description: "High detail, slower",
    layerHeight: "0.1mm",
  },
];
