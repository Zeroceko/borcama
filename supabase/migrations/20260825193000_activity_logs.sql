create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  event_type text not null check (char_length(event_type) between 2 and 48),
  entity_type text check (entity_type is null or char_length(entity_type) <= 32),
  source text not null default 'manual' check (char_length(source) <= 32),
  path text check (path is null or char_length(path) <= 120),
  metadata jsonb not null default '{}'::jsonb check (octet_length(metadata::text) <= 2048),
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_user_created_idx
  on public.activity_logs (user_id, created_at desc);
create index if not exists activity_logs_created_idx
  on public.activity_logs (created_at desc);
create index if not exists activity_logs_event_created_idx
  on public.activity_logs (event_type, created_at desc);

alter table public.activity_logs enable row level security;
revoke all on public.activity_logs from public, anon;
grant insert on public.activity_logs to authenticated;

drop policy if exists "users_insert_own_activity" on public.activity_logs;
create policy "users_insert_own_activity"
  on public.activity_logs for insert to authenticated
  with check (auth.uid() = user_id);

comment on table public.activity_logs is
  'Privacy-minimized product activity events. Financial amounts and descriptions are intentionally excluded.';
