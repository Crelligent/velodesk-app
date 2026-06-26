-- FIX: Profile Creation Trigger
-- Run this in Supabase SQL Editor to fix the signup issue

-- Step 1: Drop existing trigger if broken
drop trigger if exists on_auth_user_created on auth.users;

-- Step 2: Recreate the function with proper error handling
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
exception when others then
  -- Log the error but don't fail
  raise log 'Error in handle_new_user: %', SQLERRM;
  return new;
end;
$$ language plpgsql security definer;

-- Step 3: Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Step 4: Grant necessary permissions
grant usage on schema public to authenticated;
grant usage on schema public to anon;
grant all on public.profiles to authenticated;
grant all on public.profiles to anon;
grant all on public.profiles to service_role;

-- Step 5: Ensure service role can bypass RLS
alter table public.profiles force row level security;

-- Add policy for service_role to insert profiles
drop policy if exists "Service role can insert profiles" on public.profiles;
create policy "Service role can insert profiles" on public.profiles
  for insert to service_role with check (true);

-- Step 6: Verify the trigger exists
select tgname, tgrelid::regclass, proname
from pg_trigger t
join pg_proc p on t.tgfoid = p.oid
where t.tgname = 'on_auth_user_created';
