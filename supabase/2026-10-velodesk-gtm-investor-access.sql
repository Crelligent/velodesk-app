-- Go-to-Market Score + founder-controlled investor access (Oct 2026)
-- Applied to project trrklkqogomnqvvofhxg on 26 Oct 2026.

-- 1. Go-to-Market Scores: written by the server (service role) in the same run as pmf_scores.
create table if not exists public.gtm_scores (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    score numeric not null check (score >= 0 and score <= 100),
    components jsonb not null default '{}'::jsonb,
    inputs jsonb not null default '{}'::jsonb,
    calculated_at timestamptz not null default now()
);
create index if not exists gtm_scores_user_time on public.gtm_scores (user_id, calculated_at desc);

alter table public.gtm_scores enable row level security;

grant select, insert, update, delete on public.gtm_scores to anon, authenticated;
grant all on public.gtm_scores to service_role;

drop policy if exists "Users can view own GTM scores" on public.gtm_scores;
create policy "Users can view own GTM scores" on public.gtm_scores
    for select using (auth.uid() = user_id);
-- No insert/update/delete policies: only the service role writes scores.

-- 2. Investor access: a founder shares their scores with an investor by email,
--    and can revoke it at any time. Company name/industry are copied at invite time
--    so investors never need read access to profiles.
create table if not exists public.investor_access (
    id uuid primary key default gen_random_uuid(),
    founder_id uuid not null references auth.users(id) on delete cascade,
    investor_email text not null check (investor_email = lower(investor_email) and position('@' in investor_email) > 1),
    company_name text,
    industry text,
    status text not null default 'active' check (status in ('active', 'revoked')),
    created_at timestamptz not null default now(),
    revoked_at timestamptz
);
create unique index if not exists investor_access_active_unique
    on public.investor_access (founder_id, investor_email) where status = 'active';
create index if not exists investor_access_investor on public.investor_access (investor_email) where status = 'active';

alter table public.investor_access enable row level security;

grant select, insert, update, delete on public.investor_access to anon, authenticated;
grant all on public.investor_access to service_role;

drop policy if exists "Founders manage their investor access" on public.investor_access;
create policy "Founders manage their investor access" on public.investor_access
    for all using (auth.uid() = founder_id) with check (auth.uid() = founder_id);

drop policy if exists "Investors see access granted to them" on public.investor_access;
create policy "Investors see access granted to them" on public.investor_access
    for select using (status = 'active' and investor_email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 3. Investors read the scores of founders who granted them active access.
drop policy if exists "Investors view shared PMF scores" on public.pmf_scores;
create policy "Investors view shared PMF scores" on public.pmf_scores
    for select using (exists (
        select 1 from public.investor_access a
        where a.founder_id = pmf_scores.user_id
          and a.status = 'active'
          and a.investor_email = lower(coalesce(auth.jwt() ->> 'email', ''))
    ));

drop policy if exists "Investors view shared GTM scores" on public.gtm_scores;
create policy "Investors view shared GTM scores" on public.gtm_scores
    for select using (exists (
        select 1 from public.investor_access a
        where a.founder_id = gtm_scores.user_id
          and a.status = 'active'
          and a.investor_email = lower(coalesce(auth.jwt() ->> 'email', ''))
    ));
