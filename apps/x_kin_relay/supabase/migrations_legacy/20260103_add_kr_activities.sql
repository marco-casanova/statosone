-- ============================================
-- KR_ACTIVITIES TABLE (Activity/Care logs)
-- ============================================
-- Run this in Supabase SQL Editor to add the missing kr_activities table

CREATE TABLE IF NOT EXISTS kr_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES kr_clients(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    caregiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES kr_care_categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES kr_care_subcategories(id) ON DELETE SET NULL,
    circle_id TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category TEXT,
    activity_type TEXT,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    activity_time TIME DEFAULT CURRENT_TIME,
    duration_minutes INTEGER,
    value JSONB,
    details JSONB,
    subtype_adl TEXT,
    subtype_safety TEXT,
    assistance_level TEXT,
    notes TEXT,
    location TEXT,
    mood TEXT,
    energy_level TEXT,
    attachments TEXT[],
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kr_activities_client ON kr_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_recipient ON kr_activities(recipient_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_caregiver ON kr_activities(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_date ON kr_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_kr_activities_observed_at ON kr_activities(observed_at);
CREATE INDEX IF NOT EXISTS idx_kr_activities_category ON kr_activities(category_id);
CREATE INDEX IF NOT EXISTS idx_kr_activities_type ON kr_activities(activity_type);

-- RLS Policies
ALTER TABLE kr_activities ENABLE ROW LEVEL SECURITY;

-- Users can view activities for clients they have access to
CREATE POLICY "Users can view activities they created or are assigned to"
ON kr_activities FOR SELECT
USING (
    auth.uid() = created_by 
    OR auth.uid() = caregiver_id 
    OR auth.uid() = recipient_id
    OR auth.uid() IN (
        SELECT user_id FROM kr_caregiver_profiles WHERE user_id = auth.uid()
    )
);

-- Users can insert their own activities
CREATE POLICY "Users can insert activities"
ON kr_activities FOR INSERT
WITH CHECK (auth.uid() = created_by OR auth.uid() = caregiver_id);

-- Users can update activities they created
CREATE POLICY "Users can update their own activities"
ON kr_activities FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = caregiver_id);

-- Trigger for updated_at
CREATE TRIGGER update_kr_activities_updated_at
    BEFORE UPDATE ON kr_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
