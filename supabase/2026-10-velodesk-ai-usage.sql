-- Velodesk AI usage log: one row per answered question. Used for the daily per-user
-- limit (AI_DAILY_MESSAGE_LIMIT) and to track Anthropic API cost. Service role only.
create table if not exists public.ai_usage (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  tool_calls integer not null default 0
);
create index if not exists ai_usage_user_created_idx on public.ai_usage (user_id, created_at desc);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;

-- Data API grants (required for new tables in "public" from 30 Oct 2026).
-- Mirrors production. Row Level Security still controls which rows each user can reach.
grant all on public.ai_usage to service_role;
