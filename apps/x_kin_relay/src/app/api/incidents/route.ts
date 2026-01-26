import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { Incident, IncidentFormData, ApiResponse } from "@/types/kinrelay";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");
  const date = searchParams.get("date");
  const severity = searchParams.get("severity");

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
    let query = supabase.from("kr_incidents").select(`
        *,
        client:kr_clients(*),
        reporter:profiles!reported_by(*)
      `);

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    if (date) {
      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;
      query = query
        .gte("incident_date", startOfDay)
        .lte("incident_date", endOfDay);
    }

    if (severity) {
      query = query.eq("severity", severity);
    }

    const { data, error } = await query.order("incident_date", {
      ascending: false,
    });

    if (error) throw error;

    return NextResponse.json<ApiResponse<Incident[]>>({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch incidents",
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
    const body: IncidentFormData = await request.json();

    const { data, error } = await supabase
      .from("kr_incidents")
      .insert([
        {
          ...body,
          reported_by: user.id,
          incident_date: body.incident_date || new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<Incident>>(
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
          message: error.message || "Failed to report incident",
        },
      },
      { status: 500 }
    );
  }
}
