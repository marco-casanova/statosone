-- ============================================================
-- DreamNest Library - Migration 00001: Enum Types
-- ============================================================
-- Run this migration first to create all enum types used by tables

-- User roles
CREATE TYPE user_role AS ENUM ('parent', 'author', 'admin');

-- Book publication status
CREATE TYPE book_status AS ENUM ('draft', 'in_review', 'published', 'archived');

-- Page layout mode
CREATE TYPE page_layout_mode AS ENUM ('canvas', 'flow');

-- Block types
CREATE TYPE block_type AS ENUM ('text', 'image', 'video', 'animation', 'hotspot');

-- Asset types  
CREATE TYPE asset_type AS ENUM ('image', 'audio', 'video', 'animation');

-- Category types
CREATE TYPE category_type AS ENUM ('theme', 'mood', 'skill');

-- Narration mode
CREATE TYPE narration_mode AS ENUM ('recorded', 'tts');

-- Reading session mode
CREATE TYPE reading_mode AS ENUM ('manual', 'auto');

-- Subscription status (mirrors Stripe)
CREATE TYPE subscription_status AS ENUM (
  'active', 
  'trialing', 
  'past_due', 
  'canceled', 
  'unpaid', 
  'incomplete', 
  'incomplete_expired',
  'paused'
);
