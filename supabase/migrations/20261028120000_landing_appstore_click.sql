-- Ölçüm: landing'deki App Store bağlantısı tıklaması (site v3; birincil CTA
-- App Store ve web kaydı eşit ağırlıkta).

alter table public.analytics_events
  drop constraint if exists analytics_events_event_name_check;

alter table public.analytics_events
  add constraint analytics_events_event_name_check check (
    event_name in (
      'landing_visit',
      'register_view',
      'deposit_result_view',
      'deposit_product_click',
      'debt_payoff_result_view',
      'debt_payoff_product_click',
      'landing_cta_click',
      'landing_scroll_half',
      'landing_appstore_click',
      'content_product_click'
    )
  );
