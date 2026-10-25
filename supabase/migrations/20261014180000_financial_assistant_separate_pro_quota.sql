-- Pro'ya geçen kullanıcı, ücretsizken o gün kullandığı sorulardan bağımsız
-- günde 20 soru alır (Özer kararı, 14 Eki 2026). question_count toplam kalır;
-- pro_question_count Pro dönemindeki soruları sayar. Ücretsiz hak:
-- question_count - pro_question_count < 5.
alter table public.financial_assistant_daily_usage
  add column if not exists pro_question_count integer not null default 0;

create or replace function public.financial_assistant_pro_active(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select coalesce(e.source, '') not in ('admin_revoked', 'self_revoked') and (
      coalesce(e.pro_expires_at, '-infinity'::timestamptz) > now()
      or coalesce(e.trial_ends_at, '-infinity'::timestamptz) > now()
    )
    from public.user_entitlements e where e.user_id = p_user_id
  ), false);
$$;
revoke all on function public.financial_assistant_pro_active(uuid) from public, anon, authenticated;
grant execute on function public.financial_assistant_pro_active(uuid) to service_role;

create or replace function public.consume_financial_assistant_question(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  today_istanbul date := (now() at time zone 'Europe/Istanbul')::date;
  pro boolean;
  question_limit integer;
  used integer;
begin
  if p_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  pro := public.financial_assistant_pro_active(p_user_id);
  question_limit := case when pro then 20 else 5 end;

  insert into public.financial_assistant_daily_usage (user_id, usage_day, question_count, pro_question_count)
  values (p_user_id, today_istanbul, 1, case when pro then 1 else 0 end)
  on conflict (user_id, usage_day) do update
    set question_count = public.financial_assistant_daily_usage.question_count + 1,
        pro_question_count = public.financial_assistant_daily_usage.pro_question_count + case when pro then 1 else 0 end,
        updated_at = now()
    where case when pro
      then public.financial_assistant_daily_usage.pro_question_count < question_limit
      else public.financial_assistant_daily_usage.question_count - public.financial_assistant_daily_usage.pro_question_count < question_limit
    end
  returning case when pro then pro_question_count else question_count - pro_question_count end into used;

  if used is null then
    return jsonb_build_object('allowed', false, 'used', question_limit, 'limit', question_limit, 'remaining', 0);
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

create or replace function public.refund_financial_assistant_question(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pro boolean;
begin
  if p_user_id is null then return; end if;
  pro := public.financial_assistant_pro_active(p_user_id);

  update public.financial_assistant_daily_usage
  set question_count = greatest(question_count - 1, 0),
      pro_question_count = case when pro then greatest(pro_question_count - 1, 0) else pro_question_count end,
      updated_at = now()
  where user_id = p_user_id
    and usage_day = (now() at time zone 'Europe/Istanbul')::date;
end;
$$;
