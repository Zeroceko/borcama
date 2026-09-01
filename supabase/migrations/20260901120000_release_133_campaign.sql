insert into public.marketing_campaigns
  (slug, name, subject, description, template_key, audience_type, kind, status)
values
  (
    'features-v1-33',
    'Siz istediniz, biz yaptık · v1.33',
    'Siz istediniz, biz yaptık: Borcama''da 4 yenilik',
    'Ekstre ekleme, kart görünümü, taksit dağılımı ve borç planındaki son yenilikler.',
    'features_v1_33',
    'Doğrulanmış tüm üyeler',
    'manual',
    'paused'
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  template_key = excluded.template_key,
  audience_type = excluded.audience_type,
  kind = excluded.kind,
  updated_at = now();
