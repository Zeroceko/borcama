-- Supabase panelinde: SQL Editor → New query → bu dosyanın tamamını yapıştırıp çalıştırın.

create table if not exists kv_store (
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value text not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

alter table kv_store enable row level security;

create policy "Kullanıcı kendi verisini okuyabilir"
  on kv_store for select
  using (auth.uid() = user_id);

create policy "Kullanıcı kendi verisini ekleyebilir"
  on kv_store for insert
  with check (auth.uid() = user_id);

create policy "Kullanıcı kendi verisini güncelleyebilir"
  on kv_store for update
  using (auth.uid() = user_id);

create policy "Kullanıcı kendi verisini silebilir"
  on kv_store for delete
  using (auth.uid() = user_id);
