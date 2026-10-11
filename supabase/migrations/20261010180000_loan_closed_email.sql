-- Kredi kapanışında tek seferlik tebrik e-postası. Teslimatlar
-- marketing_deliveries (campaign_id, user_id, delivery_key) tekilliğiyle
-- kredi başına bir kez gönderilir; delivery_key = "loan:<kredi id>".
insert into public.marketing_campaigns
  (slug, name, subject, description, template_key, audience_type, kind)
values
  ('loan-closed', 'Kredi kapanışı tebriği', 'Tebrikler, bir kredini daha kapattın',
   'Kullanıcı bir krediyi kapattığında (kapanış kutlaması gösterildiğinde) kredi başına tek tebrik. Tutar ve banka adı içermez.',
   'loan_closed', 'Doğrulanmış e-postalı ve son 30 günde kredi kapatan üyeler', 'lifecycle')
on conflict (slug) do update set updated_at = now();
