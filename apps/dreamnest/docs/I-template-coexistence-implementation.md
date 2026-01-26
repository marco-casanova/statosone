# Template Coexistence System - Implementation Summary

## Overview

Implemented a comprehensive template coexistence system for DreamNest that enforces age-appropriate content rules and allows books to use primary and optional secondary templates with strict validation.

## Architecture

### 1. Template System

- **17 Templates** across 6 age groups (BABY, TODDLER, PRESCHOOL, KIDS, TWEEN, PRETEEN)
- Core templates: TEXT_ONLY, PICTURE_HEAVY, BALANCED, MINIMAL_TEXT, INTERACTIVE, etc.
- New templates added: FACE_AND_VOICE, POINT_AND_NAME, QUESTION_AND_WAIT

### 2. Domain Layer (`/src/domain/templates/`)

#### types.ts

- Core type definitions for template system
- `TemplateId` union type for all 17 templates
- `AgeGroup` type with 6 age ranges
- `SlotDefinition` interface for template slots
- `ValidationResult` types for error handling

#### data.ts

- Canonical template definitions in `TEMPLATES` registry
- Each template includes:
  - name, purpose, allowedAgeGroups
  - slots (required/optional fields for content)
  - rules (word count limits, media requirements)
  - limits (max instances per book)
- `TEMPLATES_BY_AGE_GROUP` mapping
- `AGE_GROUPS` metadata with developmental focus

#### validation.ts

- Page-level validation: `validatePage()`
- Book-level validation: `validateBook()`
- Statistics calculation: `calculateBookTemplateStats()`
- Checks slot requirements, word count limits, template limits

#### coexistence.ts (NEW)

- **Primary/Secondary Template Architecture**
- `COEXISTENCE_RULES` registry for all 6 age groups
- Each age group defines:
  - `primaryTemplates`: Required templates for main content
  - `coexistenceMap`: Maps each primary → allowed secondary templates
  - `forbidden`: Explicitly disallowed template combinations
- Validation functions:
  - `validateTemplateCoexistence()`: Checks if combination is valid
  - `getAllowedPrimaryTemplates()`: Get valid primary templates for age
  - `getAllowedSecondaryTemplates()`: Get valid secondaries for primary+age
  - `getCoexistenceGuidelines()`: Get usage guidelines for templates

### 3. Database Schema (`/supabase/migrations/00010_page_templates.sql`)

#### Books Table

```sql
ALTER TABLE books
  ADD COLUMN primary_template_id TEXT,
  ADD COLUMN secondary_template_id TEXT;
```

- `primary_template_id`: Required template for main content
- `secondary_template_id`: Optional template for variety

#### Book Pages Table

```sql
ALTER TABLE book_pages
  ADD COLUMN template_id TEXT,
  ADD COLUMN template_slots JSONB;
```

- `template_id`: Template used for this specific page
- `template_slots`: JSON object storing slot values (text, media references)

### 4. TypeScript Types (`/src/types/database.ts`)

#### Updated Interfaces

- `Book`: Added `primary_template_id`, `secondary_template_id`
- `BookPage`: Added `template_id`, `template_slots`
- `CreateBookInput`: Added template fields
- `UpdateBookInput`: Added template fields
- `CreatePageInput`: Added template fields
- `UpdatePageInput`: Added template fields

### 5. UI Components

#### BookTemplateConfigurator (`/src/components/editor/book-template-configurator.tsx`)

- **Primary/Secondary Template Selection**
- Features:
  - Age-group filtered template dropdowns
  - Real-time coexistence validation
  - Validation error display with helpful messages
  - Usage guidelines from coexistence rules
  - Disabled state for invalid secondary options
- Visual feedback:
  - Green checkmark for valid combinations
  - Red X for validation errors
  - Info icon for guidelines
  - Age group badges

#### BookSettingsModal (Updated)

- Added Template tab with BookTemplateConfigurator
- Replaced single template picker with primary/secondary system
- State management for both template fields
- Saves both templates to database on update

#### PropertyPanel (Updated)

- Added Template tab alongside Page, Block, Audio tabs
- Integrated PageTemplateEditor for per-page template configuration
- Shows template validation errors
- Real-time slot editing

#### PageTemplateEditor (`/src/components/editor/page-template-editor.tsx`)

- Edit template slots for individual pages
- String slots: Text input with word count validation
- Media slots: Asset picker integration (to be connected)
- Validation feedback
- Slot requirement indicators

#### BookEditor (Updated)

- Updated `handlePageAdd()` to use book's `primary_template_id` by default
- Added template fields to Book and Page interfaces
- Pages inherit primary template but can be overridden

### 6. Actions (`/src/actions/books.ts`)

- `updateBook()` already passes through all input fields
- Automatically saves `primary_template_id` and `secondary_template_id`
- No changes needed - works with updated types

## Coexistence Rules Summary

### Design Principles

1. **One Primary Template**: Every book must have exactly one primary template
2. **Optional Secondary**: Books may add one secondary template for variety
3. **Age-Appropriate Combinations**: Only certain combinations allowed per age group
4. **Forbidden Pairs**: Some templates cannot coexist (e.g., TEXT_ONLY + PICTURE_HEAVY)

### Example Rules (Baby 0-2)

```typescript
primaryTemplates: ['PICTURE_HEAVY', 'POINT_AND_NAME', 'FACE_AND_VOICE']
coexistenceMap: {
  PICTURE_HEAVY: ['POINT_AND_NAME', 'FACE_AND_VOICE'],
  POINT_AND_NAME: ['PICTURE_HEAVY'],
  FACE_AND_VOICE: ['PICTURE_HEAVY']
}
forbidden: ['TEXT_ONLY', 'BALANCED', 'INTERACTIVE', ...]
```

### Example Rules (Kids 6-8)

```typescript
primaryTemplates: ['BALANCED', 'CHAPTER', 'NARRATIVE', 'INTERACTIVE']
coexistenceMap: {
  BALANCED: ['INTERACTIVE', 'QUESTION_AND_WAIT'],
  CHAPTER: ['NARRATIVE'],
  NARRATIVE: ['CHAPTER'],
  INTERACTIVE: ['BALANCED']
}
```

## Implementation Status

### ✅ Completed

1. Template type system (17 templates)
2. Template data definitions with slots, rules, limits
3. Validation utilities (page, book, stats)
4. Coexistence rules module (330 lines)
5. Database migration for primary/secondary templates
6. TypeScript type updates
7. BookTemplateConfigurator component (285 lines)
8. BookSettingsModal integration
9. PropertyPanel Template tab
10. PageTemplateEditor component
11. BookEditor default template assignment

### ⚠️ Pending

1. **Run Database Migration**: Execute `00010_page_templates.sql` via Supabase dashboard or CLI
2. **Asset Library Integration**: Pass slot context to asset library when picking media for template slots
3. **Template Migration**: Migrate existing books with `default_template_id` to use `primary_template_id`
4. **Testing**: Test all age groups with various template combinations
5. **Slot Validation UI**: Show more detailed slot errors in PropertyPanel

### 📋 Future Enhancements

1. Template previews in BookTemplateConfigurator
2. Bulk page template assignment
3. Template usage analytics
4. Template recommendation based on book content
5. Custom template creation for premium authors

## Usage Workflow

### For Authors

1. **Create Book** → Open Book Settings → Template tab
2. **Select Primary Template** based on age group and content type
3. **Optionally Add Secondary** for page variety (if valid combination)
4. **Create Pages** → Pages automatically use primary template
5. **Edit Page Template** → Override template per page if needed
6. **Fill Template Slots** → Add text/media content to required slots
7. **Validation** → System enforces word counts, media requirements, template limits

### Validation Flow

```
Book Save
  ├─ Check primary template is set
  ├─ Validate primary is allowed for age group
  ├─ If secondary set:
  │   ├─ Validate secondary allowed for age
  │   └─ Validate primary+secondary coexistence
  └─ Save to database

Page Creation
  ├─ Inherit book's primary template
  ├─ Initialize empty template_slots
  └─ Save to database

Page Edit
  ├─ Validate template_id is allowed
  ├─ Validate slot values (word count, required fields)
  ├─ Check template instance limits
  └─ Save to database
```

## Key Files

### Domain Layer

- `/src/domain/templates/types.ts` - Type definitions
- `/src/domain/templates/data.ts` - Template definitions
- `/src/domain/templates/validation.ts` - Validation logic
- `/src/domain/templates/coexistence.ts` - Coexistence rules ⭐
- `/src/domain/templates/index.ts` - Module exports

### Database

- `/supabase/migrations/00010_page_templates.sql` - Schema ⭐
- `/src/types/database.ts` - TypeScript types

### Components

- `/src/components/editor/book-template-configurator.tsx` - Primary/secondary picker ⭐
- `/src/components/editor/book-settings-modal.tsx` - Book settings with template tab
- `/src/components/editor/property-panel.tsx` - Right sidebar with template tab
- `/src/components/editor/page-template-editor.tsx` - Per-page template editor
- `/src/components/editor/template-picker.tsx` - Visual template selector
- `/src/components/editor/book-editor.tsx` - Main editor with template support

### Actions

- `/src/actions/books.ts` - Book CRUD with template fields
- `/src/actions/pages.ts` - Page CRUD with template fields

## Technical Notes

### Type Safety

- All template IDs use `TemplateId` union type
- Slot values use `SlotValue = string | { asset_id: string }` type
- Coexistence validation returns typed `ValidationResult`
- Database types match domain types

### Performance

- Template lookups use `TEMPLATES` registry (O(1))
- Age group filtering pre-computed in `TEMPLATES_BY_AGE_GROUP`
- Coexistence rules indexed by age group and primary template
- Validation happens client-side before server submission

### Error Handling

- Validation returns descriptive error messages
- UI shows validation errors inline
- Database constraints prevent invalid states
- Graceful fallbacks for missing templates

## Migration Notes

To apply the database changes:

```bash
# If using Supabase CLI
supabase migration up

# Or apply via Supabase Dashboard
# Go to SQL Editor → Run the migration file
```

To migrate existing books:

```sql
-- Copy default_template_id to primary_template_id
UPDATE books
SET primary_template_id = default_template_id
WHERE default_template_id IS NOT NULL;

-- Optionally remove old column
-- ALTER TABLE books DROP COLUMN default_template_id;
```

## Testing Checklist

- [ ] Create book with each age group
- [ ] Select each primary template
- [ ] Add valid secondary templates
- [ ] Attempt invalid secondary (should be disabled)
- [ ] Create page → verify inherits primary template
- [ ] Edit page template → verify validation
- [ ] Fill template slots → verify word count limits
- [ ] Save book → verify database fields updated
- [ ] Reload book → verify templates load correctly
- [ ] Check coexistence validation messages

## References

- Original spec: `/docs/F-author-tool.md` (Template Definitions)
- Coexistence rules: User-provided "Template Coexistence Map"
- Database schema: `/docs/C-database-schema.md`
- Implementation plan: `/docs/H-implementation-plan.md`
