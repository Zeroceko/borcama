-- Araç hunilerinde olay sırası düzeltmesi. Sonuç olayı istemcide landing_visit'ten
-- milisaniyeler önce yazılabildiği için (lazy sayfa + React efekt sırası) sonuç ve
-- tıklama adımları hep eleniyordu. 1 dakikalık tolerans geçmiş veriyi de düzeltir;
-- yol eşleşmesi sondaki '/' ile de çalışır. İstemci tarafı v1.65.1'de düzeltildi.

create or replace function public.admin_debt_payoff_tool_funnel(p_since timestamptz)
returns table(
  landing_visit bigint,
  result_view bigint,
  product_click bigint,
  register_view bigint,
  sign_up bigint,
  email_verified bigint,
  first_debt_or_statement bigint,
  matured_14d bigint
)
language sql
security definer
set search_path = ''
as $$
  with debt_payoff_sessions as (
    select ae.session_id, min(ae.created_at) as entered_at
    from public.analytics_events ae
    where ae.event_name = 'landing_visit'
      and rtrim(ae.path, '/') = '/araclar/borc-kapatma-hesaplayici'
      and ae.created_at >= p_since
    group by ae.session_id
  ), event_steps as (
    select d.session_id,
      coalesce(bool_or(ae.event_name = 'debt_payoff_result_view' and ae.created_at >= d.entered_at - interval '1 minute'), false) as viewed_result,
      coalesce(bool_or(ae.event_name = 'debt_payoff_product_click' and ae.created_at >= d.entered_at - interval '1 minute'), false) as clicked_product,
      coalesce(bool_or(ae.event_name = 'register_view' and ae.created_at >= d.entered_at - interval '1 minute'), false) as viewed_register
    from debt_payoff_sessions d
    left join public.analytics_events ae using (session_id)
    group by d.session_id
  ), account_steps as (
    select d.session_id,
      count(ua.user_id) > 0 as signed_up,
      count(ua.user_id) filter (where u.email_confirmed_at is not null) > 0 as verified,
      count(ua.user_id) filter (where exists (
        select 1 from public.activity_logs al
        where al.user_id = ua.user_id
          and al.created_at >= d.entered_at
          and al.event_type in ('card_added','statement_added','loan_added','overdraft_added','other_debt_added')
      )) > 0 as added_debt
    from debt_payoff_sessions d
    left join public.user_acquisition ua using (session_id)
    left join auth.users u on u.id = ua.user_id
    group by d.session_id
  )
  select count(*)::bigint,
    count(*) filter (where e.viewed_result)::bigint,
    count(*) filter (where e.clicked_product)::bigint,
    count(*) filter (where e.viewed_register)::bigint,
    count(*) filter (where a.signed_up)::bigint,
    count(*) filter (where a.verified)::bigint,
    count(*) filter (where a.added_debt)::bigint,
    count(*) filter (where d.entered_at <= now() - interval '14 days')::bigint
  from debt_payoff_sessions d
  join event_steps e using (session_id)
  join account_steps a using (session_id);
$$;

create or replace function public.admin_deposit_tool_funnel(p_since timestamptz)
returns table(
  landing_visit bigint,
  result_view bigint,
  product_click bigint,
  register_view bigint,
  sign_up bigint,
  email_verified bigint,
  first_asset bigint,
  first_debt_or_statement bigint,
  matured_14d bigint
)
language sql
security definer
set search_path = ''
as $$
  with deposit_sessions as (
    select ae.session_id, min(ae.created_at) as entered_at
    from public.analytics_events ae
    where ae.event_name = 'landing_visit'
      and rtrim(ae.path, '/') = '/araclar/mevduat-faizi-hesaplama'
      and ae.created_at >= p_since
    group by ae.session_id
  ), event_steps as (
    select d.session_id,
      coalesce(bool_or(ae.event_name = 'deposit_result_view' and ae.created_at >= d.entered_at - interval '1 minute'), false) as viewed_result,
      coalesce(bool_or(ae.event_name = 'deposit_product_click' and ae.created_at >= d.entered_at - interval '1 minute'), false) as clicked_product,
      coalesce(bool_or(ae.event_name = 'register_view' and ae.created_at >= d.entered_at - interval '1 minute'), false) as viewed_register
    from deposit_sessions d
    left join public.analytics_events ae using (session_id)
    group by d.session_id
  ), account_steps as (
    select d.session_id,
      count(ua.user_id) > 0 as signed_up,
      count(ua.user_id) filter (where u.email_confirmed_at is not null) > 0 as verified,
      count(ua.user_id) filter (where exists (
        select 1 from public.activity_logs al
        where al.user_id = ua.user_id
          and al.created_at >= d.entered_at
          and al.event_type = 'asset_added'
      )) > 0 as added_asset,
      count(ua.user_id) filter (where exists (
        select 1 from public.activity_logs al
        where al.user_id = ua.user_id
          and al.created_at >= d.entered_at
          and al.event_type in ('card_added','statement_added','loan_added','overdraft_added','other_debt_added')
      )) > 0 as added_debt
    from deposit_sessions d
    left join public.user_acquisition ua using (session_id)
    left join auth.users u on u.id = ua.user_id
    group by d.session_id
  )
  select count(*)::bigint,
    count(*) filter (where e.viewed_result)::bigint,
    count(*) filter (where e.clicked_product)::bigint,
    count(*) filter (where e.viewed_register)::bigint,
    count(*) filter (where a.signed_up)::bigint,
    count(*) filter (where a.verified)::bigint,
    count(*) filter (where a.added_asset)::bigint,
    count(*) filter (where a.added_debt)::bigint,
    count(*) filter (where d.entered_at <= now() - interval '14 days')::bigint
  from deposit_sessions d
  join event_steps e using (session_id)
  join account_steps a using (session_id);
$$;
