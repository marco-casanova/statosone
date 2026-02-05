import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe with API key check
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Payment processing is not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

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
    const { quoteId, orderId, amountCents, description, modelName } = body;

    if (!quoteId && !orderId) {
      return NextResponse.json(
        { error: "Quote ID or Order ID required" },
        { status: 400 },
      );
    }

    if (!amountCents || amountCents <= 0) {
      return NextResponse.json(
        { error: "Valid amount required" },
        { status: 400 },
      );
    }

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
              name: modelName || "3D Print Order",
              description:
                description || "Custom 3D printed part from Print-4-Me",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        quote_id: quoteId || "",
        order_id: orderId || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/orders/${orderId || "new"}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/orders/${orderId || "new"}?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
