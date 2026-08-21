alter table public.user_entitlements
  add column if not exists trial_announcement_sent_at timestamptz;

insert into public.user_entitlements (
  user_id,
  trial_started_at,
  trial_ends_at,
  updated_at
)
select
  users.id,
  now(),
  now() + interval '30 days',
  now()
from auth.users as users
left join public.user_entitlements as entitlements
  on entitlements.user_id = users.id
where entitlements.user_id is null
   or (
     entitlements.trial_started_at is null
     and coalesce(entitlements.pro_expires_at, '-infinity'::timestamptz) <= now()
     and coalesce(entitlements.source, '') not in ('admin_revoked', 'self_revoked')
   )
on conflict (user_id) do update
set
  trial_started_at = excluded.trial_started_at,
  trial_ends_at = excluded.trial_ends_at,
  updated_at = excluded.updated_at
where public.user_entitlements.trial_started_at is null
  and coalesce(public.user_entitlements.pro_expires_at, '-infinity'::timestamptz) <= now()
  and coalesce(public.user_entitlements.source, '') not in ('admin_revoked', 'self_revoked');

create index if not exists user_entitlements_trial_announcement_idx
  on public.user_entitlements (trial_announcement_sent_at)
  where trial_ends_at is not null;
