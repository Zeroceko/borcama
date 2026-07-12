-- Supabase panelinde: SQL Editor → New query → bu dosyanın tamamını yapıştırıp çalıştırın.

create table if not exists kv_store (
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value text not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

alter table kv_store enable row level security;
alter table kv_store force row level security;

alter table kv_store drop constraint if exists kv_store_key_format;
alter table kv_store add constraint kv_store_key_format check (key ~ '^borctakip:v[0-9]+$');
alter table kv_store drop constraint if exists kv_store_value_size;
alter table kv_store add constraint kv_store_value_size check (octet_length(value) <= 2097152);

revoke all on table kv_store from anon;
revoke all on table kv_store from authenticated;
grant select, insert, update, delete on table kv_store to authenticated;

drop policy if exists "Kullanıcı kendi verisini okuyabilir" on kv_store;
drop policy if exists "Kullanıcı kendi verisini ekleyebilir" on kv_store;
drop policy if exists "Kullanıcı kendi verisini güncelleyebilir" on kv_store;
drop policy if exists "Kullanıcı kendi verisini silebilir" on kv_store;

create policy "Kullanıcı kendi verisini okuyabilir"
  on kv_store for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Kullanıcı kendi verisini ekleyebilir"
  on kv_store for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Kullanıcı kendi verisini güncelleyebilir"
  on kv_store for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Kullanıcı kendi verisini silebilir"
  on kv_store for delete
  to authenticated
  using ((select auth.uid()) = user_id);
