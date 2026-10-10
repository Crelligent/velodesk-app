-- Velodesk fixes — October 2026
-- Idempotent. Run in the Supabase SQL editor AFTER schema.sql / subscriptions.sql.
-- Reconciles the two conflicting `subscriptions` definitions (schema.sql vs
-- subscriptions.sql), closes an RLS hole, and hides integration secrets from
-- the browser.

begin;

-- ============================================
-- 1. SUBSCRIPTIONS: superset of both schemas
-- ============================================
alter table public.subscriptions add column if not exists plan text default 'free';
alter table public.subscriptions add column if not exists provider text;
alter table public.subscriptions add column if not exists provider_customer_id text;
alter table public.subscriptions add column if not exists provider_subscription_id text;
alter table public.subscriptions add column if not exists stripe_customer_id text;
alter table public.subscriptions add column if not exists stripe_subscription_id text;
alter table public.subscriptions add column if not exists price_id text;
alter table public.subscriptions add column if not exists current_period_start timestamptz;
alter table public.subscriptions add column if not exists current_period_end timestamptz;
alter table public.subscriptions add column if not exists trial_ends_at timestamptz;

-- schema.sql only allowed free/pro/enterprise; pricing sells founder/startup/accelerator
alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check
  check (plan in ('free', 'founder', 'startup', 'accelerator', 'pro', 'enterprise'));

-- Allow every status the Stripe/Paystack webhooks write
alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions add constraint subscriptions_status_check
  check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete',
                    'incomplete_expired', 'paused', 'non_renewing'));

alter table public.subscriptions drop constraint if exists subscriptions_provider_check;
alter table public.subscriptions add constraint subscriptions_provider_check
  check (provider is null or provider in ('stripe', 'paystack'));

-- Webhooks upsert ON CONFLICT (user_id): one subscription row per user.
-- FAILS if duplicates exist; check first:
--   select user_id, count(*) from public.subscriptions group by 1 having count(*) > 1;
create unique index if not exists subscriptions_user_id_key on public.subscriptions(user_id);
create unique index if not exists subscriptions_stripe_subscription_id_key
  on public.subscriptions(stripe_subscription_id);
create index if not exists subscriptions_provider_customer_idx
  on public.subscriptions(provider, provider_customer_id);

-- CRITICAL: subscriptions.sql created a policy with no role and USING (true) /
-- WITH CHECK (true), i.e. ANY user (even anon) could read, insert, update or
-- delete ANY subscription (e.g. grant themselves a paid plan).
-- The service role bypasses RLS anyway, so this policy is not needed.
drop policy if exists "Service role can manage subscriptions" on public.subscriptions;

-- Ensure the owner-read policy exists under either schema
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ============================================
-- 2. INTEGRATION TOKENS: secrets are server-only
-- ============================================
-- access_token / refresh_token hold customers' Paystack secret keys and OAuth
-- tokens in plaintext. Browsers keep read access to metadata only; API routes
-- read secrets with the service role, scoped to the session user.
revoke select on public.integration_tokens from anon, authenticated;
grant select (id, user_id, provider, status, scope, expires_at, config, created_at, updated_at)
  on public.integration_tokens to authenticated;

-- Writes of secrets also go through API routes (session-scoped, plan limits)
revoke insert, update on public.integration_tokens from anon, authenticated;
-- DELETE (disconnect from the dashboard) remains allowed by the RLS owner policy.

-- Explicit WITH CHECK so a user can never write a row for someone else
drop policy if exists "Users can manage own tokens" on public.integration_tokens;
create policy "Users can manage own tokens" on public.integration_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================
-- 3. PMF SCORES: record which inputs a score was based on
-- ============================================
-- { inputsUsed: text[], missing: text[], sources: {metric: provider},
--   revenue: { mrr, currency, bySource, fxRate?, excluded, score } }
alter table public.pmf_scores add column if not exists inputs jsonb;

-- ============================================
-- 4. PAYMENT EVENTS: each provider payment reference is used once
-- ============================================
-- Prevents replaying an old successful Paystack reference to reactivate a
-- subscription, and de-duplicates callback vs webhook processing.
create table if not exists public.payment_events (
  id uuid primary key default uuid_generate_v4(),
  provider text not null check (provider in ('stripe', 'paystack')),
  reference text not null,
  user_id uuid references auth.users(id) on delete set null,
  amount bigint,          -- minor units (kobo / cents)
  currency text,
  paid_at timestamptz,
  created_at timestamptz default now() not null,
  unique (provider, reference)
);

-- Service role only: RLS on, no policies for anon/authenticated
alter table public.payment_events enable row level security;

-- ============================================
-- 5. RESCORE THROTTLE
-- ============================================
-- Background PMF rescoring (after connect/sync) runs at most once per user per
-- 15 minutes; claimed atomically by updating this column. Cron ignores it.
alter table public.profiles add column if not exists last_scored_at timestamptz;

commit;

-- TODO (not done here): encrypt access_token/refresh_token at rest
-- (Supabase Vault / pgsodium, or app-level AES-GCM with a key outside the DB).
