import { iosMu } from "./platform.js";
import { t } from "./i18n.js";

// Alt gezinme cubugu iOS'ta HTML degil, isletim sisteminin kendi UITabBar'i.
// Haberlesme WebKit mesaj kanaliyla yapiliyor; kanal yoksa (tarayici, Android)
// hicbir sey calismiyor ve HTML cubuk devrede kaliyor.
export const nativeSekmeCubuguVarMi = iosMu;

function kanal() {
  if (!nativeSekmeCubuguVarMi) return null;
  return window.webkit?.messageHandlers?.borcamaTab || null;
}

export function sekmeCubuguHazirla(sekmeSecildi) {
  const kapi = kanal();
  if (!kapi) return false;
  window.addEventListener("borcamaSekmeSecildi", (olay) => {
    const anahtar = olay?.detail?.anahtar;
    if (anahtar) sekmeSecildi(anahtar);
  });
  // Sekme etiketleri secili dilde gonderilir; eski native surum alani
  // tanimazsa kendi Turkce etiketlerini kullanir.
  kapi.postMessage({
    tip: "hazirla",
    basliklar: [t("sekme.ozet"), t("sekme.borclar"), t("sekme.hareketler"), t("sekme.varliklar")],
  });
  return true;
}

export function sekmeCubugunuSec(anahtar) {
  kanal()?.postMessage({ tip: "sec", anahtar });
}

export function sekmeCubuguTemasi(koyu) {
  kanal()?.postMessage({ tip: "tema", koyu: Boolean(koyu) });
}

export function sekmeCubugunuGoster(gorunsun) {
  kanal()?.postMessage({ tip: "goster", gorunsun });
}

// Kod ekrani acikken native, uygulamaya donulunce panoya o sirada yeni
// kopyalanmis 6 haneli kodu borcamaPanodanKod olayiyla gonderir. Kod ekrani
// acilmadan once panoda olan sayi (eski bir kod) okunmaz.
export function panodanKoduDinle(kodGeldi) {
  const kapi = kanal();
  if (!kapi) return () => {};
  const dinle = (olay) => {
    const kod = olay?.detail?.kod;
    if (kod) kodGeldi(kod);
  };
  window.addEventListener("borcamaPanodanKod", dinle);
  kapi.postMessage({ tip: "kodBekle", acik: true });
  return () => {
    window.removeEventListener("borcamaPanodanKod", dinle);
    kapi.postMessage({ tip: "kodBekle", acik: false });
  };
}

// Paylas -> Borcama ile gelen PDF islendikten sonra Documents/Inbox'tan
// silinir. Native yalniz Inbox altindaki dosyalari siler.
export function gelenDosyayiSil(adres) {
  if (!adres) return;
  kanal()?.postMessage({ tip: "gelenDosyaSil", adres });
}
