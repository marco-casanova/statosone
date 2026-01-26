// ============================================================
// DreamNest Library - Database Types
// ============================================================
// These types mirror the Supabase database schema

// ============================================================
// Enum Types
// ============================================================

export type UserRole = "parent" | "author" | "admin";

export type BookStatus = "draft" | "in_review" | "published" | "archived";

export type PageLayoutMode = "canvas" | "flow";

// Alias for backward compatibility
export type PageMode = PageLayoutMode;

export type BlockType =
  | "text"
  | "image"
  | "video"
  | "animation"
  | "hotspot"
  | "audio"
  | "shape";

export type AssetType = "image" | "audio" | "video" | "animation" | "cover";

export type CategoryType = "theme" | "mood" | "skill";

export type NarrationMode = "recorded" | "tts";

export type ReadingMode = "manual" | "auto";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type SubscriptionTier = "free" | "family" | "premium";

// ============================================================
// Database Row Types
// ============================================================

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  user_id: string;
  bio: string | null;
  website_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Kid {
  id: string;
  parent_id: string;
  name: string;
  birth_date: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  author_id: string;
  type: AssetType;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  alt_text: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  type: CategoryType;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  created_at: string;
}

export interface Book {
  id: string;
  author_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: BookStatus;
  cover_asset_id: string | null;
  design_width: number;
  design_height: number;
  age_min: number;
  age_max: number;
  estimated_read_time_minutes: number | null;
  page_count: number;
  language: string;
  is_featured: boolean;
  submitted_at: string | null;
  published_at: string | null;
  rejection_reason: string | null;
  // Book trim size (from canonical sizes)
  trim_size: string | null;
  custom_width_cm: number | null;
  custom_height_cm: number | null;
  // Template configuration
  primary_template_id: string | null;
  secondary_template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookCategory {
  book_id: string;
  category_id: string;
}

export interface BookPage {
  id: string;
  book_id: string;
  page_index: number;
  layout_mode: PageLayoutMode;
  background_color: string | null;
  background_asset_id: string | null;
  auto_advance_delay_ms: number | null;
  // Page template
  template_id: string | null;
  template_slots: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PageBlock {
  id: string;
  page_id: string;
  type: BlockType;
  block_index: number;
  content: BlockContent;
  layout: BlockLayout;
  style: BlockStyle;
  created_at: string;
  updated_at: string;
}

export interface PageNarration {
  id: string;
  page_id: string;
  mode: NarrationMode;
  audio_asset_id: string | null;
  tts_text: string | null;
  tts_voice: string | null;
  duration_ms: number | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  kid_id: string | null;
  current_page_index: number;
  mode: ReadingMode;
  is_completed: boolean;
  completed_at: string | null;
  total_time_seconds: number;
  last_read_at: string;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  book_id: string;
  page_index: number;
  note: string | null;
  created_at: string;
}

// ============================================================
// Block Content Types (JSONB shapes)
// ============================================================

export type BlockContent =
  | TextBlockContent
  | ImageBlockContent
  | VideoBlockContent
  | AnimationBlockContent
  | HotspotBlockContent;

export interface TextBlockContent {
  text: string;
  html?: string;
}

export interface ImageBlockContent {
  asset_id: string;
  alt_text?: string;
}

export interface VideoBlockContent {
  asset_id: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster_asset_id?: string;
}

export interface AnimationBlockContent {
  asset_id: string;
  autoplay?: boolean;
  loop?: boolean;
  play_on_hover?: boolean;
}

export interface HotspotBlockContent {
  action: "play_sound" | "show_tooltip" | "navigate";
  target_asset_id?: string;
  tooltip_text?: string;
  target_page_index?: number;
}

// ============================================================
// Block Layout Types (JSONB shapes)
// ============================================================

export interface BlockLayout {
  // For canvas mode - normalized coordinates (0-1)
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  z_index?: number;

  // For flow mode
  flow_width?: "full" | "half" | "auto";
  flow_alignment?: "left" | "center" | "right";
  margin_top?: number;
  margin_bottom?: number;
}

// ============================================================
// Block Style Types (JSONB shapes)
// ============================================================

export type BlockStyle =
  | TextBlockStyle
  | ImageBlockStyle
  | VideoBlockStyle
  | AnimationBlockStyle
  | HotspotBlockStyle;

export interface TextBlockStyle {
  font_family?: string;
  font_size?: number;
  font_weight?: "normal" | "bold";
  font_style?: "normal" | "italic";
  text_align?: "left" | "center" | "right";
  vertical_align?: "top" | "middle" | "bottom";
  color?: string;
  background_color?: string | null;
  padding?: number;
  border_radius?: number;
  line_height?: number;
  letter_spacing?: number;
}

export interface ImageBlockStyle {
  object_fit?: "contain" | "cover" | "fill";
  border_radius?: number;
  border_width?: number;
  border_color?: string | null;
  shadow?: string | null;
  opacity?: number;
}

export interface VideoBlockStyle {
  border_radius?: number;
  shadow?: string | null;
  show_controls?: boolean;
}

export interface AnimationBlockStyle {
  opacity?: number;
  play_speed?: number;
}

export interface HotspotBlockStyle {
  shape?: "circle" | "rectangle";
  background_color?: string;
  border_color?: string;
  border_width?: number;
  pulse_animation?: boolean;
  visibility?: "visible" | "hidden";
}

// ============================================================
// Joined/Extended Types (for queries with relations)
// ============================================================

export interface BookWithRelations extends Book {
  author?: AuthorWithProfile;
  cover?: Asset | null;
  categories?: CategoryRelation[];
  pages?: BookPageWithRelations[];
}

export interface AuthorWithProfile extends Author {
  profiles?: Profile;
}

export interface CategoryRelation {
  category: Category;
}

export interface BookPageWithRelations extends BookPage {
  blocks?: PageBlock[];
  narration?: PageNarration | null;
}

export interface ReadingSessionWithRelations extends ReadingSession {
  book?: Book;
  kid?: Kid | null;
}

export interface BookmarkWithRelations extends Bookmark {
  book?: Book;
}

// ============================================================
// Input Types (for mutations)
// ============================================================

export interface CreateBookInput {
  title: string;
  subtitle?: string;
  description?: string;
  age_min?: number;
  age_max?: number;
  design_width?: number;
  design_height?: number;
  language?: string;
  category_ids?: string[];
  trim_size?: string;
  primary_template_id?: string;
  secondary_template_id?: string;
}

export interface UpdateBookInput {
  title?: string;
  subtitle?: string;
  description?: string;
  age_min?: number;
  age_max?: number;
  cover_asset_id?: string | null;
  design_width?: number;
  design_height?: number;
  language?: string;
  is_featured?: boolean;
  status?: BookStatus;
  rejection_reason?: string;
  trim_size?: string | null;
  custom_width_cm?: number | null;
  custom_height_cm?: number | null;
  primary_template_id?: string | null;
  secondary_template_id?: string | null;
}

export interface CreatePageInput {
  book_id: string;
  page_index?: number;
  mode?: PageLayoutMode;
  layout_mode?: PageLayoutMode;
  background_color?: string;
  background_asset_id?: string;
  audio_narration_id?: string;
  auto_advance_delay_ms?: number;
  template_id?: string;
  template_slots?: Record<string, unknown>;
}

export interface UpdatePageInput {
  mode?: PageLayoutMode;
  layout_mode?: PageLayoutMode;
  background_color?: string;
  background_asset_id?: string | null;
  audio_narration_id?: string | null;
  auto_advance_delay_ms?: number;
  template_id?: string | null;
  template_slots?: Record<string, unknown> | null;
}

// Alias for backward compatibility
export type UpsertPageInput = CreatePageInput;

export interface CreateBlockInput {
  page_id: string;
  type: BlockType;
  block_index: number;
  content: BlockContent;
  layout?: BlockLayout;
  style?: BlockStyle;
}

export interface UpdateBlockInput {
  block_index?: number;
  content?: BlockContent;
  layout?: BlockLayout;
  style?: BlockStyle;
}

export interface CreateAssetInput {
  type: AssetType;
  file_path: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  alt_text?: string;
}

export interface CreateKidInput {
  name: string;
  birth_date?: string;
  avatar_url?: string;
}

export interface UpdateKidInput {
  name?: string;
  birth_date?: string;
  avatar_url?: string | null;
}

export interface UpsertReadingSessionInput {
  book_id: string;
  kid_id?: string | null;
  current_page_index?: number;
  mode?: ReadingMode;
  is_completed?: boolean;
  total_time_seconds?: number;
}

export interface CreateBookmarkInput {
  book_id: string;
  page_index: number;
  note?: string;
}

// ============================================================
// Filter Types (for queries)
// ============================================================

export interface BookFilters {
  status?: BookStatus;
  age_min?: number;
  age_max?: number;
  category?: string;
  category_ids?: string[];
  author_id?: string;
  ageGroup?: string;
  search?: string;
  is_featured?: boolean;
  page?: number;
  limit?: number;
}

export interface AssetFilters {
  type?: AssetType;
  search?: string;
  page?: number;
  limit?: number;
}
