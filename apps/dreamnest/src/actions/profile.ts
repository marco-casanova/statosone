"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get current user's profile
 */
export async function getProfile() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email, avatar_url, role")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Update current user's profile
 */
export async function updateProfile(input: {
  displayName?: string;
  avatarUrl?: string;
}) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.displayName !== undefined) {
    updates.display_name = input.displayName;
  }
  if (input.avatarUrl !== undefined) {
    updates.avatar_url = input.avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }

  // Also update auth metadata
  if (input.displayName) {
    await supabase.auth.updateUser({
      data: { display_name: input.displayName },
    });
  }

  revalidatePath("/app/settings");
  return { success: true };
}

/**
 * Get author profile with both profile and author data
 */
export async function getAuthorProfile() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email, avatar_url, role")
    .eq("id", user.id)
    .single();

  // Get author data
  const { data: author } = await supabase
    .from("authors")
    .select("id, bio, website_url, is_verified")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    bio: author?.bio || "",
    website_url: author?.website_url || "",
    is_verified: author?.is_verified || false,
    author_id: author?.id || null,
  };
}

/**
 * Update author profile (both profile and author tables)
 */
export async function updateAuthorProfile(input: {
  displayName?: string;
  bio?: string;
  websiteUrl?: string;
  avatarUrl?: string;
}) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Update profile table
  if (input.displayName !== undefined || input.avatarUrl !== undefined) {
    const profileUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.displayName !== undefined) {
      profileUpdate.display_name = input.displayName;
    }
    if (input.avatarUrl !== undefined) {
      profileUpdate.avatar_url = input.avatarUrl;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return { error: "Failed to update profile" };
    }
  }

  // Update author table
  if (input.bio !== undefined || input.websiteUrl !== undefined) {
    // First check if author record exists
    const { data: existingAuthor } = await supabase
      .from("authors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const authorUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.bio !== undefined) {
      authorUpdate.bio = input.bio;
    }
    if (input.websiteUrl !== undefined) {
      authorUpdate.website_url = input.websiteUrl;
    }

    if (existingAuthor) {
      // Update existing
      const { error: authorError } = await supabase
        .from("authors")
        .update(authorUpdate)
        .eq("user_id", user.id);

      if (authorError) {
        console.error("Error updating author:", authorError);
        return { error: "Failed to update author profile" };
      }
    } else {
      // Create new author record
      const { error: authorError } = await supabase.from("authors").insert({
        user_id: user.id,
        bio: input.bio || null,
        website_url: input.websiteUrl || null,
        is_verified: false,
      });

      if (authorError) {
        console.error("Error creating author:", authorError);
        return { error: "Failed to create author profile" };
      }
    }
  }

  // Also update auth metadata for display name
  if (input.displayName) {
    await supabase.auth.updateUser({
      data: {
        display_name: input.displayName,
      },
    });
  }

  revalidatePath("/author/settings");
  revalidatePath("/author");
  revalidatePath("/app/settings");
  return { success: true };
}

/**
 * Get public author profile by author ID
 */
export async function getPublicAuthorProfile(authorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("authors")
    .select(
      `
      id,
      bio,
      website_url,
      is_verified,
      profiles!inner(display_name, avatar_url)
    `
    )
    .eq("id", authorId)
    .single();

  if (error) {
    console.error("Error fetching author profile:", error);
    return null;
  }

  const profile = data.profiles as unknown as {
    display_name: string;
    avatar_url: string;
  };

  return {
    id: data.id,
    bio: data.bio,
    website_url: data.website_url,
    is_verified: data.is_verified,
    display_name: profile?.display_name || "Unknown Author",
    avatar_url: profile?.avatar_url || null,
  };
}
