These migrations are preserved for reference only.

They are not part of the active migration chain anymore because they contain:

- overlapping table definitions
- destructive `DROP TABLE` / recreate steps
- conflicting `kr_activities` and `kr_medications` schemas
- RLS branches that depend on schema variants from older experiments

For fresh installs, use the files in `supabase/migrations/` only.
