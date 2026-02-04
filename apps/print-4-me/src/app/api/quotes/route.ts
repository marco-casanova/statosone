import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { calculatePrice } from "@/lib/pricing";
import type { Material, Quality } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { modelId, material, quality, quantity, shippingAddress } = body;

    if (!modelId || !material || !quality || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify model exists and belongs to user
    const { data: model, error: modelError } = await supabase
      .from("models")
      .select("*")
      .eq("id", modelId)
      .eq("user_id", user.id)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Calculate price
    const pricing = calculatePrice(
      material as Material,
      quality as Quality,
      quantity,
    );

    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        model_id: modelId,
        material: material as Material,
        quality: quality as Quality,
        quantity,
        base_price_cents: pricing.basePriceCents,
        quality_addon_cents: pricing.qualityAddonCents,
        quantity_price_cents: pricing.quantityPriceCents,
        shipping_cents: pricing.shippingCents,
        total_cents: pricing.totalCents,
        shipping_address: shippingAddress || null,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 7 days
      })
      .select()
      .single();

    if (quoteError) {
      console.error("Quote creation error:", quoteError);
      return NextResponse.json(
        { error: "Failed to create quote" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      quote,
      pricing,
    });
  } catch (error: any) {
    console.error("Quote error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create quote" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const quoteId = searchParams.get("id");
    const modelId = searchParams.get("modelId");

    if (quoteId) {
      const { data: quote, error } = await supabase
        .from("quotes")
        .select(
          `
          *,
          model:models(*)
        `,
        )
        .eq("id", quoteId)
        .eq("user_id", user.id)
        .single();

      if (error || !quote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }

      return NextResponse.json({ quote });
    }

    // Get quotes for a specific model or all quotes
    let query = supabase
      .from("quotes")
      .select(
        `
        *,
        model:models(id, name)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (modelId) {
      query = query.eq("model_id", modelId);
    }

    const { data: quotes, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch quotes" },
        { status: 500 },
      );
    }

    return NextResponse.json({ quotes });
  } catch (error: any) {
    console.error("Fetch quotes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch quotes" },
      { status: 500 },
    );
  }
}
