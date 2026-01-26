"use server";

import { createClient, getUser, getSession } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { UserRole } from "@/types";

/**
 * Sign up with email and password
 */
export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    return { error: error.message };
  }

  // Check if email confirmation is required
  if (data.user && !data.session) {
    return {
      success: true,
      message: "Check your email for confirmation link",
    };
  }

  revalidatePath("/", "layout");
  redirect("/app");
}

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo || "/app");
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error("OAuth error:", error);
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Failed to initiate OAuth" };
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Reset password (send email)
 */
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    console.error("Reset password error:", error);
    return { error: error.message };
  }

  return { success: true, message: "Check your email for reset link" };
}

/**
 * Update password (after reset)
 */
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Update password error:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/app");
}

/**
 * Get current user profile
 */
export async function getCurrentProfile() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const fullName = formData.get("fullName") as string;
  const avatarUrl = formData.get("avatarUrl") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }

  // Also update auth metadata
  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      avatar_url: avatarUrl,
    },
  });

  revalidatePath("/app/settings");
  return { success: true };
}

/**
 * Delete account
 */
export async function deleteAccount() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Note: This requires admin privileges in production
  // Should trigger cascade delete via RLS policies
  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Error deleting account:", error);
    return { error: "Failed to delete account. Please contact support." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Get user role
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getCurrentProfile();
  return profile?.role || null;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

/**
 * Check if user is author (or admin)
 */
export async function isAuthor(): Promise<boolean> {
  const role = await getUserRole();
  return role === "author" || role === "admin";
}

/**
 * Request author role
 */
export async function requestAuthorRole() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // In a real app, this might create a request for admin approval
  // For MVP, we'll auto-approve
  const { error } = await supabase
    .from("profiles")
    .update({ role: "author" })
    .eq("id", user.id);

  if (error) {
    console.error("Error requesting author role:", error);
    return { error: "Failed to request author role" };
  }

  revalidatePath("/app");
  revalidatePath("/author");
  return { success: true };
}

/**
 * Handle auth callback (OAuth or email confirmation)
 */
export async function handleAuthCallback(code: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error);
    return { error: error.message };
  }

  return { success: true };
}
