// Paylas -> Borcama: iOS'ta PDF "Borcama'da ac" ile gelince dosya
// uygulamanin gelen kutusuna kopyalanir ve adresi appUrlOpen ile web'e ulasir.
// Kaynaga gore iki yer var: Mail, Dosyalar ve banka uygulamalari
// file:///.../Documents/Inbox/<ad>.pdf, Onizleme (Preview) ise
// file:///.../tmp/com.borcama.app-Inbox/<ad>.pdf veriyor. Adres, uygulama hazir olana
// (giris, Face ID, veri yuklemesi) kadar burada bekler; App aboneligi alir,
// dosyayi okur ve ekstre penceresini acar. Islenen adres oturum boyunca bir
// daha islenmez: webview yeniden yuklenince getLaunchUrl ayni adresi tekrar
// verebiliyor.
import { nativeMi } from "./platform.js";
import { gelenDosyayiSil } from "./nativeSekmeCubugu.js";

const ISLENEN_ANAHTARI = "borcama_islenen_ekstreler";

export function gelenPdfAdresiMi(adres) {
  if (typeof adres !== "string" || !adres.startsWith("file://")) return false;
  let yol;
  try {
    yol = decodeURIComponent(new URL(adres).pathname);
  } catch {
    return false;
  }
  return /\/(Documents\/Inbox|tmp\/[^/]+-Inbox)\/[^/]+\.pdf$/i.test(yol);
}

export function gelenDosyaAdi(adres) {
  try {
    const ad = decodeURIComponent(new URL(adres).pathname.split("/").pop() || "");
    return ad || "ekstre.pdf";
  } catch {
    return "ekstre.pdf";
  }
}

function islenenler() {
  try {
    const liste = JSON.parse(sessionStorage.getItem(ISLENEN_ANAHTARI) || "[]");
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

function islendiOlarakIsaretle(adres) {
  try {
    sessionStorage.setItem(ISLENEN_ANAHTARI, JSON.stringify([...islenenler(), adres].slice(-20)));
  } catch {
    /* depolama kapaliysa yalniz bellekteki kuyruk kullanilir */
  }
}

let bekleyen = null;
const aboneler = new Set();

// Test ve dinleyici icin: adresi kuyruga alir, aboneye haber verir.
export function gelenAdresiAl(adres) {
  if (!gelenPdfAdresiMi(adres)) return false;
  if (adres === bekleyen || islenenler().includes(adres)) return false;
  bekleyen = adres;
  aboneler.forEach((abone) => abone(adres));
  return true;
}

// App hazir oldugunda abone olur; bekleyen adres varsa hemen verilir.
export function gelenEkstreAboneOl(abone) {
  aboneler.add(abone);
  if (bekleyen) abone(bekleyen);
  return () => aboneler.delete(abone);
}

// Ekstre penceresi dosyayi aldiktan (ya da reddettikten) sonra cagrilir.
export function gelenEkstreIslendi(adres) {
  if (!adres) return;
  islendiOlarakIsaretle(adres);
  if (bekleyen === adres) bekleyen = null;
  gelenDosyayiSil(adres);
}

// Banka ekstrelerinin adinda bosluk, Turkce harf ve parantez olur
// ("23 Ekim 2026 (Güncel Ekstrem).pdf"). Adres once geldigi gibi, olmazsa
// yolu bir kez cozulup yeniden kodlanmis haliyle denenir.
export function gelenDosyaAdresAdaylari(adres) {
  const adaylar = [adres];
  try {
    const url = new URL(adres);
    const yeniden = `file://${encodeURI(decodeURIComponent(url.pathname))}`;
    if (!adaylar.includes(yeniden)) adaylar.push(yeniden);
  } catch {
    /* gecersiz adres: yalniz kendisi denenir */
  }
  return adaylar;
}

export async function gelenEkstreDosyasi(adres) {
  const { Capacitor } = await import("@capacitor/core");
  let sonDurum = "yok";
  for (const aday of gelenDosyaAdresAdaylari(adres)) {
    try {
      const yanit = await fetch(Capacitor.convertFileSrc(aday));
      if (yanit.ok) {
        const icerik = await yanit.blob();
        if (icerik.size > 0) return new File([icerik], gelenDosyaAdi(adres), { type: "application/pdf" });
        sonDurum = "bos";
      } else {
        sonDurum = String(yanit.status);
      }
    } catch {
      sonDurum = "ag";
    }
  }
  throw new Error(`gelen dosya okunamadi (${sonDurum})`);
}

// main.jsx acilista bir kez cagirir; App'ten once kurulur ki soguk
// acilistaki adres kacmasin.
export async function gelenEkstreleriDinle() {
  if (!nativeMi) return;
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("appUrlOpen", (olay) => gelenAdresiAl(olay?.url));
    // Uygulama kapaliyken paylasildiysa bekletilen appUrlOpen olayini
    // Capacitor yalniz ilk dinleyiciye (derinBaglantilariDinle) veriyor;
    // adres baslangic adresinden okunur. Ayni adresin yeniden gelmesini
    // islenenler listesi ve bekleyen karsilastirmasi engeller.
    const baslangic = await App.getLaunchUrl();
    gelenAdresiAl(baslangic?.url);
  } catch {
    // Eklenti yoksa paylasim akisi devre disi kalir.
  }
}

export function _sifirla() {
  bekleyen = null;
  aboneler.clear();
}
