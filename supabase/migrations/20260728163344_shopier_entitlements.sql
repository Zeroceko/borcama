create table if not exists public.shopier_purchases (
  order_id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  buyer_email text not null,
  product_id text not null,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'TRY',
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  purchased_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopier_purchases_buyer_email_idx
  on public.shopier_purchases (lower(buyer_email));

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ad_free_lifetime boolean not null default false,
  source text,
  purchase_id text references public.shopier_purchases(order_id) on delete set null,
  granted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.shopier_purchases enable row level security;
alter table public.user_entitlements enable row level security;

revoke all on public.shopier_purchases from anon, authenticated;
revoke all on public.user_entitlements from anon;
grant select on public.user_entitlements to authenticated;

drop policy if exists "Kullanici kendi reklamsiz hakkini gorebilir"
  on public.user_entitlements;
create policy "Kullanici kendi reklamsiz hakkini gorebilir"
  on public.user_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

