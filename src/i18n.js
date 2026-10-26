import { nativeMi } from "./platform.js";
import tr from "./locales/tr.js";
import en from "./locales/en.js";

// Uygulama ici dil secimi. Harici kutuphane yok: sozlukler duz nesne,
// eksik anahtar Turkce metne duser. Web surumu simdilik daima Turkce;
// Ingilizce yalniz native kabukta (iOS) devreye girer.

export const DIL_ANAHTARI = "borcama_dil";
export const DESTEKLENEN_DILLER = ["tr", "en", "de", "fr", "es", "it"];
// tr ve en pakete gomulu; diger diller yalniz gerektiginde yuklenir ki
// web (daima Turkce) bu sozlukleri hic indirmesin.
const SOZLUKLER = { tr, en };
const YUKLEYICILER = {
  de: () => import("./locales/de.js"),
  fr: () => import("./locales/fr.js"),
  es: () => import("./locales/es.js"),
  it: () => import("./locales/it.js"),
};

// Secili dilin sozlugunu yukler. Uygulama modulleri degerlendirilmeden once
// (src/giris.js) cagrilir; yuklenemezse metinler Ingilizceye duser.
export async function dilSozlugunuYukle(kod = dil()) {
  if (SOZLUKLER[kod] || !YUKLEYICILER[kod]) return;
  try {
    SOZLUKLER[kod] = (await YUKLEYICILER[kod]()).default;
  } catch {
    // Ag/paket hatasi: Ingilizce yedek kullanilir.
  }
}
const LOCALELER = { tr: "tr-TR", en: "en-US", de: "de-DE", fr: "fr-FR", es: "es-ES", it: "it-IT" };

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
  // Cihaz dili desteklenen dillerden biriyse o; degilse Ingilizce.
  const onek = String(tarayiciDili || "").toLowerCase().slice(0, 2);
  return DESTEKLENEN_DILLER.includes(onek) ? onek : "en";
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
export const DIL_ADLARI = { tr: "Türkçe", en: "English", de: "Deutsch", fr: "Français", es: "Español", it: "Italiano" };

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

// Her ceviride kendiliginden saglanan degiskenler (ornegin {simge}: secili
// para biriminin simgesi). Saglayici currencyInput.js tarafindan kaydedilir;
// cagiranin verdigi degiskenler onceliklidir.
let ortakDegiskenSaglayici = null;
export function ortakDegiskenleriAyarla(saglayici) {
  ortakDegiskenSaglayici = typeof saglayici === "function" ? saglayici : null;
}
function ortakDegiskenler(metin, degiskenler) {
  if (!ortakDegiskenSaglayici || !metin.includes("{simge}")) return degiskenler;
  return { ...ortakDegiskenSaglayici(), ...(degiskenler || {}) };
}

function yerlestir(metin, hamDegiskenler) {
  const degiskenler = ortakDegiskenler(metin, hamDegiskenler);
  if (!degiskenler) return metin;
  return metin.replace(/\{(\w+)\}/g, (tum, ad) =>
    Object.prototype.hasOwnProperty.call(degiskenler, ad) ? String(degiskenler[ad]) : tum,
  );
}

// Anahtar secili dilde yoksa Turkceye, orada da yoksa anahtarin kendisine duser.
// Yedek zinciri: secili dil -> (Turkce degilse) Ingilizce -> Turkce -> anahtar.
// Yeni bir dilde eksik kalan anahtar Turkce degil Ingilizce gorunur.
function sozlukMetni(kod, anahtar) {
  return SOZLUKLER[kod]?.[anahtar] ?? (kod !== "tr" ? en[anahtar] : undefined) ?? tr[anahtar];
}

export function cevir(kod, anahtar, degiskenler) {
  const metin = sozlukMetni(kod, anahtar) ?? anahtar;
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
  const metin = sozlukMetni(kod, anahtar) ?? anahtar;
  degiskenler = ortakDegiskenler(metin, degiskenler) || {};
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
  const kod = dil();
  if (kod === "tr") return metin;
  return sozlukMetni(kod, `deger.${metin}`) ?? metin;
}

// "YYYY-MM-DD" bicimindeki kayit tarihini ekranda gosterir. Web'de bugunku
// "GG.AA.YYYY" ciktisi birebir korunur; native'de secili dilin yerel tarih
// bicimi kullanilir (en: 10/5/2026, de: 5.10.2026).
export function isoTarihGoster(iso, { native = nativeMi, yerel = locale() } = {}) {
  const metin = String(iso ?? "");
  const parca = /^(\d{4})-(\d{2})-(\d{2})/.exec(metin);
  if (!native || !parca) return metin.split("-").reverse().join(".");
  return new Date(Number(parca[1]), Number(parca[2]) - 1, Number(parca[3])).toLocaleDateString(yerel);
}
