-- ============================================
-- ADVANCED ENTERPRISE FEATURES SCHEMA
-- Run this in your Supabase SQL Editor after the main schema
-- ============================================

-- ============================================
-- ORGANIZATION MEMBERS TABLE
-- For team/multi-user support
-- ============================================
create table if not exists public.organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  invited_by uuid references public.profiles(id),
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  created_at timestamptz default now() not null,
  unique(organization_id, user_id)
);

alter table public.organization_members enable row level security;

-- Members can view their own memberships
create policy "Users can view memberships" on public.organization_members
  for select using (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT om.user_id FROM public.organization_members om 
      WHERE om.organization_id = organization_id AND om.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can insert members
create policy "Admins can invite members" on public.organization_members
  for insert with check (
    auth.uid() IN (
      SELECT om.user_id FROM public.organization_members om 
      WHERE om.organization_id = organization_id AND om.role IN ('owner', 'admin')
    ) OR
    auth.uid() = user_id -- For accepting own invite
  );

-- Only owners can update roles
create policy "Owners can update members" on public.organization_members
  for update using (
    auth.uid() IN (
      SELECT om.user_id FROM public.organization_members om 
      WHERE om.organization_id = organization_id AND om.role = 'owner'
    )
  );

-- Only owners can remove members
create policy "Owners can remove members" on public.organization_members
  for delete using (
    auth.uid() IN (
      SELECT om.user_id FROM public.organization_members om 
      WHERE om.organization_id = organization_id AND om.role = 'owner'
    ) OR
    auth.uid() = user_id -- Users can leave
  );

-- ============================================
-- TEAM INVITES TABLE
-- For pending team invitations
-- ============================================
create table if not exists public.team_invites (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member', 'viewer')),
  token text not null unique,
  invited_by uuid references public.profiles(id) not null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.team_invites enable row level security;

create policy "Users can view invites for their orgs" on public.team_invites
  for select using (
    auth.uid() IN (
      SELECT om.user_id FROM public.organization_members om 
      WHERE om.organization_id = organization_id AND om.role IN ('owner', 'admin')
    )
  );

create policy "Admins can create invites" on public.team_invites
  for insert with check (
    auth.uid() IN (
      SELECT om.user_id FROM public.organization_members om 
      WHERE om.organization_id = organization_id AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- ENTERPRISE SETTINGS TABLE
-- For white-label customization
-- ============================================
create table if not exists public.enterprise_settings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade not null unique,
  logo_url text,
  primary_color text default '#22c55e',
  secondary_color text default '#1a1a1a',
  font_family text default 'Outfit',
  custom_domain text,
  remove_branding boolean default false,
  custom_footer_text text,
  email_from_name text,
  email_from_address text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.enterprise_settings enable row level security;

create policy "Org members can view settings" on public.enterprise_settings
  for select using (
    auth.uid() IN (
      SELECT om.user_id FROM public.organization_members om 
      WHERE om.organization_id = organization_id
    )
  );

create policy "Admins can update settings" on public.enterprise_settings
  for all using (
    auth.uid() IN (
      SELECT om.user_id FROM public.organization_members om 
      WHERE om.organization_id = organization_id AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- API KEYS TABLE
-- For API access
-- ============================================
create table if not exists public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  key_hash text not null, -- Store hashed version of the key
  key_prefix text not null, -- First 8 chars for identification (vd_xxx...)
  last_used_at timestamptz,
  usage_count integer default 0,
  rate_limit integer default 1000, -- Requests per hour
  scopes text[] default array['read'],
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.api_keys enable row level security;

create policy "Users can manage own API keys" on public.api_keys
  for all using (auth.uid() = user_id);

-- ============================================
-- API USAGE LOG TABLE
-- For tracking API usage
-- ============================================
create table if not exists public.api_usage_log (
  id uuid primary key default uuid_generate_v4(),
  api_key_id uuid references public.api_keys(id) on delete cascade not null,
  endpoint text not null,
  method text not null,
  status_code integer,
  response_time_ms integer,
  ip_address text,
  created_at timestamptz default now() not null
);

alter table public.api_usage_log enable row level security;

create policy "Users can view own API usage" on public.api_usage_log
  for select using (
    api_key_id IN (SELECT id FROM public.api_keys WHERE user_id = auth.uid())
  );

-- ============================================
-- PMF REPORTS TABLE (extended)
-- For shareable reports with white-label support
-- ============================================
create table if not exists public.pmf_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  slug text not null unique,
  title text not null,
  pmf_score_id uuid references public.pmf_scores(id),
  score integer not null,
  breakdown jsonb not null,
  insights jsonb default '[]',
  is_public boolean default true,
  password_hash text, -- Optional password protection
  custom_branding jsonb, -- Override org branding
  view_count integer default 0,
  expires_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.pmf_reports enable row level security;

create policy "Users can manage own reports" on public.pmf_reports
  for all using (auth.uid() = user_id);

create policy "Public reports are viewable" on public.pmf_reports
  for select using (is_public = true);

-- ============================================
-- TRIGGERS
-- ============================================

drop trigger if exists update_enterprise_settings_updated_at on public.enterprise_settings;
create trigger update_enterprise_settings_updated_at
  before update on public.enterprise_settings
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_pmf_reports_updated_at on public.pmf_reports;
create trigger update_pmf_reports_updated_at
  before update on public.pmf_reports
  for each row execute procedure public.update_updated_at();
