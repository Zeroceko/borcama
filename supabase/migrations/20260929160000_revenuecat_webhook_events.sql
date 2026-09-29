alter table public.user_entitlements
  add column if not exists revenuecat_event_at timestamptz;

create table if not exists public.revenuecat_webhook_events (
  id text primary key,
  event_type text not null,
  app_user_id uuid references auth.users(id) on delete set null,
  environment text not null check (environment in ('PRODUCTION', 'SANDBOX')),
  store text,
  transaction_id text,
  expiration_at timestamptz,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.revenuecat_webhook_events enable row level security;
revoke all on public.revenuecat_webhook_events from anon, authenticated;

create index if not exists revenuecat_webhook_events_user_idx
  on public.revenuecat_webhook_events (app_user_id, occurred_at desc);
