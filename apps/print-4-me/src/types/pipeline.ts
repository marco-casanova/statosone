// ============================================================
// Pipeline types – STL → Slice → Quote → Pay → G-code workflow
// ============================================================

// ---- Order Status Lifecycle ----
export const ORDER_STATUSES = [
  "NEW",
  "QUOTED",
  "PAID",
  "SLICING",
  "READY_TO_PRINT",
  "PRINTING",
  "PRINT_DONE",
  "WAITING_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "REFUNDED",
] as const;

export type PipelineOrderStatus = (typeof ORDER_STATUSES)[number];

// Allowed forward transitions (source → targets[])
export const STATUS_TRANSITIONS: Record<
  PipelineOrderStatus,
  PipelineOrderStatus[]
> = {
  NEW: ["QUOTED"],
  QUOTED: ["PAID"],
  PAID: ["SLICING", "REFUNDED"],
  SLICING: ["READY_TO_PRINT", "FAILED"],
  READY_TO_PRINT: ["PRINTING", "FAILED"],
  PRINTING: ["PRINT_DONE", "FAILED"],
  PRINT_DONE: ["WAITING_DELIVERY", "FAILED"],
  WAITING_DELIVERY: ["OUT_FOR_DELIVERY", "FAILED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  DELIVERED: ["FAILED"],
  FAILED: [],
  REFUNDED: [],
};

/** Check if a transition is valid */
export function isValidTransition(
  from: PipelineOrderStatus,
  to: PipelineOrderStatus,
): boolean {
  // Any status can go to FAILED
  if (to === "FAILED") return true;
  // PAID can refund (admin only)
  if (from === "PAID" && to === "REFUNDED") return true;
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// ---- Status display helpers ----
export const STATUS_LABELS: Record<PipelineOrderStatus, string> = {
  NEW: "New",
  QUOTED: "Quoted",
  PAID: "Paid",
  SLICING: "Slicing",
  READY_TO_PRINT: "Ready to Print",
  PRINTING: "Printing",
  PRINT_DONE: "Print Done",
  WAITING_DELIVERY: "Waiting Delivery",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const STATUS_COLORS: Record<PipelineOrderStatus, string> = {
  NEW: "bg-gray-500",
  QUOTED: "bg-blue-500",
  PAID: "bg-indigo-600",
  SLICING: "bg-yellow-500",
  READY_TO_PRINT: "bg-orange-500",
  PRINTING: "bg-amber-600",
  PRINT_DONE: "bg-lime-600",
  WAITING_DELIVERY: "bg-cyan-600",
  OUT_FOR_DELIVERY: "bg-teal-600",
  DELIVERED: "bg-green-600",
  FAILED: "bg-red-600",
  REFUNDED: "bg-rose-500",
};

// ---- DB row types ----
export interface PrinterProfile {
  id: string;
  name: string;
  description: string | null;
  prusa_ini_storage_key: string | null;
  machine_eur_per_hour: number;
  avg_kw: number;
  build_volume_x_mm: number;
  build_volume_y_mm: number;
  build_volume_z_mm: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialProfile {
  id: string;
  name: string;
  description: string | null;
  color: string;
  filament_eur_per_kg: number;
  filament_ini_storage_key: string | null;
  waste_multiplier: number;
  density_g_per_cm3: number;
  nozzle_temp_c: number;
  bed_temp_c: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineOrder {
  id: string;
  user_id: string;
  status: PipelineOrderStatus;
  printer_profile_id: string | null;
  material_profile_id: string | null;
  layer_height: number;
  infill_percent: number;
  supports: boolean;
  notes: string | null;
  quantity: number;
  quote_currency: string;
  quote_total_cents: number | null;
  quote_breakdown_json: QuoteBreakdown | null;
  slicer_estimate_json: SlicerEstimate | null;
  pricing_constants_json: PricingConstants | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  stl_storage_key: string | null;
  stl_filename: string | null;
  stl_file_size_bytes: number | null;
  gcode_storage_key: string | null;
  gcode_ready_at: string | null;
  shipping_address: import("./database").ShippingAddress | null;
  tracking_number: string | null;
  label_url: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  from_status: PipelineOrderStatus | null;
  to_status: PipelineOrderStatus;
  message: string | null;
  actor_user_id: string | null;
  created_at: string;
}

// ---- Slicer estimate (output from PrusaSlicer) ----
export interface SlicerEstimate {
  grams_used: number;
  print_time_seconds: number;
  layers: number | null;
  filament_length_mm: number | null;
}

// ---- Pricing constants snapshot ----
export interface PricingConstants {
  filament_eur_per_kg: number;
  filament_eur_per_g: number;
  energy_eur_per_kwh: number;
  printer_avg_kw: number;
  machine_eur_per_hour: number;
  overhead_fixed_eur: number;
  risk_multiplier: number;
  profit_multiplier: number;
  material_waste_multiplier: number;
}

// ---- Quote breakdown (stored with each order) ----
export interface QuoteBreakdown {
  grams_used: number;
  print_time_seconds: number;
  print_time_hours: number;
  material_cost_eur: number;
  machine_cost_eur: number;
  energy_cost_eur: number;
  overhead_eur: number;
  subtotal_eur: number;
  risk_fee_eur: number;
  profit_fee_eur: number;
  total_eur: number;
  total_cents: number;
  quantity: number;
  per_unit_total_eur: number;
  grand_total_eur: number;
  grand_total_cents: number;
}

// ---- Joined types for UI ----
export type PipelineOrderWithDetails = PipelineOrder & {
  printer_profile?: PrinterProfile | null;
  material_profile?: MaterialProfile | null;
  profile?: import("./database").Profile | null;
  events?: OrderEvent[];
};
