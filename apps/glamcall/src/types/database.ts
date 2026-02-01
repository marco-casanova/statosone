// Database types for GlamCall
// Auto-generated types matching Supabase schema

export type ConsultantStatus = "pending" | "approved" | "rejected" | "inactive";
export type BookingStatus = "scheduled" | "completed" | "cancelled" | "no-show";
export type CallStatus = "in-progress" | "completed" | "missed" | "dropped";

export interface Consultant {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  bio: string | null;
  languages: string[];
  experience_years: number;
  status: ConsultantStatus;
  hourly_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  qr_code_url: string | null;
  contact_email: string;
  contact_phone: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  consultant_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  consultant_id: string;
  store_id: string;
  customer_name: string | null;
  customer_email: string | null;
  start_time: string;
  end_time: string | null;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Call {
  id: string;
  consultant_id: string;
  store_id: string;
  booking_id: string | null;
  room_name: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  status: CallStatus;
  customer_feedback: number | null; // 1-5 rating
  notes: string | null;
  created_at: string;
}

export interface Assignment {
  id: string;
  consultant_id: string;
  store_id: string;
  hourly_rate: number | null; // Override default rate
  assigned_at: string;
  is_active: boolean;
}

export interface ProductRecommendation {
  id: string;
  call_id: string;
  product_name: string;
  product_sku: string | null;
  product_price: number | null;
  notes: string | null;
  created_at: string;
}

// Extended types with relations
export interface ConsultantWithAvailability extends Consultant {
  availability: Availability[];
}

export interface ConsultantWithAssignments extends Consultant {
  assignments: (Assignment & { store: Store })[];
}

export interface CallWithDetails extends Call {
  consultant: Consultant;
  store: Store;
  recommendations: ProductRecommendation[];
}

export interface StoreWithConsultants extends Store {
  assignments: (Assignment & { consultant: Consultant })[];
}

// Form types
export interface ConsultantApplicationForm {
  name: string;
  email: string;
  phone: string;
  bio: string;
  languages: string[];
  experience_years: number;
  preferred_hours: string;
}

export interface StoreForm {
  name: string;
  address: string;
  city: string;
  country: string;
  contact_email: string;
  contact_phone: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard stats
export interface DashboardStats {
  totalConsultants: number;
  activeConsultants: number;
  pendingApplications: number;
  totalStores: number;
  callsToday: number;
  totalCallsThisMonth: number;
  totalMinutesThisMonth: number;
  averageCallDuration: number;
  revenueThisMonth: number;
}

export interface ConsultantStats {
  totalCalls: number;
  totalMinutes: number;
  averageRating: number;
  earningsThisMonth: number;
  callsThisWeek: number;
}
