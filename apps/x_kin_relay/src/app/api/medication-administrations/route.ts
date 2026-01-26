import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { MedicationAdministration, ApiResponse } from "@/types/kinrelay";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");
  const date = searchParams.get("date");
  const medicationId = searchParams.get("medication_id");

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
    let query = supabase.from("kr_medication_administrations").select(`
        *,
        medication:kr_medications(*),
        client:kr_clients(*),
        administrator:profiles!administered_by(*)
      `);

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    if (medicationId) {
      query = query.eq("medication_id", medicationId);
    }

    if (date) {
      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;
      query = query
        .gte("scheduled_time", startOfDay)
        .lte("scheduled_time", endOfDay);
    }

    const { data, error } = await query.order("scheduled_time", {
      ascending: false,
    });

    if (error) throw error;

    return NextResponse.json<ApiResponse<MedicationAdministration[]>>({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message:
            error.message || "Failed to fetch medication administrations",
        },
      },
      { status: 500 }
    );
  }
}

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

    const { data, error } = await supabase
      .from("kr_medication_administrations")
      .insert([
        {
          ...body,
          administered_by: user.id,
          actual_time:
            body.was_taken || body.was_refused
              ? new Date().toISOString()
              : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<MedicationAdministration>>(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message:
            error.message || "Failed to record medication administration",
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { message: "Administration ID is required" },
        },
        { status: 400 }
      );
    }

    // Update actual_time if status changes
    if ((updates.was_taken || updates.was_refused) && !updates.actual_time) {
      updates.actual_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("kr_medication_administrations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<MedicationAdministration>>({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message:
            error.message || "Failed to update medication administration",
        },
      },
      { status: 500 }
    );
  }
}
