-- ============================================
-- CREATE SUPER USER SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor after signing up
-- Replace 'your-email@example.com' with your actual email
-- ============================================

-- Option 1: Promote existing user to admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'marco.casanova.de@outlook.com';

-- Verify the update
SELECT id, email, role, full_name, created_at 
FROM profiles 
WHERE email = 'marco.casanova.de@outlook.com';

-- ============================================
-- ALTERNATIVE: Create admin user directly via Supabase Auth
-- ============================================
-- If you want to create a user programmatically (run in SQL Editor):
-- Note: This uses Supabase's auth.users table directly

-- DO $$
-- DECLARE
--     new_user_id UUID;
-- BEGIN
--     -- Create user in auth.users (requires service role)
--     INSERT INTO auth.users (
--         id,
--         instance_id,
--         email,
--         encrypted_password,
--         email_confirmed_at,
--         created_at,
--         updated_at,
--         raw_app_meta_data,
--         raw_user_meta_data,
--         aud,
--         role
--     ) VALUES (
--         gen_random_uuid(),
--         '00000000-0000-0000-0000-000000000000',
--         'admin@stratos.dev',
--         crypt('your-secure-password', gen_salt('bf')),
--         NOW(),
--         NOW(),
--         NOW(),
--         '{"provider": "email", "providers": ["email"]}',
--         '{"full_name": "Super Admin"}',
--         'authenticated',
--         'authenticated'
--     )
--     RETURNING id INTO new_user_id;
--     
--     -- The trigger will auto-create the profile, then update to admin
--     UPDATE profiles SET role = 'admin' WHERE id = new_user_id;
-- END $$;

-- ============================================
-- LIST ALL ADMINS
-- ============================================
-- SELECT id, email, role, full_name, created_at 
-- FROM profiles 
-- WHERE role = 'admin';
