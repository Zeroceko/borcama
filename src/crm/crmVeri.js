// CRM ekranlarının saf hesapları. Backoffice GET yanıtını (summary, users,
// activities, feedback, referrals, analytics, product_health) girdi alır;
// ağ ve React'tan bağımsız olduğu için doğrudan test edilir.

const GUN = 86400000;

const zaman = (deger) => {
  const t = deger ? Date.parse(deger) : NaN;
  return Number.isFinite(t) ? t : null;
};

export const SEGMENTLER = [
  ["tumu", "Tümü"],
  ["yeni", "Son 7 gün yeni"],
  ["verisiz", "Veri girmemiş"],
  ["aktif", "Son 7 gün giriş"],
  ["dogrulanmamis", "E-posta doğrulanmamış"],
  ["deneme", "Pro denemesi"],
  ["pro", "Pro"],
];

export function segmenteUyarMi(kullanici, segment, simdi = Date.now()) {
  const kayit = zaman(kullanici.created_at);
  const giris = zaman(kullanici.last_sign_in_at);
  switch (segment) {
    case "yeni": return kayit !== null && simdi - kayit <= 7 * GUN;
    case "verisiz": return !kullanici.has_data;
    case "aktif": return giris !== null && simdi - giris <= 7 * GUN;
    case "dogrulanmamis": return !kullanici.email_confirmed_at;
    case "deneme": return Boolean(kullanici.trial_active);
    case "pro": return Boolean(kullanici.pro_active);
    default: return true;
  }
}

export function kullanicilariFiltrele(kullanicilar = [], { segment = "tumu", arama = "", simdi = Date.now() } = {}) {
  const q = arama.trim().toLocaleLowerCase("tr-TR");
  return kullanicilar
    .filter((u) => segmenteUyarMi(u, segment, simdi))
    .filter((u) => !q || String(u.email || "").toLocaleLowerCase("tr-TR").includes(q))
    .sort((a, b) => (zaman(b.created_at) || 0) - (zaman(a.created_at) || 0));
}

export function paketAdi(u) {
  if (u.pro_active) return "Pro";
  if (u.trial_active) return "Pro denemesi";
  return "Ücretsiz";
}

// Operatörün bugün bakması gerekenler. Her grup en fazla `sinir` kayıt döner.
export function ilgilenilecekler(veri, { simdi = Date.now(), sinir = 6 } = {}) {
  const kullanicilar = veri?.users || [];
  const verisizYeni = kullanicilar
    .filter((u) => !u.has_data && u.email_confirmed_at && zaman(u.created_at) !== null && simdi - zaman(u.created_at) <= 14 * GUN)
    .sort((a, b) => zaman(b.created_at) - zaman(a.created_at));
  const dogrulanmamis = kullanicilar
    .filter((u) => !u.email_confirmed_at && zaman(u.created_at) !== null && simdi - zaman(u.created_at) <= 14 * GUN)
    .sort((a, b) => zaman(b.created_at) - zaman(a.created_at));
  const denemesiBiten = kullanicilar
    .filter((u) => u.trial_active && !u.pro_active && Number.isFinite(u.trial_days_remaining) && u.trial_days_remaining <= 3)
    .sort((a, b) => a.trial_days_remaining - b.trial_days_remaining);
  const geriBildirim = (veri?.feedback || [])
    .filter((f) => zaman(f.created_at) !== null && simdi - zaman(f.created_at) <= 14 * GUN)
    .sort((a, b) => zaman(b.created_at) - zaman(a.created_at));
  const davetIncelemesi = (veri?.referrals?.items || []).filter((r) => r.status === "review");
  return {
    verisizYeni: { toplam: verisizYeni.length, kayitlar: verisizYeni.slice(0, sinir) },
    dogrulanmamis: { toplam: dogrulanmamis.length, kayitlar: dogrulanmamis.slice(0, sinir) },
    denemesiBiten: { toplam: denemesiBiten.length, kayitlar: denemesiBiten.slice(0, sinir) },
    geriBildirim: { toplam: geriBildirim.length, kayitlar: geriBildirim.slice(0, sinir) },
    davetIncelemesi: { toplam: davetIncelemesi.length, kayitlar: davetIncelemesi.slice(0, sinir) },
  };
}

// Son `gun` günün kayıt hunisi (admin_funnel_daily satırları) ve önceki eşit dönem.
export function huniOzeti(gunluk = [], gun = 7) {
  const satirlar = [...gunluk].sort((a, b) => String(a.day).localeCompare(String(b.day)));
  const topla = (dilim) => dilim.reduce((t, s) => ({
    ziyaret: t.ziyaret + Number(s.visitors || 0),
    kayitEkrani: t.kayitEkrani + Number(s.register_views || 0),
    hesap: t.hesap + Number(s.accounts_created || 0),
    dogrulanan: t.dogrulanan + Number(s.accounts_verified || 0),
  }), { ziyaret: 0, kayitEkrani: 0, hesap: 0, dogrulanan: 0 });
  return {
    bu: topla(satirlar.slice(-gun)),
    onceki: topla(satirlar.slice(-2 * gun, -gun)),
  };
}

export function oran(pay, payda) {
  if (!payda) return null;
  return Math.round((pay / payda) * 1000) / 10;
}

export function sonEtkinlikler(aktiviteler = [], { simdi = Date.now(), saat = 24, sinir = 12 } = {}) {
  return aktiviteler
    .filter((a) => zaman(a.created_at) !== null && simdi - zaman(a.created_at) <= saat * 3600000)
    .sort((a, b) => zaman(b.created_at) - zaman(a.created_at))
    .slice(0, sinir);
}
