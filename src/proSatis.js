import { nativeMi } from "./platform.js";
import { bilinenUlke, ulkeKoduGecerli } from "./ulke.js";

// Borcama Pro aboneligi App Store'da simdilik yalniz bazi ulkelerde (Turkiye)
// satista olabilir. Kullanicinin App Store ulkesinde urun yoksa RevenueCat
// teklifleri bos doner; bu durumda native uygulama satin alma yuzeylerini
// gostermez ve Pro'ya bagli ozellikleri ucretsiz acar (kullanici acamayacagi
// kilitli ozellik gormesin).
//
// Web'de ayni kural IP ulkesiyle uygulanir (Paddle odemesi): ulke Turkiye ise
// bugunku satis akisi aynen surer; baska bir ulkeyse satin alma yuzeyleri
// gizlenir ve Pro ozellikleri yalniz istemcide ucretsiz acilir (sunucuya hak
// yazilmaz). Ulke alinamazsa Pro satista sayilir (bugunku davranis). Ucretli
// aboneligi olan kullanici her yerde normal akisi gorur (App.jsx: ucretliPro).

export const PRO_SATIS_ANAHTARI = "borcama_pro_satis";

// RevenueCat hata kodlari: 23 = CONFIGURATION_ERROR (urunler magazadan
// alinamadi), 5 = PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR.
const URUN_YOK_HATALARI = new Set(["23", "5"]);
const TURKIYE_MAGAZALARI = new Set(["TUR", "TR"]);

// Saf karar (iOS ve web ortak): "var" | "yok" | null (bilinmiyor; ag hatasi vb.).
// Ulke kaynagi iOS'ta App Store magaza ulkesi (paketler/hata.storefront,
// "TUR"), web'de IP ulkesi (ulke, "TR"). Kural ikisinde ayni: Pro yalniz
// Turkiye'de satista. Turkiye'de hicbir kosulda "yok" denmez: orada urun bos
// donuyorsa bu yapilandirma hatasidir, Pro bedavaya acilmamali.
export function proSatisDurumuBelirle({ paketler = null, hata = null, ulke = null } = {}) {
  const magaza = String(ulke ?? paketler?.storefront ?? hata?.storefront ?? "").toUpperCase();
  let durum = null;
  if (ulke && !paketler && !hata) {
    // Web: urun listesi sorulmaz; ulke biliniyorsa karar yalniz ulkeden.
    durum = "var";
  } else if (hata) {
    durum = hata.bosTeklif || URUN_YOK_HATALARI.has(String(hata.code ?? "")) ? "yok" : null;
  } else if (paketler && !paketler.unavailable) {
    durum = paketler.monthly || paketler.annual ? "var" : "yok";
  }
  if (durum === "yok" && TURKIYE_MAGAZALARI.has(magaza)) return null;
  // Abonelikler yalniz Turkiye magazasinda satista. Sandbox, ulke kisitina
  // ragmen urunleri dondurebiliyor; bu yuzden magaza ulkesi biliniyorsa ve
  // Turkiye degilse urun listesine bakilmaksizin Pro satilmiyor sayilir.
  if (magaza && !TURKIYE_MAGAZALARI.has(magaza)) return "yok";
  return durum;
}

// Web: IP ulkesiyle ayni karar fonksiyonu. Ulke bilinmiyorsa (hata, yerel
// gelistirme) bugunku davranis: Pro satista.
export function webProSatisDurumu(ulke) {
  const kod = String(ulke ?? "").toUpperCase();
  return (ulkeKoduGecerli(kod) && proSatisDurumuBelirle({ ulke: kod })) || "var";
}

export function kayitliProSatisDurumu() {
  if (!nativeMi) return webProSatisDurumu(bilinenUlke());
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

// Bu cihazin App Store ulkesinde (web'de IP ulkesinde) Pro satilmiyor mu
// (son bilinen durum)?
export function proSatistaDegil() {
  return kayitliProSatisDurumu() === "yok";
}
