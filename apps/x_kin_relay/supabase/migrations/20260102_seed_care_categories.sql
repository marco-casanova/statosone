-- ============================================
-- KINRELAY CARE CATEGORIES SEED DATA
-- ============================================
-- Seeds all care categories and subcategories for KinRelay
-- Based on the mockup screens
-- 
-- PREREQUISITE: Run 20260102_kinrelay_complete_schema.sql first
-- ============================================

-- ============================================
-- CARE CATEGORIES
-- ============================================

-- Patrón de Sueño (Sleep Pattern)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000001', 'Sleep Pattern', 'Patrón de Sueño', 'moon', '#4A90E2', 1, 'Track sleep quality and patterns')
ON CONFLICT (name) DO NOTHING;

-- Cuidado Personal (Personal Care)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000002', 'Personal Care', 'Cuidado Personal', 'user', '#50C878', 2, 'Daily personal hygiene and care activities')
ON CONFLICT (name) DO NOTHING;

-- Hidratación (Hydration)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000003', 'Hydration', 'Hidratación', 'droplet', '#5DADE2', 3, 'Track fluid intake throughout the day')
ON CONFLICT (name) DO NOTHING;

-- Nutrición (Nutrition)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000004', 'Nutrition', 'Nutrición', 'utensils', '#F39C12', 4, 'Meal tracking and dietary management')
ON CONFLICT (name) DO NOTHING;

-- Movilidad (Mobility)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000005', 'Mobility', 'Movilidad', 'walking', '#E74C3C', 5, 'Track movement and physical activities')
ON CONFLICT (name) DO NOTHING;

-- Continencia/Incontinencia (Continence/Incontinence)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000006', 'Continence/Incontinence', 'Continencia/Incontinencia', 'shield', '#9B59B6', 6, 'Bladder and bowel management')
ON CONFLICT (name) DO NOTHING;

-- Actividad (Activity)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000007', 'Activity', 'Actividad', 'activity', '#1ABC9C', 7, 'Daily activities and engagement')
ON CONFLICT (name) DO NOTHING;

-- Administración de Medicamentos (Medication Administration)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000008', 'Medication Administration', 'Administración de Medicamentos', 'pill', '#E67E22', 8, 'Track medication administration')
ON CONFLICT (name) DO NOTHING;

-- Patrón de Conducta (Behavior Pattern)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000009', 'Behavior Pattern', 'Patrón de Conducta', 'brain', '#34495E', 9, 'Track behavioral patterns and incidents')
ON CONFLICT (name) DO NOTHING;

-- Incidente (Incident)
INSERT INTO kr_care_categories (id, name, name_es, icon, color, sort_order, description) VALUES
('00000000-0000-0000-0000-000000000010', 'Incident', 'Incidente', 'alert-triangle', '#C0392B', 10, 'Report and track incidents')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR PERSONAL CARE
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, sort_order) VALUES
('00000000-0000-0000-0000-000000000002', 'Personal Hygiene', 'Aseo Personal', NULL, 'checkbox', 1),
('00000000-0000-0000-0000-000000000002', 'Oral Hygiene', 'Aseo Bucal', NULL, 'checkbox', 2),
('00000000-0000-0000-0000-000000000002', 'Skin Care', 'Cuidado de la Piel', NULL, 'checkbox', 3),
('00000000-0000-0000-0000-000000000002', 'Getting Dressed', 'Vestido Calzado', NULL, 'checkbox', 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR HYDRATION
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, options, sort_order) VALUES
('00000000-0000-0000-0000-000000000003', 'Water Intake', 'Ingesta de Agua', 'ml', 'select', 
 '{"options": ["100ml", "200ml", "300ml", "400ml", "500ml", "600ml", "750ml", "1L"], "presets": [100, 200, 300, 400, 500, 600, 750, 1000]}'::jsonb, 1),
('00000000-0000-0000-0000-000000000003', 'Tea/Coffee', 'Té/Café', 'ml', 'select', 
 '{"options": ["100ml", "150ml", "200ml", "250ml", "300ml"], "presets": [100, 150, 200, 250, 300]}'::jsonb, 2),
('00000000-0000-0000-0000-000000000003', 'Juice', 'Zumo', 'ml', 'select', 
 '{"options": ["100ml", "150ml", "200ml", "250ml", "330ml"], "presets": [100, 150, 200, 250, 330]}'::jsonb, 3),
('00000000-0000-0000-0000-000000000003', 'Soup/Broth', 'Sopa/Caldo', 'ml', 'select', 
 '{"options": ["150ml", "200ml", "250ml", "300ml", "400ml"], "presets": [150, 200, 250, 300, 400]}'::jsonb, 4),
('00000000-0000-0000-0000-000000000003', 'Other Fluids', 'Otros Líquidos', 'ml', 'select', 
 '{"options": ["100ml", "200ml", "300ml", "400ml", "500ml"], "presets": [100, 200, 300, 400, 500]}'::jsonb, 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR NUTRITION
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, options, sort_order) VALUES
('00000000-0000-0000-0000-000000000004', 'Breakfast', 'Desayuno', 'portion', 'select', 
 '{"options": ["All (100%)", "Most (75%)", "Half (50%)", "Some (25%)", "None (0%)"], "values": [100, 75, 50, 25, 0]}'::jsonb, 1),
('00000000-0000-0000-0000-000000000004', 'Lunch', 'Almuerzo', 'portion', 'select', 
 '{"options": ["All (100%)", "Most (75%)", "Half (50%)", "Some (25%)", "None (0%)"], "values": [100, 75, 50, 25, 0]}'::jsonb, 2),
('00000000-0000-0000-0000-000000000004', 'Dinner', 'Cena', 'portion', 'select', 
 '{"options": ["All (100%)", "Most (75%)", "Half (50%)", "Some (25%)", "None (0%)"], "values": [100, 75, 50, 25, 0]}'::jsonb, 3),
('00000000-0000-0000-0000-000000000004', 'Snacks', 'Meriendas', NULL, 'text', NULL, 4),
('00000000-0000-0000-0000-000000000004', 'Supplement Drinks', 'Bebidas Suplementarias', 'ml', 'select', 
 '{"options": ["125ml", "200ml", "237ml", "330ml"], "presets": [125, 200, 237, 330]}'::jsonb, 5),
('00000000-0000-0000-0000-000000000004', 'Special Diet Compliance', 'Cumplimiento Dieta Especial', NULL, 'checkbox', NULL, 6)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR MOBILITY
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, options, sort_order) VALUES
('00000000-0000-0000-0000-000000000005', 'Walking', 'Caminando', 'minutes', 'number', 
 '{"min": 0, "max": 180, "step": 5}'::jsonb, 1),
('00000000-0000-0000-0000-000000000005', 'Transfers', 'Transferencias', 'times', 'number', 
 '{"min": 0, "max": 50, "step": 1}'::jsonb, 2),
('00000000-0000-0000-0000-000000000005', 'Exercise', 'Ejercicio', 'minutes', 'number', 
 '{"min": 0, "max": 180, "step": 5}'::jsonb, 3),
('00000000-0000-0000-0000-000000000005', 'Assistance Level', 'Nivel de Asistencia', NULL, 'select', 
 '{"options": ["Independent", "Minimal", "Moderate", "Maximum", "Total"]}'::jsonb, 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR CONTINENCE/INCONTINENCE
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, options, sort_order) VALUES
('00000000-0000-0000-0000-000000000006', 'Bathroom Visit', 'Visita al Baño', 'times', 'number', 
 '{"min": 0, "max": 20, "step": 1}'::jsonb, 1),
('00000000-0000-0000-0000-000000000006', 'Urine Output', 'Producción de Orina', 'ml', 'select', 
 '{"options": ["Small (<100ml)", "Medium (100-300ml)", "Large (300-500ml)", "Very Large (>500ml)"], "values": [50, 200, 400, 600]}'::jsonb, 2),
('00000000-0000-0000-0000-000000000006', 'Accidents', 'Accidentes', 'times', 'number', 
 '{"min": 0, "max": 10, "step": 1}'::jsonb, 3),
('00000000-0000-0000-0000-000000000006', 'Brief Changes', 'Cambios de Pañal', 'times', 'number', 
 '{"min": 0, "max": 15, "step": 1}'::jsonb, 4),
('00000000-0000-0000-0000-000000000006', 'Brief Saturation', 'Saturación del Pañal', NULL, 'select', 
 '{"options": ["Dry", "Light", "Moderate", "Heavy", "Soaked"]}'::jsonb, 5),
('00000000-0000-0000-0000-000000000006', 'Continence Status', 'Estado de Continencia', NULL, 'select', 
 '{"options": ["Continent", "Occasional", "Frequent", "Total Incontinence"]}'::jsonb, 6),
('00000000-0000-0000-0000-000000000006', 'Catheter Output', 'Producción por Sonda', 'ml', 'select', 
 '{"options": ["100ml", "200ml", "300ml", "400ml", "500ml", "600ml", "800ml", "1000ml"], "presets": [100, 200, 300, 400, 500, 600, 800, 1000]}'::jsonb, 7)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR ACTIVITY
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, options, sort_order) VALUES
('00000000-0000-0000-0000-000000000007', 'Social Interaction', 'Interacción Social', 'minutes', 'number', 
 '{"min": 0, "max": 480, "step": 15}'::jsonb, 1),
('00000000-0000-0000-0000-000000000007', 'Cognitive Activities', 'Actividades Cognitivas', 'minutes', 'number', 
 '{"min": 0, "max": 240, "step": 15}'::jsonb, 2),
('00000000-0000-0000-0000-000000000007', 'Recreation', 'Recreación', 'minutes', 'number', 
 '{"min": 0, "max": 480, "step": 15}'::jsonb, 3),
('00000000-0000-0000-0000-000000000007', 'TV/Entertainment', 'TV/Entretenimiento', 'minutes', 'number', 
 '{"min": 0, "max": 480, "step": 15}'::jsonb, 4),
('00000000-0000-0000-0000-000000000007', 'Engagement Level', 'Nivel de Participación', NULL, 'select', 
 '{"options": ["Very Active", "Active", "Moderate", "Low", "Refused"]}'::jsonb, 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR MEDICATION ADMINISTRATION
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, options, sort_order) VALUES
('00000000-0000-0000-0000-000000000008', 'Medication Name', 'Nombre del Medicamento', NULL, 'text', NULL, 1),
('00000000-0000-0000-0000-000000000008', 'Dosage - Tablets', 'Dosis - Comprimidos', 'tablets', 'select', 
 '{"options": ["0.5 tablet", "1 tablet", "1.5 tablets", "2 tablets", "3 tablets"], "values": [0.5, 1, 1.5, 2, 3]}'::jsonb, 2),
('00000000-0000-0000-0000-000000000008', 'Dosage - Liquid', 'Dosis - Líquido', 'ml', 'select', 
 '{"options": ["2.5ml", "5ml", "10ml", "15ml", "20ml", "25ml", "30ml"], "presets": [2.5, 5, 10, 15, 20, 25, 30]}'::jsonb, 3),
('00000000-0000-0000-0000-000000000008', 'Dosage - Drops', 'Dosis - Gotas', 'drops', 'select', 
 '{"options": ["1 drop", "2 drops", "3 drops", "4 drops", "5 drops", "10 drops"], "presets": [1, 2, 3, 4, 5, 10]}'::jsonb, 4),
('00000000-0000-0000-0000-000000000008', 'Dosage - Insulin', 'Dosis - Insulina', 'units', 'select', 
 '{"options": ["2 units", "4 units", "6 units", "8 units", "10 units", "12 units", "15 units", "20 units", "25 units", "30 units"], "presets": [2, 4, 6, 8, 10, 12, 15, 20, 25, 30]}'::jsonb, 5),
('00000000-0000-0000-0000-000000000008', 'Administration Route', 'Vía de Administración', NULL, 'select', 
 '{"options": ["Oral", "Sublingual", "Topical", "Injection (SC)", "Injection (IM)", "Inhaled", "Eye drops", "Ear drops", "Rectal", "Transdermal patch"]}'::jsonb, 6),
('00000000-0000-0000-0000-000000000008', 'Status', 'Estado', NULL, 'select', 
 '{"options": ["Administered", "Refused", "Held", "Not Available", "Self-Administered"]}'::jsonb, 7),
('00000000-0000-0000-0000-000000000008', 'Side Effects', 'Efectos Secundarios', NULL, 'text', NULL, 8)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR BEHAVIOR PATTERN
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, options, sort_order) VALUES
('00000000-0000-0000-0000-000000000009', 'Behavior Type', 'Tipo de Conducta', NULL, 'select', 
 '{"options": ["Aggression", "Wandering", "Anxiety", "Agitation", "Confusion", "Withdrawal", "Other"]}'::jsonb, 1),
('00000000-0000-0000-0000-000000000009', 'Severity', 'Severidad', NULL, 'select', 
 '{"options": ["Low", "Medium", "High"]}'::jsonb, 2),
('00000000-0000-0000-0000-000000000009', 'Trigger', 'Desencadenante', NULL, 'text', NULL, 3),
('00000000-0000-0000-0000-000000000009', 'Antecedent', 'Antecedente de la Conducta', NULL, 'text', NULL, 4),
('00000000-0000-0000-0000-000000000009', 'Description', 'Descripción', NULL, 'textarea', NULL, 5),
('00000000-0000-0000-0000-000000000009', 'Intervention', 'Intervención', NULL, 'text', NULL, 6)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR INCIDENT
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, options, sort_order) VALUES
('00000000-0000-0000-0000-000000000010', 'Incident Type', 'Tipo de Incidente', NULL, 'select', 
 '{"options": ["Fall", "Aggression", "Medication Error", "Wandering", "Injury", "Illness", "Other"]}'::jsonb, 1),
('00000000-0000-0000-0000-000000000010', 'Severity', 'Severidad', NULL, 'select', 
 '{"options": ["Low", "Medium", "High", "Critical"]}'::jsonb, 2),
('00000000-0000-0000-0000-000000000010', 'Location', 'Ubicación', NULL, 'text', NULL, 3),
('00000000-0000-0000-0000-000000000010', 'Description', 'Descripción', NULL, 'textarea', NULL, 4),
('00000000-0000-0000-0000-000000000010', 'Immediate Action', 'Acción Inmediata', NULL, 'textarea', NULL, 5),
('00000000-0000-0000-0000-000000000010', 'Medical Attention Required', 'Requiere Atención Médica', NULL, 'checkbox', NULL, 6),
('00000000-0000-0000-0000-000000000010', 'Family Notified', 'Familia Notificada', NULL, 'checkbox', NULL, 7)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBCATEGORIES FOR SLEEP PATTERN
-- ============================================
INSERT INTO kr_care_subcategories (category_id, name, name_es, unit, input_type, options, sort_order) VALUES
('00000000-0000-0000-0000-000000000001', 'Bedtime', 'Hora de Dormir', NULL, 'time', NULL, 1),
('00000000-0000-0000-0000-000000000001', 'Wake Time', 'Hora de Despertar', NULL, 'time', NULL, 2),
('00000000-0000-0000-0000-000000000001', 'Total Hours', 'Horas Totales', 'hours', 'number', 
 '{"min": 0, "max": 24, "step": 0.5}'::jsonb, 3),
('00000000-0000-0000-0000-000000000001', 'Sleep Quality', 'Calidad de Sueño', NULL, 'select', 
 '{"options": ["Excellent", "Good", "Fair", "Poor"]}'::jsonb, 4),
('00000000-0000-0000-0000-000000000001', 'Interruptions', 'Interrupciones', 'times', 'number', 
 '{"min": 0, "max": 20, "step": 1}'::jsonb, 5),
('00000000-0000-0000-0000-000000000001', 'Naps', 'Siestas', 'times', 'number', 
 '{"min": 0, "max": 10, "step": 1}'::jsonb, 6)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
DECLARE
    category_count INTEGER;
    subcategory_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM kr_care_categories;
    SELECT COUNT(*) INTO subcategory_count FROM kr_care_subcategories;
    
    RAISE NOTICE '✅ Seeded % care categories and % subcategories', category_count, subcategory_count;
END $$;
