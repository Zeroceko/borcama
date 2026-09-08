import { Capacitor } from "@capacitor/core";

// Native/web ayrimi icin tek kaynak. Uygulamanin baska hicbir yerinde
// Capacitor dogrudan sorgulanmaz; her kosul buradan gecer.
export const platformAdi = Capacitor.getPlatform();
export const nativeMi = Capacitor.isNativePlatform();
export const iosMu = nativeMi && platformAdi === "ios";
export const androidMi = nativeMi && platformAdi === "android";

// Native kabukta acilabilecek yollar. Landing, SEO, demo ve yonetim
// ekranlari listede yok: App Store 4.2 geregi native surum bir web
// sarmalayicisi gibi davranmamali, dogrudan uygulama akisina girmeli.
const NATIVE_YOLLARI = new Set([
  "/login",
  "/register",
  "/reset-password",
  "/welcome",
  "/upgrade",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/faq",
  "/summary",
  "/debts",
  "/payments",
  "/debt-plan",
  "/income",
  "/fixed-income",
  "/expenses",
  "/fixed-expenses",
  "/assets",
  "/settings",
]);

export function nativeYoluMu(yol) {
  return NATIVE_YOLLARI.has(yol);
}

// Native kabukta govdeye isaretci sinif ekler; guvenli alan degerleri ve
// native duzeltmeler bu sinif uzerinden native.css'te uygulanir. Tarayicida
// hicbir sey yapmaz; web gorunumu bugunku haliyle kalir.
export function nativeGorunumuHazirla() {
  if (!nativeMi) return;
  document.documentElement.classList.add("borcama-native");
  document.documentElement.classList.add(`borcama-${platformAdi}`);
  // viewport-fit=cover olmadan env(safe-area-inset-*) her zaman 0 doner;
  // centik ve ev cubugu bosluklarinin olculebilmesi icin gerekli.
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && !viewport.content.includes("viewport-fit")) {
    viewport.setAttribute("content", `${viewport.content}, viewport-fit=cover`);
  }
}
