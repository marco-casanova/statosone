import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { Client, ClientFormData, ApiResponse } from "@/types/kinrelay";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("id");

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
    if (clientId) {
      // Get single client
      const { data, error } = await supabase
        .from("kr_clients")
        .select(
          `
          *,
          family_member:profiles!family_member_id(*),
          kr_care_assignments(
            *,
            specialist:profiles!specialist_id(*)
          )
        `
        )
        .eq("id", clientId)
        .single();

      if (error) throw error;

      return NextResponse.json<ApiResponse<any>>({
        success: true,
        data,
      });
    } else {
      // Get all clients for the current user
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      let query = supabase.from("kr_clients").select(`
        *,
        family_member:profiles!family_member_id(*),
        kr_care_assignments(
          *,
          specialist:profiles!specialist_id(*)
        )
      `);

      // Filter based on role
      if (profile?.role === "family") {
        query = query.eq("family_member_id", user.id);
      } else if (
        ["specialist", "nurse", "caregiver"].includes(profile?.role || "")
      ) {
        // Get clients assigned to this specialist
        const { data: assignments } = await supabase
          .from("kr_care_assignments")
          .select("client_id")
          .eq("specialist_id", user.id)
          .eq("is_active", true);

        const clientIds = assignments?.map((a) => a.client_id) || [];
        query = query.in("id", clientIds);
      }

      const { data, error } = await query.order("full_name");

      if (error) throw error;

      return NextResponse.json<ApiResponse<Client[]>>({
        success: true,
        data: data || [],
      });
    }
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch clients",
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
    const body: ClientFormData = await request.json();

    // Validate user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "family") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { message: "Only family members can create clients" },
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("kr_clients")
      .insert([
        {
          ...body,
          family_member_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<Client>>(
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
          message: error.message || "Failed to create client",
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
          error: { message: "Client ID is required" },
        },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: client } = await supabase
      .from("kr_clients")
      .select("family_member_id")
      .eq("id", id)
      .single();

    if (client?.family_member_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { message: "Unauthorized to update this client" },
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("kr_clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<Client>>({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to update client",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("id");

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

  if (!clientId) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { message: "Client ID is required" },
      },
      { status: 400 }
    );
  }

  try {
    // Verify ownership
    const { data: client } = await supabase
      .from("kr_clients")
      .select("family_member_id")
      .eq("id", clientId)
      .single();

    if (client?.family_member_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { message: "Unauthorized to delete this client" },
        },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("kr_clients")
      .delete()
      .eq("id", clientId);

    if (error) throw error;

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to delete client",
        },
      },
      { status: 500 }
    );
  }
}
