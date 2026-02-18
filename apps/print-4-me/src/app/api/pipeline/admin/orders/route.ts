// GET /api/pipeline/admin/orders — list all orders (admin only)
// PATCH /api/pipeline/admin/orders — not used at list level
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

    // Verify admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Use service role to bypass RLS
    let query = supabase
      .from("pipeline_orders")
      .select(
        `
        *,
        printer_profile:printer_profiles(*),
        material_profile:material_profiles(*),
        profile:profiles(*)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Admin orders fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 },
      );
    }

    // Client-side search filtering (email, filename, order id)
    let filtered = orders || [];
    if (q) {
      const search = q.toLowerCase();
      filtered = filtered.filter(
        (o: any) =>
          o.id.toLowerCase().includes(search) ||
          o.stl_filename?.toLowerCase().includes(search) ||
          o.profile?.email?.toLowerCase().includes(search) ||
          o.profile?.full_name?.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({
      orders: filtered,
      total: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
