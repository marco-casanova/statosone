export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "admin";
export type Material = "PLA" | "PETG" | "RESIN";
export type Quality = "draft" | "standard" | "fine";
export type FileType = "stl" | "obj";
export type OrderStatus =
  | "created"
  | "paid"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";
export type CustomRequestStatus =
  | "submitted"
  | "reviewing"
  | "quoted"
  | "accepted"
  | "rejected";

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      models: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          file_path: string;
          file_type: FileType;
          file_size_bytes: number;
          thumbnail_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          file_path: string;
          file_type: FileType;
          file_size_bytes: number;
          thumbnail_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          file_path?: string;
          file_type?: FileType;
          file_size_bytes?: number;
          thumbnail_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          model_id: string;
          user_id: string;
          material: Material;
          color: string;
          quality: Quality;
          quantity: number;
          price_cents: number;
          base_price_cents: number;
          quality_addon_cents: number;
          quantity_price_cents: number;
          shipping_cents: number;
          total_cents: number;
          currency: string;
          shipping_address: ShippingAddress | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          model_id: string;
          user_id: string;
          material: Material;
          color?: string;
          quality: Quality;
          quantity: number;
          price_cents: number;
          base_price_cents: number;
          quality_addon_cents: number;
          quantity_price_cents: number;
          shipping_cents: number;
          total_cents: number;
          currency?: string;
          shipping_address?: ShippingAddress | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          model_id?: string;
          user_id?: string;
          material?: Material;
          color?: string;
          quality?: Quality;
          quantity?: number;
          price_cents?: number;
          base_price_cents?: number;
          quality_addon_cents?: number;
          quantity_price_cents?: number;
          shipping_cents?: number;
          total_cents?: number;
          currency?: string;
          shipping_address?: ShippingAddress | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          model_id: string;
          quote_id: string;
          status: OrderStatus;
          material: Material;
          color: string;
          quality: Quality;
          quantity: number;
          total_cents: number;
          tracking_token: string;
          shipping_address: ShippingAddress;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          tracking_number: string | null;
          label_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model_id: string;
          quote_id: string;
          status?: OrderStatus;
          material: Material;
          color?: string;
          quality: Quality;
          quantity: number;
          total_cents: number;
          tracking_token?: string;
          shipping_address: ShippingAddress;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          tracking_number?: string | null;
          label_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model_id?: string;
          quote_id?: string;
          status?: OrderStatus;
          material?: Material;
          color?: string;
          quality?: Quality;
          quantity?: number;
          total_cents?: number;
          tracking_token?: string;
          shipping_address?: ShippingAddress;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          tracking_number?: string | null;
          label_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      custom_requests: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          reference_paths: string[];
          status: CustomRequestStatus;
          admin_quote_cents: number | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          reference_paths?: string[];
          status?: CustomRequestStatus;
          admin_quote_cents?: number | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          reference_paths?: string[];
          status?: CustomRequestStatus;
          admin_quote_cents?: number | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [key: string]: never;
    };
    Functions: {
      [key: string]: never;
    };
    Enums: {
      user_role: UserRole;
      material: Material;
      quality: Quality;
      file_type: FileType;
      order_status: OrderStatus;
      custom_request_status: CustomRequestStatus;
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
}

// Helper types for easy access
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Model = Database["public"]["Tables"]["models"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type CustomRequest =
  Database["public"]["Tables"]["custom_requests"]["Row"];
