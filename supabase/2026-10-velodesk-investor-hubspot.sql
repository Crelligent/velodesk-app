-- Investor deal scoring in HubSpot (Oct 2026).
-- Company website domain (from the founder's work email) helps match the founder's
-- company to deals in the investor's HubSpot. The investor's HubSpot token lives in
-- integration_tokens with provider 'hubspot_investor' (existing table and policies).
alter table public.investor_access add column if not exists company_domain text;
