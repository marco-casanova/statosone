import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { CareCategory, ApiResponse } from "@/types/kinrelay";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("id");
  const includeSubcategories =
    searchParams.get("include_subcategories") === "true";

  try {
    if (categoryId) {
      // Get single category
      let query = supabase.from("kr_care_categories").select("*");

      if (includeSubcategories) {
        query = supabase.from("kr_care_categories").select(`
            *,
            subcategories:kr_care_subcategories(*)
          `);
      }

      const { data, error } = await query
        .eq("id", categoryId)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      return NextResponse.json<ApiResponse<any>>({
        success: true,
        data,
      });
    } else {
      // Get all categories
      let query = supabase.from("kr_care_categories").select("*");

      if (includeSubcategories) {
        query = supabase.from("kr_care_categories").select(`
            *,
            subcategories:kr_care_subcategories(*)
          `);
      }

      const { data, error } = await query
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;

      return NextResponse.json<ApiResponse<CareCategory[]>>({
        success: true,
        data: data || [],
      });
    }
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch care categories",
        },
      },
      { status: 500 }
    );
  }
}
