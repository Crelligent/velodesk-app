# Project notes

## Supabase: every new table needs explicit grants
From 30 October 2026, Supabase no longer grants Data API access to new tables in the `public` schema automatically.
Every SQL script or migration that creates a table in `public` must grant access in the same file, or supabase-js returns "permission denied":

```sql
grant select, insert, update, delete on public.<table> to anon, authenticated;
grant all on public.<table> to service_role;
```

Server-only tables (tokens, secrets, internal usage logs) get only the `service_role` line. Row Level Security still has to be enabled with policies; grants do not replace it.
