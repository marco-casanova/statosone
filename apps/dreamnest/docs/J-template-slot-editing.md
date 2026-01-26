# Template Slot Editing Guide

## Overview

Templates define fixed content slots (text, images, videos, audio) that must be filled according to age-appropriate rules. This guide explains how to edit and upload content for each template.

## How It Works

### 1. Book-Level Templates (Book Tab)

- **Location**: Right Properties Panel → Book Tab
- **Purpose**: Configure which templates the entire book uses
- **Settings**:
  - **Primary Template**: Main structure (e.g., PICTURE_HEAVY, BALANCED)
  - **Secondary Template**: Optional accent template for variety
  - **Validation**: Real-time checking of template compatibility

### 2. Page-Level Template Assignment (Template Tab)

- **Location**: Right Properties Panel → Template Tab
- **Purpose**: Assign specific template to current page
- **Features**:
  - Select from book's allowed templates
  - View template rules and limits
  - See validation status
  - Access detailed slot editing

### 3. Quick Slot Editing (Page Tab)

- **Location**: Right Properties Panel → Page Tab
- **Purpose**: Quickly fill template content for current page
- **Visual Display**:
  ```
  ┌─────────────────────────────────────┐
  │ 📘 PICTURE_HEAVY Content            │
  │ ────────────────────────────────────│
  │                                     │
  │ 📝 Main Text *                      │
  │ [Text input area]                   │
  │                                     │
  │ 🖼️ Primary Image *                  │
  │ [Upload button or thumbnail]        │
  │                                     │
  │ 🎵 Background Audio (optional)      │
  │ [Upload audio button]               │
  │                                     │
  │ 💡 Go to Template tab for details   │
  └─────────────────────────────────────┘
  ```

## Slot Types

### 📝 Text Slots (String)

- **Icon**: 📝
- **Editor**: Multi-line text area
- **Validation**: Word count limits (varies by template)
- **Example**: Main story text, captions, labels
- **Usage**: Type directly into the text field

### 🖼️ Image Slots

- **Icon**: 🖼️
- **Editor**: Upload button with preview
- **Formats**: JPG, PNG, WebP
- **Actions**:
  - Click "Upload image" → Opens Asset Library
  - Select from existing assets
  - Upload new image
  - Preview shows when set
  - X button to clear

### 🎬 Video Slots

- **Icon**: 🎬
- **Editor**: Upload button with preview
- **Formats**: MP4, WebM
- **Validation**: Duration limits (e.g., max 30s for BABY templates)
- **Actions**: Same as images

### 🎵 Audio Slots

- **Icon**: 🎵
- **Editor**: Upload button with preview
- **Formats**: MP3, WAV, OGG
- **Usage**: Background music, sound effects, narration
- **Actions**: Same as images

## Required vs Optional Slots

### Required Slots (marked with \*)

- **Must be filled** before publishing
- Shown with red asterisk: `Main Text *`
- Page validation will fail if empty
- Highlighted in validation errors

### Optional Slots

- Marked with "(optional)"
- Can be left empty
- Adds variety without being mandatory
- Example: `Background Audio (optional)`

## Workflow Example

### Creating a Page with PICTURE_HEAVY Template

1. **Assign Template** (Template Tab or Book Settings)

   - Select PICTURE_HEAVY as page template
   - System shows: "3 slots: main_text, primary_image, secondary_image"

2. **Fill Required Slots** (Page Tab - Quick Edit)

   ```
   Main Text * (string)
   └─ "Once upon a time, in a magical forest..."

   Primary Image * (image)
   └─ [Upload] → Select forest.jpg
   ```

3. **Add Optional Content**

   ```
   Secondary Image (optional)
   └─ [Upload] → Select animals.png

   Background Audio (optional)
   └─ [Upload] → Select birds-chirping.mp3
   ```

4. **Validate**
   - Green checkmark: ✓ All required slots filled
   - Template stats: "PICTURE_HEAVY: 82 words (max 100)"
   - Ready to publish

## Template Rules Display

Each template shows its rules in the Template tab:

```
Template Rules:
• Text must be 50-100 words
• Requires 1-2 large images
• Images must be high-quality and child-friendly
• Optional background music allowed
• Animation not allowed (static images only)
```

## Validation Feedback

### Valid State (Green)

```
✓ Template valid
All required slots filled
82/100 words used
```

### Invalid State (Red)

```
⚠ 2 error(s)
• Required slot 'primary_image' is empty
• Text exceeds maximum word count (125/100 words)
```

## Asset Library Integration

When clicking "Upload" for media slots:

1. **Asset Library Opens**

   - Context-aware: Knows which slot you're filling
   - Shows compatible assets (images for image slots, etc.)
   - Upload tab for new assets

2. **Select Asset**

   - Click on existing asset → Auto-fills slot
   - Or upload new → Preview → Select → Auto-fills

3. **Slot Updates**
   - Thumbnail appears in slot editor
   - Green checkmark indicates content set
   - X button to remove/change

## Page Tab vs Template Tab

### Use Page Tab When:

- Quickly filling content for current page
- See all slots at a glance
- Rapid content entry workflow
- Template already assigned

### Use Template Tab When:

- Assigning/changing page template
- Viewing detailed template rules
- Understanding template limits
- Seeing validation details
- Learning about template purpose

## Book Tab vs Page Template Tab

### Book Tab:

- **Scope**: Entire book
- **Settings**: Primary and secondary templates for all pages
- **Purpose**: Define book's overall structure
- **Validation**: Checks template coexistence rules

### Template Tab (per page):

- **Scope**: Current page only
- **Settings**: This page's specific template
- **Purpose**: Override or confirm page template
- **Validation**: Checks this page's slot requirements

## Tips for Efficient Editing

1. **Set Book Templates First**

   - Book Tab → Choose primary template
   - Optional: Add secondary for variety
   - This sets defaults for new pages

2. **Use Page Tab for Content**

   - Focus on Page Tab for content entry
   - All slots visible and editable
   - Quick workflow for multiple pages

3. **Batch Upload Assets**

   - Upload all images first to Asset Library
   - Then assign to pages quickly
   - Reuse assets across pages

4. **Watch Validation**

   - Green checkmarks = good to go
   - Red errors = needs attention
   - Word count indicators prevent overruns

5. **Template Tab for Details**
   - Switch to Template tab to understand rules
   - See full validation details
   - Learn template constraints

## Visual Indicators

| Indicator         | Meaning           |
| ----------------- | ----------------- |
| \* (red asterisk) | Required slot     |
| ✓ Set (green)     | Slot has content  |
| Empty             | Needs content     |
| 📝 🖼️ 🎬 🎵       | Slot type icon    |
| Word count        | Text validation   |
| Green background  | Valid template    |
| Red background    | Validation errors |
| Purple gradient   | Template section  |

## Keyboard Shortcuts

- `Tab` - Navigate between slots
- `Enter` - Open asset library for media slots
- `Esc` - Close asset library
- `Ctrl/Cmd + S` - Save (auto-saves anyway)

## Common Patterns

### PICTURE_HEAVY Template

```
Slots:
- main_text (50-100 words) *
- primary_image (large, prominent) *
- secondary_image (smaller, optional)
- background_audio (optional)
```

### TEXT_ONLY Template

```
Slots:
- title (5-10 words) *
- body_text (200-500 words) *
- caption (optional)
```

### INTERACTIVE Template

```
Slots:
- instruction_text (20-50 words) *
- interactive_image (with hotspots) *
- audio_prompt *
- success_audio (optional)
```

## Troubleshooting

### "Upload button doesn't work"

- Check Book Tab: Is a template assigned to the book?
- Check Template Tab: Is a template assigned to this page?
- Asset library requires template context

### "Slot not showing"

- Template may not have been assigned yet
- Go to Template Tab → Select a template
- Slots will appear automatically

### "Validation errors"

- Read error messages carefully
- Common issues:
  - Missing required slots
  - Text too long/short
  - Wrong media type
- Fix indicated issues, checkmark will turn green

### "Can't change template"

- Book-level templates restrict options
- Check Book Tab for allowed templates
- Primary template limits which templates can be used

## Summary

The template slot system provides:

- ✅ **Structured content** - Predefined slots ensure consistency
- ✅ **Age-appropriate** - Templates enforce developmental rules
- ✅ **Validation** - Real-time feedback prevents errors
- ✅ **Flexibility** - Quick editing in Page Tab, detailed in Template Tab
- ✅ **Visual feedback** - Icons, colors, checkmarks guide you
- ✅ **Easy uploads** - One-click asset library integration

Start with the Page Tab for daily content work, use Template Tab for understanding and configuration!
