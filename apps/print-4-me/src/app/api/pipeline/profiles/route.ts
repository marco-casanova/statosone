// GET /api/pipeline/profiles
// Returns available printer and material profiles for the order form
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

    const [printers, materials] = await Promise.all([
      supabase
        .from("printer_profiles")
        .select("*")
        .eq("active", true)
        .order("name"),
      supabase
        .from("material_profiles")
        .select("*")
        .eq("active", true)
        .order("name"),
    ]);

    return NextResponse.json({
      printers: printers.data || [],
      materials: materials.data || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
