alter table public.user_entitlements
  add column if not exists features_announcement_sent_at timestamptz;

create index if not exists user_entitlements_features_announcement_idx
  on public.user_entitlements (features_announcement_sent_at)
  where features_announcement_sent_at is null;
