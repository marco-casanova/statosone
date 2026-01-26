# F) Author Tool UX Spec

## Overview

The Author Tool is a drag-and-drop book builder that enables authors to create structured digital picture books. It supports two page layout modes (canvas and flow), multiple block types, asset management, and a review-based publish workflow.

---

## Information Architecture

```
/author                          # Dashboard
/author/books                    # Book list
/author/books/new                # Create new book
/author/books/[id]               # Book overview
/author/books/[id]/edit          # Page builder (default: first page)
/author/books/[id]/pages/[pageId]  # Edit specific page
/author/books/[id]/settings      # Book settings
/author/books/[id]/preview       # Full preview (both modes)
/author/assets                   # Asset library
/author/settings                 # Author profile
```

---

## Page Builder Interface

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DreamNest Author Studio           [Preview] [Save] [Settings] [Avatar] │
├────────────────┬────────────────────────────────────────┬───────────────┤
│                │                                        │               │
│   BLOCK        │                                        │   BLOCK       │
│   PALETTE      │                                        │   PROPERTIES  │
│                │                                        │               │
│  ┌──────────┐  │         CANVAS / PREVIEW AREA         │   ┌─────────┐ │
│  │ T  Text  │  │                                        │   │ Content │ │
│  └──────────┘  │   ┌────────────────────────────────┐   │   ├─────────┤ │
│  ┌──────────┐  │   │                                │   │   │ Position│ │
│  │ 🖼 Image │  │   │                                │   │   ├─────────┤ │
│  └──────────┘  │   │      Selected Block            │   │   │ Style   │ │
│  ┌──────────┐  │   │      [Resize Handles]          │   │   └─────────┘ │
│  │ 🎬 Video │  │   │                                │   │               │
│  └──────────┘  │   │                                │   │   z-index: 2  │
│  ┌──────────┐  │   └────────────────────────────────┘   │   rotation: 0 │
│  │ ✨ Anim  │  │                                        │               │
│  └──────────┘  │                                        │   [Duplicate] │
│  ┌──────────┐  │                                        │   [Delete]    │
│  │ 👆Hotspot│  │                                        │               │
│  └──────────┘  │                                        │               │
│                │                                        │               │
│  ─────────────│                                        │               │
│                │                                        │               │
│   ASSET        │                                        │               │
│   LIBRARY      │                                        │               │
│   [Upload]     │                                        │               │
│   [Images ▼]   │                                        │               │
│   ┌───┐ ┌───┐  │                                        │               │
│   │   │ │   │  │                                        │               │
│   └───┘ └───┘  │                                        │               │
│                │                                        │               │
├────────────────┴────────────────────────────────────────┴───────────────┤
│  PAGE THUMBNAILS                                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                            │
│  │  1  │  │  2  │  │  3  │  │  4  │  │  +  │  [Reorder] [Delete Page]   │
│  │ *** │  │     │  │     │  │     │  │     │                            │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Block Types

### 1. Text Block

**Purpose:** Display text content (titles, paragraphs, dialogue)

**Content Schema:**

```typescript
interface TextBlockContent {
  text: string; // Plain text
  html?: string; // Rich text HTML (optional)
}
```

**Style Options:**

- Font family (select from approved list)
- Font size (12-72px, scaled to canvas)
- Font weight (normal, bold)
- Font style (normal, italic)
- Text color (color picker)
- Background color (optional)
- Text alignment (left, center, right)
- Vertical alignment (top, middle, bottom)
- Line height (1.0-2.5)
- Padding (0-50px)
- Border radius (0-24px)

**Editor Features:**

- Inline rich text editing (bold, italic)
- Direct text input on canvas
- Character count display

---

### 2. Image Block

**Purpose:** Display illustrations, photos

**Content Schema:**

```typescript
interface ImageBlockContent {
  asset_id: string; // Reference to assets table
  alt_text: string; // Accessibility
}
```

**Style Options:**

- Object fit (contain, cover, fill)
- Border radius (0-100px)
- Border width and color
- Box shadow
- Opacity (0-100%)

**Editor Features:**

- Click to select from asset library
- Drag asset from library to canvas
- Image preview in properties panel
- Edit alt text inline

---

### 3. Video Block

**Purpose:** Embedded video clips (short animations, author messages)

**Content Schema:**

```typescript
interface VideoBlockContent {
  asset_id: string; // Reference to video asset
  autoplay: boolean; // Auto-play when page loads
  loop: boolean; // Loop playback
  muted: boolean; // Muted by default
  poster_asset_id?: string; // Thumbnail image
}
```

**Style Options:**

- Border radius
- Box shadow
- Controls visibility

**Editor Features:**

- Upload video or select from library
- Set poster frame
- Configure playback options

---

### 4. Animation Block

**Purpose:** Lottie/SVG animations for interactive elements

**Content Schema:**

```typescript
interface AnimationBlockContent {
  asset_id: string; // Lottie JSON or animated SVG
  autoplay: boolean;
  loop: boolean;
  play_on_hover: boolean;
}
```

**Style Options:**

- Opacity
- Play speed (0.5x - 2x)

**Editor Features:**

- Upload Lottie JSON
- Preview animation
- Set playback behavior

---

### 5. Hotspot Block

**Purpose:** Interactive touch targets for sounds, tooltips, navigation

**Content Schema:**

```typescript
interface HotspotBlockContent {
  action: "play_sound" | "show_tooltip" | "navigate";
  target_asset_id?: string; // Sound to play
  tooltip_text?: string; // Tooltip content
  target_page_index?: number; // Navigate to page
}
```

**Style Options:**

- Shape (circle, rectangle)
- Background color (usually semi-transparent)
- Border color and width
- Pulse animation (on/off)
- Visibility (visible or hidden until hover)

**Editor Features:**

- Draw hotspot area on canvas
- Configure action type
- Select sound from library
- Enter tooltip text
- Preview interaction

---

## Layout Modes

### Canvas Mode (Default)

**Description:** Blocks are freely positioned on a 2D canvas using normalized coordinates (0-1).

**Behavior:**

- Drag blocks anywhere on canvas
- Resize with corner/edge handles
- Rotate with rotation handle
- Z-index controls layering
- Responsive: coordinates scale to any screen size

**Coordinates:**

```typescript
interface CanvasLayout {
  x: number; // 0-1, left edge position
  y: number; // 0-1, top edge position
  width: number; // 0-1, relative to canvas width
  height: number; // 0-1, relative to canvas height
  rotation: number; // degrees
  z_index: number; // layer order
}
```

**Canvas Reference Size:**

- Design width: 1024px (default)
- Design height: 768px (default)
- Stored in `books.design_width` and `books.design_height`
- Used for preview scaling, not actual rendering

---

### Flow Mode

**Description:** Blocks render in vertical order (like a document). Useful for text-heavy pages.

**Behavior:**

- Blocks stack vertically by `block_index`
- No x/y positioning (ignored)
- Width can be set (full, half, auto)
- Alignment via style (left, center, right)
- No overlapping

**Layout for Flow:**

```typescript
interface FlowLayout {
  width: "full" | "half" | "auto";
  alignment: "left" | "center" | "right";
  margin_top: number; // pixels
  margin_bottom: number;
  z_index: number; // still used for special effects
}
```

---

## Asset Library

### Interface

```
┌─────────────────────────────────────────┐
│  MY ASSETS                     [Upload] │
├─────────────────────────────────────────┤
│  [All] [Images] [Audio] [Video] [Anim]  │
├─────────────────────────────────────────┤
│  Search: [________________] 🔍          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │ img │  │ img │  │ img │  │ img │    │
│  │  1  │  │  2  │  │  3  │  │  4  │    │
│  └─────┘  └─────┘  └─────┘  └─────┘    │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │ 🔊  │  │ 🔊  │  │ 🎬  │  │ ✨  │    │
│  │audio│  │audio│  │video│  │anim │    │
│  └─────┘  └─────┘  └─────┘  └─────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Features

1. **Upload**

   - Drag & drop zone
   - File picker
   - Supported formats:
     - Images: JPG, PNG, WebP, SVG, GIF
     - Audio: MP3, WAV, OGG
     - Video: MP4, WebM
     - Animation: Lottie JSON
   - Max file sizes:
     - Images: 10MB
     - Audio: 50MB
     - Video: 100MB
     - Animation: 5MB

2. **Organization**

   - Filter by type
   - Search by filename
   - Sort by date, name, size

3. **Actions**

   - Preview (click to enlarge/play)
   - Edit metadata (alt text, name)
   - Delete (with confirmation)
   - Usage indicator (shows where asset is used)

4. **Integration**
   - Drag asset directly to canvas
   - Click asset to insert at cursor
   - Asset picker modal for block properties

---

## Autosave

### Strategy

**Debounced Autosave:**

- Trigger save 2 seconds after last change
- Visual indicator: "Saving..." → "All changes saved"
- Conflict resolution: Last write wins (single author per book)

### What Gets Saved

| Entity                     | Trigger          | Endpoint                          |
| -------------------------- | ---------------- | --------------------------------- |
| Block content/layout/style | Any block change | `PATCH /blocks/[id]`              |
| Block position (drag)      | Drag end         | `PATCH /blocks/[id]`              |
| Block creation             | Drop new block   | `POST /blocks`                    |
| Block deletion             | Delete action    | `DELETE /blocks/[id]`             |
| Page settings              | Settings change  | `PATCH /pages/[id]`               |
| Page order                 | Reorder pages    | `PATCH /books/[id]/pages/reorder` |

### Optimistic Updates

- UI updates immediately
- Save happens in background
- On error: Show toast, retry, or revert

### Save Status Indicator

```
┌──────────────────────────┐
│  ✓ All changes saved     │  ← Success state
│  ⟳ Saving...             │  ← Saving state
│  ⚠ Failed to save        │  ← Error state (with retry)
└──────────────────────────┘
```

---

## Narration Editor

### Per-Page Narration Panel

```
┌─────────────────────────────────────────┐
│  PAGE NARRATION                         │
├─────────────────────────────────────────┤
│                                         │
│  ○ Recorded Audio    ● Text-to-Speech   │
│                                         │
│  ─────── RECORDED ───────               │
│  [Upload Audio File]                    │
│  Current: narration_p1.mp3 [▶] [✕]     │
│                                         │
│  ─────── TTS ───────                    │
│  Narration Text:                        │
│  ┌─────────────────────────────────┐   │
│  │ Once upon a time, in a cozy    │   │
│  │ little burrow, lived a bunny   │   │
│  │ named Bella...                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Voice: [Sophia (Warm) ▼]              │
│  [▶ Preview TTS]                        │
│                                         │
│  Duration: 12.5s (auto-detected)        │
│                                         │
└─────────────────────────────────────────┘
```

### Features

1. **Recorded Audio**

   - Upload MP3/WAV
   - Play preview
   - Auto-detect duration
   - Replace/remove audio

2. **Text-to-Speech**

   - Enter narration text
   - Select voice (from TTS provider)
   - Preview generated speech
   - Auto-calculate duration

3. **Timing**
   - Auto-advance uses narration duration
   - Fallback to page `auto_advance_delay_ms`
   - Manual override option

---

## Preview Mode

### Access

- Button in editor toolbar: [Preview]
- Full-screen preview opens in modal/new tab
- Toggle between Manual and Auto modes

### Preview Controls

```
┌─────────────────────────────────────────────────────────────────┐
│  PREVIEW                                            [✕ Close]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Manual Mode] [Auto Mode]           Device: [Desktop ▼]        │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │                                                           │  │
│  │                    BOOK PREVIEW                           │  │
│  │                                                           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [◄ Prev]  Page 3 of 12  [Next ►]       [▶ Play] [⏸ Pause]     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Features

- **Manual Mode:** Navigate with arrows, click blocks
- **Auto Mode:** Play/pause, narration plays, auto-advance
- **Device Preview:** Desktop (1024x768), Tablet (768x1024), Phone (375x667)
- **Interaction Testing:** Hotspots, videos, animations work in preview

---

## Publish Workflow

### Status Flow

```
                ┌──────────────────────────────────────────┐
                │                                          │
                ▼                                          │
┌─────────┐   Submit   ┌───────────┐   Approve   ┌───────────────┐
│  DRAFT  │ ─────────► │ IN_REVIEW │ ──────────► │   PUBLISHED   │
└─────────┘            └───────────┘             └───────────────┘
     ▲                       │                          │
     │                       │ Reject                   │ Archive
     │                       ▼                          ▼
     │                 ┌───────────┐             ┌───────────────┐
     └─────────────────│  (DRAFT)  │             │   ARCHIVED    │
        Edit & Resubmit└───────────┘             └───────────────┘
```

### Submit for Review

**Pre-submit Checklist (Auto-validated):**

- [ ] At least 5 pages
- [ ] All pages have at least one block
- [ ] Cover image set
- [ ] Title and description filled
- [ ] Age range selected
- [ ] At least one category assigned

**Submit Action:**

1. Click "Submit for Review"
2. Show checklist validation
3. If valid: Confirm dialog
4. On confirm: Status → `in_review`, `submitted_at` = now
5. Notify admins (email/in-app)

### While In Review

- Author can view but NOT edit
- "Pending Review" badge displayed
- Estimated review time shown

### Review Outcomes

**Approved:**

- Status → `published`
- `published_at` = now
- Book appears in public library
- Author notified

**Rejected:**

- Status → `draft`
- `rejection_reason` set
- Author notified with feedback
- Author can edit and resubmit

---

## Keyboard Shortcuts

| Action          | Shortcut               |
| --------------- | ---------------------- |
| Save            | `⌘/Ctrl + S`           |
| Undo            | `⌘/Ctrl + Z`           |
| Redo            | `⌘/Ctrl + Shift + Z`   |
| Delete selected | `Delete` / `Backspace` |
| Duplicate block | `⌘/Ctrl + D`           |
| Select all      | `⌘/Ctrl + A`           |
| Deselect        | `Escape`               |
| Preview         | `⌘/Ctrl + P`           |
| Next page       | `Page Down`            |
| Previous page   | `Page Up`              |
| Bring forward   | `⌘/Ctrl + ]`           |
| Send backward   | `⌘/Ctrl + [`           |
| Bring to front  | `⌘/Ctrl + Shift + ]`   |
| Send to back    | `⌘/Ctrl + Shift + [`   |

---

## Responsive Considerations

### Author Tool Responsiveness

- **Desktop (1200px+):** Full three-panel layout
- **Tablet (768-1199px):** Collapsible side panels
- **Mobile:** Not recommended, show "Use desktop for best experience"

### Canvas Responsiveness (Reader)

The normalized coordinate system ensures blocks scale proportionally:

```typescript
// Convert normalized to pixel coordinates
function toPixels(
  normalized: { x: number; y: number; width: number; height: number },
  viewport: { width: number; height: number }
) {
  return {
    left: normalized.x * viewport.width,
    top: normalized.y * viewport.height,
    width: normalized.width * viewport.width,
    height: normalized.height * viewport.height,
  };
}
```

---

## Error Handling

| Error           | User Message                             | Recovery                                |
| --------------- | ---------------------------------------- | --------------------------------------- |
| Save failed     | "Failed to save. Retrying..."            | Auto-retry 3x, then manual retry button |
| Upload failed   | "Upload failed. Please try again."       | Show retry button                       |
| Asset too large | "File exceeds 10MB limit."               | Show compression tips                   |
| Invalid format  | "Unsupported file type."                 | List supported formats                  |
| Session expired | "Session expired. Please log in."        | Redirect to login, preserve draft       |
| Network offline | "You're offline. Changes saved locally." | Sync when back online                   |
