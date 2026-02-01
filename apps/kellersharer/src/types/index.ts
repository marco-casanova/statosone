// KellerSharer Types

export type UserType = "renter" | "searcher";

export interface KellerProfile {
  id: string;
  user_id: string;
  user_type: UserType;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Space {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  type: SpaceType;
  size_m2: number;
  price_per_m2: number;
  total_price: number;
  address: string;
  city: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  images: string[];
  status: SpaceStatus;
  available_from: string;
  minimum_rental_months: number;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: KellerProfile;
}

export type SpaceType =
  | "basement"
  | "garage"
  | "attic"
  | "storage_room"
  | "warehouse"
  | "parking"
  | "other";

export type SpaceStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "rented"
  | "inactive";

export interface SpaceSearch {
  id: string;
  searcher_id: string;
  title: string;
  description: string;
  preferred_types: SpaceType[];
  min_size_m2: number;
  max_size_m2: number;
  max_budget: number;
  preferred_location: string;
  radius_km: number;
  needed_from: string;
  rental_duration_months: number;
  status: "active" | "matched" | "closed";
  created_at: string;
  updated_at: string;
  // Joined data
  searcher?: KellerProfile;
}

export interface Rental {
  id: string;
  space_id: string;
  renter_id: string;
  searcher_id: string;
  start_date: string;
  end_date: string;
  monthly_price: number;
  status: RentalStatus;
  contract_url?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  space?: Space;
  renter?: KellerProfile;
  searcher?: KellerProfile;
}

export type RentalStatus = "pending" | "active" | "completed" | "cancelled";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  space_id?: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Contract {
  id: string;
  rental_id: string;
  renter_name: string;
  searcher_name: string;
  space_address: string;
  space_description: string;
  size_m2: number;
  monthly_price: number;
  start_date: string;
  end_date: string;
  terms: string;
  renter_signature?: string;
  searcher_signature?: string;
  renter_signed_at?: string;
  searcher_signed_at?: string;
  pdf_url?: string;
  created_at: string;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalSpaces: number;
  activeRentals: number;
  pendingReviews: number;
  monthlyRevenue: number;
}

export interface FlaggedItem {
  id: string;
  type: "space" | "user" | "rental";
  reason: string;
  reported_by: string;
  status: "pending" | "reviewed" | "resolved";
  created_at: string;
}

// Form types
export interface CreateSpaceForm {
  title: string;
  description: string;
  type: SpaceType;
  size_m2: number;
  price_per_m2: number;
  address: string;
  city: string;
  postal_code: string;
  amenities: string[];
  available_from: string;
  minimum_rental_months: number;
}

export interface CreateSearchForm {
  title: string;
  description: string;
  preferred_types: SpaceType[];
  min_size_m2: number;
  max_size_m2: number;
  max_budget: number;
  preferred_location: string;
  radius_km: number;
  needed_from: string;
  rental_duration_months: number;
}
