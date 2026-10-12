import { getActivationState } from "./productActivation.js";

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
  return [kart?.banka, kart?.ad].filter(Boolean).join(" · ") || "Kartın";
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
      oneri: { id: `kurulum-${g.id}`, tur: "kurulum", gorev: g, baslik: g.baslik, aciklama: g.aciklama, adim: `${kurulum.tamamlanan + 1}/${kurulum.toplam}`, aksiyonEtiketi: "Devam et" },
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
      baslik: `${o.ad || o.banka || "Ödemen"}: ödediysen işaretle`,
      aciklama: gun === 0 ? "Son ödeme günü bugün. Ödediysen işaretle; kalan borcun güncellensin." : `Son ödeme günü ${-gun} gün önce geçti. Ödediysen işaretle; kalan borcun güncellensin.`,
      aksiyonEtiketi: "Ödemelere git", ertelenebilir: true,
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
      baslik: `${kartAdi(kart)} için yeni ekstreni gir`,
      aciklama: "Yeni dönem kesildi. Ekstreni okut ya da tutarı yaz; ödeme planın güncellensin.",
      aksiyonEtiketi: "Ekstre ekle", ertelenebilir: true,
    });
  }

  // 3) Tamamlama: tek borç kaydı varsa diğerleri.
  if (borcKalemSayisi(veri) === 1)
    adaylar.push({
      id: "baska-borc", tur: "tamamla", hedef: "borclar",
      baslik: "Başka kartın veya kredin var mı?",
      aciklama: "Hepsini ekleyince toplam borcun ve ödeme takvimin tamamlanır.",
      aksiyonEtiketi: "Borç ekle", ertelenebilir: true, kapatEtiketi: "Başka borcum yok",
      secenekler: [["cards", "Kredi kartı"], ["loans", "Kredi"], ["od", "Ek hesap / KMH"], ["others", "Diğer borç"]],
    });

  // 4) Tamamlama: her ay tekrarlanan gider yok.
  if (!(veri?.expenses || []).some((g) => g?.tekrar === "Her ay"))
    adaylar.push({
      id: "sabit-gider", tur: "tamamla", hedef: "sabit-giderler",
      baslik: "Kira ve faturalarını bir kez ekle",
      aciklama: "Her ay tekrarlanan giderlerini girersen aylık planın gerçekçi olur.",
      aksiyonEtiketi: "Sabit gider ekle", ertelenebilir: true, kapatEtiketi: "Sabit giderim yok",
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
        baslik: "Hepsi bu kadar! Artık hazırsın.",
        aciklama: "Her ay yeni ekstreni gir ve ödemelerini işaretle; gerisini Borcama hesaplar. Bundan sonra bu kutuyla seni rahatsız etmeyeceğim; ödeme ve ekstre zamanları Bugün ekranında.",
        aksiyonEtiketi: "Anladım",
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
