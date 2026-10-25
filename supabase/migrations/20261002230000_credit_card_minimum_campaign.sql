insert into public.marketing_campaigns
  (slug, name, subject, description, template_key, audience_type, kind, status)
values
  (
    'credit-card-minimum-2026-10',
    'Kredi kartı asgari ödeme güncellemesi',
    'Kredi kartı asgari ödeme kuralı değişti',
    'Yeni yüzde 20–40 eşiğini, kimleri etkilediğini ve resmî BDDK kaynağını açıklar.',
    'credit_card_minimum_2026_10',
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
