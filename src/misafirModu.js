import { nativeMi } from "./platform.js";

// Hesapsiz kullanim. Kullanici kaydolmadan borclarini girip butun
// hesaplamalari gorebilir; veriler yalnizca cihazda saklanir. Hesap
// yalnizca cihazlar arasi esleme, yedek ve Pro icin gerekir.
//
// Yalnizca uygulamada acilir; tarayici surumunde akis degismiyor.
const ANAHTAR = "borcama:misafir";

export function misafirModuAcik() {
  if (!nativeMi) return false;
  try {
    return localStorage.getItem(ANAHTAR) === "1";
  } catch {
    return false;
  }
}

export function misafirModunuAc() {
  try {
    localStorage.setItem(ANAHTAR, "1");
  } catch {
    // Depolama kapaliysa hesapsiz mod acilamaz; akis giris ekranina duser.
  }
}

export function misafirModunuKapat() {
  try {
    localStorage.removeItem(ANAHTAR);
  } catch {
    // Bayrak silinemezse bir sonraki acilista yeniden denenir.
  }
}

// Hesapsiz kullanimda veriler bu anahtarla cihazda tutulur; App.jsx ayni
// anahtari kullandigi icin hesaba gecerken tasinacak kayit buradan okunur.
export const MISAFIR_VERI_ANAHTARI = "borctakip:v1";

// Hesapsiz kullanimda cihazda biriken kayitlar, kullanici hesap actiginda ya da
// giris yaptiginda hesabina tasinir. Hesapta zaten kayit varsa uzerine
// yazilmaz; cihazdaki kopya da silinmez, boylece hicbir veri kaybolmaz.
export async function misafirVerisiniHesabaTasi() {
  if (!misafirModuAcik()) return false;
  let yerel = null;
  try {
    yerel = localStorage.getItem(MISAFIR_VERI_ANAHTARI);
  } catch {
    yerel = null;
  }
  // Bayrak once kapaniyor ki depo bundan sonra hesaba yazsin.
  misafirModunuKapat();
  if (!yerel) return false;
  try {
    const mevcut = await window.storage.get(MISAFIR_VERI_ANAHTARI);
    if (mevcut?.value) return false;
    await window.storage.set(MISAFIR_VERI_ANAHTARI, yerel);
    try {
      localStorage.removeItem(MISAFIR_VERI_ANAHTARI);
    } catch {
      // Yerel kopya silinemezse zararsiz; hesaptaki kayit esas alinir.
    }
    return true;
  } catch {
    return false;
  }
}
