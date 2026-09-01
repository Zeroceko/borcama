insert into public.marketing_campaigns
  (slug, name, subject, description, template_key, audience_type, kind, status)
values
  (
    'features-v1-33',
    'Siz istediniz, biz yaptık · 1 Eylül 2026',
    'Siz istediniz, biz yaptık: Borcama''daki önemli yenilikler',
    'Ekstre yönetimi, taksit dağılımı, sade ekranlar ve borç kapatma planındaki gözle görülür yenilikler.',
    'features_v1_33',
    'Doğrulanmış uygun üyeler',
    'manual',
    'active'
  )
on conflict (slug) do update set
  name = excluded.name,
  subject = excluded.subject,
  description = excluded.description,
  template_key = excluded.template_key,
  audience_type = excluded.audience_type,
  kind = excluded.kind,
  status = excluded.status,
  updated_at = now();
