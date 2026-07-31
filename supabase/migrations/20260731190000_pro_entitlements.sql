alter table public.user_entitlements
  add column if not exists pro_expires_at timestamptz,
  add column if not exists pro_purchase_id text references public.shopier_purchases(order_id) on delete set null;

create index if not exists user_entitlements_pro_expires_at_idx
  on public.user_entitlements (pro_expires_at)
  where pro_expires_at is not null;
