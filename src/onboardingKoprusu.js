import { nativeMi } from "./platform.js";
import { DESTEKLENEN_DILLER, belgeDiliniAyarla, cevir, dil, dilAyarla, dilSozlugunuYukle } from "./i18n.js";
import {
  DESTEKLENEN_PARA_BIRIMLERI,
  bolgeAyarla,
  bolgedenParaBirimi,
  cihazBolgesi,
  kullaniciParaBirimi,
  paraBirimiAyarla,
  paraBirimiSimgesi,
} from "./currencyInput.js";
import { onboardingTamamla } from "./onboardingDurumu.js";
import { misafirModunuAc } from "./misafirModu.js";
import { onboardingOlayiKaydet } from "./activityLog.js";
import { SIK_ULKELER, TUM_ULKELER, bayrak } from "./onboardingAdimlari.js";
import { tr as onboardingMetinleri } from "./locales/bolumler/onboarding.js";

// iOS native (SwiftUI) onboarding koprusu. Kabuk `borcamaOnboarding` mesaj
// kanalini sunuyorsa giris oncesi web onboarding'i cizilmez; akis native'de
// calisir, sonucu `borcamaOnboardingBitti` olayiyla buraya doner. Kanal
// yoksa (tarayici, eski iOS build'leri) web akisi aynen calisir.
//
// Web -> native: postMessage({ tip: "baslat", ... }) (baslatMesaji)
// `tema`: kurulum oncesi secili gorunum ("system" | "light" | "dark");
// bekleyen bir sonuc varsa onun temasi, yoksa cihazi izleyen "system".
// Native akis gorunum adiminda bunu degistirir ve sonuc.tema olarak dondurur.
// Native -> web (window CustomEvent, detail):
//   borcamaOnboardingDil   { dil }
//   borcamaOnboardingOlay  { ad: "onboarding_adim"|"onboarding_atla", adim, sure_ms }
//   borcamaOnboardingBitti { sonuc }  (sekil: onboardingAdimlari.js > durumdanSonuc)

function kanal() {
  if (!nativeMi) return null;
  return globalThis.window?.webkit?.messageHandlers?.borcamaOnboarding || null;
}

export function nativeOnboardingVarMi() {
  return Boolean(kanal());
}

// Hesap acilmadan biten onboarding'in sonucu cihazda bekler; kayit/misafir
// sonrasi uygulama ilk acildiginda (App.jsx) veriye yazilip silinir.
export const BEKLEYEN_SONUC_ANAHTARI = "borcama:onboarding:sonuc";

export function bekleyenSonucuOku() {
  try {
    const ham = globalThis.localStorage?.getItem(BEKLEYEN_SONUC_ANAHTARI);
    return ham ? JSON.parse(ham) : null;
  } catch {
    return null;
  }
}

export function bekleyenSonucuKaydet(sonuc) {
  try {
    globalThis.localStorage?.setItem(BEKLEYEN_SONUC_ANAHTARI, JSON.stringify(sonuc));
  } catch {
    // Yazilamazsa web kurulum akisi yedek olarak acilir.
  }
}

export function bekleyenSonucuTemizle() {
  try {
    globalThis.localStorage?.removeItem(BEKLEYEN_SONUC_ANAHTARI);
  } catch {
    // Silinemezse bir sonraki acilista kayitli veri varsa yok sayilir.
  }
}

const METIN_ANAHTARLARI = [...Object.keys(onboardingMetinleri), "onboarding.karar.misafir"];
const TEMALAR = ["system", "light", "dark"];

export function baslangicTemasi() {
  const bekleyen = bekleyenSonucuOku();
  return TEMALAR.includes(bekleyen?.tema) ? bekleyen.tema : "system";
}

function bolgeAdi(kod, dilKodu) {
  try {
    return new Intl.DisplayNames([dilKodu], { type: "region" }).of(kod) || kod;
  } catch {
    return kod;
  }
}

// Native akisa giden baslangic verisi. Metinler yalniz onboarding bolumu,
// her dil icin duz anahtar -> metin; {tutar} gibi yer tutucular aynen kalir.
// Eksik ceviri Ingilizceye duser (i18n.js zinciri).
export async function baslatMesaji(bugun = new Date()) {
  await Promise.all(DESTEKLENEN_DILLER.map((kod) => dilSozlugunuYukle(kod)));
  const metinler = Object.fromEntries(
    DESTEKLENEN_DILLER.map((kod) => [kod, Object.fromEntries(METIN_ANAHTARLARI.map((anahtar) => [anahtar, cevir(kod, anahtar)]))]),
  );
  const tespit = cihazBolgesi();
  const yerel = (tarih) => `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, "0")}-${String(tarih.getDate()).padStart(2, "0")}`;
  return {
    tip: "baslat",
    dil: dil(),
    tema: baslangicTemasi(),
    ulke: /^[A-Z]{2}$/.test(tespit) ? tespit : null,
    paraBirimi: kullaniciParaBirimi(),
    bugun: yerel(bugun),
    metinler,
    ulkeler: TUM_ULKELER.map((kod) => ({
      kod,
      bayrak: bayrak(kod),
      paraBirimi: bolgedenParaBirimi(`und-${kod}`),
      sik: SIK_ULKELER.includes(kod),
      adlar: Object.fromEntries(DESTEKLENEN_DILLER.map((d) => [d, bolgeAdi(kod, d)])),
    })),
    paraBirimleri: DESTEKLENEN_PARA_BIRIMLERI.map((kod) => ({ kod, sembol: paraBirimiSimgesi(kod, "en-US") })),
  };
}

// Native akis bittiginde: dil/ulke/para birimi hemen uygulanir. "giris"te
// veri yazilmaz, giris ekranina gidilir. "misafir"de hesapsiz kullanim
// acilir; "tamam"da hesap acma (kayit) ekranina gidilir. Iki durumda da
// sonuc bekler ve uygulama acilinca veriye yazilir.
export function onboardingBitti(sonuc = {}, git = (hedef) => globalThis.location?.assign(hedef)) {
  if (DESTEKLENEN_DILLER.includes(sonuc.dil)) dilAyarla(sonuc.dil);
  if (DESTEKLENEN_PARA_BIRIMLERI.includes(sonuc.paraBirimi)) paraBirimiAyarla(sonuc.paraBirimi);
  if (/^[A-Z]{2}$/.test(String(sonuc.ulke || ""))) bolgeAyarla(sonuc.ulke);
  onboardingTamamla();
  if (sonuc.cikis === "giris") return git("/login");
  bekleyenSonucuKaydet(sonuc);
  void onboardingOlayiKaydet("onboarding_tamam", {
    borc_sayisi: Array.isArray(sonuc.borclar) ? sonuc.borclar.length : 0,
    gelir_var: Number(sonuc.gelir) > 0,
    sure_ms: sonuc.sure_ms,
  });
  if (sonuc.cikis === "misafir") {
    misafirModunuAc();
    return git("/summary");
  }
  return git("/register");
}

// Koprunun acilisi: baslat mesajini gonderir, native olaylarini dinler.
// Donen fonksiyon dinleyicileri kaldirir.
export function nativeOnboardingBaslat() {
  const kapi = kanal();
  if (!kapi) return () => {};
  const dilOlayi = async (olay) => {
    const kod = olay?.detail?.dil;
    if (!DESTEKLENEN_DILLER.includes(kod)) return;
    dilAyarla(kod);
    await dilSozlugunuYukle(kod);
    belgeDiliniAyarla();
  };
  const olcumOlayi = (olay) => {
    const { ad, adim, sure_ms } = olay?.detail || {};
    if (ad === "onboarding_adim" || ad === "onboarding_atla") void onboardingOlayiKaydet(ad, { adim, sure_ms });
  };
  const bittiOlayi = (olay) => onboardingBitti(olay?.detail?.sonuc || {});
  window.addEventListener("borcamaOnboardingDil", dilOlayi);
  window.addEventListener("borcamaOnboardingOlay", olcumOlayi);
  window.addEventListener("borcamaOnboardingBitti", bittiOlayi);
  baslatMesaji().then((mesaj) => kapi.postMessage(mesaj)).catch(() => {});
  return () => {
    window.removeEventListener("borcamaOnboardingDil", dilOlayi);
    window.removeEventListener("borcamaOnboardingOlay", olcumOlayi);
    window.removeEventListener("borcamaOnboardingBitti", bittiOlayi);
  };
}
