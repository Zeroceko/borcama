create or replace function public.delete_borcama_account(
  target_user_id uuid,
  target_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if target_user_id is null or nullif(trim(target_email), '') is null then
    raise exception 'INVALID_ACCOUNT';
  end if;

  -- Kimliğe cascade olmayan, e-posta içeren Borcama operasyon kayıtlarını
  -- aynı transaction içinde kaldır; herhangi bir adım hata verirse hiçbiri silinmez.
  delete from public.marketing_deliveries
  where user_id = target_user_id or lower(recipient_email) = lower(target_email);

  delete from public.shopier_purchases
  where user_id = target_user_id or lower(buyer_email) = lower(target_email);

  delete from auth.users
  where id = target_user_id and lower(email) = lower(target_email);

  if not found then
    raise exception 'ACCOUNT_NOT_FOUND';
  end if;
end;
$$;

revoke execute on function public.delete_borcama_account(uuid, text)
  from public, anon, authenticated;
grant execute on function public.delete_borcama_account(uuid, text)
  to service_role;

comment on function public.delete_borcama_account(uuid, text) is
  'Deletes one authenticated Borcama account and its directly identifying operational records atomically; callable only by the service role after Edge Function authentication.';
