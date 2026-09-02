alter table public.analytics_events
  add column if not exists click_id_present boolean not null default false;

create table if not exists public.analytics_ingest_windows (
  window_start timestamptz primary key,
  accepted_count integer not null check (accepted_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_acquisition (
  user_id uuid primary key references auth.users(id) on delete cascade,
  session_id uuid not null,
  source text not null,
  medium text not null default '',
  campaign text not null default '',
  content text not null default '',
  term text not null default '',
  click_id_present boolean not null default false,
  plan text not null default '',
  first_touch_at timestamptz not null,
  captured_at timestamptz not null default now()
);

create index if not exists user_acquisition_session_idx
  on public.user_acquisition (session_id);
create index if not exists user_acquisition_first_touch_idx
  on public.user_acquisition (first_touch_at desc);

alter table public.analytics_ingest_windows enable row level security;
alter table public.user_acquisition enable row level security;
revoke all on public.analytics_ingest_windows from public, anon, authenticated;
revoke all on public.user_acquisition from public, anon, authenticated;
grant select on public.user_acquisition to service_role;

create or replace function public.record_analytics_event(
  p_session_id uuid,
  p_event_name text,
  p_path text,
  p_source text,
  p_medium text,
  p_campaign text,
  p_content text,
  p_term text,
  p_paid_click boolean,
  p_plan text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_window timestamptz := date_trunc('minute', now());
  current_count integer;
  inserted_count integer;
begin
  insert into public.analytics_ingest_windows(window_start, accepted_count, updated_at)
  values (current_window, 1, now())
  on conflict (window_start) do update
    set accepted_count = public.analytics_ingest_windows.accepted_count + 1,
        updated_at = excluded.updated_at
  returning accepted_count into current_count;

  if current_count > 1200 then
    raise exception 'ANALYTICS_RATE_LIMITED';
  end if;

  delete from public.analytics_ingest_windows
  where window_start < current_window - interval '1 day';

  insert into public.analytics_events(
    session_id, event_name, path, source, medium, campaign, content, term,
    click_id, click_id_present, plan
  ) values (
    p_session_id, p_event_name, p_path, p_source, p_medium, p_campaign, p_content, p_term,
    '', coalesce(p_paid_click, false), p_plan
  )
  on conflict (session_id, event_name) do nothing;
  get diagnostics inserted_count = row_count;

  return inserted_count = 1;
end;
$$;

revoke execute on function public.record_analytics_event(uuid,text,text,text,text,text,text,text,boolean,text)
  from public, anon, authenticated;
grant execute on function public.record_analytics_event(uuid,text,text,text,text,text,text,text,boolean,text)
  to service_role;

create or replace function public.capture_user_acquisition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  session_text text;
  session_uuid uuid;
  first_event public.analytics_events%rowtype;
  registration_plan text;
begin
  session_text := new.raw_user_meta_data ->> 'funnel_session_id';
  if session_text is null or session_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return new;
  end if;
  session_uuid := session_text::uuid;

  select ae.* into first_event
  from public.analytics_events ae
  where ae.session_id = session_uuid
  order by ae.created_at asc, ae.id asc
  limit 1;

  if first_event.id is null then return new; end if;

  select nullif(ae.plan, '') into registration_plan
  from public.analytics_events ae
  where ae.session_id = session_uuid and ae.plan <> ''
  order by (ae.event_name = 'register_view') desc, ae.created_at desc, ae.id desc
  limit 1;

  insert into public.user_acquisition(
    user_id, session_id, source, medium, campaign, content, term,
    click_id_present, plan, first_touch_at
  ) values (
    new.id, session_uuid,
    coalesce(nullif(first_event.source, ''), 'direct'),
    coalesce(first_event.medium, ''), coalesce(first_event.campaign, ''),
    coalesce(first_event.content, ''), coalesce(first_event.term, ''),
    coalesce(first_event.click_id_present, false), coalesce(registration_plan, first_event.plan, ''),
    first_event.created_at
  )
  on conflict (user_id) do nothing;
  return new;
exception when others then
  -- Ölçüm arızası kullanıcı kaydını engellemez; hesap CRM'de "Ölçülmedi" görünür.
  return new;
end;
$$;

drop trigger if exists on_auth_user_capture_acquisition on auth.users;
create trigger on_auth_user_capture_acquisition
after insert on auth.users
for each row execute function public.capture_user_acquisition();

revoke all on function public.capture_user_acquisition() from public, anon, authenticated;

drop function if exists public.admin_funnel_daily(timestamptz);
create function public.admin_funnel_daily(p_since timestamptz)
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
      date_trunc('day', p_since), date_trunc('day', now()), interval '1 day'
    )::date as day
  ), first_events as (
    select distinct on (ae.session_id)
      ae.session_id, ae.created_at as first_touch_at
    from public.analytics_events ae
    order by ae.session_id, ae.created_at asc, ae.id asc
  ), event_steps as (
    select ae.session_id,
      bool_or(ae.event_name = 'landing_visit') as visited,
      bool_or(ae.event_name = 'register_view') as viewed_register
    from public.analytics_events ae
    group by ae.session_id
  ), account_steps as (
    select ua.session_id,
      count(*) as accounts_created,
      count(*) filter (where u.email_confirmed_at is not null) as accounts_verified
    from public.user_acquisition ua
    join auth.users u on u.id = ua.user_id
    group by ua.session_id
  ), cohorts as (
    select f.first_touch_at::date as day, e.visited, e.viewed_register,
      coalesce(a.accounts_created, 0) as accounts_created,
      coalesce(a.accounts_verified, 0) as accounts_verified
    from first_events f
    join event_steps e using (session_id)
    left join account_steps a using (session_id)
    where f.first_touch_at >= p_since
  ), totals as (
    select c.day,
      count(*) filter (where c.visited) as visitors,
      count(*) filter (where c.viewed_register) as register_views,
      sum(c.accounts_created)::bigint as accounts_created,
      sum(c.accounts_verified)::bigint as accounts_verified
    from cohorts c
    group by c.day
  )
  select d.day,
    coalesce(t.visitors, 0), coalesce(t.register_views, 0),
    coalesce(t.accounts_created, 0), coalesce(t.accounts_verified, 0)
  from days d
  left join totals t using (day)
  order by d.day;
$$;

drop function if exists public.admin_funnel_sources(timestamptz);
create function public.admin_funnel_sources(p_since timestamptz)
returns table (
  source text,
  medium text,
  campaign text,
  visitors bigint,
  register_views bigint,
  accounts_created bigint,
  accounts_verified bigint
)
language sql
security definer
set search_path = ''
as $$
  with first_events as (
    select distinct on (ae.session_id)
      ae.session_id,
      coalesce(nullif(ae.source, ''), 'direct') as source,
      coalesce(ae.medium, '') as medium,
      coalesce(ae.campaign, '') as campaign,
      ae.created_at as first_touch_at
    from public.analytics_events ae
    order by ae.session_id, ae.created_at asc, ae.id asc
  ), event_steps as (
    select ae.session_id,
      bool_or(ae.event_name = 'landing_visit') as visited,
      bool_or(ae.event_name = 'register_view') as viewed_register
    from public.analytics_events ae
    group by ae.session_id
  ), account_steps as (
    select ua.session_id,
      count(*) as accounts_created,
      count(*) filter (where u.email_confirmed_at is not null) as accounts_verified
    from public.user_acquisition ua
    join auth.users u on u.id = ua.user_id
    group by ua.session_id
  ), cohorts as (
    select f.source, f.medium, f.campaign, e.visited, e.viewed_register,
      coalesce(a.accounts_created, 0) as accounts_created,
      coalesce(a.accounts_verified, 0) as accounts_verified
    from first_events f
    join event_steps e using (session_id)
    left join account_steps a using (session_id)
    where f.first_touch_at >= p_since
  )
  select c.source, c.medium, c.campaign,
    count(*) filter (where c.visited) as visitors,
    count(*) filter (where c.viewed_register) as register_views,
    sum(c.accounts_created)::bigint as accounts_created,
    sum(c.accounts_verified)::bigint as accounts_verified
  from cohorts c
  group by c.source, c.medium, c.campaign
  order by sum(c.accounts_verified) desc, count(*) filter (where c.visited) desc;
$$;

revoke execute on function public.admin_funnel_daily(timestamptz) from public, anon, authenticated;
revoke execute on function public.admin_funnel_sources(timestamptz) from public, anon, authenticated;
grant execute on function public.admin_funnel_daily(timestamptz) to service_role;
grant execute on function public.admin_funnel_sources(timestamptz) to service_role;
