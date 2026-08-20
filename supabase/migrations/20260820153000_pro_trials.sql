alter table public.user_entitlements
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz;

create index if not exists user_entitlements_trial_ends_at_idx
  on public.user_entitlements (trial_ends_at)
  where trial_ends_at is not null;

