insert into public.marketing_campaigns
  (slug, name, subject, description, template_key, audience_type, kind, status)
values
  (
    'features-assistant-v1-52',
    'Siz istediniz, biz yaptık · 3',
    'Siz istediniz, biz yaptık - 3 -',
    'Borcama''ya Sor''un finansal tabloyu açıklayan kısa yanıtlarını tanıtır.',
    'assistant_announcement_v1_52',
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
