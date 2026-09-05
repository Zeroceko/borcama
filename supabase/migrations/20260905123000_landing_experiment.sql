-- LANDING-001: yalnız toplulaştırılmış, kişisel veri içermeyen varyant atamasını
-- mevcut ziyaret ve kayıt hunisiyle aynı anonim oturum üzerinde saklar.
alter table public.analytics_events
  add column if not exists experiment_id text not null default '',
  add column if not exists experiment_variant text not null default '';

alter table public.analytics_events
  add constraint analytics_events_experiment_id_check
    check (experiment_id in ('', 'landing-001')),
  add constraint analytics_events_experiment_variant_check
    check (experiment_variant in ('', 'control', 'variant'));

create function public.record_analytics_event(
  p_session_id uuid,
  p_event_name text,
  p_path text,
  p_source text,
  p_medium text,
  p_campaign text,
  p_content text,
  p_term text,
  p_paid_click boolean,
  p_plan text,
  p_experiment_id text,
  p_experiment_variant text
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
    click_id, click_id_present, plan, experiment_id, experiment_variant
  ) values (
    p_session_id, p_event_name, p_path, p_source, p_medium, p_campaign, p_content, p_term,
    '', coalesce(p_paid_click, false), p_plan, p_experiment_id, p_experiment_variant
  )
  on conflict (session_id, event_name) do nothing;
  get diagnostics inserted_count = row_count;

  return inserted_count = 1;
end;
$$;

revoke execute on function public.record_analytics_event(uuid,text,text,text,text,text,text,text,boolean,text,text,text)
  from public, anon, authenticated;
grant execute on function public.record_analytics_event(uuid,text,text,text,text,text,text,text,boolean,text,text,text)
  to service_role;

create or replace function public.admin_landing_experiment_funnel(p_since timestamptz)
returns table(
  variant text,
  landing_visit bigint,
  register_view bigint,
  sign_up bigint,
  email_verified bigint,
  first_debt_or_statement bigint
)
language sql
security definer
set search_path = ''
as $$
  with exposed_sessions as (
    select ae.session_id, ae.experiment_variant as variant, ae.created_at as exposed_at
    from public.analytics_events ae
    where ae.event_name = 'landing_visit'
      and ae.experiment_id = 'landing-001'
      and ae.experiment_variant in ('control', 'variant')
      and ae.created_at >= p_since
  ), event_steps as (
    select e.session_id, e.variant,
      bool_or(ae.event_name = 'register_view' and ae.created_at >= e.exposed_at) as viewed_register
    from exposed_sessions e
    left join public.analytics_events ae using (session_id)
    group by e.session_id, e.variant
  ), account_steps as (
    select e.session_id,
      count(ua.user_id)::bigint as signed_up,
      count(ua.user_id) filter (where u.email_confirmed_at is not null)::bigint as verified,
      count(ua.user_id) filter (where exists (
        select 1 from public.activity_logs al
        where al.user_id = ua.user_id and al.created_at >= e.exposed_at
          and al.event_type in ('card_added','statement_added','loan_added','overdraft_added','other_debt_added')
      ))::bigint as first_debt
    from exposed_sessions e
    left join public.user_acquisition ua using (session_id)
    left join auth.users u on u.id = ua.user_id
    group by e.session_id, e.exposed_at
  )
  select e.variant,
    count(*)::bigint as landing_visit,
    count(*) filter (where e.viewed_register)::bigint as register_view,
    coalesce(sum(a.signed_up), 0)::bigint as sign_up,
    coalesce(sum(a.verified), 0)::bigint as email_verified,
    coalesce(sum(a.first_debt), 0)::bigint as first_debt_or_statement
  from event_steps e
  left join account_steps a using (session_id)
  group by e.variant
  order by e.variant;
$$;

revoke execute on function public.admin_landing_experiment_funnel(timestamptz) from public, anon, authenticated;
grant execute on function public.admin_landing_experiment_funnel(timestamptz) to service_role;
