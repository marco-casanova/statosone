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

    const body = await request.json();
    const { quoteId, shippingAddress } = body;

    if (!quoteId) {
      return NextResponse.json({ error: "Quote ID required" }, { status: 400 });
    }

    // Fetch the quote
    const { data: quote, error: quoteError } = (await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .eq("user_id", user.id)
      .single()) as { data: any; error: any };

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Check if quote is expired
    if (new Date(quote.expires_at) < new Date()) {
      return NextResponse.json({ error: "Quote has expired" }, { status: 400 });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        quote_id: quoteId,
        model_id: quote.model_id,
        status: "created",
        material: quote.material,
        quality: quote.quality,
        quantity: quote.quantity,
        total_cents: quote.total_cents ?? quote.price_cents,
        shipping_address: shippingAddress || quote.shipping_address || {},
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
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
    const orderId = searchParams.get("id");

    if (orderId) {
      const { data: order, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          model:models(*),
          quote:quotes(*)
        `,
        )
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (error || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Get all orders
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        model:models(id, filename, file_type)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 },
      );
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

// Cancel an order (customer can only cancel if not yet paid)
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
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Fetch order
    const { data: order, error: fetchError } = (await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()) as { data: any; error: any };

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Customer can only cancel if status is 'created'
    if (order.status !== "created") {
      return NextResponse.json(
        { error: "Cannot cancel order after payment" },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to cancel order" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel order" },
      { status: 500 },
    );
  }
}
