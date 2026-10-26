import { getActivationState } from "./productActivation.js";
import { t } from "./i18n.js";

// Borcama rehberi: kullanıcıya her an tek bir "sıradaki en faydalı adım"
// gösterir. Kurallar deterministiktir; kullanıcı aylık rutini öğrendiğinde
// bir kez "mezuniyet" mesajı verip kendini kapatır. Tercihler
// veri.ayarlar.rehber altında tutulur: { ertelenen: {id: iso}, kapatilan: [id], mezun: iso }.

const GUN = 86400000;
export const REHBER_ERTELEME_GUNU = 3;
// Kayda değer veri: bu kadar borç ve harcama/gider kaydı giren kullanıcı ürünü
// öğrenmiştir; rehber artık hiç görünmez.
export const REHBER_DOLU_BORC = 2;
export const REHBER_DOLU_HARCAMA = 5;

const ayAnahtari = (tarih) => `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, "0")}`;

function gunFarki(tarih, simdi) {
  const d = tarih instanceof Date ? tarih : new Date(`${String(tarih).slice(0, 10)}T00:00:00`);
  if (!Number.isFinite(d.getTime())) return null;
  const hedef = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const bugun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate()).getTime();
  return Math.round((hedef - bugun) / GUN);
}

function borcKalemSayisi(veri) {
  return ["cards", "loans", "overdrafts", "others"].reduce((t, alan) => t + (veri?.[alan]?.length || 0), 0);
}

// Kullanıcının Borcama'yı kullandığı farklı aylar: girilen ekstre dönemleri ve ödeme kayıtları.
function kullanimAylari(veri) {
  const aylar = new Set();
  for (const kart of veri?.cards || []) {
    if (kart?.ekstreAyi) aylar.add(String(kart.ekstreAyi));
    for (const e of kart?.ekstreGecmisi || []) if (e?.ekstreAyi) aylar.add(String(e.ekstreAyi));
  }
  for (const [ay, odemeler] of Object.entries(veri?.loanPaymentHistory || {}))
    if (Object.values(odemeler || {}).length) aylar.add(ay);
  for (const kayitlar of Object.values(veri?.cardPaymentHistory || {}))
    for (const k of Array.isArray(kayitlar) ? kayitlar : []) if (k?.tarih) aylar.add(String(k.tarih).slice(0, 7));
  return aylar;
}

export function yeterliVeriVar(veri) {
  return (
    borcKalemSayisi(veri) >= REHBER_DOLU_BORC &&
    (veri?.expenses?.length || 0) >= REHBER_DOLU_HARCAMA &&
    (veri?.incomes || []).some((g) => Number(g?.tutar) > 0)
  );
}

function kartAdi(kart) {
  return [kart?.banka, kart?.ad].filter(Boolean).join(" · ") || t("ozet.rehber.kartVarsayilan");
}

export function rehberDurumu(veri, { simdi = new Date(), yaklasan = [] } = {}) {
  const ayar = veri?.ayarlar?.rehber || {};
  if (ayar.mezun) return { asama: "mezun", oneri: null };
  if (yeterliVeriVar(veri)) return { asama: "dolu", oneri: null };

  const kurulum = getActivationState(veri);
  if (!kurulum.tamam) {
    const g = kurulum.siradaki;
    return {
      asama: "kurulum",
      kurulum,
      oneri: { id: `kurulum-${g.id}`, tur: "kurulum", gorev: g, baslik: g.baslik, aciklama: g.aciklama, adim: `${kurulum.tamamlanan + 1}/${kurulum.toplam}`, aksiyonEtiketi: t("ozet.rehber.kurulumAksiyon") },
    };
  }

  const ertelendi = (id) => {
    const t = Date.parse(ayar.ertelenen?.[id] || "");
    return Number.isFinite(t) && t > simdi.getTime();
  };
  const kapali = (id) => (ayar.kapatilan || []).includes(id);
  const adaylar = [];

  // 1) Ödemesi gelen veya geçen (son 7 gün) ve işaretlenmemiş ödeme.
  for (const o of yaklasan) {
    if (o?.odendi || !o?.tarih) continue;
    const gun = gunFarki(o.tarih, simdi);
    if (gun === null || gun > 0 || gun < -7) continue;
    // Ödeme gününden sonra eklenen borç için "ödediysen işaretle" denmez.
    if (o.eklendi && gunFarki(o.eklendi, simdi) !== null && gunFarki(o.eklendi, simdi) >= gun) continue;
    adaylar.push({
      id: `odeme-${o.anahtar || o.id}`, tur: "odeme", hedef: "odemeler",
      baslik: t("ozet.rehber.odemeBaslik", { ad: o.ad || o.banka || t("ozet.rehber.odemenVarsayilan") }),
      aciklama: gun === 0 ? t("ozet.rehber.odemeBugun") : t(-gun === 1 ? "ozet.rehber.odemeGectiTekil" : "ozet.rehber.odemeGectiCogul", { n: -gun }),
      aksiyonEtiketi: t("ozet.rehber.odemelereGit"), ertelenebilir: true,
    });
  }

  // 2) Yeni ekstresi kesilmiş kart.
  const buAy = ayAnahtari(simdi);
  for (const kart of veri?.cards || []) {
    if (!kart?.ekstreAyi || String(kart.ekstreAyi) >= buAy) continue;
    const kesim = Number(kart.kesimGunu);
    if (Number.isFinite(kesim) && kesim > 0 && simdi.getDate() < kesim) continue;
    adaylar.push({
      id: `ekstre-${kart.id}-${buAy}`, tur: "ekstre", hedef: "borclar",
      baslik: t("ozet.rehber.ekstreBaslik", { kart: kartAdi(kart) }),
      aciklama: t("ozet.rehber.ekstreAciklama"),
      aksiyonEtiketi: t("ozet.rehber.ekstreEkle"), ertelenebilir: true,
    });
  }

  // 3) Tamamlama: tek borç kaydı varsa diğerleri.
  if (borcKalemSayisi(veri) === 1)
    adaylar.push({
      id: "baska-borc", tur: "tamamla", hedef: "borclar",
      baslik: t("ozet.rehber.baskaBorcBaslik"),
      aciklama: t("ozet.rehber.baskaBorcAciklama"),
      aksiyonEtiketi: t("ozet.rehber.borcEkle"), ertelenebilir: true, kapatEtiketi: t("ozet.rehber.baskaBorcumYok"),
      secenekler: [["cards", t("ozet.rehber.secenek.kart")], ["loans", t("ozet.rehber.secenek.kredi")], ["od", t("ozet.rehber.secenek.ek")], ["others", t("ozet.rehber.secenek.diger")]],
    });

  // 4) Tamamlama: her ay tekrarlanan gider yok.
  if (!(veri?.expenses || []).some((g) => g?.tekrar === "Her ay"))
    adaylar.push({
      id: "sabit-gider", tur: "tamamla", hedef: "sabit-giderler",
      baslik: t("ozet.rehber.sabitGiderBaslik"),
      aciklama: t("ozet.rehber.sabitGiderAciklama"),
      aksiyonEtiketi: t("ozet.rehber.sabitGiderEkle"), ertelenebilir: true, kapatEtiketi: t("ozet.rehber.sabitGiderimYok"),
    });

  const oneri = adaylar.find((a) => !ertelendi(a.id) && !kapali(a.id));
  if (oneri) return { asama: oneri.tur === "tamamla" ? "tamamla" : "rutin", oneri };

  // 5) Mezuniyet: tamamlama bitti/geçildi ve en az iki ayda kullanıldı.
  const tamamlamaKaldi = adaylar.some((a) => a.tur === "tamamla" && !kapali(a.id));
  if (!tamamlamaKaldi && kullanimAylari(veri).size >= 2)
    return {
      asama: "mezuniyet",
      oneri: {
        id: "mezuniyet", tur: "mezuniyet",
        baslik: t("ozet.rehber.mezunBaslik"),
        aciklama: t("ozet.rehber.mezunAciklama"),
        aksiyonEtiketi: t("ozet.rehber.anladim"),
      },
    };
  return { asama: "bekle", oneri: null };
}

export function rehberiErtele(ayar = {}, id, simdi = new Date()) {
  return { ...ayar, ertelenen: { ...(ayar.ertelenen || {}), [id]: new Date(simdi.getTime() + REHBER_ERTELEME_GUNU * GUN).toISOString() } };
}

export function rehberOnerisiniKapat(ayar = {}, id) {
  return { ...ayar, kapatilan: [...new Set([...(ayar.kapatilan || []), id])] };
}

export function rehberiMezunEt(ayar = {}, simdi = new Date()) {
  return { ...ayar, mezun: simdi.toISOString() };
}
