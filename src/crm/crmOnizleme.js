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
  const gunluk = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    return { day: d.toISOString().slice(0, 10), visitors: 6 + (i % 5) + (i > 6 ? 4 : 0), register_views: 1 + (i % 3), accounts_created: i % 2, accounts_verified: i % 3 === 0 ? 1 : 0 };
  });
  return {
    summary: { total: kullanicilar.length, new_7d: 4, trial_active: 5, active_30d: 7, signed_in_7d: 6 },
    users: kullanicilar,
    activities: [
      ["a1", "u1", "card_added", 1], ["a2", "u4", "statement_added", 3], ["a3", "u2", "login", 5],
      ["a4", "u7", "payment_added", 8], ["a5", "u6", "expense_added", 12], ["a6", "u1", "login", 20],
    ].map(([id, user_id, event_type, saat]) => ({ id, user_id, email: kullanicilar.find((u) => u.id === user_id).email, event_type, created_at: saatOnce(saat) })),
    feedback: [{ id: "f1", user_id: "u4", email: "ornek.can@example.com", message: "Ekstre yüklerken bankamı listede bulamadım.", created_at: gunOnce(1) }],
    referrals: { available: true, items: [{ id: "r1", status: "review", referrer_email: "ornek.deniz@example.com", invitee_email: "ornek.elif@example.com", invitee_user_id: "u5" }] },
    analytics: { available: true, daily: gunluk },
    product_health: {
      active_users: { last_7_days: 4 },
      pro: { paid_active_pro: 1, active_trial: 5 },
      summary: { registered: 4, first_debt_or_statement: 2, previous: { first_debt_or_statement: 1 } },
    },
  };
}
