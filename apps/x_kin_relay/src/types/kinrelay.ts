// KinRelay TypeScript Types
// Generated from Supabase schema

import { Database } from "./db";

// ============================================
// ENUMS
// ============================================

export type UserRole =
  | "family"
  | "specialist"
  | "nurse"
  | "caregiver"
  | "admin";
export type UserStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_approval";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";

// ============================================
// PROFILE TYPES
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  profile_image_url?: string;
  bio?: string;
  specialization?: string;
  certifications?: string[];
  years_of_experience?: number;
  hourly_rate?: number;
  availability?: AvailabilitySchedule;
  languages?: string[];
  is_available_for_hire: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySchedule {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

// ============================================
// CLIENT TYPES
// ============================================

export interface Client {
  id: string;
  family_member_id: string;
  full_name: string;
  date_of_birth: string;
  gender?: string;
  address?: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string[];
  allergies?: string[];
  medications_notes?: string;
  dietary_restrictions?: string;
  mobility_level?: string;
  cognitive_status?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  primary_physician_name?: string;
  primary_physician_phone?: string;
  care_requirements?: string;
  additional_notes?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientWithAssignments extends Client {
  care_assignments: CareAssignment[];
  family_member: Profile;
}

// ============================================
// CARE ASSIGNMENT TYPES
// ============================================

export interface CareAssignment {
  id: string;
  client_id: string;
  specialist_id: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  assignment_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CareAssignmentWithDetails extends CareAssignment {
  client: Client;
  specialist: Profile;
}

// ============================================
// CARE CATEGORY TYPES
// ============================================

export interface CareCategory {
  id: string;
  name: string;
  name_es: string;
  icon?: string;
  color?: string;
  sort_order: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface CareSubcategory {
  id: string;
  category_id: string;
  name: string;
  name_es: string;
  unit?: string;
  input_type: InputType;
  options?: InputOptions;
  is_required: boolean;
  sort_order: number;
  created_at: string;
}

export type InputType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "time"
  | "checkbox"
  | "date";

export interface InputOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  presets?: number[];
}

export interface CareCategoryWithSubcategories extends CareCategory {
  subcategories: CareSubcategory[];
}

// ============================================
// MEDICATION TYPES
// ============================================

export interface Medication {
  id: string;
  client_id: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  frequency_times?: number;
  schedule_times?: string[];
  route?: string;
  prescribing_doctor?: string;
  prescription_number?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  side_effects?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationWithClient extends Medication {
  client: Client;
}

export interface MedicationAdministration {
  id: string;
  medication_id: string;
  client_id: string;
  administered_by?: string;
  scheduled_time: string;
  actual_time?: string;
  dosage_given?: string;
  was_taken: boolean;
  was_refused: boolean;
  refusal_reason?: string;
  side_effects_observed?: string;
  notes?: string;
  created_at: string;
}

export interface MedicationAdministrationWithDetails
  extends MedicationAdministration {
  medication: Medication;
  client: Client;
  administrator?: Profile;
}

// ============================================
// TASK TYPES
// ============================================

export interface Task {
  id: string;
  client_id: string;
  assigned_to?: string;
  category_id?: string;
  subcategory_id?: string;
  task_date: string;
  scheduled_time?: string;
  completed_time?: string;
  status: TaskStatus;
  value?: TaskValue;
  description?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type TaskValue = Record<string, any>;

export interface TaskWithDetails extends Task {
  client: Client;
  assigned_specialist?: Profile;
  category?: CareCategory;
  subcategory?: CareSubcategory;
  creator?: Profile;
}

// ============================================
// INCIDENT TYPES
// ============================================

export interface Incident {
  id: string;
  client_id: string;
  reported_by?: string;
  incident_type: string;
  severity: IncidentSeverity;
  incident_date: string;
  location?: string;
  description: string;
  immediate_action_taken?: string;
  witnesses?: string[];
  injuries_sustained?: string;
  medical_attention_required: boolean;
  medical_attention_details?: string;
  family_notified: boolean;
  family_notification_time?: string;
  follow_up_required: boolean;
  follow_up_notes?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface IncidentWithDetails extends Incident {
  client: Client;
  reporter?: Profile;
}

// ============================================
// BEHAVIOR PATTERN TYPES
// ============================================

export interface BehaviorPattern {
  id: string;
  client_id: string;
  recorded_by?: string;
  behavior_type: string;
  severity?: string;
  trigger?: string;
  antecedent?: string;
  behavior_description: string;
  consequence?: string;
  intervention_used?: string;
  effectiveness?: string;
  duration_minutes?: number;
  time_of_day?: string;
  recorded_at: string;
  created_at: string;
}

export interface BehaviorPatternWithDetails extends BehaviorPattern {
  client: Client;
  recorder?: Profile;
}

// ============================================
// SLEEP PATTERN TYPES
// ============================================

export interface SleepPattern {
  id: string;
  client_id: string;
  recorded_by?: string;
  sleep_date: string;
  bedtime?: string;
  wake_time?: string;
  total_hours?: number;
  quality?: string;
  interruptions: number;
  interruption_reasons?: string[];
  naps?: NapRecord[];
  notes?: string;
  created_at: string;
}

export interface NapRecord {
  start_time: string;
  duration_minutes: number;
}

export interface SleepPatternWithDetails extends SleepPattern {
  client: Client;
  recorder?: Profile;
}

// ============================================
// ACTIVITY LOG TYPES
// ============================================

export interface ActivityLog {
  id: string;
  client_id: string;
  recorded_by?: string;
  category_id?: string;
  log_date: string;
  log_time?: string;
  activity_type: string;
  details: Record<string, any>;
  notes?: string;
  created_at: string;
}

export interface ActivityLogWithDetails extends ActivityLog {
  client: Client;
  recorder?: Profile;
  category?: CareCategory;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  specialist_id: string;
  reviewer_id: string;
  client_id?: string;
  rating: number;
  review_text?: string;
  would_recommend: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithDetails extends Review {
  specialist: Profile;
  reviewer: Profile;
  client?: Client;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  client_id?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  parent_message_id?: string;
  created_at: string;
}

export interface MessageWithDetails extends Message {
  sender: Profile;
  recipient: Profile;
  client?: Client;
  replies?: Message[];
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface SearchFilters {
  role?: UserRole;
  specialization?: string;
  languages?: string[];
  availability?: string;
  minRating?: number;
  maxHourlyRate?: number;
  location?: {
    city?: string;
    state?: string;
    radius?: number;
  };
}

export interface SearchResult {
  profiles: Profile[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// REPORT TYPES
// ============================================

export interface DailyReport {
  client_id: string;
  report_date: string;
  tasks_completed: number;
  tasks_total: number;
  medications_given: number;
  medications_total: number;
  incidents: number;
  activities: ActivitySummary[];
  notes: string[];
}

export interface ActivitySummary {
  category: string;
  category_es: string;
  completed: boolean;
  details: Record<string, any>;
}

export interface WeeklyReport {
  client_id: string;
  week_start: string;
  week_end: string;
  daily_reports: DailyReport[];
  summary: {
    total_tasks: number;
    completed_tasks: number;
    medication_compliance: number;
    total_incidents: number;
    sleep_average_hours: number;
    hydration_average_oz: number;
  };
}

// ============================================
// FORM TYPES
// ============================================

export interface ClientFormData {
  full_name: string;
  date_of_birth: string;
  gender?: string;
  address?: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string[];
  allergies?: string[];
  medications_notes?: string;
  dietary_restrictions?: string;
  mobility_level?: string;
  cognitive_status?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  primary_physician_name?: string;
  primary_physician_phone?: string;
  care_requirements?: string;
  additional_notes?: string;
}

export interface TaskFormData {
  client_id: string;
  category_id: string;
  subcategory_id?: string;
  task_date: string;
  scheduled_time?: string;
  description?: string;
  notes?: string;
  value?: TaskValue;
}

export interface MedicationFormData {
  client_id: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  frequency_times?: number;
  schedule_times?: string[];
  route?: string;
  prescribing_doctor?: string;
  prescription_number?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  side_effects?: string[];
}

export interface IncidentFormData {
  client_id: string;
  incident_type: string;
  severity: IncidentSeverity;
  incident_date: string;
  location?: string;
  description: string;
  immediate_action_taken?: string;
  witnesses?: string[];
  injuries_sustained?: string;
  medical_attention_required: boolean;
  medical_attention_details?: string;
  family_notified: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardData {
  upcomingTasks: TaskWithDetails[];
  todayMedications: MedicationAdministrationWithDetails[];
  recentIncidents: IncidentWithDetails[];
  clientSummaries: ClientSummary[];
}

export interface ClientSummary {
  client: Client;
  todayTasksCompleted: number;
  todayTasksTotal: number;
  lastMedicationTime?: string;
  lastIncident?: Incident;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export type NotificationType =
  | "task_reminder"
  | "medication_due"
  | "incident_reported"
  | "message_received"
  | "review_received"
  | "assignment_new"
  | "assignment_ended";
