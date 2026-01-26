"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// ADMIN HELPER
// ============================================================

async function requireAdmin() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Admin access required");
  }

  return { supabase, user };
}

// ============================================================
// REVENUE PERIODS
// ============================================================

/**
 * Create or get current revenue period
 */
export async function getOrCreateRevenuePeriod(month?: string) {
  const { supabase } = await requireAdmin();

  const periodMonth = month || new Date().toISOString().slice(0, 7);

  // Try to get existing
  const { data: existing } = await supabase
    .from("revenue_periods")
    .select("*")
    .eq("period_month", periodMonth)
    .single();

  if (existing) {
    return existing;
  }

  // Create new
  const { data, error } = await supabase
    .from("revenue_periods")
    .insert({
      period_month: periodMonth,
      currency: "EUR",
      status: "open",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating revenue period:", error);
    throw new Error("Failed to create revenue period");
  }

  // Create associated creator pool
  await supabase.from("creator_pools").insert({
    period_id: data.id,
    pool_percent: 30.0,
  });

  return data;
}

/**
 * Get all revenue periods
 */
export async function getRevenuePeriods() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("revenue_periods")
    .select(
      `
      *,
      creator_pool:creator_pools(*)
    `
    )
    .order("period_month", { ascending: false });

  if (error) {
    console.error("Error fetching revenue periods:", error);
    return [];
  }

  return data;
}

/**
 * Update revenue period amounts
 */
export async function updateRevenuePeriod(
  periodId: string,
  updates: {
    subscription_gross_revenue?: number;
    subscription_refunds?: number;
    subscription_fees?: number;
    ppv_gross_revenue?: number;
    ppv_refunds?: number;
    ppv_fees?: number;
    status?: string;
  }
) {
  const { supabase } = await requireAdmin();

  // Calculate net revenues
  const updateData: Record<string, unknown> = { ...updates };

  if (
    updates.subscription_gross_revenue !== undefined ||
    updates.subscription_refunds !== undefined ||
    updates.subscription_fees !== undefined
  ) {
    const { data: current } = await supabase
      .from("revenue_periods")
      .select("*")
      .eq("id", periodId)
      .single();

    if (current) {
      updateData.subscription_net_revenue =
        (updates.subscription_gross_revenue ??
          current.subscription_gross_revenue) -
        (updates.subscription_refunds ?? current.subscription_refunds) -
        (updates.subscription_fees ?? current.subscription_fees);
    }
  }

  if (
    updates.ppv_gross_revenue !== undefined ||
    updates.ppv_refunds !== undefined ||
    updates.ppv_fees !== undefined
  ) {
    const { data: current } = await supabase
      .from("revenue_periods")
      .select("*")
      .eq("id", periodId)
      .single();

    if (current) {
      updateData.ppv_net_revenue =
        (updates.ppv_gross_revenue ?? current.ppv_gross_revenue) -
        (updates.ppv_refunds ?? current.ppv_refunds) -
        (updates.ppv_fees ?? current.ppv_fees);
    }
  }

  if (updates.status === "finalized") {
    updateData.finalized_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("revenue_periods")
    .update(updateData)
    .eq("id", periodId);

  if (error) {
    console.error("Error updating revenue period:", error);
    throw new Error("Failed to update revenue period");
  }

  revalidatePath("/admin/payouts");
  return { success: true };
}

// ============================================================
// CREATOR POOL MANAGEMENT
// ============================================================

/**
 * Update creator pool settings
 */
export async function updateCreatorPool(
  periodId: string,
  updates: {
    pool_percent?: number;
    bonus_pool_amount?: number;
    completion_bonus_rate?: number;
  }
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("creator_pools")
    .update(updates)
    .eq("period_id", periodId);

  if (error) {
    console.error("Error updating creator pool:", error);
    throw new Error("Failed to update creator pool");
  }

  revalidatePath("/admin/payouts");
  return { success: true };
}

/**
 * Calculate pool distribution for a period
 */
export async function calculatePoolDistribution(periodId: string) {
  const { supabase } = await requireAdmin();

  // Get period and pool info
  const { data: period } = await supabase
    .from("revenue_periods")
    .select("*, creator_pool:creator_pools(*)")
    .eq("id", periodId)
    .single();

  if (!period || period.status === "finalized") {
    throw new Error("Period not found or already finalized");
  }

  const pool = Array.isArray(period.creator_pool)
    ? period.creator_pool[0]
    : period.creator_pool;

  if (!pool) {
    throw new Error("Creator pool not found");
  }

  // Calculate pool amount
  const poolAmountGross =
    (Number(period.subscription_net_revenue) * Number(pool.pool_percent)) / 100;
  const poolAmountNet = poolAmountGross; // Could apply platform reserve here

  // Get engagement data for the period
  const { data: engagement } = await supabase
    .from("book_engagement_monthly")
    .select(
      `
      *,
      book:books(id, owner_type, author_id)
    `
    )
    .eq("period_month", period.period_month);

  // Filter to third-party books only
  const eligibleEngagement =
    engagement?.filter((e) => e.book?.owner_type === "third_party") || [];

  // Calculate total units
  const totalUnits = eligibleEngagement.reduce(
    (sum, e) => sum + Number(e.engagement_units),
    0
  );

  // Calculate per-book share and create payouts
  const bookPayouts: Record<
    string,
    { units: number; share: number; amount: number }
  > = {};

  for (const e of eligibleEngagement) {
    const bookShare =
      totalUnits > 0 ? Number(e.engagement_units) / totalUnits : 0;
    const bookAmount = poolAmountNet * bookShare;

    bookPayouts[e.book_id] = {
      units: Number(e.engagement_units),
      share: bookShare,
      amount: bookAmount,
    };
  }

  // Get author splits for each book and create payouts
  for (const [bookId, payout] of Object.entries(bookPayouts)) {
    const { data: authorBooks } = await supabase
      .from("author_books")
      .select("author_id, royalty_split_percent")
      .eq("book_id", bookId);

    if (authorBooks) {
      for (const ab of authorBooks) {
        const authorAmount =
          (payout.amount * Number(ab.royalty_split_percent)) / 100;

        if (authorAmount > 0.01) {
          // Skip tiny amounts
          await supabase.from("payouts").insert({
            period_id: periodId,
            author_id: ab.author_id,
            type: "subscription_pool",
            amount: authorAmount,
            currency: "EUR",
            engagement_units:
              payout.units * (Number(ab.royalty_split_percent) / 100),
            pool_share_percent: payout.share * 100,
            books_contributed: 1,
            status: "pending",
          });
        }
      }
    }
  }

  // Update pool with calculated values
  await supabase
    .from("creator_pools")
    .update({
      pool_amount_gross: poolAmountGross,
      pool_amount_net: poolAmountNet,
      total_eligible_units: totalUnits,
      total_books_with_engagement: eligibleEngagement.length,
      total_authors_eligible: Object.keys(bookPayouts).length,
      calculated_at: new Date().toISOString(),
    })
    .eq("period_id", periodId);

  revalidatePath("/admin/payouts");
  return {
    success: true,
    pool_amount: poolAmountNet,
    total_units: totalUnits,
    books_count: eligibleEngagement.length,
  };
}

/**
 * Aggregate engagement data for a period
 */
export async function aggregateEngagementForPeriod(periodMonth: string) {
  const { supabase } = await requireAdmin();

  // Get all content events for the period
  const { data: events } = await supabase
    .from("content_events")
    .select("book_id, user_id, minutes_read, pages_read, completed, started_at")
    .eq("event_month", periodMonth);

  if (!events || events.length === 0) {
    return { success: true, books_processed: 0 };
  }

  // Group by book
  const bookEvents: Record<
    string,
    {
      sessions: number;
      users: Set<string>;
      minutes: number;
      pages: number;
      completions: number;
      eligibleMinutes: number;
    }
  > = {};

  const MIN_MINUTES = 2;
  const MIN_PAGES = 5;
  const DAILY_CAP = 60;
  const COMPLETION_BONUS = 5;

  // Track per-user-per-book-per-day for caps
  const userBookDay: Record<string, number> = {};

  for (const event of events) {
    const bookId = event.book_id;
    const userId = event.user_id;
    const eventDate = event.started_at.slice(0, 10);
    const key = `${userId}-${bookId}-${eventDate}`;

    if (!bookEvents[bookId]) {
      bookEvents[bookId] = {
        sessions: 0,
        users: new Set(),
        minutes: 0,
        pages: 0,
        completions: 0,
        eligibleMinutes: 0,
      };
    }

    const book = bookEvents[bookId];
    book.sessions++;
    book.users.add(userId);
    book.minutes += event.minutes_read || 0;
    book.pages += event.pages_read || 0;
    if (event.completed) book.completions++;

    // Check eligibility
    if (event.minutes_read >= MIN_MINUTES || event.pages_read >= MIN_PAGES) {
      const currentDayMinutes = userBookDay[key] || 0;
      const remaining = Math.max(0, DAILY_CAP - currentDayMinutes);
      const eligible = Math.min(event.minutes_read || 0, remaining);
      userBookDay[key] = currentDayMinutes + eligible;
      book.eligibleMinutes += eligible;
    }
  }

  // Upsert engagement records
  for (const [bookId, data] of Object.entries(bookEvents)) {
    const engagementUnits =
      data.eligibleMinutes + data.completions * COMPLETION_BONUS;

    await supabase.from("book_engagement_monthly").upsert(
      {
        period_month: periodMonth,
        book_id: bookId,
        total_sessions: data.sessions,
        unique_users: data.users.size,
        total_minutes: data.minutes,
        total_pages: data.pages,
        total_completions: data.completions,
        eligible_minutes: data.eligibleMinutes,
        engagement_units: engagementUnits,
        calculated_at: new Date().toISOString(),
      },
      {
        onConflict: "period_month,book_id",
      }
    );
  }

  revalidatePath("/admin/payouts");
  return { success: true, books_processed: Object.keys(bookEvents).length };
}

// ============================================================
// PAYOUT MANAGEMENT
// ============================================================

/**
 * Get all payouts (with filters)
 */
export async function getAllPayouts(filters?: {
  status?: string;
  type?: string;
  period_id?: string;
  author_id?: string;
}) {
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("payouts")
    .select(
      `
      *,
      author:authors(
        id,
        bio,
        payout_email,
        user:profiles(display_name, email)
      ),
      period:revenue_periods(period_month),
      purchase:purchases(book:books(title))
    `
    )
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.period_id) query = query.eq("period_id", filters.period_id);
  if (filters?.author_id) query = query.eq("author_id", filters.author_id);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching payouts:", error);
    return [];
  }

  return data;
}

/**
 * Approve payout
 */
export async function approvePayout(payoutId: string) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("payouts")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", payoutId)
    .eq("status", "pending");

  if (error) {
    console.error("Error approving payout:", error);
    throw new Error("Failed to approve payout");
  }

  revalidatePath("/admin/payouts");
  return { success: true };
}

/**
 * Bulk approve payouts
 */
export async function bulkApprovePayouts(payoutIds: string[]) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("payouts")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .in("id", payoutIds)
    .eq("status", "pending");

  if (error) {
    console.error("Error bulk approving payouts:", error);
    throw new Error("Failed to approve payouts");
  }

  revalidatePath("/admin/payouts");
  return { success: true };
}

/**
 * Mark payout as paid
 */
export async function markPayoutPaid(
  payoutId: string,
  payoutReference?: string
) {
  const { supabase } = await requireAdmin();

  const { data: payout, error: fetchError } = await supabase
    .from("payouts")
    .select("author_id, amount")
    .eq("id", payoutId)
    .single();

  if (fetchError || !payout) {
    throw new Error("Payout not found");
  }

  const { error } = await supabase
    .from("payouts")
    .update({
      status: "paid",
      payout_reference: payoutReference,
      paid_at: new Date().toISOString(),
    })
    .eq("id", payoutId)
    .eq("status", "approved");

  if (error) {
    console.error("Error marking payout paid:", error);
    throw new Error("Failed to mark payout as paid");
  }

  // Update author balances
  await supabase
    .from("authors")
    .update({
      pending_balance: supabase.rpc("decrement", {
        value: payout.amount,
      }),
      total_earned: supabase.rpc("increment", {
        value: payout.amount,
      }),
    })
    .eq("id", payout.author_id);

  revalidatePath("/admin/payouts");
  return { success: true };
}

/**
 * Cancel payout
 */
export async function cancelPayout(payoutId: string, reason?: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("payouts")
    .update({
      status: "cancelled",
      failed_reason: reason,
    })
    .eq("id", payoutId)
    .in("status", ["pending", "approved"]);

  if (error) {
    console.error("Error cancelling payout:", error);
    throw new Error("Failed to cancel payout");
  }

  revalidatePath("/admin/payouts");
  return { success: true };
}

// ============================================================
// DASHBOARD STATS
// ============================================================

/**
 * Get payout dashboard stats
 */
export async function getPayoutDashboardStats() {
  const { supabase } = await requireAdmin();

  // Get current period
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: currentPeriod } = await supabase
    .from("revenue_periods")
    .select("*, creator_pool:creator_pools(*)")
    .eq("period_month", currentMonth)
    .single();

  // Get pending payouts
  const { count: pendingCount } = await supabase
    .from("payouts")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { data: pendingAmount } = await supabase
    .from("payouts")
    .select("amount")
    .eq("status", "pending");

  // Get approved payouts
  const { count: approvedCount } = await supabase
    .from("payouts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  // Get this month's total paid
  const { data: paidThisMonth } = await supabase
    .from("payouts")
    .select("amount")
    .eq("status", "paid")
    .gte("paid_at", `${currentMonth}-01`);

  // Get active authors count
  const { count: activeAuthors } = await supabase
    .from("authors")
    .select("*", { count: "exact", head: true })
    .eq("author_type", "third_party")
    .neq("payout_model", "none");

  return {
    current_period: currentPeriod,
    pending_payouts: pendingCount || 0,
    pending_amount:
      pendingAmount?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
    approved_payouts: approvedCount || 0,
    paid_this_month:
      paidThisMonth?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
    active_authors: activeAuthors || 0,
  };
}
