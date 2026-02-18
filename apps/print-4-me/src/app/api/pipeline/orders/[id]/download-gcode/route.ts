// GET /api/pipeline/orders/[id]/download-gcode
// Returns a signed URL to download the G-code file
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
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

    // Check if user is admin or owns the order
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    // Fetch order
    let query = supabase.from("pipeline_orders").select("*").eq("id", id);

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data: order, error: orderError } = await query.single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Must be READY_TO_PRINT or later
    const downloadableStatuses = [
      "READY_TO_PRINT",
      "PRINTING",
      "PRINT_DONE",
      "WAITING_DELIVERY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    if (!downloadableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: "G-code not yet available" },
        { status: 400 },
      );
    }

    if (!order.gcode_storage_key) {
      return NextResponse.json(
        { error: "G-code file not found" },
        { status: 404 },
      );
    }

    // Generate short-lived signed URL (15 minutes)
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from("gcode-files")
      .createSignedUrl(order.gcode_storage_key, 900);

    if (urlError || !signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrl.signedUrl,
      filename: `${order.stl_filename?.replace(".stl", "") || order.id}.gcode`,
    });
  } catch (error: any) {
    console.error("G-code download error:", error);
    return NextResponse.json(
      { error: error.message || "Download failed" },
      { status: 500 },
    );
  }
}
