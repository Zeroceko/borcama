-- CRM'den kullanıcı silme için iz kaydı. E-posta açık tutulmaz (silinen
-- hesabın verisi geri gelmesin); yalnız SHA-256 özeti, sebep ve işlemi yapan
-- yönetici saklanır. Yalnız service_role erişir.
create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('delete_user')),
  reason text not null check (reason in ('test', 'user_request', 'other')),
  target_user_id uuid not null,
  target_email_sha256 text not null check (target_email_sha256 ~ '^[0-9a-f]{64}$'),
  actor_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_actions_created_idx on public.admin_actions (created_at desc);

alter table public.admin_actions enable row level security;
revoke all on public.admin_actions from public, anon, authenticated;
grant select, insert on public.admin_actions to service_role;
