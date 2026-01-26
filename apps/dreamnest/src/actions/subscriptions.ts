"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionTier } from "@/types";

/**
 * Get current user's subscription status
 */
export async function getSubscription() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data;
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const subscription = await getSubscription();

  if (!subscription) {
    return false;
  }

  return subscription.status === "active" || subscription.status === "trialing";
}

/**
 * Get subscription tier
 */
export async function getSubscriptionTier(): Promise<SubscriptionTier> {
  const subscription = await getSubscription();

  if (!subscription) {
    return "free";
  }

  if (subscription.status === "active" || subscription.status === "trialing") {
    return subscription.tier || "family";
  }

  return "free";
}

/**
 * Check if user can access full content (subscriber or author of content)
 */
export async function canAccessFullContent(bookId?: string): Promise<boolean> {
  const user = await getUser();

  if (!user) {
    return false;
  }

  // Check subscription
  const hasSubscription = await hasActiveSubscription();
  if (hasSubscription) {
    return true;
  }

  // If bookId provided, check if user is author
  if (bookId) {
    const supabase = await createClient();
    const { data: book } = await supabase
      .from("books")
      .select("author_id")
      .eq("id", bookId)
      .single();

    if (book?.author_id === user.id) {
      return true;
    }
  }

  // Check if user is admin
  const { data: profile } = await (await createClient())
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return true;
  }

  return false;
}

/**
 * Update subscription from Stripe webhook data
 * Called by webhook handler only - uses admin client
 */
export async function updateSubscriptionFromStripe(input: {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  tier: SubscriptionTier;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: input.user_id,
      stripe_customer_id: input.stripe_customer_id,
      stripe_subscription_id: input.stripe_subscription_id,
      tier: input.tier,
      status: input.status,
      current_period_start: input.current_period_start,
      current_period_end: input.current_period_end,
      cancel_at_period_end: input.cancel_at_period_end || false,
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Failed to update subscription");
  }

  return { success: true };
}

/**
 * Cancel subscription (mark to cancel at period end)
 */
export async function cancelSubscription() {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const subscription = await getSubscription();

  if (!subscription?.stripe_subscription_id) {
    throw new Error("No active subscription found");
  }

  // Note: Actual Stripe cancellation happens via API route
  // This just returns the subscription ID to cancel
  return {
    subscriptionId: subscription.stripe_subscription_id,
    customerId: subscription.stripe_customer_id,
  };
}

/**
 * Get subscription preview (for upgrade/downgrade)
 */
export async function getSubscriptionPreview() {
  const subscription = await getSubscription();

  return {
    currentTier: subscription?.tier || "free",
    status: subscription?.status || null,
    periodEnd: subscription?.current_period_end || null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
  };
}

/**
 * Link Stripe customer to user (called after checkout)
 */
export async function linkStripeCustomer(stripeCustomerId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("id", user.id);

  if (error) {
    console.error("Error linking Stripe customer:", error);
    throw new Error("Failed to link Stripe customer");
  }

  return { success: true };
}

/**
 * Get Stripe customer ID for current user
 */
export async function getStripeCustomerId(): Promise<string | null> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  return profile?.stripe_customer_id || null;
}

/**
 * Check trial eligibility
 */
export async function isTrialEligible(): Promise<boolean> {
  const user = await getUser();

  if (!user) {
    return true; // New users are trial eligible
  }

  const supabase = await createClient();

  // Check if user has ever had a subscription
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  return !data || data.length === 0;
}
