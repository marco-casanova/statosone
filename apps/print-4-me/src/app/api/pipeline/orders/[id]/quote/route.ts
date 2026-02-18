// POST /api/pipeline/orders/[id]/quote
// Estimates print (via slicer or heuristic), computes quote, sets status QUOTED
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  buildPricingConstants,
  computeQuote,
  estimateFromFileSize,
} from "@/lib/pipeline-pricing";
import type { MaterialProfile, PrinterProfile } from "@/types/pipeline";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from("pipeline_orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "NEW") {
      return NextResponse.json(
        { error: `Cannot quote order in ${order.status} status` },
        { status: 400 },
      );
    }

    // Validate STL exists in storage
    if (!order.stl_storage_key) {
      return NextResponse.json(
        { error: "STL file not uploaded yet" },
        { status: 400 },
      );
    }

    // Try to get file metadata to check it exists
    const { data: fileList } = await supabase.storage
      .from("stl-files")
      .list(order.stl_storage_key.split("/").slice(0, -1).join("/"), {
        search: order.stl_storage_key.split("/").pop(),
      });

    const fileExists = fileList && fileList.length > 0;
    const fileSizeBytes = fileExists
      ? (fileList[0] as any).metadata?.size ||
        order.stl_file_size_bytes ||
        1024 * 1024
      : order.stl_file_size_bytes || 1024 * 1024;

    // Estimate using file-size heuristic (no slicer service needed)
    const slicerEstimate = estimateFromFileSize(
      fileSizeBytes,
      order.layer_height,
      order.infill_percent,
    );

    // Load printer & material profiles for pricing
    let printerProfile: PrinterProfile | null = null;
    let materialProfile: MaterialProfile | null = null;

    if (order.printer_profile_id) {
      const { data } = await supabase
        .from("printer_profiles")
        .select("*")
        .eq("id", order.printer_profile_id)
        .single();
      printerProfile = data;
    }

    if (order.material_profile_id) {
      const { data } = await supabase
        .from("material_profiles")
        .select("*")
        .eq("id", order.material_profile_id)
        .single();
      materialProfile = data;
    }

    // Build pricing constants from profiles
    const pricingConstants = buildPricingConstants(
      materialProfile,
      printerProfile,
    );

    // Compute the quote
    const breakdown = computeQuote(
      slicerEstimate,
      pricingConstants,
      order.quantity,
    );

    // Update the order with quote data
    const { error: updateError } = await supabase
      .from("pipeline_orders")
      .update({
        status: "QUOTED",
        slicer_estimate_json: slicerEstimate,
        quote_breakdown_json: breakdown,
        pricing_constants_json: pricingConstants,
        quote_total_cents: breakdown.grand_total_cents,
        stl_file_size_bytes: fileSizeBytes,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Quote update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save quote" },
        { status: 500 },
      );
    }

    // Log the event
    await supabase.from("order_events").insert({
      order_id: id,
      from_status: "NEW",
      to_status: "QUOTED",
      message: `Quote generated: €${breakdown.grand_total_eur.toFixed(2)} (${breakdown.grams_used}g, ${Math.round(breakdown.print_time_hours * 60)}min)`,
      actor_user_id: user.id,
    });

    return NextResponse.json({
      success: true,
      quote: breakdown,
      slicer_estimate: slicerEstimate,
      pricing_constants: pricingConstants,
      total_cents: breakdown.grand_total_cents,
    });
  } catch (error: any) {
    console.error("Quote error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate quote" },
      { status: 500 },
    );
  }
}
