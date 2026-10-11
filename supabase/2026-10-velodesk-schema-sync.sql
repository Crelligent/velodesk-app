-- Velodesk schema catch-up — October 2026
-- Run FIRST, before 2026-10-velodesk-fixes.sql and 2026-10-velodesk-invoices.sql.
-- Idempotent and additive: only adds missing columns and missing rows.
--
-- The live database was created from an older schema than src/ expects:
--   * profiles had no email / full_name, so the on-signup trigger (handle_new_user)
--     failed silently and new users got NO profile row (and could never get a
--     subscription, which references profiles).
--   * integration_tokens had sync_status / connected_at but the app reads
--     status / config / created_at / updated_at (and an updated_at trigger already
--     exists on it, so every UPDATE failed).
--   * pmf_scores had no insights; experiments had no description / variants / results.

begin;

-- ============================================
-- 1. PROFILES
-- ============================================
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;

update public.profiles p set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- Users whose profile was never created because of the broken trigger
insert into public.profiles (id, email, full_name, avatar_url)
select u.id, u.email,
       coalesce(u.raw_user_meta_data->>'full_name', ''),
       coalesce(u.raw_user_meta_data->>'avatar_url', '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- ============================================
-- 2. INTEGRATION TOKENS
-- ============================================
alter table public.integration_tokens add column if not exists status text default 'connected';
alter table public.integration_tokens add column if not exists config jsonb default '{}'::jsonb;
alter table public.integration_tokens add column if not exists created_at timestamptz default now();
alter table public.integration_tokens add column if not exists updated_at timestamptz default now();

update public.integration_tokens
set status = coalesce(status, 'connected'),
    config = coalesce(config, '{}'::jsonb),
    created_at = coalesce(connected_at, created_at, now())
where true;

-- ============================================
-- 3. PMF SCORES / EXPERIMENTS
-- ============================================
alter table public.pmf_scores add column if not exists insights jsonb;
alter table public.experiments add column if not exists description text;
alter table public.experiments add column if not exists variants jsonb;
alter table public.experiments add column if not exists results jsonb;

commit;
