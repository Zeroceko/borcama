create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code)
);

create unique index if not exists referral_codes_active_user_idx
  on public.referral_codes (user_id)
  where status in ('active', 'paused');

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  invitee_user_id uuid not null references auth.users(id) on delete cascade,
  referral_code_id uuid not null references public.referral_codes(id),
  status text not null default 'registered' check (status in ('registered', 'verified', 'rewarded', 'review', 'rejected')),
  risk_reason text,
  attributed_at timestamptz not null default now(),
  verified_at timestamptz,
  rewarded_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invitee_user_id),
  check (referrer_user_id <> invitee_user_id)
);

create index if not exists referrals_referrer_idx
  on public.referrals (referrer_user_id, created_at desc);
create index if not exists referrals_review_idx
  on public.referrals (status, verified_at desc)
  where status = 'review';

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('referrer', 'invitee')),
  days integer not null default 30 check (days between 1 and 365),
  status text not null default 'pending' check (status in ('pending', 'active', 'applied', 'review', 'revoked')),
  starts_at timestamptz,
  ends_at timestamptz,
  applied_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (referral_id, user_id),
  unique (referral_id, role)
);

create index if not exists referral_rewards_user_idx
  on public.referral_rewards (user_id, created_at desc);
create index if not exists referral_rewards_pending_idx
  on public.referral_rewards (user_id, status)
  where status = 'pending';

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;

alter table public.marketing_deliveries
  add column if not exists delivery_key text not null default 'default';
alter table public.marketing_deliveries
  drop constraint if exists marketing_deliveries_campaign_id_user_id_key;
create unique index if not exists marketing_deliveries_campaign_user_key_idx
  on public.marketing_deliveries (campaign_id, user_id, delivery_key);

revoke all on public.referral_codes from anon, authenticated;
revoke all on public.referrals from anon, authenticated;
revoke all on public.referral_rewards from anon, authenticated;

create or replace function public.normalize_referral_code(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select upper(regexp_replace(coalesce(value, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

create or replace function public.canonical_referral_email(value text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  local_part text;
  domain_part text;
begin
  local_part := split_part(lower(trim(coalesce(value, ''))), '@', 1);
  domain_part := split_part(lower(trim(coalesce(value, ''))), '@', 2);
  local_part := split_part(local_part, '+', 1);
  if domain_part in ('gmail.com', 'googlemail.com') then
    local_part := replace(local_part, '.', '');
    domain_part := 'gmail.com';
  end if;
  return local_part || '@' || domain_part;
end;
$$;

create or replace function public.apply_referral_reward(reward_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  reward public.referral_rewards%rowtype;
  entitlement public.user_entitlements%rowtype;
  start_at timestamptz;
  end_at timestamptz;
begin
  select * into reward
  from public.referral_rewards
  where id = reward_id
  for update;

  if reward.id is null or reward.status <> 'pending' then
    return false;
  end if;

  -- Aynı kullanıcıya eş zamanlı gelen ödüller birbirinin süresini ezmesin.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(reward.user_id::text, 0));

  select * into entitlement
  from public.user_entitlements
  where user_id = reward.user_id
  for update;

  if coalesce(entitlement.source, '') in ('admin_revoked', 'self_revoked') then
    update public.referral_rewards
    set status = 'review', updated_at = now()
    where id = reward.id;
    update public.referrals
    set status = 'review', risk_reason = 'pro_access_revoked', updated_at = now()
    where id = reward.referral_id;
    return false;
  end if;

  -- Ücretli hak devam ederken sağlayıcının bitiş tarihine dokunma; ödül sırada kalır.
  if entitlement.pro_expires_at is not null and entitlement.pro_expires_at > now() then
    return false;
  end if;

  start_at := greatest(now(), coalesce(entitlement.trial_ends_at, now()));
  end_at := start_at + make_interval(days => reward.days);

  insert into public.user_entitlements (
    user_id, trial_started_at, trial_ends_at, trial_ending_email_sent_at, updated_at
  ) values (
    reward.user_id, now(), end_at, null, now()
  )
  on conflict (user_id) do update set
    trial_started_at = coalesce(public.user_entitlements.trial_started_at, excluded.trial_started_at),
    trial_ends_at = end_at,
    trial_ending_email_sent_at = null,
    updated_at = now();

  update public.referral_rewards
  set status = 'applied', starts_at = start_at, ends_at = end_at,
      applied_at = now(), updated_at = now()
  where id = reward.id;
  update public.referrals
  set status = 'rewarded', rewarded_at = coalesce(rewarded_at, now()), updated_at = now()
  where id = reward.referral_id
    and not exists (
      select 1 from public.referral_rewards pending
      where pending.referral_id = reward.referral_id
        and pending.status in ('pending', 'review')
    );
  return true;
end;
$$;

create or replace function public.activate_pending_referral_rewards(target_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  reward record;
  applied_count integer := 0;
begin
  for reward in
    select id from public.referral_rewards
    where user_id = target_user_id and status = 'pending'
    order by created_at
  loop
    if public.apply_referral_reward(reward.id) then
      applied_count := applied_count + 1;
    else
      exit;
    end if;
  end loop;
  return applied_count;
end;
$$;

create or replace function public.process_verified_referral(target_invitee_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  referral public.referrals%rowtype;
  monthly_verified integer;
  blocked_accounts integer;
  recent_registrations integer;
  same_email_alias boolean;
  reward_status text;
  item record;
begin
  select * into referral
  from public.referrals
  where invitee_user_id = target_invitee_id
  for update;

  if referral.id is null or referral.status not in ('registered', 'verified') then
    return;
  end if;

  select count(*) into monthly_verified
  from public.referrals
  where referrer_user_id = referral.referrer_user_id
    and id <> referral.id
    and verified_at >= date_trunc('month', now())
    and status in ('verified', 'rewarded', 'review');

  select count(*) into blocked_accounts
  from public.user_entitlements
  where user_id in (referral.referrer_user_id, referral.invitee_user_id)
    and coalesce(source, '') in ('admin_revoked', 'self_revoked');

  select count(*) into recent_registrations
  from public.referrals
  where referrer_user_id = referral.referrer_user_id
    and id <> referral.id
    and attributed_at >= now() - interval '1 hour';

  select public.canonical_referral_email(referrer.email) = public.canonical_referral_email(invitee.email)
  into same_email_alias
  from auth.users referrer, auth.users invitee
  where referrer.id = referral.referrer_user_id
    and invitee.id = referral.invitee_user_id;

  reward_status := case
    when monthly_verified >= 3 or blocked_accounts > 0 or recent_registrations >= 4 or coalesce(same_email_alias, false)
      then 'review'
    else 'pending'
  end;

  update public.referrals
  set status = case when reward_status = 'review' then 'review' else 'verified' end,
      risk_reason = case
        when blocked_accounts > 0 then 'pro_access_revoked'
        when coalesce(same_email_alias, false) then 'email_alias_match'
        when recent_registrations >= 4 then 'registration_velocity'
        when monthly_verified >= 3 then 'monthly_verified_limit'
        else null
      end,
      verified_at = coalesce(verified_at, now()), updated_at = now()
  where id = referral.id;

  insert into public.referral_rewards (referral_id, user_id, role, days, status)
  values
    (referral.id, referral.referrer_user_id, 'referrer', 30, reward_status),
    (referral.id, referral.invitee_user_id, 'invitee', 30, reward_status)
  on conflict (referral_id, user_id) do nothing;

  if reward_status = 'review' then
    return;
  end if;

  for item in
    select id from public.referral_rewards
    where referral_id = referral.id and status = 'pending'
    order by role
  loop
    perform public.apply_referral_reward(item.id);
  end loop;

  if not exists (
    select 1 from public.referral_rewards
    where referral_id = referral.id and status in ('pending', 'review')
  ) then
    update public.referrals
    set status = 'rewarded', rewarded_at = now(), updated_at = now()
    where id = referral.id;
  end if;
end;
$$;

create or replace function public.start_borcama_trial_after_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted_code text;
  code_row public.referral_codes%rowtype;
begin
  if tg_op = 'INSERT' then
    submitted_code := public.normalize_referral_code(new.raw_user_meta_data ->> 'referral_code');
    if submitted_code <> '' then
      select * into code_row
      from public.referral_codes
      where code = submitted_code and status = 'active';
      if code_row.id is not null and code_row.user_id <> new.id then
        insert into public.referrals (
          referrer_user_id, invitee_user_id, referral_code_id, status
        ) values (
          code_row.user_id, new.id, code_row.id, 'registered'
        ) on conflict (invitee_user_id) do nothing;
      end if;
    end if;
  end if;

  if new.email_confirmed_at is null then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.email_confirmed_at is not null then
    return new;
  end if;

  insert into public.user_entitlements (
    user_id, trial_started_at, trial_ends_at, updated_at
  ) values (
    new.id, now(), now() + interval '30 days', now()
  )
  on conflict (user_id) do update set
    trial_started_at = coalesce(public.user_entitlements.trial_started_at, excluded.trial_started_at),
    trial_ends_at = coalesce(public.user_entitlements.trial_ends_at, excluded.trial_ends_at),
    updated_at = now()
  where public.user_entitlements.trial_started_at is null
    and coalesce(public.user_entitlements.source, '') not in ('admin_revoked', 'self_revoked');

  perform public.process_verified_referral(new.id);
  return new;
end;
$$;

create or replace function public.review_referral_reward(
  target_referral_id uuid,
  target_admin_id uuid,
  approve boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item record;
begin
  if approve then
    update public.referrals
    set status = 'verified', risk_reason = null, reviewed_at = now(),
        reviewed_by = target_admin_id, updated_at = now()
    where id = target_referral_id and status = 'review';
    update public.referral_rewards
    set status = 'pending', updated_at = now()
    where referral_id = target_referral_id and status = 'review';
    for item in
      select id from public.referral_rewards
      where referral_id = target_referral_id and status = 'pending'
      order by role
    loop
      perform public.apply_referral_reward(item.id);
    end loop;
  else
    update public.referrals
    set status = 'rejected', reviewed_at = now(), reviewed_by = target_admin_id,
        updated_at = now()
    where id = target_referral_id and status = 'review';
    update public.referral_rewards
    set status = 'revoked', updated_at = now()
    where referral_id = target_referral_id and status = 'review';
  end if;
end;
$$;

revoke execute on function public.normalize_referral_code(text) from public, anon, authenticated;
revoke execute on function public.canonical_referral_email(text) from public, anon, authenticated;
revoke execute on function public.apply_referral_reward(uuid) from public, anon, authenticated;
revoke execute on function public.activate_pending_referral_rewards(uuid) from public, anon, authenticated;
revoke execute on function public.process_verified_referral(uuid) from public, anon, authenticated;
revoke execute on function public.start_borcama_trial_after_confirmation() from public, anon, authenticated;
revoke execute on function public.review_referral_reward(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.activate_pending_referral_rewards(uuid) to service_role;
grant execute on function public.review_referral_reward(uuid, uuid, boolean) to service_role;

insert into public.marketing_campaigns
  (slug, name, subject, description, template_key, audience_type, kind, status)
values
  ('referral-reward-referrer', 'Davet ödülü · davet eden', 'Arkadaşın katıldı, 30 gün Pro kazandın', 'Doğrulanan davet sonrası davet edene gider.', 'referral_reward_referrer', 'Davet ödülü kazanan üye', 'lifecycle', 'active'),
  ('referral-reward-invitee', 'Davet ödülü · yeni üye', 'Davet ödülün hazır: Pro sürene 30 gün eklendi', 'Doğrulanan davet sonrası yeni üyeye gider.', 'referral_reward_invitee', 'Davetle doğrulanan yeni üye', 'lifecycle', 'active')
on conflict (slug) do update set
  name = excluded.name,
  subject = excluded.subject,
  description = excluded.description,
  template_key = excluded.template_key,
  audience_type = excluded.audience_type,
  kind = excluded.kind,
  status = excluded.status,
  updated_at = now();
