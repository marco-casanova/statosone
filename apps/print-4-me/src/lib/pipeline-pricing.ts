// ============================================================
// Slicer-based pricing engine
// Computes quote from PrusaSlicer estimates (grams + time)
// Filament cost: 6kg / €59 = €9.83/kg = €0.00983/g
// ============================================================

import type {
  PricingConstants,
  QuoteBreakdown,
  SlicerEstimate,
  MaterialProfile,
  PrinterProfile,
} from "@/types/pipeline";

// ---- Default pricing constants ----
export const DEFAULT_PRICING: PricingConstants = {
  filament_eur_per_kg: 9.83,
  filament_eur_per_g: 0.00983,
  energy_eur_per_kwh: 0.35, // Germany average
  printer_avg_kw: 0.12, // Ender-class during PLA
  machine_eur_per_hour: 4.0,
  overhead_fixed_eur: 1.5,
  risk_multiplier: 0.1, // 10%
  profit_multiplier: 0.2, // 20%
  material_waste_multiplier: 0.15, // 15% for supports/purge
};

/**
 * Build a PricingConstants snapshot from profiles + defaults.
 * This is stored with the order so the quote is immutable.
 */
export function buildPricingConstants(
  materialProfile?: MaterialProfile | null,
  printerProfile?: PrinterProfile | null,
  overrides?: Partial<PricingConstants>,
): PricingConstants {
  const filament_eur_per_kg =
    materialProfile?.filament_eur_per_kg ?? DEFAULT_PRICING.filament_eur_per_kg;
  return {
    ...DEFAULT_PRICING,
    filament_eur_per_kg,
    filament_eur_per_g: filament_eur_per_kg / 1000,
    material_waste_multiplier:
      materialProfile?.waste_multiplier ??
      DEFAULT_PRICING.material_waste_multiplier,
    printer_avg_kw: printerProfile?.avg_kw ?? DEFAULT_PRICING.printer_avg_kw,
    machine_eur_per_hour:
      printerProfile?.machine_eur_per_hour ??
      DEFAULT_PRICING.machine_eur_per_hour,
    ...overrides,
  };
}

/**
 * Compute a full price quote from slicer estimate + pricing constants.
 *
 * Formula:
 *   material_cost = grams_used × (1 + waste) × eur_per_g
 *   hours         = print_time_seconds / 3600
 *   machine_cost  = hours × machine_eur_per_hour
 *   energy_cost   = hours × printer_avg_kw × energy_eur_per_kwh
 *   subtotal      = material + machine + energy + overhead
 *   risk_fee      = subtotal × risk_multiplier
 *   profit_fee    = subtotal × profit_multiplier
 *   total         = subtotal + risk_fee + profit_fee
 */
export function computeQuote(
  estimate: SlicerEstimate,
  constants: PricingConstants,
  quantity: number = 1,
): QuoteBreakdown {
  const { grams_used, print_time_seconds } = estimate;

  const material_cost_eur =
    grams_used *
    (1 + constants.material_waste_multiplier) *
    constants.filament_eur_per_g;

  const hours = print_time_seconds / 3600;

  const machine_cost_eur = hours * constants.machine_eur_per_hour;

  const energy_cost_eur =
    hours * constants.printer_avg_kw * constants.energy_eur_per_kwh;

  const subtotal_eur =
    material_cost_eur +
    machine_cost_eur +
    energy_cost_eur +
    constants.overhead_fixed_eur;

  const risk_fee_eur = subtotal_eur * constants.risk_multiplier;
  const profit_fee_eur = subtotal_eur * constants.profit_multiplier;

  const total_eur = roundTo2(subtotal_eur + risk_fee_eur + profit_fee_eur);
  const total_cents = Math.round(total_eur * 100);

  const grand_total_eur = roundTo2(total_eur * quantity);
  const grand_total_cents = Math.round(grand_total_eur * 100);

  return {
    grams_used,
    print_time_seconds,
    print_time_hours: roundTo2(hours),
    material_cost_eur: roundTo2(material_cost_eur),
    machine_cost_eur: roundTo2(machine_cost_eur),
    energy_cost_eur: roundTo2(energy_cost_eur),
    overhead_eur: roundTo2(constants.overhead_fixed_eur),
    subtotal_eur: roundTo2(subtotal_eur),
    risk_fee_eur: roundTo2(risk_fee_eur),
    profit_fee_eur: roundTo2(profit_fee_eur),
    total_eur,
    total_cents,
    quantity,
    per_unit_total_eur: total_eur,
    grand_total_eur,
    grand_total_cents,
  };
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Simple volume-based estimate when slicer is not available.
 * Uses STL file size as a rough proxy for volume.
 * Returns a conservative estimate for quoting purposes.
 */
export function estimateFromFileSize(
  fileSizeBytes: number,
  layerHeight: number = 0.2,
  infillPercent: number = 20,
): SlicerEstimate {
  // Very rough heuristic: 1 MB STL ≈ 30g printed at 20% infill
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  const infillFactor = infillPercent / 20; // normalize to 20% baseline
  const layerFactor = 0.2 / layerHeight; // finer layers = more time

  const grams_used = Math.max(5, fileSizeMB * 30 * infillFactor);
  // Rough: 1g ≈ 3 min print time at 0.2mm
  const print_time_seconds = Math.round(grams_used * 180 * layerFactor);

  return {
    grams_used: roundTo2(grams_used),
    print_time_seconds,
    layers: null,
    filament_length_mm: null,
  };
}

/** Format EUR price for display */
export function formatEur(eur: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(eur);
}

/** Format cents to EUR display */
export function formatCents(cents: number): string {
  return formatEur(cents / 100);
}

/** Format seconds to human-readable duration */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
