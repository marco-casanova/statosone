# H) Implementation Plan

## Folder Structure

```
dreamnest/
├── .env.local                      # Environment variables
├── .env.example                    # Example env template
├── next.config.mjs                 # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
├── package.json
│
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── fonts/                      # Custom fonts
│
├── supabase/
│   ├── config.toml                 # Supabase local config
│   └── migrations/
│       ├── 00001_enums.sql
│       ├── 00002_tables.sql
│       ├── 00003_functions.sql
│       ├── 00004_triggers.sql
│       ├── 00005_rls_policies.sql
│       ├── 00006_storage.sql
│       └── 00007_seed.sql
│
├── src/
│   ├── app/
│   │   ├── (marketing)/            # Public marketing pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── library/
│   │   │   │   └── page.tsx        # Public library preview
│   │   │   └── books/
│   │   │       └── [id]/
│   │   │           └── page.tsx    # Book preview page
│   │   │
│   │   ├── (auth)/                 # Auth pages
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts        # OAuth callback
│   │   │
│   │   ├── (app)/                  # Parent/subscriber app
│   │   │   ├── layout.tsx          # App shell with nav
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── library/
│   │   │   │   └── page.tsx        # Full library
│   │   │   ├── books/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Book detail
│   │   │   │       └── read/
│   │   │   │           └── page.tsx # Reader
│   │   │   ├── kids/
│   │   │   │   ├── page.tsx        # Kids list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Kid profile
│   │   │   ├── bookmarks/
│   │   │   │   └── page.tsx
│   │   │   ├── subscription/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── author/                 # Author portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Author dashboard
│   │   │   ├── books/
│   │   │   │   ├── page.tsx        # My books
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # Create book
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Book overview
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx # Page builder
│   │   │   │       └── settings/
│   │   │   │           └── page.tsx
│   │   │   ├── assets/
│   │   │   │   └── page.tsx        # Asset library
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/                  # Admin panel
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Admin dashboard
│   │   │   ├── books/
│   │   │   │   ├── page.tsx        # Review queue
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Review book
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   └── categories/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts        # Create Stripe checkout
│   │   │   ├── billing/
│   │   │   │   └── portal/
│   │   │   │       └── route.ts    # Stripe billing portal
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts    # Stripe webhooks
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx              # Root layout
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── nav.tsx
│   │   │
│   │   ├── marketing/
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   ├── pricing-card.tsx
│   │   │   ├── testimonials.tsx
│   │   │   └── faq.tsx
│   │   │
│   │   ├── library/
│   │   │   ├── book-card.tsx
│   │   │   ├── book-grid.tsx
│   │   │   ├── filter-sidebar.tsx
│   │   │   ├── age-filter.tsx
│   │   │   ├── category-filter.tsx
│   │   │   └── search-bar.tsx
│   │   │
│   │   ├── reader/
│   │   │   ├── reader-container.tsx
│   │   │   ├── page-renderer.tsx
│   │   │   ├── block-renderer.tsx
│   │   │   ├── text-block.tsx
│   │   │   ├── image-block.tsx
│   │   │   ├── video-block.tsx
│   │   │   ├── animation-block.tsx
│   │   │   ├── hotspot-block.tsx
│   │   │   ├── narration-player.tsx
│   │   │   ├── reader-controls.tsx
│   │   │   ├── thumbnail-drawer.tsx
│   │   │   └── progress-bar.tsx
│   │   │
│   │   ├── editor/
│   │   │   ├── editor-canvas.tsx
│   │   │   ├── block-palette.tsx
│   │   │   ├── block-properties.tsx
│   │   │   ├── asset-library.tsx
│   │   │   ├── asset-picker.tsx
│   │   │   ├── page-thumbnails.tsx
│   │   │   ├── narration-editor.tsx
│   │   │   ├── draggable-block.tsx
│   │   │   ├── resize-handles.tsx
│   │   │   └── editor-toolbar.tsx
│   │   │
│   │   ├── kids/
│   │   │   ├── kid-card.tsx
│   │   │   ├── kid-form.tsx
│   │   │   └── kid-picker.tsx
│   │   │
│   │   └── shared/
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       ├── subscription-gate.tsx
│   │       ├── trial-banner.tsx
│   │       └── empty-state.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser client
│   │   │   ├── server.ts           # Server client
│   │   │   ├── middleware.ts       # Auth middleware helper
│   │   │   └── admin.ts            # Service role client
│   │   │
│   │   ├── stripe/
│   │   │   ├── client.ts           # Stripe instance
│   │   │   ├── checkout.ts         # Checkout helpers
│   │   │   └── webhooks.ts         # Webhook handlers
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts               # classnames helper
│   │   │   ├── format.ts           # Date/number formatting
│   │   │   └── coordinates.ts      # Normalized coord helpers
│   │   │
│   │   └── constants.ts            # App constants
│   │
│   ├── hooks/
│   │   ├── use-supabase.ts
│   │   ├── use-user.ts
│   │   ├── use-subscription.ts
│   │   ├── use-books.ts
│   │   ├── use-book.ts
│   │   ├── use-reading-session.ts
│   │   ├── use-bookmarks.ts
│   │   ├── use-kids.ts
│   │   ├── use-autosave.ts
│   │   ├── use-narration.ts
│   │   └── use-editor.ts
│   │
│   ├── actions/                    # Server actions
│   │   ├── books.ts
│   │   ├── pages.ts
│   │   ├── blocks.ts
│   │   ├── assets.ts
│   │   ├── reading-sessions.ts
│   │   ├── bookmarks.ts
│   │   ├── kids.ts
│   │   ├── subscriptions.ts
│   │   └── auth.ts
│   │
│   ├── types/
│   │   ├── database.ts             # Generated Supabase types
│   │   ├── blocks.ts               # Block content/layout/style
│   │   ├── api.ts                  # API request/response types
│   │   └── index.ts                # Re-exports
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── editor-store.ts
│   │   ├── reader-store.ts
│   │   └── app-store.ts
│   │
│   └── middleware.ts               # Next.js middleware
│
└── tests/
    ├── e2e/                        # Playwright tests
    └── unit/                       # Vitest tests
```

---

## Key Components

### Reader Components

| Component         | Purpose                            | Props                                    |
| ----------------- | ---------------------------------- | ---------------------------------------- |
| `ReaderContainer` | Main reader wrapper, handles modes | `bookId`, `initialPage`                  |
| `PageRenderer`    | Renders single page with blocks    | `page`, `layoutMode`                     |
| `BlockRenderer`   | Routes to correct block type       | `block`                                  |
| `TextBlock`       | Renders text with styles           | `content`, `style`, `layout`             |
| `ImageBlock`      | Renders image from asset           | `content`, `style`, `layout`             |
| `VideoBlock`      | Video player with controls         | `content`, `style`, `layout`             |
| `HotspotBlock`    | Interactive hotspot                | `content`, `style`, `layout`, `onAction` |
| `NarrationPlayer` | Audio playback controls            | `audioUrl`, `onEnd`                      |
| `ReaderControls`  | Bottom control bar                 | `mode`, `onModeChange`, `onNavigate`     |
| `ThumbnailDrawer` | Page thumbnail grid                | `pages`, `currentIndex`, `onSelect`      |

### Editor Components

| Component         | Purpose                | Props                            |
| ----------------- | ---------------------- | -------------------------------- |
| `EditorCanvas`    | Main editing canvas    | `page`, `onBlockChange`          |
| `BlockPalette`    | Draggable block types  | `onDragStart`                    |
| `BlockProperties` | Edit selected block    | `block`, `onChange`              |
| `AssetLibrary`    | Browse/upload assets   | `onSelect`                       |
| `AssetPicker`     | Modal asset selector   | `type`, `onSelect`               |
| `PageThumbnails`  | Page list with reorder | `pages`, `onReorder`, `onSelect` |
| `DraggableBlock`  | Block with drag/resize | `block`, `onDrag`, `onResize`    |
| `NarrationEditor` | Edit page narration    | `narration`, `onChange`          |

### Library Components

| Component       | Purpose              | Props                 |
| --------------- | -------------------- | --------------------- |
| `BookCard`      | Book preview card    | `book`, `onClick`     |
| `BookGrid`      | Grid of book cards   | `books`, `loading`    |
| `FilterSidebar` | Age/category filters | `filters`, `onChange` |
| `SearchBar`     | Book search input    | `query`, `onChange`   |

---

## Key Database Queries

### List Books with Filters

```typescript
// actions/books.ts
export async function listBooks(filters: BookFilters) {
  const supabase = createServerClient();

  let query = supabase
    .from("books")
    .select(
      `
      *,
      author:authors(id, user_id, profiles(display_name, avatar_url)),
      cover:assets!cover_asset_id(file_path),
      categories:book_categories(category:categories(*))
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // Age filter
  if (filters.ageMin !== undefined) {
    query = query.gte("age_max", filters.ageMin);
  }
  if (filters.ageMax !== undefined) {
    query = query.lte("age_min", filters.ageMax);
  }

  // Category filter
  if (filters.categoryIds?.length) {
    query = query.in(
      "id",
      supabase
        .from("book_categories")
        .select("book_id")
        .in("category_id", filters.categoryIds)
    );
  }

  // Search
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Pagination
  const from = (filters.page - 1) * filters.limit;
  query = query.range(from, from + filters.limit - 1);

  return query;
}
```

### Get Book with Pages and Blocks

```typescript
// actions/books.ts
export async function getBookDetail(bookId: string, userId?: string) {
  const supabase = createServerClient();

  // Check access level
  const hasSubscription = userId ? await hasActiveSubscription(userId) : false;
  const isAuthor = userId ? await isBookAuthor(userId, bookId) : false;
  const canAccessAll = hasSubscription || isAuthor;

  // Get book
  const { data: book } = await supabase
    .from("books")
    .select(
      `
      *,
      author:authors(
        id,
        bio,
        profiles(display_name, avatar_url)
      ),
      cover:assets!cover_asset_id(file_path),
      categories:book_categories(category:categories(*))
    `
    )
    .eq("id", bookId)
    .single();

  if (!book) return null;

  // Get pages with blocks
  let pagesQuery = supabase
    .from("book_pages")
    .select(
      `
      *,
      blocks:page_blocks(*),
      narration:page_narrations(*)
    `
    )
    .eq("book_id", bookId)
    .order("page_index");

  // Limit pages for non-subscribers
  if (!canAccessAll) {
    pagesQuery = pagesQuery.lt("page_index", 3);
  }

  const { data: pages } = await pagesQuery;

  return {
    ...book,
    pages: pages || [],
    isPreviewOnly: !canAccessAll,
    totalPages: book.page_count,
  };
}
```

### Update Reading Session

```typescript
// actions/reading-sessions.ts
export async function updateReadingSession(
  bookId: string,
  updates: Partial<ReadingSession>
) {
  const supabase = createServerClient();
  const user = await getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("reading_sessions")
    .upsert(
      {
        user_id: user.id,
        book_id: bookId,
        kid_id: updates.kidId,
        current_page_index: updates.currentPageIndex,
        mode: updates.mode,
        is_completed: updates.isCompleted,
        completed_at: updates.isCompleted ? new Date().toISOString() : null,
        last_read_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,book_id,kid_id",
      }
    )
    .select()
    .single();

  return data;
}
```

### Author: Update Block

```typescript
// actions/blocks.ts
export async function updateBlock(
  blockId: string,
  updates: {
    content?: BlockContent;
    layout?: BlockLayout;
    style?: BlockStyle;
    block_index?: number;
  }
) {
  const supabase = createServerClient();
  const user = await getUser();

  if (!user) throw new Error("Unauthorized");

  // RLS will verify author owns the block's book
  const { data, error } = await supabase
    .from("page_blocks")
    .update(updates)
    .eq("id", blockId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

---

## API Endpoints

### Stripe Checkout

```typescript
// app/api/checkout/route.ts
export async function POST(request: Request) {
  const { priceId } = await request.json();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create Stripe customer
  let customerId = await getStripeCustomerId(user.id);
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await saveStripeCustomerId(user.id, customerId);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: user.id },
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/app?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?checkout=canceled`,
  });

  return NextResponse.json({ url: session.url });
}
```

### Stripe Webhook

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await handleStripeWebhook(event);

  return NextResponse.json({ received: true });
}
```

---

## Server Actions Summary

| Action                 | File                | Purpose                 |
| ---------------------- | ------------------- | ----------------------- |
| `listBooks`            | books.ts            | List books with filters |
| `getBook`              | books.ts            | Get book detail         |
| `createBook`           | books.ts            | Author creates book     |
| `updateBook`           | books.ts            | Author updates book     |
| `submitForReview`      | books.ts            | Submit book for review  |
| `publishBook`          | books.ts            | Admin publishes book    |
| `createPage`           | pages.ts            | Add page to book        |
| `updatePage`           | pages.ts            | Update page settings    |
| `reorderPages`         | pages.ts            | Change page order       |
| `deletePage`           | pages.ts            | Remove page             |
| `createBlock`          | blocks.ts           | Add block to page       |
| `updateBlock`          | blocks.ts           | Update block            |
| `deleteBlock`          | blocks.ts           | Remove block            |
| `reorderBlocks`        | blocks.ts           | Change block order      |
| `uploadAsset`          | assets.ts           | Upload file to storage  |
| `deleteAsset`          | assets.ts           | Remove asset            |
| `getReadingSession`    | reading-sessions.ts | Get user's session      |
| `updateReadingSession` | reading-sessions.ts | Update progress         |
| `createBookmark`       | bookmarks.ts        | Add bookmark            |
| `deleteBookmark`       | bookmarks.ts        | Remove bookmark         |
| `createKid`            | kids.ts             | Add kid profile         |
| `updateKid`            | kids.ts             | Update kid              |
| `deleteKid`            | kids.ts             | Remove kid              |

---

## State Management

### Editor Store (Zustand)

```typescript
// stores/editor-store.ts
interface EditorState {
  // Current book/page
  bookId: string | null;
  currentPageId: string | null;
  pages: BookPage[];

  // Selection
  selectedBlockId: string | null;

  // UI state
  isPreviewing: boolean;
  isSaving: boolean;
  saveStatus: "saved" | "saving" | "error";

  // Actions
  setCurrentPage: (pageId: string) => void;
  selectBlock: (blockId: string | null) => void;
  updateBlock: (blockId: string, updates: Partial<PageBlock>) => void;
  addBlock: (pageId: string, block: NewBlock) => void;
  deleteBlock: (blockId: string) => void;
  reorderBlocks: (pageId: string, blockIds: string[]) => void;
  saveChanges: () => Promise<void>;
}
```

### Reader Store (Zustand)

```typescript
// stores/reader-store.ts
interface ReaderState {
  // Book data
  book: Book | null;
  pages: BookPage[];

  // Reading state
  currentPageIndex: number;
  mode: "manual" | "auto";
  isPlaying: boolean;

  // Narration
  narrationState: NarrationState;

  // Session
  sessionId: string | null;
  kidId: string | null;

  // Actions
  setPage: (index: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setMode: (mode: "manual" | "auto") => void;
  togglePlay: () => void;
  setKid: (kidId: string | null) => void;
}
```

---

## Environment Variables

```env
# .env.local

# App
NEXT_PUBLIC_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_xxx

# Storage (optional CDN)
NEXT_PUBLIC_STORAGE_URL=https://xxx.supabase.co/storage/v1

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
```

---

## Development Phases

### Phase 1: Foundation (Week 1-2)

- [ ] Project setup (Next.js, Tailwind, Supabase)
- [ ] Database schema + migrations
- [ ] RLS policies
- [ ] Auth (signup, login, logout)
- [ ] Basic profile management

### Phase 2: Library (Week 3-4)

- [ ] Book listing with filters
- [ ] Book detail page
- [ ] Category management (admin)
- [ ] Public library preview

### Phase 3: Reader (Week 5-6)

- [ ] Page renderer (canvas + flow)
- [ ] Block renderers (text, image, video)
- [ ] Manual mode navigation
- [ ] Auto mode with narration
- [ ] Reading session tracking
- [ ] Bookmarks

### Phase 4: Subscriptions (Week 7)

- [ ] Stripe integration
- [ ] Checkout flow
- [ ] Webhook handling
- [ ] Content gating
- [ ] Billing portal

### Phase 5: Author Tool (Week 8-10)

- [ ] Book creation
- [ ] Page builder canvas
- [ ] Block drag & drop
- [ ] Asset library
- [ ] Narration editor
- [ ] Autosave
- [ ] Preview mode
- [ ] Submit for review

### Phase 6: Admin (Week 11)

- [ ] Review queue
- [ ] Book approval/rejection
- [ ] User management
- [ ] Basic analytics

### Phase 7: Polish (Week 12)

- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsiveness
- [ ] Accessibility audit
- [ ] Testing
