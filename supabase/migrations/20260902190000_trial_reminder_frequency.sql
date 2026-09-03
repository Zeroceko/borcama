alter table public.user_entitlements
  add column if not exists trial_reminder_email_sent_at timestamptz;

insert into public.marketing_campaigns
  (slug, name, subject, description, template_key, audience_type, kind)
values
  ('trial-first-plan-reminder', 'Pro deneme ilk plan hatırlatması', 'Borcama Pro ücretsiz denemen hazır', 'Doğrulanan ve denemesi başlayıp henüz giriş yapmayan üyeye tek nazik hatırlatma.', 'trial_first_plan_reminder', 'Doğrulanmış, 48 saattir giriş yapmamış deneme üyeleri', 'lifecycle')
on conflict (slug) do update set updated_at = now();
