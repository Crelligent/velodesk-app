-- Velodesk invoices & receipts — October 2026
-- Idempotent. Run in the Supabase SQL editor AFTER 2026-10-velodesk-fixes.sql.
--
-- One row per successful subscription charge. The row is BOTH the invoice and the
-- receipt (an invoice marked paid, plus a receipt number). Amounts are integers in
-- minor units (kobo / cents). Customer and seller details are snapshotted at issue
-- time so a later profile edit never rewrites an issued invoice.

begin;

-- ============================================
-- 1. NUMBERING: VD-2026-00001 (invoice) / VDR-2026-00001 (receipt)
-- ============================================
create sequence if not exists public.invoice_number_seq;

-- ============================================
-- 2. INVOICES
-- ============================================
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  seq bigint not null default nextval('public.invoice_number_seq'),
  number text unique,          -- set by the trigger below
  receipt_number text unique,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null check (provider in ('stripe', 'paystack')),
  provider_reference text not null,          -- Paystack transaction reference / Stripe invoice id
  status text not null default 'paid' check (status in ('paid', 'refunded', 'void')),
  currency text not null check (currency in ('NGN', 'USD')),
  subtotal bigint not null check (subtotal >= 0),  -- excl. VAT
  tax bigint not null default 0 check (tax >= 0),
  total bigint not null check (total >= 0),        -- = amount charged
  tax_rate numeric(5, 2) not null default 0,
  tax_label text,                                   -- e.g. 'VAT 7.5%'; null = no tax line
  plan text,
  description text not null,                        -- line item text
  period_start timestamptz,
  period_end timestamptz,
  issued_at timestamptz not null default now(),
  paid_at timestamptz not null,
  payment_method text,                              -- 'Visa •••• 4081'
  customer jsonb not null,                          -- {name, email, company, address, taxId}
  seller jsonb not null,                            -- {name, address, rcNumber, tin, email, website}
  emailed_at timestamptz,
  email_error text,
  created_at timestamptz not null default now(),
  unique (provider, provider_reference),
  unique (seq),
  constraint invoices_amounts_add_up check (total = subtotal + tax)
);

create or replace function public.set_invoice_numbers() returns trigger
language plpgsql as $$
declare
  yr text := to_char(new.issued_at at time zone 'Africa/Lagos', 'YYYY');
  n text := lpad(new.seq::text, 5, '0');
begin
  new.number := 'VD-' || yr || '-' || n;
  new.receipt_number := 'VDR-' || yr || '-' || n;
  return new;
end $$;

drop trigger if exists invoices_set_numbers on public.invoices;
create trigger invoices_set_numbers before insert on public.invoices
  for each row execute function public.set_invoice_numbers();

create index if not exists invoices_user_issued_idx on public.invoices (user_id, issued_at desc);

-- Owners can read their own invoices; all writes go through the service role.
alter table public.invoices enable row level security;
drop policy if exists "Users can view own invoices" on public.invoices;
create policy "Users can view own invoices" on public.invoices
  for select using (auth.uid() = user_id);

-- ============================================
-- 3. BILLING DETAILS shown on invoices (editable in Settings)
-- ============================================
alter table public.profiles add column if not exists billing_address text;
alter table public.profiles add column if not exists tax_id text;

-- ============================================
-- 4. FAILED-PAYMENT NOTICE: one email per failure episode
-- ============================================
alter table public.subscriptions add column if not exists past_due_since timestamptz;
alter table public.subscriptions add column if not exists payment_failed_notified_at timestamptz;
alter table public.subscriptions add column if not exists currency text;
alter table public.subscriptions add column if not exists plan_amount bigint;   -- minor units, last charge

-- ============================================
-- 5. UPCOMING-CHARGE HEADS-UP: the charge date the last reminder was sent for
-- ============================================
alter table public.subscriptions add column if not exists upcoming_charge_notified_for timestamptz;

commit;
