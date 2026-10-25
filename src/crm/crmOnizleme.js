// Yalnız yerel /crm-preview için uydurma, tarihi bugüne göre kayan örnek veri.
// Gerçek kullanıcı veya e-posta içermez.
const saatOnce = (s) => new Date(Date.now() - s * 3600000).toISOString();
const gunOnce = (g) => saatOnce(g * 24);

export function crmOnizlemeVerisi() {
  const kullanicilar = [
    ["u1", "ornek.ayse@example.com", 1, true, true, { trial_active: true, trial_days_remaining: 29 }],
    ["u2", "ornek.mehmet@example.com", 2, true, false, { trial_active: true, trial_days_remaining: 28 }],
    ["u3", "ornek.zeynep@example.com", 3, false, false, {}],
    ["u4", "ornek.can@example.com", 5, true, true, { trial_active: true, trial_days_remaining: 25 }],
    ["u5", "ornek.elif@example.com", 9, true, false, { trial_active: true, trial_days_remaining: 21 }],
    ["u6", "ornek.burak@example.com", 27, true, true, { trial_active: true, trial_days_remaining: 2 }],
    ["u7", "ornek.deniz@example.com", 45, true, true, { pro_active: true, pro_source: "revenuecat_web" }],
    ["u8", "ornek.selin@example.com", 60, true, true, {}],
  ].map(([id, email, gun, dogrulandi, veri, ek]) => ({
    id, email, status: "active", created_at: gunOnce(gun), email_confirmed_at: dogrulandi ? gunOnce(gun) : null,
    last_sign_in_at: gunOnce(Math.max(0.2, gun / 4)), has_data: veri, pro_active: false, trial_active: false, ...ek,
  }));
  return {
    summary: { total: kullanicilar.length, new_7d: 4, trial_active: 5, active_30d: 7, signed_in_7d: 6 },
    users: kullanicilar,
    activities: [
      ["a1", "u1", "card_added", 1], ["a2", "u4", "statement_added", 3], ["a3", "u2", "login", 5],
      ["a4", "u7", "payment_added", 8], ["a5", "u6", "expense_added", 12], ["a6", "u1", "login", 20],
    ].map(([id, user_id, event_type, saat]) => ({ id, user_id, email: kullanicilar.find((u) => u.id === user_id).email, event_type, created_at: saatOnce(saat) })),
    feedback: [{ id: "f1", user_id: "u4", email: "ornek.can@example.com", message: "Ekstre yüklerken bankamı listede bulamadım.", created_at: gunOnce(1) }],
    referrals: { available: true, items: [{ id: "r1", status: "review", referrer_email: "ornek.deniz@example.com", invitee_email: "ornek.elif@example.com", invitee_user_id: "u5" }] },
    campaigns: [
      { slug: "trial-started", name: "Pro denemesi başladı", subject: "Borcama Pro deneme üyeliğin başladı", kind: "lifecycle", status: "active", audience_type: "Yeni Pro denemesi", metrics: { sent: 34, opened: 21, clicked: 6, visited: 5 } },
      { slug: "loan-closed", name: "Kredi kapanışı tebriği", subject: "Tebrikler, bir kredini daha kapattın", kind: "lifecycle", status: "active", audience_type: "Son 30 günde kredi kapatan üyeler", metrics: { sent: 0, opened: 0, clicked: 0, visited: 0 } },
      { slug: "auth-confirmation", name: "E-posta doğrulama", subject: "Borcama hesabını doğrula", kind: "auth", status: "active", audience_type: "Yeni üye", metrics: { sent: 42, opened: 38, clicked: 35, visited: 33 } },
      { slug: "credit-card-minimum-2026-10", name: "Kredi kartı asgari ödeme güncellemesi", subject: "Kredi kartı asgari ödeme kuralı değişti", kind: "manual", status: "active", audience_type: "Doğrulanmış üyeler", metrics: { sent: 0, opened: 0, clicked: 0, visited: 0 } },
    ],
    analytics: {
      available: true,
      daily: Array.from({ length: 90 }, (_, i) => {
        const d = new Date(Date.now() - (89 - i) * 86400000);
        return { day: d.toISOString().slice(0, 10), visitors: 4 + (i % 7) + (i > 76 ? 5 : 0), register_views: i % 3, accounts_created: i % 4 === 0 ? 1 : 0, accounts_verified: i % 8 === 0 ? 1 : 0 };
      }),
      sources: [
        { source: "google", medium: "organic", campaign: "", visitors: 120, register_views: 9, accounts_created: 4, accounts_verified: 3 },
        { source: "direct", medium: "", campaign: "", visitors: 210, register_views: 6, accounts_created: 3, accounts_verified: 2 },
        { source: "instagram", medium: "social", campaign: "organik_2026_10", visitors: 18, register_views: 2, accounts_created: 1, accounts_verified: 1 },
      ],
      debt_payoff_tool: { landing_visit: 40, result_view: 31, product_click: 4, register_view: 3, sign_up: 1, first_debt_or_statement: 1 },
      deposit_tool: { landing_visit: 22, result_view: 18, product_click: 1, register_view: 1, sign_up: 0, first_asset: 0 },
      olcum: { available: true,
        son_7_gun: { ana: { ziyaret: 30, yari: 12, cta: 4, icerik_gecis: 0, kayit_ekrani: 4 }, sozluk: { ziyaret: 14, yari: 0, cta: 0, icerik_gecis: 2, kayit_ekrani: 1 }, araclar: { ziyaret: 9, yari: 0, cta: 0, icerik_gecis: 1, kayit_ekrani: 1 } },
        son_30_gun: { ana: { ziyaret: 120, yari: 45, cta: 14, icerik_gecis: 0, kayit_ekrani: 13 }, sozluk: { ziyaret: 60, yari: 0, cta: 0, icerik_gecis: 6, kayit_ekrani: 3 }, araclar: { ziyaret: 40, yari: 0, cta: 0, icerik_gecis: 5, kayit_ekrani: 3 }, rehber: { ziyaret: 12, yari: 0, cta: 0, icerik_gecis: 1, kayit_ekrani: 0 } } },
    },
    product_health: {
      available: true,
      period: { label: "Son 30 gün" },
      active_users: { today: 2, last_7_days: 4, last_30_days: 7, definition: "Giriş hariç kayıt yapan tekil kullanıcı." },
      retention: { d7: { available: true, returned: 2, eligible: 6 } },
      pro: { paid_active_pro: 1, active_trial: 5 },
      summary: { registered: 8, verified: 7, first_debt_or_statement: 4, full_activation_observed: 2, previous: { registered: 6, verified: 5, first_debt_or_statement: 2, full_activation_observed: 1 } },
      measurement: { activation_definition: "Tam aktivasyon: ilk borç/ekstre + gelir + ilk gider veya ödeme olayı." },
    },
  };
}
