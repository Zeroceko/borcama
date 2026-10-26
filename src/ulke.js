import { nativeMi } from "./platform.js";

// Web: ziyaretcinin IP ulkesi (/api/ulke). Yalniz iki karar icin kullanilir:
// Pro'nun satista olup olmadigi (proSatis.js) ve yeni kullanicinin varsayilan
// para birimi/bolge kurallari (currencyInput.js). Native'de hic calismaz;
// orada App Store ulkesi ve cihaz bolgesi kullanilir.
//
// Tarayicida yalniz iki harfli ulke kodu ve alinma zamani saklanir; boylece
// her acilista istek beklenmez ve karar sayfa yuklemeleri arasinda tutarli
// kalir. Ulke alinamazsa null: cagiranlar bugunku davranisa (Pro satista,
// TRY) duser.

export const ULKE_ANAHTARI = "borcama_ulke";
export const ULKE_OMRU_MS = 12 * 60 * 60 * 1000;
const ULKE_KODU = /^[A-Z]{2}$/;

let bellekteki; // undefined: henuz okunmadi

export function ulkeKoduGecerli(kod) {
  return typeof kod === "string" && ULKE_KODU.test(kod);
}

function kayitOku() {
  try {
    const ham = globalThis.localStorage?.getItem(ULKE_ANAHTARI);
    if (!ham) return null;
    const kayit = JSON.parse(ham);
    return ulkeKoduGecerli(kayit?.kod) && Number.isFinite(kayit?.zaman) ? kayit : null;
  } catch {
    return null;
  }
}

function kayitYaz(kod, zaman) {
  try {
    globalThis.localStorage?.setItem(ULKE_ANAHTARI, JSON.stringify({ kod, zaman }));
  } catch {
    // Depolama kapali: karar yalniz bu sayfa yuklemesinde gecerli.
  }
}

// Bilinen son ulke ("TR", "DE"...) ya da null. Senkron; ag beklemez.
export function bilinenUlke() {
  if (nativeMi) return null;
  if (bellekteki === undefined) bellekteki = kayitOku()?.kod ?? null;
  return bellekteki;
}

export function ulkeTazeMi(simdi = Date.now()) {
  const kayit = kayitOku();
  return Boolean(kayit && simdi - kayit.zaman < ULKE_OMRU_MS && simdi >= kayit.zaman);
}

// /api/ulke'yi sorar; basarida kodu bellege ve depoya yazar. Hata, zaman
// asimi veya bilinmeyen ulkede bilinen deger degismez ve null doner.
export async function ulkeyiGuncelle({ getir = globalThis.fetch, zamanAsimiMs = 1500, simdi = Date.now } = {}) {
  if (nativeMi || typeof getir !== "function") return null;
  const iptal = typeof AbortController === "function" ? new AbortController() : null;
  const zamanlayici = iptal ? setTimeout(() => iptal.abort(), zamanAsimiMs) : null;
  try {
    const yanit = await getir("/api/ulke", {
      cache: "no-store",
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: iptal?.signal,
    });
    if (!yanit?.ok) return null;
    const veri = await yanit.json();
    const kod = String(veri?.ulke ?? "").toUpperCase();
    if (!ulkeKoduGecerli(kod)) return null;
    bellekteki = kod;
    kayitYaz(kod, simdi());
    return kod;
  } catch {
    return null;
  } finally {
    if (zamanlayici) clearTimeout(zamanlayici);
  }
}

// Testler icin: bellekteki degeri sifirlar.
export function ulkeBelleginiSifirla() {
  bellekteki = undefined;
}
