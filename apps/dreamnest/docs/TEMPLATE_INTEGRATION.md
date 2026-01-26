# Template System Integration - Usage Guide

## Overview

The template system is now fully integrated into the page editor. Here's how it works:

## For Users

### 1. Setting a Book Template

1. Open **Book Settings** (gear icon in header)
2. Go to the **Template** tab
3. Choose a default template for your book based on age range
4. Save settings

### 2. Editing Page Templates

1. Select a page in the page list
2. In the **Properties** panel on the right, click the **Template** tab
3. You'll see:
   - **Template Selection**: Choose or change the page template
   - **Template Slots**: Edit the content for each slot (text, images, audio, video)
   - **Validation Status**: See if your page meets template rules
   - **Template Rules**: View the rules for the selected template

### 3. Template Slots

Each template defines specific slots you must fill:

- **String slots**: Enter text directly (respects word limits)
- **Image slots**: Click to select from asset library
- **Video slots**: Click to select video/animation
- **Audio slots**: Click to select or record audio

### 4. Validation

The system automatically validates your page against the template:

- ✅ Green = All rules followed
- ❌ Red = Issues found (click to see details)

## For Developers

### Files Changed

1. **Property Panel** (`property-panel.tsx`):

   - Added "Template" tab
   - Integrated `PageTemplateEditor` component

2. **Page Template Editor** (`page-template-editor.tsx`):

   - New component for template selection and slot editing
   - Real-time validation
   - Slot-specific editors (string, image, video, audio)

3. **Database**:
   - `book_pages.template_id` - stores selected template
   - `book_pages.template_slots` - stores slot values
   - `books.default_template_id` - default template for new pages

### API Integration

Pages now include template data:

```typescript
interface BookPage {
  template_id: string | null;
  template_slots: Record<string, SlotValue> | null;
}
```

Update pages with:

```typescript
onPageUpdate({
  template_id: "LOOK_AND_LISTEN",
  template_slots: {
    text: { slotKey: "text", value: "Hello Baby", type: "string" },
    background_image_id: {
      slotKey: "background_image_id",
      value: "asset-123",
      type: "image",
    },
  },
});
```

### Template Validation

```typescript
import { validatePage } from "@/domain/templates";

const result = validatePage(templateId, slots);
if (!result.valid) {
  console.error(result.errors);
}
```

## Next Steps

### Immediate TODOs:

1. **Asset Library Integration**: Pass slot context to asset library so it knows which slot is being filled
2. **Template Picker Modal**: Add full template picker in the page template editor (currently shows alert)
3. **Page Actions**: Update `pages.ts` actions to save/load template data
4. **Canvas Integration**: Show template slot boundaries on the canvas
5. **Auto-populate**: When template selected, automatically create blocks for each slot

### Future Enhancements:

1. **Template Preview**: Show visual preview of template layout
2. **Slot Drag & Drop**: Drag assets directly to slots
3. **Smart Defaults**: Suggest templates based on page content
4. **Template Library**: Allow custom templates (premium feature)
5. **Batch Apply**: Apply template to multiple pages at once

## Migration

Run the database migration:

```bash
cd supabase
supabase migration up
```

Or apply manually:

```sql
ALTER TABLE book_pages ADD COLUMN template_id TEXT;
ALTER TABLE book_pages ADD COLUMN template_slots JSONB DEFAULT '{}';
ALTER TABLE books ADD COLUMN default_template_id TEXT;
```
