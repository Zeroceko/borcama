// Site (landing) teması: varsayılan açık. prefers-color-scheme izlenmez;
// koyu yalnız alt bilgideki anahtarla açılır ve bu tarayıcıda hatırlanır.
// Depolama kapalıysa (gizli pencere vb.) açık temayla devam edilir.

export const SITE_KOYU_ANAHTARI = "borcama:site-koyu";

export function siteKoyuMu() {
  try {
    return globalThis.localStorage?.getItem(SITE_KOYU_ANAHTARI) === "1";
  } catch {
    return false;
  }
}

export function siteKoyuKaydet(koyu) {
  try {
    globalThis.localStorage?.setItem(SITE_KOYU_ANAHTARI, koyu ? "1" : "0");
  } catch {
    // Tercih yalnız bu sayfa açıkken geçerli kalır.
  }
}

export function siteTemasiniUygula(koyu, kok = globalThis.document?.documentElement) {
  if (!kok) return;
  if (koyu) kok.setAttribute("data-theme", "dark");
  else kok.removeAttribute("data-theme");
}
