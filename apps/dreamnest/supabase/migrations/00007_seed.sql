-- ============================================================
-- DreamNest Library - Migration 00007: Seed Data
-- ============================================================
-- Sample categories for initial setup

-- Theme categories
INSERT INTO categories (type, name, slug, description, icon, color, display_order) VALUES
  ('theme', 'Adventure', 'adventure', 'Exciting journeys and discoveries', '🗺️', '#FF6B6B', 1),
  ('theme', 'Fantasy', 'fantasy', 'Magical worlds and creatures', '🦄', '#9B59B6', 2),
  ('theme', 'Animals', 'animals', 'Stories featuring animal friends', '🐻', '#27AE60', 3),
  ('theme', 'Family', 'family', 'Stories about family bonds', '👨‍👩‍👧‍👦', '#E74C3C', 4),
  ('theme', 'Friendship', 'friendship', 'Tales of friendship and teamwork', '🤝', '#F39C12', 5),
  ('theme', 'Nature', 'nature', 'Exploring the natural world', '🌳', '#2ECC71', 6);

-- Mood categories  
INSERT INTO categories (type, name, slug, description, icon, color, display_order) VALUES
  ('mood', 'Bedtime', 'bedtime', 'Calm stories perfect for sleep', '🌙', '#3498DB', 10),
  ('mood', 'Funny', 'funny', 'Silly stories that make you laugh', '😂', '#F1C40F', 11),
  ('mood', 'Heartwarming', 'heartwarming', 'Stories that warm your heart', '❤️', '#E91E63', 12),
  ('mood', 'Exciting', 'exciting', 'Action-packed adventures', '⚡', '#FF5722', 13);

-- Skill categories
INSERT INTO categories (type, name, slug, description, icon, color, display_order) VALUES
  ('skill', 'Counting', 'counting', 'Learn numbers and counting', '🔢', '#00BCD4', 20),
  ('skill', 'ABCs', 'abcs', 'Letters and early reading', '🔤', '#4CAF50', 21),
  ('skill', 'Colors', 'colors', 'Learn about colors', '🎨', '#9C27B0', 22),
  ('skill', 'Shapes', 'shapes', 'Discover shapes', '⬡', '#FF9800', 23),
  ('skill', 'Emotions', 'emotions', 'Understanding feelings', '😊', '#E91E63', 24),
  ('skill', 'Kindness', 'kindness', 'Being kind to others', '💝', '#F44336', 25),
  ('skill', 'Problem Solving', 'problem-solving', 'Critical thinking skills', '🧩', '#673AB7', 26);
