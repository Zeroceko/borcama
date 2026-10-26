import { nativeMi } from "./platform.js";
import tr from "./locales/tr.js";
import en from "./locales/en.js";

// Uygulama ici dil secimi. Harici kutuphane yok: sozlukler duz nesne,
// eksik anahtar Turkce metne duser. Web surumu simdilik daima Turkce;
// Ingilizce yalniz native kabukta (iOS) devreye girer.

export const DIL_ANAHTARI = "borcama_dil";
export const DESTEKLENEN_DILLER = ["tr", "en"];
const SOZLUKLER = { tr, en };
const LOCALELER = { tr: "tr-TR", en: "en-US" };

function guvenliOku(anahtar) {
  try {
    return globalThis.localStorage?.getItem(anahtar) ?? null;
  } catch {
    return null;
  }
}

function guvenliYaz(anahtar, deger) {
  try {
    globalThis.localStorage?.setItem(anahtar, deger);
  } catch {
    // Gizli sekme veya kapali depolama: secim yalniz bu oturumda kalir.
  }
}

// Saf karar fonksiyonu; testler ortamdan bagimsiz cagirir.
export function dilBelirle({ native = false, kayitli = null, tarayiciDili = "" } = {}) {
  if (!native) return "tr";
  if (DESTEKLENEN_DILLER.includes(kayitli)) return kayitli;
  return String(tarayiciDili || "").toLowerCase().startsWith("tr") ? "tr" : "en";
}

let oturumDili = null;

export function dil() {
  if (oturumDili) return oturumDili;
  return dilBelirle({
    native: nativeMi,
    kayitli: guvenliOku(DIL_ANAHTARI),
    tarayiciDili: globalThis.navigator?.language || "",
  });
}

export function dilAyarla(kod) {
  if (!DESTEKLENEN_DILLER.includes(kod)) return dil();
  guvenliYaz(DIL_ANAHTARI, kod);
  oturumDili = nativeMi ? kod : "tr";
  if (globalThis.document?.documentElement) {
    globalThis.document.documentElement.lang = oturumDili;
  }
  return oturumDili;
}

// Dil adlari her zaman kendi dilinde yazilir; kullanici okuyamadigi dilde
// kalmissa da kendi dilini tanir.
export const DIL_ADLARI = { tr: "Türkçe", en: "English" };

export function digerDil(kod = dil()) {
  return kod === "en" ? "tr" : "en";
}

// Acilista <html lang> secili dile esitlenir; ekran okuyucu ve yazim
// denetimi dogru dili kullanir. Web'de dil daima "tr" (index.html ile ayni).
export function belgeDiliniAyarla() {
  const kok = globalThis.document?.documentElement;
  if (kok && kok.lang !== dil()) kok.lang = dil();
}

// Dil degisince tum metinler yeniden okunmali; en guvenli yol sayfayi
// yeniden yuklemek. Web'de dil secimi yok, hicbir sey yapmaz.
export function diliDegistirVeYenile(kod) {
  if (!nativeMi || kod === dil()) return;
  dilAyarla(kod);
  globalThis.location?.reload();
}

export function locale(kod = dil()) {
  return LOCALELER[kod] || LOCALELER.tr;
}

function yerlestir(metin, degiskenler) {
  if (!degiskenler) return metin;
  return metin.replace(/\{(\w+)\}/g, (tum, ad) =>
    Object.prototype.hasOwnProperty.call(degiskenler, ad) ? String(degiskenler[ad]) : tum,
  );
}

// Anahtar secili dilde yoksa Turkceye, orada da yoksa anahtarin kendisine duser.
export function cevir(kod, anahtar, degiskenler) {
  const sozluk = SOZLUKLER[kod] || tr;
  const metin = sozluk[anahtar] ?? tr[anahtar] ?? anahtar;
  return yerlestir(metin, degiskenler);
}

export function t(anahtar, degiskenler) {
  return cevir(dil(), anahtar, degiskenler);
}

// Metin icine React ogesi (kalin e-posta, baglanti dugmesi) yerlestirmek icin:
// cumle parcalara bolunur, {ad} yerine degiskenin kendisi (oge olabilir) konur.
// Kelime sirasi dile gore degistigi icin ogeyi metnin disinda birakmak yerine
// yer tutucuyla sozluge tasiriz.
export function cevirOgeler(kod, anahtar, degiskenler = {}) {
  const sozluk = SOZLUKLER[kod] || tr;
  const metin = sozluk[anahtar] ?? tr[anahtar] ?? anahtar;
  return metin
    .split(/(\{\w+\})/)
    .filter((parca) => parca !== "")
    .map((parca) => {
      const ad = /^\{(\w+)\}$/.exec(parca)?.[1];
      return ad && Object.prototype.hasOwnProperty.call(degiskenler, ad) ? degiskenler[ad] : parca;
    });
}

export function tOgeler(anahtar, degiskenler) {
  return cevirOgeler(dil(), anahtar, degiskenler);
}

// Veride saklanan Turkce degerler (borc turu, kategori, banka disi etiketler)
// hic degistirilmez; yalniz ekranda gosterilirken cevrilir. Sozlukte
// "deger.<Turkce metin>" anahtari varsa o, yoksa metnin kendisi doner.
export function tDeger(metin) {
  if (metin === null || metin === undefined || metin === "") return metin;
  const anahtar = `deger.${metin}`;
  const sozluk = SOZLUKLER[dil()] || tr;
  return sozluk[anahtar] ?? metin;
}
