-- Programme membership for the programme benchmark (Oct 2026).
-- A founder joins the programme of the partner perk they signed up through.
-- Written only by the server (service role); founders can read their own row.
create table if not exists public.programme_members (
    user_id uuid primary key references auth.users(id) on delete cascade,
    programme text not null,
    joined_at timestamptz not null default now()
);
create index if not exists programme_members_programme on public.programme_members (programme);

alter table public.programme_members enable row level security;

grant select, insert, update, delete on public.programme_members to anon, authenticated;
grant all on public.programme_members to service_role;

drop policy if exists "Users can view own programme" on public.programme_members;
create policy "Users can view own programme" on public.programme_members
    for select using (auth.uid() = user_id);
-- No insert/update/delete policies: membership is set server-side only.

-- Backfill founders who already signed up through a perk.
insert into public.programme_members (user_id, programme, joined_at)
select u.id, lower(u.raw_user_meta_data ->> 'perk_code'), u.created_at
from auth.users u
where u.raw_user_meta_data ->> 'perk_code' is not null
  and lower(u.raw_user_meta_data ->> 'perk_code') in
      ('posthog','mixpanel','paystack','hubspot','google','vc4a','cchub','vestbee','openvc','f6s','creditforstartups','indiehackers')
on conflict (user_id) do nothing;
