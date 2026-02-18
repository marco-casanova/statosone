// GET /api/pipeline/admin/orders/[id]/stl-download
// Returns a signed download URL for the STL file (admin only)
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

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Fetch the order
    // @ts-ignore — pipeline_orders table not in generated types yet
    const { data: order, error: orderError } = await supabase
      .from("pipeline_orders")
      .select("stl_storage_key, stl_filename")
      .eq("id", id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.stl_storage_key) {
      return NextResponse.json(
        { error: "No STL file uploaded" },
        { status: 404 },
      );
    }

    // Generate signed download URL (1 hour)
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from("stl-files")
      .createSignedUrl(order.stl_storage_key, 3600);

    if (downloadError || !downloadData?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      downloadUrl: downloadData.signedUrl,
      filename: order.stl_filename,
    });
  } catch (error: any) {
    console.error("STL download error:", error);
    return NextResponse.json(
      { error: error.message || "Download failed" },
      { status: 500 },
    );
  }
}
