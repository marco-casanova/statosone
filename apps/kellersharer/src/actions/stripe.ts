"use server";

import Stripe from "stripe";
import { getUser, getProfile } from "@/lib/supabase/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Space, Rental } from "@/types";

// Initialize Stripe with API key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

/**
 * Create a Stripe Checkout Session for a rental
 */
export async function createCheckoutSession(
  spaceId: string,
  startDate: string,
  durationMonths: number,
) {
  const user = await getUser();
  const profile = await getProfile();

  if (!user || !profile) {
    return { error: "Unauthorized" };
  }

  const supabase = await createServerClient();

  // Get the space details
  const { data: space, error: spaceError } = await supabase
    .from("spaces")
    .select("*, owner:keller_profiles!owner_id(*)")
    .eq("id", spaceId)
    .single();

  if (spaceError || !space) {
    return { error: "Space not found" };
  }

  try {
    // Calculate total amount
    const totalAmount = space.total_price * durationMonths * 100; // Convert to cents
    const platformFee = Math.round(totalAmount * 0.1); // 10% platform fee

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "sepa_debit"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: space.title,
              description: `${space.size_m2} m² space rental for ${durationMonths} months`,
              images: space.images?.length > 0 ? [space.images[0]] : undefined,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        space_id: spaceId,
        renter_id: space.owner_id,
        searcher_id: user.id,
        start_date: startDate,
        duration_months: durationMonths.toString(),
      },
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/rentals/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/spaces/${spaceId}`,
    });

    return { sessionUrl: session.url };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return { error: "Failed to create checkout session" };
  }
}

/**
 * Create a Stripe subscription for recurring rental payments
 */
export async function createRentalSubscription(
  spaceId: string,
  startDate: string,
) {
  const user = await getUser();
  const profile = await getProfile();

  if (!user || !profile) {
    return { error: "Unauthorized" };
  }

  const supabase = await createServerClient();

  // Get the space details
  const { data: space, error: spaceError } = await supabase
    .from("spaces")
    .select("*, owner:keller_profiles!owner_id(*)")
    .eq("id", spaceId)
    .single();

  if (spaceError || !space) {
    return { error: "Space not found" };
  }

  try {
    // Create or retrieve Stripe customer
    let customerId: string;

    const existingCustomers = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile.full_name,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create a price for this rental
    const price = await stripe.prices.create({
      currency: "eur",
      unit_amount: space.total_price * 100, // Convert to cents
      recurring: {
        interval: "month",
      },
      product_data: {
        name: `Monthly Rent: ${space.title}`,
        metadata: {
          space_id: spaceId,
        },
      },
    });

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "sepa_debit"],
      customer: customerId,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        space_id: spaceId,
        renter_id: space.owner_id,
        searcher_id: user.id,
        start_date: startDate,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/rentals/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/spaces/${spaceId}`,
    });

    return { sessionUrl: session.url };
  } catch (error) {
    console.error("Stripe subscription error:", error);
    return { error: "Failed to create subscription" };
  }
}

/**
 * Handle successful payment webhook
 */
export async function handlePaymentSuccess(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { error: "Payment not completed" };
    }

    const { space_id, renter_id, searcher_id, start_date, duration_months } =
      session.metadata || {};

    if (!space_id || !renter_id || !searcher_id) {
      return { error: "Invalid session metadata" };
    }

    const supabase = await createServerClient();

    // Calculate end date
    const startDateObj = new Date(start_date!);
    const endDateObj = new Date(startDateObj);
    endDateObj.setMonth(
      endDateObj.getMonth() + parseInt(duration_months || "1"),
    );

    // Create rental record
    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .insert({
        space_id,
        renter_id,
        searcher_id,
        start_date: start_date,
        end_date: endDateObj.toISOString().split("T")[0],
        monthly_price: session.amount_total ? session.amount_total / 100 : 0,
        status: "active",
        stripe_subscription_id: (session.subscription as string) || null,
      })
      .select()
      .single();

    if (rentalError) {
      console.error("Error creating rental:", rentalError);
      return { error: "Failed to create rental record" };
    }

    // Update space status to rented
    await supabase
      .from("spaces")
      .update({ status: "rented" })
      .eq("id", space_id);

    return { rental };
  } catch (error) {
    console.error("Payment success handling error:", error);
    return { error: "Failed to process payment" };
  }
}

/**
 * Get Stripe Connect onboarding link for space owners
 */
export async function getConnectOnboardingLink() {
  const user = await getUser();
  const profile = await getProfile();

  if (!user || !profile || profile.user_type !== "renter") {
    return { error: "Unauthorized" };
  }

  try {
    // Create Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "DE",
      email: user.email!,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        user_id: user.id,
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/payments`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/payments?success=true`,
      type: "account_onboarding",
    });

    return { url: accountLink.url, accountId: account.id };
  } catch (error) {
    console.error("Connect onboarding error:", error);
    return { error: "Failed to create payout account" };
  }
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory() {
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized", payments: [] };
  }

  try {
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return { payments: [] };
    }

    const charges = await stripe.charges.list({
      customer: customers.data[0].id,
      limit: 20,
    });

    const payments = charges.data.map((charge) => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency,
      status: charge.status,
      description: charge.description,
      created: new Date(charge.created * 1000).toISOString(),
    }));

    return { payments };
  } catch (error) {
    console.error("Payment history error:", error);
    return { error: "Failed to fetch payment history", payments: [] };
  }
}
