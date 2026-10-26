import { nativeMi } from "./platform.js";

// Borcama Pro aboneligi App Store'da simdilik yalniz bazi ulkelerde (Turkiye)
// satista olabilir. Kullanicinin App Store ulkesinde urun yoksa RevenueCat
// teklifleri bos doner; bu durumda native uygulama satin alma yuzeylerini
// gostermez ve Pro'ya bagli ozellikleri ucretsiz acar (kullanici acamayacagi
// kilitli ozellik gormesin). Web'de bu mantik hic calismaz.

export const PRO_SATIS_ANAHTARI = "borcama_pro_satis";

// RevenueCat hata kodlari: 23 = CONFIGURATION_ERROR (urunler magazadan
// alinamadi), 5 = PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR.
const URUN_YOK_HATALARI = new Set(["23", "5"]);
const TURKIYE_MAGAZALARI = new Set(["TUR", "TR"]);

// Saf karar: "var" | "yok" | null (bilinmiyor; ag hatasi vb.).
// Turkiye magazasinda hicbir kosulda "yok" denmez: orada urun bos donuyorsa
// bu yapilandirma hatasidir, Pro bedavaya acilmamali.
export function proSatisDurumuBelirle({ paketler = null, hata = null } = {}) {
  const magaza = String(paketler?.storefront ?? hata?.storefront ?? "").toUpperCase();
  let durum = null;
  if (hata) {
    durum = hata.bosTeklif || URUN_YOK_HATALARI.has(String(hata.code ?? "")) ? "yok" : null;
  } else if (paketler && !paketler.unavailable) {
    durum = paketler.monthly || paketler.annual ? "var" : "yok";
  }
  if (durum === "yok" && TURKIYE_MAGAZALARI.has(magaza)) return null;
  return durum;
}

export function kayitliProSatisDurumu() {
  if (!nativeMi) return "var";
  try {
    const deger = globalThis.localStorage?.getItem(PRO_SATIS_ANAHTARI);
    return deger === "var" || deger === "yok" ? deger : null;
  } catch {
    return null;
  }
}

export function proSatisDurumunuKaydet(durum) {
  if (!nativeMi || (durum !== "var" && durum !== "yok")) return;
  try {
    globalThis.localStorage?.setItem(PRO_SATIS_ANAHTARI, durum);
  } catch {
    // Depolama kapali: karar yalniz bu oturumda gecerli.
  }
}

// Bu cihazin App Store ulkesinde Pro satilmiyor mu (son bilinen durum)?
export function proSatistaDegil() {
  return nativeMi && kayitliProSatisDurumu() === "yok";
}
