alter table public.user_entitlements
  add column if not exists trial_started_email_sent_at timestamptz,
  add column if not exists trial_ending_email_sent_at timestamptz;

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subject text not null,
  description text not null default '',
  template_key text not null,
  audience_type text not null,
  kind text not null check (kind in ('auth', 'lifecycle', 'manual')),
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.marketing_campaigns(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  recipient_email text not null,
  resend_email_id text unique,
  status text not null default 'queued',
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  visited_at timestamptz,
  open_count integer not null default 0,
  click_count integer not null default 0,
  visit_count integer not null default 0,
  last_event_at timestamptz,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);

create index if not exists marketing_deliveries_campaign_idx
  on public.marketing_deliveries (campaign_id, created_at desc);
create index if not exists marketing_deliveries_resend_idx
  on public.marketing_deliveries (resend_email_id)
  where resend_email_id is not null;
create index if not exists user_entitlements_trial_lifecycle_idx
  on public.user_entitlements (trial_ends_at)
  where trial_ends_at is not null;

alter table public.marketing_campaigns enable row level security;
alter table public.marketing_deliveries enable row level security;
revoke all on public.marketing_campaigns from anon, authenticated;
revoke all on public.marketing_deliveries from anon, authenticated;

insert into public.marketing_campaigns
  (slug, name, subject, description, template_key, audience_type, kind)
values
  ('auth-confirmation', 'E-posta doğrulama', 'Borcama hesabını doğrula', 'Yeni üyelerin e-posta adresini doğrular.', 'auth_confirmation', 'Yeni üye', 'auth'),
  ('trial-started', 'Pro denemesi başladı', 'Borcama Pro deneme üyeliğin başladı', 'Doğrulamadan sonra açılan 30 günlük Pro denemesini anlatır.', 'trial_started', 'Yeni Pro denemesi', 'lifecycle'),
  ('trial-ending-3d', 'Pro denemesi bitiyor', 'Borcama Pro denemen 3 gün içinde bitiyor', 'Denemenin bitmesine üç gün kala satın alma bağlantısı gönderir.', 'trial_ending', 'Denemesinin son 3 günündeki üyeler', 'lifecycle'),
  ('features-2026-08', 'Yeni özellikler', 'Siz istediniz, biz yaptık: Borcama''da yenilikler', 'Ekstre ve ödeme planı yükleme yeniliklerini anlatır.', 'features', 'Doğrulanmış tüm üyeler', 'manual'),
  ('trial-invite-2026-08', '1 ay ücretsiz Pro', 'Borcama Pro''yu 1 Ay Ücretsiz Denemeye Başla', 'Aktif deneme hakkı bulunan üyelere gider.', 'trial_invite', 'Aktif deneme hakkı bulunan üyeler', 'manual')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  template_key = excluded.template_key,
  audience_type = excluded.audience_type,
  kind = excluded.kind,
  updated_at = now();

create or replace function public.start_borcama_trial_after_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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
  return new;
end;
$$;

revoke execute on function public.start_borcama_trial_after_confirmation() from public, anon, authenticated;

drop trigger if exists borcama_trial_after_confirmation on auth.users;
create trigger borcama_trial_after_confirmation
after insert or update of email_confirmed_at on auth.users
for each row execute function public.start_borcama_trial_after_confirmation();
