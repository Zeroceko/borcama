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
  with event_totals as (
    select
      coalesce(nullif(source, ''), 'direct') as source,
      coalesce(medium, '') as medium,
      coalesce(campaign, '') as campaign,
      count(*) filter (where event_name = 'landing_visit') as visitors,
      count(*) filter (where event_name = 'register_view') as register_views
    from public.analytics_events
    where created_at >= p_since
    group by 1, 2, 3
  ), user_totals as (
    select
      coalesce(nullif(raw_user_meta_data ->> 'funnel_source', ''), 'direct') as source,
      coalesce(raw_user_meta_data ->> 'funnel_medium', '') as medium,
      coalesce(raw_user_meta_data ->> 'funnel_campaign', '') as campaign,
      count(*) as accounts_created,
      count(*) filter (where email_confirmed_at is not null) as accounts_verified
    from auth.users
    where created_at >= p_since
      and raw_user_meta_data ->> 'funnel_session_id' is not null
    group by 1, 2, 3
  ), keys as (
    select source, medium, campaign from event_totals
    union
    select source, medium, campaign from user_totals
  )
  select k.source, k.medium, k.campaign,
    coalesce(e.visitors, 0), coalesce(e.register_views, 0),
    coalesce(u.accounts_created, 0), coalesce(u.accounts_verified, 0)
  from keys k
  left join event_totals e using (source, medium, campaign)
  left join user_totals u using (source, medium, campaign)
  order by coalesce(u.accounts_verified, 0) desc, coalesce(e.visitors, 0) desc
  limit 30;
$$;

revoke execute on function public.admin_funnel_sources(timestamptz) from public, anon, authenticated;
grant execute on function public.admin_funnel_sources(timestamptz) to service_role;
