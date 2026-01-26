import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";
import { Task, TaskFormData, ApiResponse } from "@/types/kinrelay";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("id");
  const clientId = searchParams.get("client_id");
  const date = searchParams.get("date");
  const status = searchParams.get("status");

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
    if (taskId) {
      // Get single task
      const { data, error } = await supabase
        .from("kr_tasks")
        .select(
          `
          *,
          client:kr_clients(*),
          assigned_specialist:profiles!assigned_to(*),
          category:kr_care_categories(*),
          subcategory:kr_care_subcategories(*),
          creator:profiles!created_by(*)
        `
        )
        .eq("id", taskId)
        .single();

      if (error) throw error;

      return NextResponse.json<ApiResponse<any>>({
        success: true,
        data,
      });
    } else {
      // Build query based on parameters
      let query = supabase.from("kr_tasks").select(`
        *,
        client:kr_clients(*),
        assigned_specialist:profiles!assigned_to(*),
        category:kr_care_categories(*),
        subcategory:kr_care_subcategories(*)
      `);

      // Filter by client
      if (clientId) {
        query = query.eq("client_id", clientId);
      } else {
        // Get authorized clients
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
          return NextResponse.json<ApiResponse<Task[]>>({
            success: true,
            data: [],
          });
        }

        query = query.in("client_id", clientIds);
      }

      // Filter by date
      if (date) {
        query = query.eq("task_date", date);
      }

      // Filter by status
      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("task_date", {
        ascending: false,
      });

      if (error) throw error;

      return NextResponse.json<ApiResponse<Task[]>>({
        success: true,
        data: data || [],
      });
    }
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch tasks",
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
    const body: TaskFormData = await request.json();

    // Verify user has access to the client
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let hasAccess = false;
    let assignedTo = user.id;

    if (profile?.role === "family") {
      const { data: client } = await supabase
        .from("kr_clients")
        .select("id")
        .eq("id", body.client_id)
        .eq("family_member_id", user.id)
        .single();
      hasAccess = !!client;

      // If family creates task, assign to active specialist
      const { data: assignment } = await supabase
        .from("kr_care_assignments")
        .select("specialist_id")
        .eq("client_id", body.client_id)
        .eq("is_active", true)
        .single();

      if (assignment) {
        assignedTo = assignment.specialist_id;
      }
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
          error: { message: "Unauthorized to create tasks for this client" },
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("kr_tasks")
      .insert([
        {
          ...body,
          assigned_to: assignedTo,
          created_by: user.id,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<Task>>(
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
          message: error.message || "Failed to create task",
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
          error: { message: "Task ID is required" },
        },
        { status: 400 }
      );
    }

    // If completing a task, set completed_time
    if (updates.status === "completed" && !updates.completed_time) {
      updates.completed_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("kr_tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<Task>>({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to update task",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("id");

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

  if (!taskId) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { message: "Task ID is required" },
      },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.from("kr_tasks").delete().eq("id", taskId);

    if (error) throw error;

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          message: error.message || "Failed to delete task",
        },
      },
      { status: 500 }
    );
  }
}
