// GET  /api/pipeline/admin/orders/[id]    — admin order detail
// PATCH /api/pipeline/admin/orders/[id]   — admin status update
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isValidTransition } from "@/types/pipeline";
import type { PipelineOrderStatus } from "@/types/pipeline";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch order with relations
    const { data: order, error: orderError } = await supabase
      .from("pipeline_orders")
      .select(
        `
        *,
        printer_profile:printer_profiles(*),
        material_profile:material_profiles(*),
        profile:profiles(*)
      `,
      )
      .eq("id", id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch events
    const { data: events } = await supabase
      .from("order_events")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      order,
      events: events || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { to_status, message, failure_reason, tracking_number, label_url } =
      body;

    if (!to_status) {
      return NextResponse.json(
        { error: "to_status is required" },
        { status: 400 },
      );
    }

    // Fetch current order
    const { data: order, error: orderError } = await supabase
      .from("pipeline_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const fromStatus = order.status as PipelineOrderStatus;
    const toStatus = to_status as PipelineOrderStatus;

    // Validate transition
    if (!isValidTransition(fromStatus, toStatus)) {
      return NextResponse.json(
        { error: `Invalid transition: ${fromStatus} → ${toStatus}` },
        { status: 400 },
      );
    }

    // Build update payload
    const updatePayload: Record<string, any> = { status: toStatus };

    if (toStatus === "FAILED" && failure_reason) {
      updatePayload.failure_reason = failure_reason;
    }
    if (tracking_number) {
      updatePayload.tracking_number = tracking_number;
    }
    if (label_url) {
      updatePayload.label_url = label_url;
    }

    // Update order
    const { error: updateError } = await supabase
      .from("pipeline_orders")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 },
      );
    }

    // Log event
    await supabase.from("order_events").insert({
      order_id: id,
      from_status: fromStatus,
      to_status: toStatus,
      message: message || `Status changed to ${toStatus}`,
      actor_user_id: user.id,
    });

    return NextResponse.json({ success: true, status: toStatus });
  } catch (error: any) {
    console.error("Admin status update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
