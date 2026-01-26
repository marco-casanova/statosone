// ============================================================
// DreamNest Library - API Types
// ============================================================

import type {
  Book,
  BookPage,
  PageBlock,
  Category,
  Kid,
  ReadingSession,
  Bookmark,
  Subscription,
  Asset,
  BookFilters,
} from "./database";

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// Book API Types
// ============================================================

export interface ListBooksResponse {
  books: BookListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookListItem {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: Book["status"];
  age_min: number;
  age_max: number;
  page_count: number;
  estimated_read_time_minutes: number | null;
  is_featured: boolean;
  published_at: string | null;
  cover_url: string | null;
  author: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  categories: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  }[];
}

export interface BookDetailResponse {
  book: BookListItem & {
    design_width: number;
    design_height: number;
    language: string;
    author: {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
      bio: string | null;
    };
  };
  pages: PageWithBlocks[];
  isPreviewOnly: boolean;
  totalPages: number;
  readingSession?: {
    current_page_index: number;
    mode: ReadingSession["mode"];
    is_completed: boolean;
  } | null;
  bookmarks: number[];
}

export interface PageWithBlocks {
  id: string;
  page_index: number;
  layout_mode: BookPage["layout_mode"];
  background_color: string | null;
  background_url: string | null;
  auto_advance_delay_ms: number | null;
  blocks: BlockWithAssets[];
  narration: {
    mode: "recorded" | "tts";
    audio_url: string | null;
    tts_text: string | null;
    duration_ms: number | null;
  } | null;
}

export interface BlockWithAssets extends PageBlock {
  asset_url?: string | null;
}

// ============================================================
// Checkout API Types
// ============================================================

export interface CreateCheckoutRequest {
  priceId: string;
}

export interface CreateCheckoutResponse {
  url: string;
  sessionId: string;
}

export interface CreatePortalResponse {
  url: string;
}

// ============================================================
// Reading Session API Types
// ============================================================

export interface UpdateSessionRequest {
  bookId: string;
  kidId?: string | null;
  currentPageIndex?: number;
  mode?: ReadingSession["mode"];
  isCompleted?: boolean;
  totalTimeSeconds?: number;
}

export interface UpdateSessionResponse {
  session: ReadingSession;
}

// ============================================================
// Bookmark API Types
// ============================================================

export interface CreateBookmarkRequest {
  bookId: string;
  pageIndex: number;
  note?: string;
}

export interface DeleteBookmarkRequest {
  bookId: string;
  pageIndex: number;
}

// ============================================================
// Author API Types
// ============================================================

export interface AuthorBookListItem {
  id: string;
  title: string;
  status: Book["status"];
  page_count: number;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  published_at: string | null;
  rejection_reason: string | null;
}

export interface CreateBookRequest {
  title: string;
  subtitle?: string;
  description?: string;
  ageMin?: number;
  ageMax?: number;
  categoryIds?: string[];
}

export interface CreateBookResponse {
  book: Book;
  firstPage: BookPage;
}

export interface UpdateBlockRequest {
  blockId: string;
  content?: PageBlock["content"];
  layout?: PageBlock["layout"];
  style?: PageBlock["style"];
  blockIndex?: number;
}

export interface ReorderBlocksRequest {
  pageId: string;
  blockIds: string[];
}

export interface ReorderPagesRequest {
  bookId: string;
  pageIds: string[];
}

export interface SubmitForReviewRequest {
  bookId: string;
}

// ============================================================
// Admin API Types
// ============================================================

export interface ReviewQueueItem {
  id: string;
  title: string;
  author: {
    id: string;
    display_name: string | null;
    email: string | null;
  };
  page_count: number;
  submitted_at: string;
  cover_url: string | null;
}

export interface PublishBookRequest {
  bookId: string;
}

export interface RejectBookRequest {
  bookId: string;
  reason: string;
}

// ============================================================
// Asset API Types
// ============================================================

export interface UploadAssetRequest {
  file: File;
  type: Asset["type"];
  altText?: string;
}

export interface UploadAssetResponse {
  asset: Asset;
  url: string;
}

export interface AssetListItem {
  id: string;
  type: Asset["type"];
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  alt_text: string | null;
  url: string;
  created_at: string;
}

// ============================================================
// Kids API Types
// ============================================================

export interface CreateKidRequest {
  name: string;
  birthDate?: string;
}

export interface UpdateKidRequest {
  name?: string;
  birthDate?: string;
  avatarUrl?: string | null;
}

export interface KidWithProgress extends Kid {
  books_read: number;
  total_reading_time: number;
  current_books: {
    book_id: string;
    title: string;
    cover_url: string | null;
    progress: number; // percentage
  }[];
}

// ============================================================
// User API Types
// ============================================================

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: "parent" | "author" | "admin";
  subscription: {
    status: Subscription["status"];
    plan: "monthly" | "yearly" | null;
    trial_end: string | null;
    current_period_end: string | null;
  } | null;
  author?: {
    id: string;
    bio: string | null;
    is_verified: boolean;
  } | null;
}

// ============================================================
// Stripe Webhook Types
// ============================================================

export interface StripeWebhookPayload {
  type: string;
  data: {
    object: unknown;
  };
}
