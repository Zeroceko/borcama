create table if not exists public.financial_daily_snapshots (
  snapshot_date date primary key,
  participant_count integer not null default 0 check (participant_count >= 0),
  total_debt numeric(18, 2) not null default 0 check (total_debt >= 0),
  cards numeric(18, 2) not null default 0 check (cards >= 0),
  loans numeric(18, 2) not null default 0 check (loans >= 0),
  overdrafts numeric(18, 2) not null default 0 check (overdrafts >= 0),
  others numeric(18, 2) not null default 0 check (others >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists financial_daily_snapshots_date_idx
  on public.financial_daily_snapshots (snapshot_date desc);

alter table public.financial_daily_snapshots enable row level security;
revoke all on public.financial_daily_snapshots from public, anon, authenticated;
grant select, insert, update on public.financial_daily_snapshots to service_role;

comment on table public.financial_daily_snapshots is
  'CEO ekranı için kişi bazında veri içermeyen günlük anonim borç toplamları.';
