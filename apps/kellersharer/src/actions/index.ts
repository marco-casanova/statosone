"use server";

import { createServerClient, getUser, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  KellerProfile,
  Space,
  SpaceSearch,
  Rental,
  CreateSpaceForm,
  CreateSearchForm,
  UserType,
} from "@/types";

// ============ Profile Actions ============

export async function createProfile(userType: UserType, fullName: string) {
  const supabase = await createServerClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("keller_profiles")
    .insert({
      user_id: user.id,
      user_type: userType,
      full_name: fullName,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    return { error: error.message };
  }

  revalidatePath("/app");
  return { data };
}

export async function updateProfile(updates: Partial<KellerProfile>) {
  const supabase = await createServerClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("keller_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return { error: error.message };
  }

  revalidatePath("/app");
  return { data };
}

export async function getCurrentProfile(): Promise<KellerProfile | null> {
  return getProfile();
}

// ============ Space Actions (for Renters) ============

export async function createSpace(form: CreateSpaceForm) {
  const supabase = await createServerClient();
  const user = await getUser();
  const profile = await getProfile();

  if (!user || !profile) {
    return { error: "Unauthorized" };
  }

  if (profile.user_type !== "renter") {
    return { error: "Only renters can create spaces" };
  }

  const totalPrice = form.size_m2 * form.price_per_m2;

  const { data, error } = await supabase
    .from("spaces")
    .insert({
      owner_id: user.id,
      title: form.title,
      description: form.description,
      type: form.type,
      size_m2: form.size_m2,
      price_per_m2: form.price_per_m2,
      total_price: totalPrice,
      address: form.address,
      city: form.city,
      postal_code: form.postal_code,
      amenities: form.amenities,
      available_from: form.available_from,
      minimum_rental_months: form.minimum_rental_months,
      status: "pending_review",
      images: [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating space:", error);
    return { error: error.message };
  }

  revalidatePath("/app");
  return { data };
}

export async function updateSpace(spaceId: string, updates: Partial<Space>) {
  const supabase = await createServerClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("spaces")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", spaceId)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating space:", error);
    return { error: error.message };
  }

  revalidatePath("/app");
  return { data };
}

export async function deleteSpace(spaceId: string) {
  const supabase = await createServerClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("spaces")
    .delete()
    .eq("id", spaceId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error deleting space:", error);
    return { error: error.message };
  }

  revalidatePath("/app");
  return { success: true };
}

export async function getMySpaces(): Promise<Space[]> {
  const supabase = await createServerClient();
  const user = await getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching spaces:", error);
    return [];
  }

  return data || [];
}

export async function getAvailableSpaces(filters?: {
  type?: string;
  city?: string;
  minSize?: number;
  maxPrice?: number;
}): Promise<Space[]> {
  const supabase = await createServerClient();

  let query = supabase
    .from("spaces")
    .select("*, owner:keller_profiles!owner_id(*)")
    .eq("status", "active");

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (filters?.minSize) {
    query = query.gte("size_m2", filters.minSize);
  }
  if (filters?.maxPrice) {
    query = query.lte("total_price", filters.maxPrice);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching spaces:", error);
    return [];
  }

  return data || [];
}

export async function getSpaceById(spaceId: string): Promise<Space | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("spaces")
    .select("*, owner:keller_profiles!owner_id(*)")
    .eq("id", spaceId)
    .single();

  if (error) {
    console.error("Error fetching space:", error);
    return null;
  }

  return data;
}

// ============ Search Actions (for Searchers) ============

export async function createSpaceSearch(form: CreateSearchForm) {
  const supabase = await createServerClient();
  const user = await getUser();
  const profile = await getProfile();

  if (!user || !profile) {
    return { error: "Unauthorized" };
  }

  if (profile.user_type !== "searcher") {
    return { error: "Only searchers can create search profiles" };
  }

  const { data, error } = await supabase
    .from("space_searches")
    .insert({
      searcher_id: user.id,
      title: form.title,
      description: form.description,
      preferred_types: form.preferred_types,
      min_size_m2: form.min_size_m2,
      max_size_m2: form.max_size_m2,
      max_budget: form.max_budget,
      preferred_location: form.preferred_location,
      radius_km: form.radius_km,
      needed_from: form.needed_from,
      rental_duration_months: form.rental_duration_months,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating search:", error);
    return { error: error.message };
  }

  revalidatePath("/app");
  return { data };
}

export async function getMySearches(): Promise<SpaceSearch[]> {
  const supabase = await createServerClient();
  const user = await getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("space_searches")
    .select("*")
    .eq("searcher_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching searches:", error);
    return [];
  }

  return data || [];
}

export async function getActiveSearchers(): Promise<SpaceSearch[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("space_searches")
    .select("*, searcher:keller_profiles!searcher_id(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching searchers:", error);
    return [];
  }

  return data || [];
}

// ============ Rental Actions ============

export async function createRentalRequest(
  spaceId: string,
  startDate: string,
  endDate: string,
) {
  const supabase = await createServerClient();
  const user = await getUser();
  const profile = await getProfile();

  if (!user || !profile) {
    return { error: "Unauthorized" };
  }

  // Get the space to find the owner
  const space = await getSpaceById(spaceId);
  if (!space) {
    return { error: "Space not found" };
  }

  const { data, error } = await supabase
    .from("rentals")
    .insert({
      space_id: spaceId,
      renter_id: space.owner_id,
      searcher_id: user.id,
      start_date: startDate,
      end_date: endDate,
      monthly_price: space.total_price,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating rental:", error);
    return { error: error.message };
  }

  revalidatePath("/app");
  return { data };
}

export async function updateRentalStatus(rentalId: string, status: string) {
  const supabase = await createServerClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("rentals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", rentalId)
    .select()
    .single();

  if (error) {
    console.error("Error updating rental:", error);
    return { error: error.message };
  }

  revalidatePath("/app");
  return { data };
}

export async function getMyRentals(): Promise<Rental[]> {
  const supabase = await createServerClient();
  const user = await getUser();
  const profile = await getProfile();

  if (!user || !profile) return [];

  let query = supabase
    .from("rentals")
    .select(
      "*, space:spaces(*), renter:keller_profiles!renter_id(*), searcher:keller_profiles!searcher_id(*)",
    );

  if (profile.user_type === "renter") {
    query = query.eq("renter_id", user.id);
  } else {
    query = query.eq("searcher_id", user.id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rentals:", error);
    return [];
  }

  return data || [];
}

// ============ Admin Actions ============

export async function getAdminStats() {
  const supabase = await createServerClient();

  const [users, spaces, rentals, pendingSpaces] = await Promise.all([
    supabase.from("keller_profiles").select("id", { count: "exact" }),
    supabase.from("spaces").select("id", { count: "exact" }),
    supabase
      .from("rentals")
      .select("id", { count: "exact" })
      .eq("status", "active"),
    supabase
      .from("spaces")
      .select("id", { count: "exact" })
      .eq("status", "pending_review"),
  ]);

  return {
    totalUsers: users.count || 0,
    totalSpaces: spaces.count || 0,
    activeRentals: rentals.count || 0,
    pendingReviews: pendingSpaces.count || 0,
    monthlyRevenue: 0, // Would calculate from Stripe
  };
}

export async function getPendingSpaces(): Promise<Space[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("spaces")
    .select("*, owner:keller_profiles!owner_id(*)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending spaces:", error);
    return [];
  }

  return data || [];
}

export async function approveSpace(spaceId: string) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("spaces")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", spaceId);

  if (error) {
    console.error("Error approving space:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function rejectSpace(spaceId: string) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("spaces")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", spaceId);

  if (error) {
    console.error("Error rejecting space:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function getAllUsers() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("keller_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data || [];
}
