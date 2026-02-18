import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: order, error: orderError } = (await supabase
      .from("orders")
      .select(
        `
        id,
        model:models(filename, file_path, file_type)
      `,
      )
      .eq("id", id)
      .single()) as { data: any; error: any };

    if (orderError || !order?.model?.file_path) {
      return NextResponse.json({ error: "Order model not found" }, { status: 404 });
    }

    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from("models")
      .createSignedUrl(order.model.file_path, 3600, {
        download: order.model.filename,
      });

    if (signedUrlError || !signedUrl?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to create download URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrl.signedUrl,
      filename: order.model.filename,
      fileType: order.model.file_type,
    });
  } catch (error: any) {
    console.error("Admin model download error:", error);
    return NextResponse.json(
      { error: error.message || "Download failed" },
      { status: 500 },
    );
  }
}
