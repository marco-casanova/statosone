-- ============================================
-- KR_REF_MEDICATIONS (reference medication catalog)
-- ============================================
-- Reference list used to prefill kr_medications without duplicating static data.
-- Import your cleaned CSV (e.g., kinrelay_medications_mvp.csv) into this table.

CREATE TABLE IF NOT EXISTS kr_ref_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_display TEXT NOT NULL,
    active_substance TEXT,
    atc_code TEXT,
    category TEXT,
    source TEXT DEFAULT 'docmorris',
    verified BOOLEAN DEFAULT FALSE,
    evidence_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Avoid duplicate reference rows for the same substance/category combination.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_kr_ref_medications_substance_cat
    ON kr_ref_medications (COALESCE(active_substance, ''), COALESCE(atc_code, ''), COALESCE(category, ''));

CREATE INDEX IF NOT EXISTS idx_kr_ref_medications_active_substance ON kr_ref_medications(active_substance);
CREATE INDEX IF NOT EXISTS idx_kr_ref_medications_atc_code ON kr_ref_medications(atc_code);
CREATE INDEX IF NOT EXISTS idx_kr_ref_medications_category ON kr_ref_medications(category);

-- RLS
ALTER TABLE kr_ref_medications ENABLE ROW LEVEL SECURITY;

-- Simplified policies (adjust once auth model is finalized)
DROP POLICY IF EXISTS "Allow all select on kr_ref_medications" ON kr_ref_medications;
DROP POLICY IF EXISTS "Allow all insert on kr_ref_medications" ON kr_ref_medications;
DROP POLICY IF EXISTS "Allow all update on kr_ref_medications" ON kr_ref_medications;
DROP POLICY IF EXISTS "Allow all delete on kr_ref_medications" ON kr_ref_medications;

CREATE POLICY "Allow all select on kr_ref_medications"
ON kr_ref_medications FOR SELECT USING (true);

CREATE POLICY "Allow all insert on kr_ref_medications"
ON kr_ref_medications FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on kr_ref_medications"
ON kr_ref_medications FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on kr_ref_medications"
ON kr_ref_medications FOR DELETE USING (true);
