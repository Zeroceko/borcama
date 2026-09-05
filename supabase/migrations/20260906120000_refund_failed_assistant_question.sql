create or replace function public.refund_financial_assistant_question(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then return; end if;

  update public.financial_assistant_daily_usage
  set question_count = greatest(question_count - 1, 0),
      updated_at = now()
  where user_id = p_user_id
    and usage_day = (now() at time zone 'Europe/Istanbul')::date;
end;
$$;

revoke all on function public.refund_financial_assistant_question(uuid) from public, anon, authenticated;
grant execute on function public.refund_financial_assistant_question(uuid) to service_role;
