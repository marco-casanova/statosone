import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import {
  Profile,
  SearchFilters,
  SearchResult,
  ApiResponse,
} from "@/types/kinrelay";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { message: "Unauthorized" },
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      role,
      specialization,
      languages,
      minRating,
      maxHourlyRate,
      location,
      page = 1,
      pageSize = 20,
    }: SearchFilters & { page?: number; pageSize?: number } = body;

    // Get current user's role
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Build query based on the user's role
    let query = supabase
      .from("kr_caregiver_profiles")
      .select("*, user:profiles!user_id(*)", { count: "exact" });

    // If family member, search for specialists/caregivers
    if (currentProfile?.role === "family") {
      query = query.in("role", ["specialist", "nurse", "caregiver"]);
      query = query.eq("is_available_for_hire", true);
      query = query.eq("status", "active");
    }
    // If specialist/caregiver, search for families needing care
    else if (
      ["specialist", "nurse", "caregiver"].includes(currentProfile?.role || "")
    ) {
      query = query.eq("role", "family");
      query = query.eq("status", "active");
      // Note: Families would need to have a flag indicating they're looking for care
      // This might require additional logic or fields
    }

    // Apply filters
    if (role) {
      query = query.eq("role", role);
    }

    if (specialization) {
      query = query.ilike("specialization", `%${specialization}%`);
    }

    if (languages && languages.length > 0) {
      query = query.overlaps("languages", languages);
    }

    if (minRating !== undefined) {
      query = query.gte("rating", minRating);
    }

    if (maxHourlyRate !== undefined) {
      query = query.lte("hourly_rate", maxHourlyRate);
    }

    if (location?.city) {
      query = query.ilike("city", `%${location.city}%`);
    }

    if (location?.state) {
      query = query.eq("state", location.state);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by rating
    query = query.order("rating", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    const result: SearchResult = {
      profiles: data || [],
      total: count || 0,
      page,
      pageSize,
    };

    return NextResponse.json<ApiResponse<SearchResult>>({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to search profiles",
        },
      },
      { status: 500 }
    );
  }
}

// GET endpoint for simple searches
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const specialization = searchParams.get("specialization");
  const minRating = searchParams.get("min_rating");

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { message: "Unauthorized" },
      },
      { status: 401 }
    );
  }

  try {
    let query = supabase
      .from("kr_caregiver_profiles")
      .select("*, user:profiles!user_id(*)")
      .eq("status", "active");

    if (role) {
      query = query.eq("role", role);
    }

    if (specialization) {
      query = query.ilike("specialization", `%${specialization}%`);
    }

    if (minRating) {
      query = query.gte("rating", parseFloat(minRating));
    }

    query = query.order("rating", { ascending: false }).limit(50);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json<ApiResponse<Profile[]>>({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to search profiles",
        },
      },
      { status: 500 }
    );
  }
}
