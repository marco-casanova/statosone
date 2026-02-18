// POST /api/pipeline/orders/[id]/checkout
// Creates Stripe Checkout Session for the quoted total
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function getBaseUrl(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin
  );
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const paymentLinkUrl = process.env.STRIPE_PAYMENT_LINK_URL;
    if (!stripeSecretKey && !paymentLinkUrl) {
      return NextResponse.json(
        { error: "Payment processing not configured" },
        { status: 500 },
      );
    }

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

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("pipeline_orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "QUOTED") {
      return NextResponse.json(
        {
          error: `Cannot checkout order in ${order.status} status. Must be QUOTED.`,
        },
        { status: 400 },
      );
    }

    if (!order.quote_total_cents || order.quote_total_cents <= 0) {
      return NextResponse.json(
        { error: "Invalid quote total" },
        { status: 400 },
      );
    }

    const breakdown = order.quote_breakdown_json as any;
    const description = [
      `${breakdown?.grams_used || "?"}g filament`,
      `${breakdown?.print_time_hours || "?"}h print time`,
      order.stl_filename || "3D Print",
    ].join(" · ");

    const baseUrl = getBaseUrl(request);
    const successUrl = `${baseUrl}/dashboard/pipeline/orders/${id}?payment=success`;
    const cancelUrl = `${baseUrl}/dashboard/pipeline/orders/${id}?payment=cancelled`;

    // Payment Link mode: use a preconfigured Stripe link and pass the pipeline
    // order id through client_reference_id so webhook can match it.
    if (paymentLinkUrl) {
      const paymentLink = new URL(paymentLinkUrl);
      paymentLink.searchParams.set("client_reference_id", `pipeline:${id}`);
      if (user.email) {
        paymentLink.searchParams.set("prefilled_email", user.email);
      }

      return NextResponse.json({
        success: true,
        url: paymentLink.toString(),
        mode: "payment_link",
        successUrl,
        cancelUrl,
      });
    }

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe secret key is not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia" as any,
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: order.stl_filename || "3D Print Order",
              description,
            },
            unit_amount: order.quote_total_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        pipeline_order_id: id,
        user_id: user.id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Store stripe session id on the order
    await supabase
      .from("pipeline_orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Pipeline checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout" },
      { status: 500 },
    );
  }
}
