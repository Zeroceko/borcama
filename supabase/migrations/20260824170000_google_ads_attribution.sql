alter table public.analytics_events
  add column if not exists content text not null default '',
  add column if not exists term text not null default '',
  add column if not exists click_id text not null default '';

create index if not exists analytics_events_click_id_idx
  on public.analytics_events (click_id)
  where click_id <> '';
