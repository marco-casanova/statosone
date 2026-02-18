// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe with API key check
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Payment processing is not configured" },
        { status: 500 },
      );
    }

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret is not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    const supabase: SupabaseClient<Database> = createServiceRoleClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const clientReferenceId = session.client_reference_id || "";
        let orderId = session.metadata?.order_id || "";
        let pipelineOrderId = session.metadata?.pipeline_order_id || "";

        // Payment Link references:
        // - Legacy orders use raw order id
        // - Pipeline orders use "pipeline:<id>"
        if (!pipelineOrderId && clientReferenceId.startsWith("pipeline:")) {
          pipelineOrderId = clientReferenceId.slice("pipeline:".length);
        }
        if (!orderId && clientReferenceId && !pipelineOrderId) {
          orderId = clientReferenceId;
        }

        const quoteId = session.metadata?.quote_id;
        const userId = session.metadata?.user_id;

        console.log("Payment completed:", {
          orderId,
          quoteId,
          userId,
          pipelineOrderId,
          amount: session.amount_total,
        });

        // ---- Pipeline order flow ----
        if (pipelineOrderId) {
          const { error: pipelineError } = await supabase
            .from("pipeline_orders")
            .update({
              status: "PAID",
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_checkout_session_id: session.id,
              paid_at: new Date().toISOString(),
            })
            .eq("id", pipelineOrderId);

          if (pipelineError) {
            console.error("Failed to update pipeline order:", pipelineError);
          } else {
            console.log("Pipeline order updated to PAID:", pipelineOrderId);

            // Log event
            await supabase.from("order_events").insert({
              order_id: pipelineOrderId,
              from_status: "QUOTED",
              to_status: "PAID",
              message: "Payment received via Stripe",
            });

            console.log(
              "Pipeline order PAID — ready for admin review:",
              pipelineOrderId,
            );
          }
          break;
        }

        // ---- Legacy order flow ----
        // If we have an order ID, update the order status
        if (orderId) {
          const { error: orderError } = await supabase
            .from("orders")
            .update({
              status: "paid" as const,
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_session_id: session.id,
            })
            .eq("id", orderId);

          if (orderError) {
            console.error("Failed to update order:", orderError);
          } else {
            console.log("Order updated to paid:", orderId);
          }
        }

        // If we have a quote ID but no order, create the order now
        if (quoteId && !orderId) {
          // Fetch the quote
          const { data: quote, error: quoteError } = await supabase
            .from("quotes")
            .select("*")
            .eq("id", quoteId)
            .single();

          if (!quote) {
            console.error("Quote not found");
            break;
          }

          if (quoteError) {
            console.error("Failed to fetch quote:", quoteError);
            break;
          }

          // Fetch the model
          const { data: model, error: modelError } = await supabase
            .from("models")
            .select("*")
            .eq("id", quote.model_id)
            .single();

          if (modelError || !model) {
            console.error("Failed to fetch model:", modelError);
          } else {
            // Create the order
            const { data: newOrder, error: createError } = await supabase
              .from("orders")
              .insert({
                user_id: userId!,
                quote_id: quoteId,
                model_id: quote.model_id,
                status: "paid" as const,
                material: quote.material,
                color: quote.color || "White",
                quality: quote.quality,
                quantity: quote.quantity,
                total_cents: quote.total_cents ?? quote.price_cents,
                shipping_address: quote.shipping_address || {},
                stripe_payment_intent_id: session.payment_intent as string,
                stripe_session_id: session.id,
              })
              .select()
              .single();

            if (createError) {
              console.error("Failed to create order:", createError);
            } else if (newOrder) {
              console.log("Order created:", newOrder.id);
            }
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          console.log("Checkout session expired for order:", orderId);
          // Optionally mark order as payment_expired or delete draft order
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(
          "Payment failed:",
          paymentIntent.id,
          paymentIntent.last_payment_error,
        );
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        // Find and update the order
        const { data: orders, error: findError } = await supabase
          .from("orders")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntentId);

        if (!findError && orders && orders.length > 0) {
          const { error: updateError } = await supabase
            .from("orders")
            .update({ status: "cancelled" as const })
            .eq("stripe_payment_intent_id", paymentIntentId);

          if (updateError) {
            console.error("Failed to update refunded order:", updateError);
          } else {
            console.log("Order marked as refunded:", orders[0].id);
          }
        }
        break;
      }

      default:
        console.log("Unhandled webhook event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};
