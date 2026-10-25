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
