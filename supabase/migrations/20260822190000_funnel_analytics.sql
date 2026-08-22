create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  event_name text not null check (event_name in ('landing_visit', 'register_view')),
  path text not null default '',
  source text not null default 'direct',
  medium text not null default '',
  campaign text not null default '',
  plan text not null default '',
  created_at timestamptz not null default now(),
  unique (session_id, event_name)
);

create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_source_idx
  on public.analytics_events (source, created_at desc);

alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from public, anon, authenticated;

create or replace function public.admin_funnel_daily(p_since timestamptz)
returns table (
  day date,
  visitors bigint,
  register_views bigint,
  accounts_created bigint,
  accounts_verified bigint
)
language sql
security definer
set search_path = ''
as $$
  with days as (
    select generate_series(
      date_trunc('day', p_since),
      date_trunc('day', now()),
      interval '1 day'
    )::date as day
  ), event_counts as (
    select created_at::date as day,
      count(*) filter (where event_name = 'landing_visit') as visitors,
      count(*) filter (where event_name = 'register_view') as register_views
    from public.analytics_events
    where created_at >= p_since
    group by created_at::date
  ), user_counts as (
    select created_at::date as day,
      count(*) as accounts_created,
      count(*) filter (where email_confirmed_at is not null) as accounts_verified
    from auth.users
    where created_at >= p_since
      and raw_user_meta_data ->> 'funnel_session_id' is not null
    group by created_at::date
  )
  select d.day,
    coalesce(e.visitors, 0),
    coalesce(e.register_views, 0),
    coalesce(u.accounts_created, 0),
    coalesce(u.accounts_verified, 0)
  from days d
  left join event_counts e using (day)
  left join user_counts u using (day)
  order by d.day;
$$;

create or replace function public.admin_funnel_sources(p_since timestamptz)
returns table (source text, visitors bigint)
language sql
security definer
set search_path = ''
as $$
  select coalesce(nullif(ae.source, ''), 'direct') as source, count(*) as visitors
  from public.analytics_events ae
  where ae.event_name = 'landing_visit' and ae.created_at >= p_since
  group by 1
  order by 2 desc
  limit 12;
$$;

revoke execute on function public.admin_funnel_daily(timestamptz) from public, anon, authenticated;
revoke execute on function public.admin_funnel_sources(timestamptz) from public, anon, authenticated;
grant execute on function public.admin_funnel_daily(timestamptz) to service_role;
grant execute on function public.admin_funnel_sources(timestamptz) to service_role;
