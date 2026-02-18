import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

function getBaseUrl(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin
  );
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const paymentLinkUrl = process.env.STRIPE_PAYMENT_LINK_URL;
    if (!stripeSecretKey && !paymentLinkUrl) {
      return NextResponse.json(
        { error: "Payment processing is not configured" },
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

    const body = await request.json();
    const requestedQuoteId = body?.quoteId as string | undefined;
    const requestedOrderId = body?.orderId as string | undefined;

    if (!requestedQuoteId && !requestedOrderId) {
      return NextResponse.json(
        { error: "Quote ID or Order ID required" },
        { status: 400 },
      );
    }

    let amountCents = 0;
    let quoteId = requestedQuoteId ?? "";
    let orderId = requestedOrderId ?? "";
    let modelName = "3D Print Order";
    let description = "Custom 3D printed part from Print-4-Me";

    if (requestedOrderId) {
      const { data: order, error: orderError } = (await supabase
        .from("orders")
        .select(
          `
          id,
          quote_id,
          total_cents,
          status,
          model:models(filename)
        `,
        )
        .eq("id", requestedOrderId)
        .eq("user_id", user.id)
        .single()) as { data: any; error: any };

      if (orderError || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.status === "cancelled") {
        return NextResponse.json(
          { error: "Cancelled orders cannot be paid" },
          { status: 400 },
        );
      }
      if (order.status !== "created") {
        return NextResponse.json(
          { error: "This order has already been processed" },
          { status: 400 },
        );
      }

      amountCents = order.total_cents;
      quoteId = order.quote_id;
      orderId = order.id;
      modelName = order.model?.filename || modelName;
      description = `3D print order #${order.id.slice(0, 8)}`;
    } else if (requestedQuoteId) {
      const { data: quote, error: quoteError } = (await supabase
        .from("quotes")
        .select(
          `
          id,
          total_cents,
          price_cents,
          model:models(filename)
        `,
        )
        .eq("id", requestedQuoteId)
        .eq("user_id", user.id)
        .single()) as { data: any; error: any };

      if (quoteError || !quote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }

      amountCents = quote.total_cents ?? quote.price_cents;
      quoteId = quote.id;
      modelName = quote.model?.filename || modelName;
      description = `Quote #${quote.id.slice(0, 8)}`;
    }

    if (!amountCents || amountCents <= 0) {
      return NextResponse.json(
        { error: "Invalid amount for checkout" },
        { status: 400 },
      );
    }

    const baseUrl = getBaseUrl(request);
    const successPath = orderId
      ? `/dashboard/orders/${orderId}?payment=success`
      : "/dashboard/orders?payment=success";
    const cancelPath = orderId
      ? `/dashboard/orders/${orderId}?payment=cancelled`
      : "/dashboard/orders?payment=cancelled";

    // Payment Link mode: redirect to preconfigured Stripe payment link
    // while carrying the order id through client_reference_id so webhook
    // can mark the correct order as paid.
    if (paymentLinkUrl) {
      const paymentLink = new URL(paymentLinkUrl);
      if (orderId) {
        paymentLink.searchParams.set("client_reference_id", orderId);
      }
      if (user.email) {
        paymentLink.searchParams.set("prefilled_email", user.email);
      }

      return NextResponse.json({
        success: true,
        url: paymentLink.toString(),
        mode: "payment_link",
        successUrl: `${baseUrl}${successPath}`,
        cancelUrl: `${baseUrl}${cancelPath}`,
      });
    }

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe secret key is not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: modelName,
              description,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        quote_id: quoteId,
        order_id: orderId,
      },
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}${cancelPath}`,
    });

    if (orderId) {
      await supabase
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", orderId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
