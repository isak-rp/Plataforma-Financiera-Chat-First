# Supabase SQL Migrations

## Order

1. `001_create_tables.sql`
2. `002_rls_policies.sql`
3. `003_seed_data.sql` (development only)

## Notes

- `003_seed_data.sql` is only for development.
- The schema enforces multi-tenant isolation with RLS policies.
