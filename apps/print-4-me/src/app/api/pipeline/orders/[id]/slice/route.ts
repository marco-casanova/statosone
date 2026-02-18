// @ts-nocheck
// POST /api/pipeline/orders/[id]/slice
// Protected endpoint — called by webhook or worker after payment
// Downloads STL, calls slicer service, uploads G-code, updates order
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify internal call via shared secret
    const authHeader = request.headers.get("authorization");
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (internalSecret && authHeader !== `Bearer ${internalSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("pipeline_orders")
      .select(
        "*, printer_profile:printer_profiles(*), material_profile:material_profiles(*)",
      )
      .eq("id", id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json(
        {
          error: `Cannot slice order in ${order.status} status. Must be PAID.`,
        },
        { status: 400 },
      );
    }

    // Set status to SLICING
    await supabase
      .from("pipeline_orders")
      .update({ status: "SLICING" })
      .eq("id", id);

    await supabase.from("order_events").insert({
      order_id: id,
      from_status: "PAID",
      to_status: "SLICING",
      message: "Slicing started",
    });

    try {
      // Get signed URL for STL download
      const { data: stlUrl } = await supabase.storage
        .from("stl-files")
        .createSignedUrl(order.stl_storage_key!, 3600);

      if (!stlUrl?.signedUrl) {
        throw new Error("Failed to get STL download URL");
      }

      // Call the slicer service
      const slicerUrl = process.env.SLICER_SERVICE_URL;
      if (!slicerUrl) {
        throw new Error("SLICER_SERVICE_URL not configured");
      }

      const slicerResponse = await fetch(`${slicerUrl}/slice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stl_url: stlUrl.signedUrl,
          order_id: id,
          layer_height: order.layer_height,
          infill_percent: order.infill_percent,
          supports: order.supports,
          printer_ini:
            (order as any).printer_profile?.prusa_ini_storage_key || null,
          filament_ini:
            (order as any).material_profile?.filament_ini_storage_key || null,
        }),
      });

      if (!slicerResponse.ok) {
        const err = await slicerResponse.text();
        throw new Error(`Slicer service error: ${err}`);
      }

      const sliceResult = await slicerResponse.json();

      // The slicer service should return:
      // { gcode_url, grams_used, print_time_seconds, gcode_storage_key }

      // If slicer returns gcode as a buffer/URL, upload to storage
      let gcodeKey = sliceResult.gcode_storage_key;
      if (!gcodeKey && sliceResult.gcode_url) {
        // Download gcode from slicer and upload to our storage
        const gcodeResponse = await fetch(sliceResult.gcode_url);
        const gcodeBuffer = Buffer.from(await gcodeResponse.arrayBuffer());
        gcodeKey = `${order.user_id}/${id}.gcode`;

        const { error: uploadError } = await supabase.storage
          .from("gcode-files")
          .upload(gcodeKey, gcodeBuffer, {
            contentType: "application/octet-stream",
          });

        if (uploadError) {
          throw new Error(`G-code upload failed: ${uploadError.message}`);
        }
      }

      // Update order to READY_TO_PRINT
      const now = new Date().toISOString();
      await supabase
        .from("pipeline_orders")
        .update({
          status: "READY_TO_PRINT",
          gcode_storage_key: gcodeKey,
          gcode_ready_at: now,
          slicer_estimate_json:
            sliceResult.estimate || order.slicer_estimate_json,
        })
        .eq("id", id);

      await supabase.from("order_events").insert({
        order_id: id,
        from_status: "SLICING",
        to_status: "READY_TO_PRINT",
        message: "G-code generated successfully",
      });

      // Optionally send email notification
      // await sendReadyEmail(order, gcodeKey);

      return NextResponse.json({
        success: true,
        status: "READY_TO_PRINT",
        gcode_storage_key: gcodeKey,
      });
    } catch (sliceError: any) {
      // Mark order as FAILED
      await supabase
        .from("pipeline_orders")
        .update({
          status: "FAILED",
          failure_reason: sliceError.message,
        })
        .eq("id", id);

      await supabase.from("order_events").insert({
        order_id: id,
        from_status: "SLICING",
        to_status: "FAILED",
        message: `Slicing failed: ${sliceError.message}`,
      });

      return NextResponse.json(
        { error: `Slicing failed: ${sliceError.message}` },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Slice endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Slicing failed" },
      { status: 500 },
    );
  }
}
