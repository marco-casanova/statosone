# A) Information Architecture + User Flows

## Route Structure

### Public Routes (No Auth Required)

```
/                           # Landing page (conversion-focused)
/login                      # Login page
/signup                     # Signup page (parent or author selection)
/library                    # Public library browse (preview mode)
/books/[id]                 # Book detail page (preview info)
/pricing                    # Pricing page with plans
/about                      # About DreamNest
/authors                    # Author showcase / become an author
```

### Parent/Subscriber Routes (Auth Required)

```
/app                        # Dashboard (continue reading, recommendations)
/app/library                # Full library with filters
/app/books/[id]             # Book detail (subscriber view)
/app/books/[id]/read        # Reader (manual/auto modes)
/app/kids                   # Manage kid profiles
/app/kids/[id]              # Kid profile detail + progress
/app/bookmarks              # All bookmarks
/app/settings               # Account settings
/app/subscription           # Manage subscription
```

### Author Routes (Auth Required + Author Role)

```
/author                     # Author dashboard (my books, stats)
/author/books               # List my books
/author/books/new           # Create new book
/author/books/[id]          # Book overview (pages, settings)
/author/books/[id]/edit     # Page builder/editor
/author/books/[id]/pages/[pageId]  # Edit specific page
/author/assets              # Asset library
/author/settings            # Author profile settings
```

### Admin Routes (Auth Required + Admin Role)

```
/admin                      # Admin dashboard
/admin/books                # All books (review queue)
/admin/books/[id]           # Review/publish book
/admin/users                # User management
/admin/authors              # Author management
/admin/categories           # Category management
/admin/subscriptions        # Subscription overview
```

### API Routes

```
/api/auth/callback          # Supabase auth callback
/api/webhooks/stripe        # Stripe webhook endpoint
/api/checkout               # Create Stripe checkout session
/api/billing/portal         # Create Stripe billing portal session
```

---

## User Flows

### Flow 1: Parent Discovery → Subscription

```
┌─────────────────────────────────────────────────────────────────┐
│                         DISCOVERY PHASE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Land on / (homepage)                                        │
│     ├── See hero: "Magical bedtime stories..."                  │
│     ├── Browse featured books preview                           │
│     └── CTA: "Start Free Trial" or "Browse Library"            │
│                                                                  │
│  2. Browse /library (public preview)                            │
│     ├── See book covers, titles, age ranges                     │
│     ├── Filter by age (2-4, 4-6, 6-8)                          │
│     ├── Filter by category (Adventure, Bedtime, Learning)       │
│     └── Click book → /books/[id] (preview page)                │
│                                                                  │
│  3. View /books/[id] (book preview)                             │
│     ├── See cover, description, page count                      │
│     ├── Preview first 2-3 pages (blurred rest)                 │
│     └── CTA: "Subscribe to Read" → /signup                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       CONVERSION PHASE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  4. Signup /signup                                               │
│     ├── Choose role: "I'm a Parent" (default)                   │
│     ├── Enter email, password                                    │
│     ├── Agree to terms                                          │
│     └── Submit → Create account → /pricing                      │
│                                                                  │
│  5. Choose plan /pricing                                         │
│     ├── Monthly: $9.99/month                                    │
│     ├── Yearly: $79.99/year (save 33%)                         │
│     └── Click "Start Trial" → Stripe Checkout                  │
│                                                                  │
│  6. Stripe Checkout (external)                                   │
│     ├── Enter payment info                                       │
│     ├── 7-day free trial starts                                 │
│     └── Success → Redirect to /app                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ENGAGEMENT PHASE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  7. Onboarding /app (first time)                                │
│     ├── "Add your first child" modal                            │
│     ├── Enter kid name, age                                      │
│     └── Get personalized recommendations                        │
│                                                                  │
│  8. Browse full library /app/library                            │
│     ├── All filters available                                    │
│     ├── Smart recommendations based on kid age                  │
│     └── Click book → /app/books/[id]                           │
│                                                                  │
│  9. Read book /app/books/[id]/read                              │
│     ├── Choose mode: Manual or Auto                             │
│     ├── Select kid profile for progress tracking                │
│     ├── Read/listen to story                                     │
│     ├── Bookmark pages                                           │
│     └── Progress auto-saved                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: Author Book Creation

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTHOR ONBOARDING                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Signup as Author /signup                                     │
│     ├── Select "I'm an Author"                                  │
│     ├── Enter email, password                                    │
│     └── Submit → /author (author dashboard)                     │
│                                                                  │
│  2. Complete Author Profile /author/settings                    │
│     ├── Display name, bio                                        │
│     ├── Profile image                                            │
│     └── Payout info (future)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        BOOK CREATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  3. Create New Book /author/books/new                           │
│     ├── Enter title, description                                 │
│     ├── Select age range (2-4, 4-6, 6-8)                       │
│     ├── Choose categories                                        │
│     ├── Set canvas size (default 1024x768)                      │
│     └── Save → Creates book + first page → /author/books/[id]  │
│                                                                  │
│  4. Upload Assets /author/assets                                 │
│     ├── Drag & drop images, audio, video                        │
│     ├── Organize in folders                                      │
│     └── Assets available across all books                       │
│                                                                  │
│  5. Build Pages /author/books/[id]/edit                         │
│     │                                                            │
│     │  ┌─────────────────────────────────────────┐              │
│     │  │  PAGE BUILDER CANVAS                     │              │
│     │  │                                          │              │
│     │  │  [Toolbar: Text|Image|Video|Hotspot]    │              │
│     │  │                                          │              │
│     │  │  ┌──────────────────────────────┐       │              │
│     │  │  │                              │       │              │
│     │  │  │     Drag & Drop Blocks       │       │              │
│     │  │  │     on Canvas                │       │              │
│     │  │  │                              │       │              │
│     │  │  └──────────────────────────────┘       │              │
│     │  │                                          │              │
│     │  │  [Page Thumbnails: 1 | 2 | 3 | + ]      │              │
│     │  │                                          │              │
│     │  └─────────────────────────────────────────┘              │
│     │                                                            │
│     ├── Add text blocks (rich text editor)                      │
│     ├── Add image blocks (from asset library)                   │
│     ├── Add video/animation blocks                              │
│     ├── Add hotspots (interactive elements)                     │
│     ├── Position blocks via drag & drop                         │
│     ├── Resize with handles                                      │
│     ├── Set z-index (layer order)                               │
│     └── Autosave every 2 seconds (debounced)                    │
│                                                                  │
│  6. Add Narration /author/books/[id]/pages/[pageId]             │
│     ├── Option A: Upload recorded audio                         │
│     ├── Option B: Enter text for TTS generation                 │
│     └── Set timing markers (optional)                           │
│                                                                  │
│  7. Preview Book                                                 │
│     ├── Preview manual mode                                      │
│     ├── Preview auto mode with narration                        │
│     └── Test on different screen sizes                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        PUBLISH WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  8. Submit for Review                                            │
│     ├── Click "Submit for Review"                               │
│     ├── Book status: draft → in_review                          │
│     └── Notification sent to admin                              │
│                                                                  │
│  9. Admin Review /admin/books/[id]                              │
│     ├── Admin views full book                                    │
│     ├── Check content guidelines                                 │
│     ├── Approve → status: published                             │
│     └── Reject → status: draft + feedback                       │
│                                                                  │
│  10. Published                                                   │
│      ├── Book appears in public library                         │
│      ├── Author gets notification                                │
│      └── Analytics begin tracking                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 3: Admin Review Process

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Admin Dashboard /admin                                       │
│     ├── Pending reviews count                                    │
│     ├── Active users stats                                       │
│     └── Subscription metrics                                     │
│                                                                  │
│  2. Review Queue /admin/books?status=in_review                  │
│     ├── List books awaiting review                              │
│     ├── Sort by submission date                                  │
│     └── Click → /admin/books/[id]                              │
│                                                                  │
│  3. Review Book /admin/books/[id]                               │
│     ├── Full preview (all pages)                                │
│     ├── Author info                                              │
│     ├── Content checklist                                        │
│     ├── Action: Approve / Reject                                │
│     └── If reject: Add feedback message                         │
│                                                                  │
│  4. Category Management /admin/categories                       │
│     ├── Create/edit categories                                   │
│     ├── Set category type (theme/mood/skill)                    │
│     └── Assign icons/colors                                      │
│                                                                  │
│  5. User Management /admin/users                                │
│     ├── Search/filter users                                      │
│     ├── View subscription status                                 │
│     └── Manage roles                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Role-Based Access Matrix

| Resource               | Public | Parent (Free) | Parent (Subscribed) | Author      | Admin |
| ---------------------- | ------ | ------------- | ------------------- | ----------- | ----- |
| Landing page           | ✅     | ✅            | ✅                  | ✅          | ✅    |
| Public library browse  | ✅     | ✅            | ✅                  | ✅          | ✅    |
| Book preview (limited) | ✅     | ✅            | ✅                  | ✅          | ✅    |
| Full book content      | ❌     | ❌            | ✅                  | Own only    | ✅    |
| Reader (manual/auto)   | ❌     | ❌            | ✅                  | Own only    | ✅    |
| Kid profiles           | ❌     | ✅            | ✅                  | ✅          | ❌    |
| Reading progress       | ❌     | ✅            | ✅                  | ✅          | ❌    |
| Bookmarks              | ❌     | ❌            | ✅                  | ✅          | ❌    |
| Author dashboard       | ❌     | ❌            | ❌                  | ✅          | ✅    |
| Book builder           | ❌     | ❌            | ❌                  | ✅          | ✅    |
| Asset library          | ❌     | ❌            | ❌                  | ✅          | ✅    |
| Publish books          | ❌     | ❌            | ❌                  | Submit only | ✅    |
| Admin dashboard        | ❌     | ❌            | ❌                  | ❌          | ✅    |
| User management        | ❌     | ❌            | ❌                  | ❌          | ✅    |
