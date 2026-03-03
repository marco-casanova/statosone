Active migration set for fresh KinRelay installs:

1. `20260303_000000_base_core.sql`
2. `20260303_000100_kinrelay_schema.sql`
3. `20260303_000200_seed_care_categories.sql`

What changed:

- The old migration folder contained multiple overlapping histories for `kr_activities`, `kr_medications`, `kr_clients`, and RLS policies.
- The base migration also includes the shared non-KinRelay `leads` table that the public lead form still writes to.
- Those older files are preserved in `supabase/migrations_legacy/` for reference only.
- Only the files in `supabase/migrations/` should be executed on a fresh Supabase project.

Important:

- This cleaned baseline is for fresh installs or `db reset` workflows.
- Do not replay the new baseline on top of a production database that already applied the legacy branch without reviewing the delta first.
