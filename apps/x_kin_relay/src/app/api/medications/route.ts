import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { Medication, MedicationFormData, ApiResponse } from "@/types/kinrelay";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const medicationId = searchParams.get("id");
  const clientId = searchParams.get("client_id");

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
    if (medicationId) {
      // Get single medication
      const { data, error } = await supabase
        .from("kr_medications")
        .select(
          `
          *,
          client:kr_clients(*)
        `
        )
        .eq("id", medicationId)
        .single();

      if (error) throw error;

      return NextResponse.json<ApiResponse<any>>({
        success: true,
        data,
      });
    } else if (clientId) {
      // Get all medications for a specific client
      const { data, error } = await supabase
        .from("kr_medications")
        .select(
          `
          *,
          client:kr_clients(*)
        `
        )
        .eq("client_id", clientId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      return NextResponse.json<ApiResponse<Medication[]>>({
        success: true,
        data: data || [],
      });
    } else {
      // Get all medications for all authorized clients
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      let clientIds: string[] = [];

      if (profile?.role === "family") {
        const { data: clients } = await supabase
          .from("kr_clients")
          .select("id")
          .eq("family_member_id", user.id);
        clientIds = clients?.map((c) => c.id) || [];
      } else if (
        ["specialist", "nurse", "caregiver"].includes(profile?.role || "")
      ) {
        const { data: assignments } = await supabase
          .from("kr_care_assignments")
          .select("client_id")
          .eq("specialist_id", user.id)
          .eq("is_active", true);
        clientIds = assignments?.map((a) => a.client_id) || [];
      }

      if (clientIds.length === 0) {
        return NextResponse.json<ApiResponse<Medication[]>>({
          success: true,
          data: [],
        });
      }

      const { data, error } = await supabase
        .from("kr_medications")
        .select(
          `
          *,
          client:kr_clients(*)
        `
        )
        .in("client_id", clientIds)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      return NextResponse.json<ApiResponse<Medication[]>>({
        success: true,
        data: data || [],
      });
    }
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch medications",
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
    const body: MedicationFormData = await request.json();

    // Verify user has access to the client
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let hasAccess = false;

    if (profile?.role === "family") {
      const { data: client } = await supabase
        .from("kr_clients")
        .select("id")
        .eq("id", body.client_id)
        .eq("family_member_id", user.id)
        .single();
      hasAccess = !!client;
    } else if (
      ["specialist", "nurse", "caregiver"].includes(profile?.role || "")
    ) {
      const { data: assignment } = await supabase
        .from("kr_care_assignments")
        .select("id")
        .eq("client_id", body.client_id)
        .eq("specialist_id", user.id)
        .eq("is_active", true)
        .single();
      hasAccess = !!assignment;
    }

    if (!hasAccess) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { message: "Unauthorized to add medications for this client" },
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("kr_medications")
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<Medication>>(
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
          message: error.message || "Failed to create medication",
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
          error: { message: "Medication ID is required" },
        },
        { status: 400 }
      );
    }

    // Verify access through client
    const { data: medication } = await supabase
      .from("kr_medications")
      .select("client_id, client:kr_clients(family_member_id)")
      .eq("id", id)
      .single();

    if (!medication) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { message: "Medication not found" },
        },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("kr_medications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<Medication>>({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to update medication",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const medicationId = searchParams.get("id");

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

  if (!medicationId) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { message: "Medication ID is required" },
      },
      { status: 400 }
    );
  }

  try {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from("kr_medications")
      .update({ is_active: false })
      .eq("id", medicationId);

    if (error) throw error;

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to delete medication",
        },
      },
      { status: 500 }
    );
  }
}
