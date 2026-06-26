-- Velodesk Database Schema
-- Compatible with existing Supabase Auth-Backed Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  industry text,
  team_size text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- ============================================
-- ORGANIZATIONS TABLE
-- For multi-user teams
-- ============================================
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry text,
  size text,
  website text,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.organizations enable row level security;

drop policy if exists "Users can view own organizations" on public.organizations;
drop policy if exists "Users can create organizations" on public.organizations;
drop policy if exists "Users can update own organizations" on public.organizations;

create policy "Users can view own organizations" on public.organizations
  for select using (auth.uid() = owner_id);

create policy "Users can create organizations" on public.organizations
  for insert with check (auth.uid() = owner_id);

create policy "Users can update own organizations" on public.organizations
  for update using (auth.uid() = owner_id);

-- ============================================
-- INTEGRATION TOKENS TABLE
-- For OAuth tokens (uses existing table name)
-- ============================================
create table if not exists public.integration_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  config jsonb default '{}',
  status text default 'connected' check (status in ('connected', 'expired', 'error')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, provider)
);

alter table public.integration_tokens enable row level security;

drop policy if exists "Users can manage own tokens" on public.integration_tokens;

create policy "Users can manage own tokens" on public.integration_tokens
  for all using (auth.uid() = user_id);

-- ============================================
-- EXPERIMENTS TABLE
-- For A/B tests and feature flags (uses existing table)
-- ============================================
create table if not exists public.experiments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  hypothesis text,
  status text default 'draft' check (status in ('draft', 'running', 'paused', 'completed')),
  start_date timestamptz,
  end_date timestamptz,
  variants jsonb default '[]',
  results jsonb default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.experiments enable row level security;

drop policy if exists "Users can manage own experiments" on public.experiments;

create policy "Users can manage own experiments" on public.experiments
  for all using (auth.uid() = user_id);

-- ============================================
-- PMF SCORES TABLE
-- For tracking PMF over time
-- ============================================
create table if not exists public.pmf_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score >= 0 and score <= 100),
  breakdown jsonb not null default '{
    "retention": 0,
    "growth": 0,
    "engagement": 0,
    "revenue": 0,
    "satisfaction": 0
  }',
  insights jsonb default '[]',
  calculated_at timestamptz default now() not null
);

alter table public.pmf_scores enable row level security;

drop policy if exists "Users can view own PMF scores" on public.pmf_scores;
drop policy if exists "Users can create PMF scores" on public.pmf_scores;

create policy "Users can view own PMF scores" on public.pmf_scores
  for select using (auth.uid() = user_id);

create policy "Users can create PMF scores" on public.pmf_scores
  for insert with check (auth.uid() = user_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- For billing/plans
-- ============================================
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  provider text check (provider in ('stripe', 'paystack')),
  provider_customer_id text,
  provider_subscription_id text,
  status text default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view own subscription" on public.subscriptions;

create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_integration_tokens_updated_at on public.integration_tokens;
create trigger update_integration_tokens_updated_at
  before update on public.integration_tokens
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_experiments_updated_at on public.experiments;
create trigger update_experiments_updated_at
  before update on public.experiments
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_subscriptions_updated_at on public.subscriptions;
create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at();
