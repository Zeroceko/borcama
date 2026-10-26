-- Pro asistan sorularına aylık 80 üst sınırı (Özer onayı, 27 Eki 2026; fiyat 39,90 TL/ay).
-- Günlük sınırlar aynı: ücretsiz 5, Pro 20. Ay İstanbul saatine göre sayılır.
create or replace function public.consume_financial_assistant_question(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  today_istanbul date := (now() at time zone 'Europe/Istanbul')::date;
  month_start date := date_trunc('month', (now() at time zone 'Europe/Istanbul'))::date;
  monthly_limit constant integer := 80;
  pro boolean;
  question_limit integer;
  used integer;
  month_used integer := 0;
begin
  if p_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  pro := public.financial_assistant_pro_active(p_user_id);
  question_limit := case when pro then 20 else 5 end;

  if pro then
    select coalesce(sum(pro_question_count), 0) into month_used
      from public.financial_assistant_daily_usage
      where user_id = p_user_id and usage_day >= month_start;
    if month_used >= monthly_limit then
      return jsonb_build_object('allowed', false, 'used', question_limit, 'limit', question_limit, 'remaining', 0,
        'period', 'month', 'monthly_limit', monthly_limit, 'monthly_remaining', 0);
    end if;
  end if;

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
    return jsonb_build_object('allowed', false, 'used', question_limit, 'limit', question_limit, 'remaining', 0, 'period', 'day');
  end if;

  if pro then
    return jsonb_build_object(
      'allowed', true, 'used', used, 'limit', question_limit,
      'remaining', least(greatest(question_limit - used, 0), greatest(monthly_limit - month_used - 1, 0)),
      'monthly_limit', monthly_limit, 'monthly_remaining', greatest(monthly_limit - month_used - 1, 0)
    );
  end if;

  return jsonb_build_object(
    'allowed', true, 'used', used, 'limit', question_limit,
    'remaining', greatest(question_limit - used, 0)
  );
end;
$$;
revoke all on function public.consume_financial_assistant_question(uuid) from public, anon, authenticated;
grant execute on function public.consume_financial_assistant_question(uuid) to service_role;
