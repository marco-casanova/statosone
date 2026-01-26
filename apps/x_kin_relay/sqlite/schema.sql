-- SQLite schema approximation for local prototyping
-- Note: SQLite has no native enum; using TEXT with CHECK constraints.

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  circle_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('safety','health_observation','adl','environment','service')),
  observed_at TEXT NOT NULL,
  recorded_by TEXT NOT NULL,
  subtype_safety TEXT NULL,
  subtype_observation TEXT NULL,
  subtype_adl TEXT NULL,
  subtype_environment TEXT NULL,
  subtype_service TEXT NULL,
  assistance_level TEXT NULL CHECK(assistance_level IN ('independent','supervision','partial','full')),
  harm_severity TEXT NULL,
  location_note TEXT NULL,
  details TEXT NULL -- JSON serialized
);

-- Optional: simple indices
CREATE INDEX IF NOT EXISTS idx_activities_observed_at ON activities(observed_at);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
