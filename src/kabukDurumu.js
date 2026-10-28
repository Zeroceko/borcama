// Web kabuğunun hangi ekranda olduğu (kurulum akışı, uygulama). Ölçüm izni
// bandı (GoogleAdsConsent) buna göre yerleşir: kurulumda hiç çizilmez,
// uygulamada büyük ekranda üstte durup içeriği iter.
import { useSyncExternalStore } from "react";

let durum = { kurulum: false, uygulama: false };
const dinleyiciler = new Set();

export function kabukDurumunuBildir(alanlar) {
  const yeni = { ...durum, ...alanlar };
  if (yeni.kurulum === durum.kurulum && yeni.uygulama === durum.uygulama) return;
  durum = yeni;
  for (const dinle of dinleyiciler) dinle();
}

function abone(dinle) {
  dinleyiciler.add(dinle);
  return () => dinleyiciler.delete(dinle);
}

export function useKabukDurumu() {
  return useSyncExternalStore(abone, () => durum, () => durum);
}

// Giriş, kayıt, kod ve parola ekranları: izin bandı yok.
const HESAP_YOLLARI = new Set(["/login", "/register", "/auth-callback", "/reset-password", "/login-preview", "/register-preview"]);

// "yok" | "ust" (uygulama, ≥1024'te üstte) | "alt" (landing ve diğer sayfalar).
export function izinBandiYeri({ yol, kurulum, uygulama }) {
  if (kurulum || HESAP_YOLLARI.has(yol)) return "yok";
  return uygulama ? "ust" : "alt";
}
