create table if not exists public.financial_assistant_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  question_count integer not null default 0 check (question_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_day)
);

alter table public.financial_assistant_daily_usage enable row level security;
revoke all on public.financial_assistant_daily_usage from anon, authenticated;

create or replace function public.consume_financial_assistant_question(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  today_istanbul date := (now() at time zone 'Europe/Istanbul')::date;
  used integer;
  question_limit integer := 10;
  entitlement public.user_entitlements%rowtype;
begin
  if p_user_id is null then raise exception 'AUTH_REQUIRED'; end if;

  select * into entitlement from public.user_entitlements where user_id = p_user_id;
  if coalesce(entitlement.source, '') not in ('admin_revoked', 'self_revoked') and (
    coalesce(entitlement.pro_expires_at, '-infinity'::timestamptz) > now()
    or coalesce(entitlement.trial_ends_at, '-infinity'::timestamptz) > now()
  ) then
    question_limit := 50;
  end if;

  insert into public.financial_assistant_daily_usage (user_id, usage_day, question_count)
  values (p_user_id, today_istanbul, 1)
  on conflict (user_id, usage_day) do update
    set question_count = public.financial_assistant_daily_usage.question_count + 1,
        updated_at = now()
    where public.financial_assistant_daily_usage.question_count < question_limit
  returning question_count into used;

  if used is null then
    select question_count into used from public.financial_assistant_daily_usage
      where user_id = p_user_id and usage_day = today_istanbul;
    return jsonb_build_object('allowed', false, 'used', used, 'limit', question_limit, 'remaining', 0);
  end if;

  return jsonb_build_object(
    'allowed', true,
    'used', used,
    'limit', question_limit,
    'remaining', greatest(question_limit - used, 0)
  );
end;
$$;

revoke all on function public.consume_financial_assistant_question(uuid) from public, anon, authenticated;
grant execute on function public.consume_financial_assistant_question(uuid) to service_role;
