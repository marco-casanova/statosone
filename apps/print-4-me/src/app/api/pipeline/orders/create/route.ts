// POST /api/pipeline/orders/create
// Accepts print settings, creates order in NEW status, returns signed upload URL for STL
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const {
      printer_profile_id,
      material_profile_id,
      layer_height = 0.2,
      infill_percent = 20,
      supports = false,
      notes,
      quantity = 1,
      stl_filename,
    } = body;

    if (!stl_filename) {
      return NextResponse.json(
        { error: "STL filename is required" },
        { status: 400 },
      );
    }

    // Validate file extension
    if (!stl_filename.toLowerCase().endsWith(".stl")) {
      return NextResponse.json(
        { error: "Only .stl files accepted" },
        { status: 400 },
      );
    }

    // Create unique storage path
    const timestamp = Date.now();
    const safeName = stl_filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const stl_storage_key = `${user.id}/${timestamp}_${safeName}`;

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("pipeline_orders")
      .insert({
        user_id: user.id,
        status: "NEW",
        printer_profile_id: printer_profile_id || null,
        material_profile_id: material_profile_id || null,
        layer_height,
        infill_percent,
        supports,
        notes: notes || null,
        quantity,
        stl_filename,
        stl_storage_key,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    // Log the creation event
    await supabase.from("order_events").insert({
      order_id: order.id,
      from_status: null,
      to_status: "NEW",
      message: "Order created",
      actor_user_id: user.id,
    });

    // Generate signed upload URL for STL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("stl-files")
      .createSignedUploadUrl(stl_storage_key);

    if (uploadError) {
      console.error("Upload URL error:", uploadError);
      // Order was created but upload URL failed — still return the order
      return NextResponse.json({
        success: true,
        order,
        uploadUrl: null,
        warning: "Upload URL generation failed. Upload manually.",
      });
    }

    return NextResponse.json({
      success: true,
      order,
      uploadUrl: uploadData.signedUrl,
      uploadToken: uploadData.token,
      storagePath: stl_storage_key,
    });
  } catch (error: any) {
    console.error("Pipeline order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 },
    );
  }
}
