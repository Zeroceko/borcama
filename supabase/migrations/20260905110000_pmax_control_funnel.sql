-- LANDING-001'in ilk aşaması: deney exposure veya kullanıcı deneyini değiştirmeden
-- yalnız PMax kontrol kohortunu toplulaştırılmış olarak ölçer.
create or replace function public.admin_pmax_control_funnel(p_since timestamptz)
returns table(
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
  with first_events as (
    select distinct on (ae.session_id) ae.session_id, ae.created_at as first_touch_at
    from public.analytics_events ae
    where ae.source = 'google' and ae.medium = 'cpc' and ae.campaign = 'tr_pmax_borcama'
      and ae.created_at >= p_since
    order by ae.session_id, ae.created_at asc, ae.id asc
  ), event_steps as (
    select ae.session_id,
      bool_or(ae.event_name = 'landing_visit') as visited,
      bool_or(ae.event_name = 'register_view') as viewed_register
    from public.analytics_events ae join first_events f using (session_id)
    group by ae.session_id
  ), account_steps as (
    select ua.session_id,
      count(*)::bigint as signed_up,
      count(*) filter (where u.email_confirmed_at is not null)::bigint as verified,
      count(*) filter (where exists (
        select 1 from public.activity_logs al
        where al.user_id = ua.user_id and al.created_at >= ua.first_touch_at
          and al.event_type in ('card_added','statement_added','loan_added','overdraft_added','other_debt_added')
      ))::bigint as first_debt
    from public.user_acquisition ua join auth.users u on u.id = ua.user_id
    join first_events f using (session_id)
    group by ua.session_id
  )
  select count(*) filter (where e.visited)::bigint,
    count(*) filter (where e.viewed_register)::bigint,
    coalesce(sum(a.signed_up), 0)::bigint,
    coalesce(sum(a.verified), 0)::bigint,
    coalesce(sum(a.first_debt), 0)::bigint
  from event_steps e left join account_steps a using (session_id);
$$;

revoke execute on function public.admin_pmax_control_funnel(timestamptz) from public, anon, authenticated;
grant execute on function public.admin_pmax_control_funnel(timestamptz) to service_role;
