import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validExtensions = [".stl", ".obj"];
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file type. Only STL and OBJ files are allowed." },
        { status: 400 },
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 },
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${user.id}/${timestamp}_${sanitizedName}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("models")
      .upload(filePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 },
      );
    }

    // Create model record in database
    const { data: model, error: modelError } = await supabase
      .from("models")
      .insert({
        user_id: user.id,
        filename: file.name,
        file_path: uploadData.path,
        file_size_bytes: file.size,
        file_type: fileExtension.replace(".", "") as "stl" | "obj",
      })
      .select()
      .single();

    if (modelError) {
      // Clean up uploaded file if model creation fails
      await supabase.storage.from("models").remove([uploadData.path]);
      console.error("Model creation error:", modelError);
      return NextResponse.json(
        { error: "Failed to create model record" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      model,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}

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

    const searchParams = request.nextUrl.searchParams;
    const modelId = searchParams.get("id");

    if (modelId) {
      // Get single model
      const { data: model, error } = (await supabase
        .from("models")
        .select("*")
        .eq("id", modelId)
        .eq("user_id", user.id)
        .single()) as { data: any; error: any };

      if (error || !model) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }

      // Get signed URL for the file
      const { data: signedUrl } = await supabase.storage
        .from("models")
        .createSignedUrl(model.file_path, 3600); // 1 hour

      return NextResponse.json({
        model,
        signedUrl: signedUrl?.signedUrl,
      });
    }

    // Get all models for user
    const { data: models, error } = await supabase
      .from("models")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: 500 },
      );
    }

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch models" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const modelId = searchParams.get("id");

    if (!modelId) {
      return NextResponse.json({ error: "Model ID required" }, { status: 400 });
    }

    // Fetch the model first
    const { data: model, error: fetchError } = (await supabase
      .from("models")
      .select("*")
      .eq("id", modelId)
      .eq("user_id", user.id)
      .single()) as { data: any; error: any };

    if (fetchError || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Check if model has any orders
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("model_id", modelId)
      .limit(1);

    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete model with existing orders" },
        { status: 400 },
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("models")
      .remove([model.file_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
    }

    // Delete model record
    const { error: deleteError } = await supabase
      .from("models")
      .delete()
      .eq("id", modelId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete model" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 500 },
    );
  }
}
