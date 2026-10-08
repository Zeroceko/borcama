import { iosMu } from "./platform.js";

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
  kapi.postMessage({ tip: "hazirla" });
  return true;
}

export function sekmeCubugunuSec(anahtar) {
  kanal()?.postMessage({ tip: "sec", anahtar });
}

export function sekmeCubugunuGoster(gorunsun) {
  kanal()?.postMessage({ tip: "goster", gorunsun });
}
