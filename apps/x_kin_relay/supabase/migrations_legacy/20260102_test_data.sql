-- ============================================
-- KINRELAY TEST DATA
-- ============================================
-- Run this AFTER creating a test user in Supabase Auth
-- Replace 'YOUR-USER-ID' with the actual UUID from Authentication → Users
-- ============================================

-- Example: Create test profiles (update the UUID!)
-- Uncomment and modify as needed:

/*
-- Test Family Member Profile
INSERT INTO profiles (id, email, full_name, role) VALUES
('YOUR-FAMILY-USER-ID', 'family@test.com', 'Maria García', 'family')
ON CONFLICT (id) DO UPDATE SET full_name = 'Maria García', role = 'family';

INSERT INTO kr_caregiver_profiles (user_id, kr_role, status, phone, city, state) VALUES
('YOUR-FAMILY-USER-ID', 'family', 'active', '+1234567890', 'Miami', 'FL')
ON CONFLICT (user_id) DO UPDATE SET status = 'active';

-- Test Specialist Profile  
INSERT INTO profiles (id, email, full_name, role) VALUES
('YOUR-SPECIALIST-USER-ID', 'specialist@test.com', 'Dr. Carlos Mendez', 'specialist')
ON CONFLICT (id) DO UPDATE SET full_name = 'Dr. Carlos Mendez', role = 'specialist';

INSERT INTO kr_caregiver_profiles (
  user_id, kr_role, status, phone, city, state, 
  specialization, years_of_experience, hourly_rate, 
  is_available_for_hire, languages, certifications
) VALUES (
  'YOUR-SPECIALIST-USER-ID', 'specialist', 'active', '+1987654321', 'Miami', 'FL',
  'Geriatric Care', 10, 45.00,
  TRUE, ARRAY['English', 'Spanish'], ARRAY['CNA', 'CPR Certified']
)
ON CONFLICT (user_id) DO UPDATE SET 
  status = 'active',
  is_available_for_hire = TRUE;

-- Test Client (person receiving care)
INSERT INTO kr_clients (
  id, family_member_id, full_name, date_of_birth, gender,
  address, phone, emergency_contact_name, emergency_contact_phone,
  medical_conditions, allergies, mobility_level, cognitive_status
) VALUES (
  '00000000-0000-0000-0000-000000000100',
  'YOUR-FAMILY-USER-ID',
  'Roberto García',
  '1945-03-15',
  'Male',
  '123 Main St, Miami, FL 33101',
  '+1555123456',
  'Maria García',
  '+1234567890',
  ARRAY['Diabetes Type 2', 'Hypertension'],
  ARRAY['Penicillin'],
  'Assisted walking',
  'Mild cognitive impairment'
)
ON CONFLICT (id) DO NOTHING;

-- Assign specialist to client
INSERT INTO kr_care_assignments (
  client_id, specialist_id, start_date, is_active, assignment_type
) VALUES (
  '00000000-0000-0000-0000-000000000100',
  'YOUR-SPECIALIST-USER-ID',
  CURRENT_DATE,
  TRUE,
  'full-time'
)
ON CONFLICT DO NOTHING;

-- Add sample medications
INSERT INTO kr_medications (
  client_id, name, dosage, unit, frequency, route, start_date, is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000100',
  'Metformin',
  '500',
  'mg',
  'twice daily',
  'oral',
  CURRENT_DATE - INTERVAL '30 days',
  TRUE
),
(
  '00000000-0000-0000-0000-000000000100',
  'Lisinopril',
  '10',
  'mg',
  'once daily',
  'oral',
  CURRENT_DATE - INTERVAL '60 days',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Add sample tasks for today
INSERT INTO kr_tasks (
  client_id, assigned_to, category_id, task_date, scheduled_time, status, description
) VALUES 
(
  '00000000-0000-0000-0000-000000000100',
  'YOUR-SPECIALIST-USER-ID',
  '00000000-0000-0000-0000-000000000002', -- Personal Care
  CURRENT_DATE,
  '08:00',
  'pending',
  'Morning personal hygiene routine'
),
(
  '00000000-0000-0000-0000-000000000100',
  'YOUR-SPECIALIST-USER-ID',
  '00000000-0000-0000-0000-000000000004', -- Nutrition
  CURRENT_DATE,
  '08:30',
  'pending',
  'Breakfast'
),
(
  '00000000-0000-0000-0000-000000000100',
  'YOUR-SPECIALIST-USER-ID',
  '00000000-0000-0000-0000-000000000008', -- Medication
  CURRENT_DATE,
  '09:00',
  'pending',
  'Morning medications'
),
(
  '00000000-0000-0000-0000-000000000100',
  'YOUR-SPECIALIST-USER-ID',
  '00000000-0000-0000-0000-000000000003', -- Hydration
  CURRENT_DATE,
  '10:00',
  'pending',
  'Mid-morning hydration check'
)
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- QUICK VERIFICATION QUERIES
-- ============================================

-- Check care categories loaded:
SELECT name, name_es, color FROM kr_care_categories ORDER BY sort_order;

-- Check subcategories loaded:
SELECT 
  c.name as category, 
  s.name as subcategory, 
  s.input_type 
FROM kr_care_subcategories s
JOIN kr_care_categories c ON c.id = s.category_id
ORDER BY c.sort_order, s.sort_order
LIMIT 20;
