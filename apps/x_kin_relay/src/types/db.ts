// Minimal runtime table types for CRUD UI (subset of columns)
export interface CareCircle {
  id: string;
  name: string;
  type: string; // circle_type_enum
  created_by: string;
  created_at?: string;
}
export interface CareRecipient {
  id: string;
  circle_id: string;
  display_name: string;
  birth_year?: number | null;
  primary_language?: string | null;
  created_at?: string;
}
export interface Medication {
  id: string;
  recipient_id: string;
  name: string;
  form: string;
  route: string;
  dose?: number | null;
  unit?: string | null;
  active?: boolean;
  created_at?: string;
}
export interface ActivityRow {
  id: string;
  circle_id: string;
  recipient_id: string;
  category: string;
  observed_at: string;
  recorded_by: string;
  subtype_safety?: string | null;
  subtype_observation?: string | null;
  subtype_adl?: string | null;
  subtype_environment?: string | null;
  subtype_service?: string | null;
}
export type CrudEntity =
  | "kr_care_circles"
  | "kr_clients"
  | "kr_medications"
  | "kr_activities";
