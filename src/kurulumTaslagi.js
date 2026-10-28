// Web kurulum akisinin (Onboarding.jsx > KurulumAkisi) adim adresi ve
// sekme oturumu taslagi (docs/web-akis-direktifi.md B6/B7). Akis
// /kurulum/<adim> adresinde calisir; adim ve cevaplar sessionStorage'da
// tutulur ki yenileme ve tarayicinin geri tusu akisi bozmasin. Native (iOS)
// bunlari kullanmaz. Saf fonksiyonlar testlerde dogrudan cagrilir.

import { ADIMLAR, BORC_TURLERI, HEDEFLER, SIKLIKLAR, TEMALAR, adimSirasi, bosDurum } from "./onboardingAdimlari.js";

export const KURULUM_YOLU = "/kurulum";

export function kurulumYoluMu(yol) {
  const temiz = String(yol || "").replace(/\/+$/, "");
  return temiz === KURULUM_YOLU || temiz.startsWith(`${KURULUM_YOLU}/`);
}

// Sorgu (ör. demo onizlemesi ?yeni=1) adreste korunur.
export function adimYolu(adim, arama = "") {
  return `${KURULUM_YOLU}/${adim}${arama || ""}`;
}

export function taslakAnahtari(kullaniciId) {
  return `borcama:kurulum-taslak:${kullaniciId || "misafir"}`;
}

const metin = (deger, uzunluk) => (typeof deger === "string" ? deger.slice(0, uzunluk) : "");
const tamSayi = (deger, en, enCok, varsayilan) => {
  const n = Number(deger);
  return Number.isInteger(n) && n >= en && n <= enCok ? n : varsayilan;
};
const BORC_ALANLARI = ["banka", "tutar", "taksit", "kalanTaksit", "gun"];

// Kayitli taslagi dogrular. Bozuk JSON, bilinmeyen adim ya da adim sirasinda
// olmayan adim (ör. "borc" ama borcYok) gecersizdir: null doner, cagiran
// taslagi siler. Tek tek alanlar gecersizse bos durumdaki varsayilana duser.
export function taslagiCoz(ham, { native = false, diller = [], birimler = [] } = {}) {
  let veri = ham;
  if (typeof ham === "string") {
    try {
      veri = JSON.parse(ham);
    } catch {
      return null;
    }
  }
  if (!veri || typeof veri !== "object" || !veri.durum || typeof veri.durum !== "object") return null;
  const d = veri.durum;
  const bos = bosDurum();
  const hedefler = Array.isArray(d.hedefler) ? HEDEFLER.filter((h) => d.hedefler.includes(h)) : [];
  const turler = Array.isArray(d.turler) ? BORC_TURLERI.filter((tur) => d.turler.includes(tur)) : [];
  const borclar = (Array.isArray(d.borclar) ? d.borclar : [])
    .filter((borc) => borc && typeof borc === "object" && BORC_TURLERI.includes(borc.tur))
    .slice(0, 20)
    .map((borc) => {
      const temiz = { tur: borc.tur };
      for (const alan of BORC_ALANLARI) if (borc[alan] !== undefined) temiz[alan] = metin(String(borc[alan]), 60);
      return temiz;
    });
  const durum = {
    ...bos,
    ad: metin(d.ad, 40),
    tema: TEMALAR.includes(d.tema) ? d.tema : bos.tema,
    hedefler: hedefler.length ? hedefler : bos.hedefler,
    siklik: SIKLIKLAR.includes(d.siklik) ? d.siklik : bos.siklik,
    maasGunu: tamSayi(d.maasGunu, 1, 31, bos.maasGunu),
    maasHaftaGunu: tamSayi(d.maasHaftaGunu, 1, 7, bos.maasHaftaGunu),
    gelir: /^[\d.,]{0,15}$/.test(String(d.gelir ?? "")) ? String(d.gelir ?? "") : "",
    turler,
    borcYok: d.borcYok === true,
    borclar,
    atlanan: Array.isArray(d.atlanan) ? d.atlanan.filter((adim) => ADIMLAR.includes(adim)) : [],
  };
  const sira = adimSirasi({ native, siklik: durum.siklik, borcYok: durum.borcYok });
  if (!sira.includes(veri.adim) || veri.adim === "hazir") return null;
  return {
    adim: veri.adim,
    durum,
    secilenDil: diller.includes(veri.secilenDil) ? veri.secilenDil : null,
    ulke: /^[A-Z]{2}$/.test(String(veri.ulke || "")) ? veri.ulke : null,
    birim: birimler.includes(veri.birim) ? veri.birim : null,
  };
}

// Tarayicinin geri/ileri tusuyla gelinen adim: kurulum girdisi degilse ya
// da adim artik sirada yoksa (ör. "Borcum yok" secildi) null.
export function gecmistenAdim(durum, sira) {
  const adim = durum && typeof durum === "object" ? durum.kurulumAdim : null;
  return adim && sira.includes(adim) ? adim : null;
}

// --- Tarayici yardimcilari (depolama kapaliysa sessizce yok sayilir) ---

export function taslagiOku(anahtar) {
  try {
    return globalThis.sessionStorage?.getItem(anahtar) ?? null;
  } catch {
    return null;
  }
}

export function taslagiYaz(anahtar, deger) {
  try {
    globalThis.sessionStorage?.setItem(anahtar, JSON.stringify(deger));
  } catch {
    // Gizli mod / kota: yenilemede akis bastan baslar.
  }
}

export function taslagiSil(anahtar) {
  try {
    globalThis.sessionStorage?.removeItem(anahtar);
  } catch {
    // Yok say.
  }
}

// Oturumdaki kullanicinin kimligi (yalniz taslak anahtari icin); oturum
// yoksa (misafir, demo) null.
export function oturumKullaniciId() {
  try {
    const depo = globalThis.localStorage;
    if (!depo) return null;
    for (let i = 0; i < depo.length; i += 1) {
      const anahtar = depo.key(i) || "";
      if (!anahtar.startsWith("sb-") || !anahtar.endsWith("-auth-token")) continue;
      const oturum = JSON.parse(depo.getItem(anahtar) || "null");
      const id = (oturum?.user || oturum?.currentSession?.user)?.id;
      if (id) return String(id);
    }
  } catch {
    // Okunamazsa misafir anahtari kullanilir.
  }
  return null;
}
