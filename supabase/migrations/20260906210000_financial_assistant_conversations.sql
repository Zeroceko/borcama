create table if not exists public.financial_assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null check (char_length(question) between 3 and 500),
  answer_title text not null default '',
  answer text not null check (char_length(answer) between 1 and 1800),
  route text not null default 'none',
  action_label text not null default '',
  needs_more_info boolean not null default false,
  model text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists financial_assistant_conversations_user_created_idx
  on public.financial_assistant_conversations (user_id, created_at desc);

alter table public.financial_assistant_conversations enable row level security;
revoke all on public.financial_assistant_conversations from public, anon, authenticated;
grant select, insert on public.financial_assistant_conversations to service_role;

comment on table public.financial_assistant_conversations is
  'Stores successful user questions and assistant answers for authorized CRM review; financial context is never stored here.';
