-- ============================================================
-- DreamNest Library - Migration 00010: Page Templates
-- ============================================================
-- Adds template support to book_pages table

-- Add template_id column to book_pages
-- Templates are stored as TEXT to reference canonical template IDs defined in code
-- This avoids needing a separate templates table while maintaining data integrity
ALTER TABLE book_pages 
ADD COLUMN template_id TEXT;

-- Add template slot values as JSONB
-- This stores the filled slot values for the template
-- Structure: { slot_key: { slotKey: string, value: string | null, type: string } }
ALTER TABLE book_pages 
ADD COLUMN template_slots JSONB DEFAULT '{}';

-- Create index for template_id for filtering pages by template
CREATE INDEX idx_book_pages_template_id ON book_pages(template_id) 
WHERE template_id IS NOT NULL;

-- Add comment explaining the template_id values
COMMENT ON COLUMN book_pages.template_id IS 
'References canonical template ID from code. Valid values: LOOK_AND_LISTEN, RHYTHM_REPEAT, OBJECT_FOCUS, SLOW_ACTION, STORY_MOMENT, ANIMATED_ACTION, INTERACTIVE_CHOICE, STORY_REEL, GUIDED_STORY, REFLECTIVE_CHOICE, STORY_REEL_PLUS, CHAPTER_SCENE, INNER_MONOLOGUE, DECISION_POINT';

COMMENT ON COLUMN book_pages.template_slots IS 
'JSONB containing filled slot values for the template. Structure follows PageTemplateInstance.slots';

-- ============================================================
-- Add template configuration to books table
-- Books can have ONE primary and optionally ONE secondary template
-- ============================================================
ALTER TABLE books 
ADD COLUMN primary_template_id TEXT,
ADD COLUMN secondary_template_id TEXT;

COMMENT ON COLUMN books.primary_template_id IS 
'Primary template - defines the structural backbone of the book. Must be set for template-based books.';

COMMENT ON COLUMN books.secondary_template_id IS 
'Optional secondary template - provides accent/variation. Must follow coexistence rules with primary template.';
