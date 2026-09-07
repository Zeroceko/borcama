-- LANDING-002: mevcut landing ile yeni tam sayfa varyantını ayrı bir
-- deney kimliği altında ölçer; LANDING-001 satırları tarihsel kalır.
alter table public.analytics_events
  drop constraint if exists analytics_events_experiment_id_check;

alter table public.analytics_events
  add constraint analytics_events_experiment_id_check
    check (experiment_id in ('', 'landing-001', 'landing-002'));

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
      and ae.experiment_id = 'landing-002'
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
