# G) Reader UX Spec

## Overview

The Reader is the core experience for parents and kids consuming books. It supports two reading modes (Manual and Auto), narration playback, progress tracking, and accessibility features.

---

## Reader Interface

### Full-Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Library          "The Brave Little Bunny"          [👤 Bella]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                                                                          │
│                                                                          │
│                                                                          │
│                         ┌────────────────────────┐                       │
│                         │                        │                       │
│  [◄]                    │    PAGE CONTENT        │                    [►]│
│                         │    (Canvas/Flow)       │                       │
│                         │                        │                       │
│                         │                        │                       │
│                         └────────────────────────┘                       │
│                                                                          │
│                                                                          │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Mode: [Manual ▼]   [🔊]   [🔖]   Page 3 of 12   [📖 Thumbnails]        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Controls Bar (Bottom)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  [Manual ▼]  [🔊 100%]  [🔖 Bookmark]  ●●●○○○○○○○○○  3/12  [📖]  [⚙]   │
│                                                                          │
│  ─── AUTO MODE CONTROLS (when auto selected) ───                        │
│  [⏮] [◄◄] [▶ Play/⏸ Pause] [►►] [⏭]     ═══════════●═══ 0:45/1:23     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Manual Mode

### Description

Parent or child controls page navigation. Narration can be played on-demand but pages don't auto-advance.

### Interactions

| Action          | Trigger                              | Result                         |
| --------------- | ------------------------------------ | ------------------------------ |
| Next page       | Click right arrow, swipe left, → key | Animate to next page           |
| Previous page   | Click left arrow, swipe right, ← key | Animate to previous page       |
| Play narration  | Click 🔊 button                      | Play current page narration    |
| Stop narration  | Click 🔊 again (while playing)       | Stop narration                 |
| Add bookmark    | Click 🔖                             | Save bookmark for current page |
| Open thumbnails | Click 📖                             | Show page thumbnail grid       |
| Jump to page    | Click thumbnail                      | Navigate to selected page      |

### Navigation Animations

- **Slide:** Default, page slides left/right
- **Fade:** Cross-fade between pages
- **Flip:** 3D page flip effect (optional, future)

---

## Auto Mode

### Description

Narration plays automatically, pages advance after narration completes. Designed for hands-free bedtime reading.

### Playback Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTO MODE FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks [▶ Play]                                        │
│                                                                  │
│  2. Current page narration starts                               │
│     └── If no narration: use auto_advance_delay_ms              │
│                                                                  │
│  3. Narration completes                                          │
│     └── Brief pause (500ms)                                     │
│                                                                  │
│  4. Advance to next page                                         │
│     └── Page transition animation                               │
│                                                                  │
│  5. Repeat from step 2                                           │
│                                                                  │
│  6. On last page: narration plays, then [▶ Replay] shown        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Auto Mode Controls

| Control    | Icon    | Action                                |
| ---------- | ------- | ------------------------------------- |
| Play/Pause | ▶ / ⏸   | Start/pause auto playback             |
| Previous   | ⏮       | Go to start of current page narration |
| Rewind     | ◄◄      | Go to previous page                   |
| Forward    | ►►      | Skip to next page                     |
| Next       | ⏭       | Go to last page                       |
| Progress   | ═══●═══ | Scrub through current narration       |
| Volume     | 🔊      | Adjust narration volume               |

### Override Behavior

Even in Auto mode, user can:

- Pause playback anytime
- Navigate manually (pauses auto)
- Resume auto from new position

---

## Narration

### Audio Playback

```typescript
interface NarrationState {
  isPlaying: boolean;
  currentTime: number; // seconds
  duration: number; // seconds
  volume: number; // 0-1
  isMuted: boolean;
}
```

### Narration Sources

1. **Recorded Audio** (`narration_mode = 'recorded'`)

   - Load from `audio_asset_id`
   - Play via HTML5 Audio

2. **Text-to-Speech** (`narration_mode = 'tts'`)
   - Generate from `tts_text` using TTS API
   - Cache generated audio
   - Play via HTML5 Audio or Web Speech API

### Timing

- Narration duration from `page_narrations.duration_ms`
- Fallback: `book_pages.auto_advance_delay_ms` (default 5000ms)
- User can adjust playback speed: 0.75x, 1x, 1.25x, 1.5x

### Volume Control

- Slider: 0-100%
- Mute toggle
- Remember preference per session

---

## Progress Tracking

### Reading Session Data

```typescript
interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  kid_id: string | null; // Optional kid profile
  current_page_index: number;
  mode: "manual" | "auto";
  is_completed: boolean;
  completed_at: Date | null;
  total_time_seconds: number;
  last_read_at: Date;
}
```

### Progress Updates

| Event            | Action                                          |
| ---------------- | ----------------------------------------------- |
| Page turn        | Update `current_page_index`                     |
| Every 30 seconds | Increment `total_time_seconds`                  |
| Reach last page  | Set `is_completed = true`, `completed_at = now` |
| Close reader     | Save final state                                |
| Mode switch      | Update `mode`                                   |

### Kid Profile Integration

- On reader open: Prompt "Who's reading?" if multiple kids
- Select kid profile to track individual progress
- Dashboard shows per-kid reading history

### Continue Reading

```
┌─────────────────────────────────────────┐
│  Continue Reading                        │
├─────────────────────────────────────────┤
│  ┌─────┐                                │
│  │cover│  The Brave Little Bunny        │
│  │     │  Page 7 of 12 • Bella          │
│  └─────┘  [Continue Reading]            │
├─────────────────────────────────────────┤
│  ┌─────┐                                │
│  │cover│  Ocean Adventures              │
│  │     │  Page 3 of 20 • Max            │
│  └─────┘  [Continue Reading]            │
└─────────────────────────────────────────┘
```

---

## Bookmarks

### Creating Bookmarks

1. Click 🔖 icon in controls bar
2. Bookmark saved for current page
3. Visual confirmation: "Page bookmarked!"
4. Icon changes to filled: 🔖 → 📑

### Viewing Bookmarks

**In Reader:**

- Bookmarked pages show indicator in thumbnail view
- Jump to bookmark from thumbnail

**In Dashboard (/app/bookmarks):**

```
┌─────────────────────────────────────────┐
│  My Bookmarks                            │
├─────────────────────────────────────────┤
│  ┌─────┐                                │
│  │page │  The Brave Little Bunny        │
│  │thumb│  Page 7 - "Bella found..."     │
│  └─────┘  Jan 2, 2026  [Go] [Remove]    │
├─────────────────────────────────────────┤
│  ┌─────┐                                │
│  │page │  Ocean Adventures              │
│  │thumb│  Page 15 - "The whale..."      │
│  └─────┘  Jan 1, 2026  [Go] [Remove]    │
└─────────────────────────────────────────┘
```

### Bookmark Data

```typescript
interface Bookmark {
  id: string;
  user_id: string;
  book_id: string;
  page_index: number;
  note: string | null; // Optional user note
  created_at: Date;
}
```

---

## Thumbnail Navigation

### Thumbnail Drawer

```
┌─────────────────────────────────────────────────────────────────┐
│  Pages                                               [✕ Close]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │  1  │  │  2  │  │  3  │  │  4  │  │  5  │  │  6  │         │
│  │     │  │     │  │ 📑  │  │     │  │     │  │     │         │
│  │ ●   │  │     │  │     │  │     │  │     │  │     │         │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘         │
│  current  ────────  bookmarked                                  │
│                                                                  │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │  7  │  │  8  │  │  9  │  │ 10  │  │ 11  │  │ 12  │         │
│  │     │  │     │  │     │  │     │  │     │  │ 🏁  │         │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘         │
│                                                     last page   │
└─────────────────────────────────────────────────────────────────┘
```

### Features

- Grid of page thumbnails
- Current page highlighted
- Bookmark indicators
- Click to jump to page
- Swipe to scroll on mobile
- Lazy load thumbnails

---

## Accessibility

### Current Features

| Feature             | Implementation                              |
| ------------------- | ------------------------------------------- |
| Keyboard navigation | ←/→ for pages, Space for play/pause         |
| Screen reader       | ARIA labels on all controls                 |
| Alt text            | Images have `alt_text` from content         |
| Focus indicators    | Visible focus rings on interactive elements |
| Reduced motion      | Respects `prefers-reduced-motion`           |

### Text Scaling (Phase 1)

```
┌─────────────────────────────────────────┐
│  Text Size                              │
├─────────────────────────────────────────┤
│                                         │
│  [A-] ───────●─────── [A+]              │
│                                         │
│  Preview: "Once upon a time..."         │
│                                         │
└─────────────────────────────────────────┘
```

- Slider to adjust text block font size
- Range: 80% - 150% of base size
- Stored in user preferences
- Applied to all text blocks

### High Contrast (Future)

- Toggle in settings
- Increases contrast ratios
- Adjusts colors for visibility

### Dyslexia-Friendly (Future)

- OpenDyslexic font option
- Increased letter spacing
- Colored overlays

---

## Interactive Elements

### Hotspots

When user taps a hotspot:

| Action Type    | Behavior                          |
| -------------- | --------------------------------- |
| `play_sound`   | Play short audio clip             |
| `show_tooltip` | Display text tooltip near hotspot |
| `navigate`     | Jump to specified page            |

### Videos

- Tap to play/pause
- Controls appear on hover/tap
- Muted by default (until user interaction)

### Animations

- Auto-play when page loads (if configured)
- Tap to restart animation
- Respects reduced motion preference

---

## Gestures (Mobile/Tablet)

| Gesture          | Action                     |
| ---------------- | -------------------------- |
| Swipe left       | Next page                  |
| Swipe right      | Previous page              |
| Tap left edge    | Previous page              |
| Tap right edge   | Next page                  |
| Tap center       | Toggle controls visibility |
| Pinch            | Zoom (future)              |
| Long press block | Show info/interaction      |

---

## Settings Menu

### Reader Settings

```
┌─────────────────────────────────────────┐
│  Reader Settings                 [Done] │
├─────────────────────────────────────────┤
│                                         │
│  Default Mode                           │
│  ○ Manual    ● Auto                     │
│                                         │
│  Text Size                              │
│  [A-] ───────●─────── [A+]              │
│                                         │
│  Narration Speed                        │
│  [0.75x] [1x] [1.25x] [1.5x]           │
│                                         │
│  Page Animation                         │
│  [Slide ▼]                              │
│                                         │
│  Auto-play Videos                       │
│  [Toggle: OFF]                          │
│                                         │
│  Show Page Numbers                      │
│  [Toggle: ON]                           │
│                                         │
└─────────────────────────────────────────┘
```

### Settings Persistence

- Stored in localStorage + user profile
- Sync across devices when logged in
- Per-book overrides possible (future)

---

## Book Completion

### End-of-Book Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                           🎉                                     │
│                                                                  │
│               You finished reading                               │
│           "The Brave Little Bunny"!                             │
│                                                                  │
│                    Reading time: 8 min                          │
│                                                                  │
│            ⭐⭐⭐⭐⭐  Rate this book                           │
│                                                                  │
│              [Read Again]  [Back to Library]                    │
│                                                                  │
│        ─────── You might also like ───────                      │
│                                                                  │
│        ┌─────┐  ┌─────┐  ┌─────┐                               │
│        │rec 1│  │rec 2│  │rec 3│                               │
│        └─────┘  └─────┘  └─────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Completion Actions

1. Mark session as completed
2. Show completion screen
3. Request optional rating
4. Show recommendations
5. Award badge (future gamification)

---

## Offline Reading (Future)

### Download for Offline

- Download button on book detail page
- Downloads: pages, blocks, assets, narration
- Stored in IndexedDB/Cache API
- Sync progress when online

### Offline Indicators

- Downloaded books show ✓ badge
- "Available Offline" filter in library
- Warning when opening non-downloaded book offline

---

## Performance Considerations

### Asset Loading

- **Lazy Load:** Load pages as user approaches
- **Preload:** Preload next 2 pages
- **Image Optimization:** Serve WebP with fallbacks
- **Audio Streaming:** Stream narration, don't download all

### Rendering

- **Canvas Mode:** CSS transforms for positioning
- **Virtual Scrolling:** For thumbnail grid
- **Debounce:** Progress save every 2 seconds max

### Memory Management

- Unload pages far from current
- Limit preloaded assets
- Clear audio buffers when not in use
