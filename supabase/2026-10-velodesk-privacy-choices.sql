-- Privacy choices (Oct 2026). One row per user, written when they first see the
-- "Your data, your control" screen and whenever they change a switch in Settings.
-- Every optional choice defaults to false (GDPR: consent is opt-in).
create table if not exists public.privacy_choices (
    user_id uuid primary key references auth.users(id) on delete cascade,
    benchmark boolean not null default false,       -- include my scores in my programme's benchmark
    product_emails boolean not null default false,  -- product updates and tips by email
    usage_analytics boolean not null default false, -- site measurement (Google Tag Manager, Apollo tracker)
    decided_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.privacy_choices enable row level security;

grant select, insert, update, delete on public.privacy_choices to anon, authenticated;
grant all on public.privacy_choices to service_role;

drop policy if exists "Users read own privacy choices" on public.privacy_choices;
create policy "Users read own privacy choices" on public.privacy_choices
    for select using (auth.uid() = user_id);
drop policy if exists "Users insert own privacy choices" on public.privacy_choices;
create policy "Users insert own privacy choices" on public.privacy_choices
    for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own privacy choices" on public.privacy_choices;
create policy "Users update own privacy choices" on public.privacy_choices
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
