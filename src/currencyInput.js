import { dil, locale, ortakDegiskenleriAyarla } from "./i18n.js";
import { nativeMi } from "./platform.js";

const sadeceRakam = (value) => String(value ?? "").replace(/\D/g, "");

const PARA_FORMATLARI = new Map();

export const PARA_BIRIMI_ANAHTARI = "borcama_para_birimi";

// Uygulamada secilebilen para birimleri. Kur cevirisi yok: tutarlar
// kullanicinin kendi biriminde girilir ve gosterilir.
export const DESTEKLENEN_PARA_BIRIMLERI = ["TRY", "USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "NZD", "SEK", "NOK", "DKK"];

const EURO_BOLGESI = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
  "AD", "MC", "SM", "VA", "ME", "XK",
]);
const BOLGE_PARA_BIRIMI = {
  TR: "TRY", US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", CH: "CHF", LI: "CHF", JP: "JPY",
  NZ: "NZD", SE: "SEK", NO: "NOK", DK: "DKK",
};

// "en-US", "tr_TR", "de-DE-u-ca-gregory" gibi bir yerel ayardan bolge kodu.
export function bolgeKodu(yerelAyar) {
  const parcalar = String(yerelAyar || "").replace(/_/g, "-").split("-");
  for (const parca of parcalar.slice(1)) {
    if (/^[A-Za-z]{2}$/.test(parca)) return parca.toUpperCase();
    if (parca.length === 1) break; // uzanti (-u-, -x-) basladi
  }
  return "";
}

// Cihaz bolgesinden varsayilan birim. Bolge bilinmiyorsa dil Turkce ise
// TRY, degilse USD; desteklenmeyen bolge de USD'ye duser.
export function bolgedenParaBirimi(yerelAyar) {
  const bolge = bolgeKodu(yerelAyar);
  if (!bolge) return String(yerelAyar || "").toLowerCase().startsWith("tr") ? "TRY" : "USD";
  if (EURO_BOLGESI.has(bolge)) return "EUR";
  return BOLGE_PARA_BIRIMI[bolge] || "USD";
}

// Saf karar fonksiyonu. Web daima TRY. Native'de gecerli kayit varsa o;
// yoksa mevcut kurulum (eski surumden gelen, verisi TRY olan kullanici)
// veya Turkce dil TRY'de kalir, yeni kurulum cihaz bolgesini kullanir.
export function paraBirimiBelirle({ native = false, kayitli = null, dilKodu = "tr", yerelAyar = "", mevcutKurulum = false } = {}) {
  if (!native) return "TRY";
  if (DESTEKLENEN_PARA_BIRIMLERI.includes(kayitli)) return kayitli;
  if (mevcutKurulum || dilKodu === "tr") return "TRY";
  return bolgedenParaBirimi(yerelAyar);
}

function depoOku(anahtar) {
  try {
    return globalThis.localStorage?.getItem(anahtar) ?? null;
  } catch {
    return null;
  }
}

function mevcutKurulumMu() {
  try {
    const depo = globalThis.localStorage;
    if (!depo) return false;
    if (depo.getItem("borcama:onboarding:v1") === "1" || depo.getItem("borcama:misafir") === "1") return true;
    for (let i = 0; i < depo.length; i += 1) {
      const anahtar = depo.key(i) || "";
      if (anahtar.startsWith("sb-") || anahtar.startsWith("borcama:misafir")) return true;
    }
  } catch {
    // Depolama yoksa yeni kurulum say.
  }
  return false;
}

export function cihazYerelAyari() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || globalThis.navigator?.language || "";
  } catch {
    return globalThis.navigator?.language || "";
  }
}

// Kullanicinin gosterim para birimi. Web'de daima TRY. Native'de ilk
// cagrida belirlenen varsayilan kaydedilir; boylece cihaz bolgesi sonradan
// degisse de kullanicinin tutarlari baska birimle gosterilmez.
export function kullaniciParaBirimi() {
  if (!nativeMi) return "TRY";
  const kayitli = depoOku(PARA_BIRIMI_ANAHTARI);
  const birim = paraBirimiBelirle({
    native: true,
    kayitli,
    dilKodu: dil(),
    yerelAyar: cihazYerelAyari(),
    mevcutKurulum: mevcutKurulumMu(),
  });
  if (birim !== kayitli) {
    try {
      globalThis.localStorage?.setItem(PARA_BIRIMI_ANAHTARI, birim);
    } catch {
      // Yazilamazsa her acilista yeniden hesaplanir.
    }
  }
  return birim;
}

export function paraBirimiAyarla(kod) {
  if (!nativeMi || !DESTEKLENEN_PARA_BIRIMLERI.includes(kod)) return kullaniciParaBirimi();
  try {
    globalThis.localStorage?.setItem(PARA_BIRIMI_ANAHTARI, kod);
  } catch {
    // Gizli mod: secim bu oturumda kalmaz.
  }
  return kod;
}

// Para biriminin secili dildeki adi ("US Dollar", "ABD Doları").
export function paraBirimiAdi(kod, yerel = locale()) {
  try {
    return new Intl.DisplayNames([yerel], { type: "currency" }).of(kod) || kod;
  } catch {
    return kod;
  }
}

// Etiketlerdeki "(₺)" gibi birim simgesi. tr-TR + TRY icin "₺".
export function paraBirimiSimgesi(kod = kullaniciParaBirimi(), yerel = locale()) {
  try {
    const parca = new Intl.NumberFormat(yerel, {
      style: "currency",
      currency: kod,
      ...(yerel === "tr-TR" ? {} : { currencyDisplay: "narrowSymbol" }),
    }).formatToParts(0).find((p) => p.type === "currency");
    return parca?.value || kod;
  } catch {
    return kod;
  }
}

// Sozluk metinlerindeki {simge} yer tutucusu her t() cagrisinda secili
// birimin simgesiyle doldurulur.
ortakDegiskenleriAyarla(() => ({ simge: paraBirimiSimgesi() }));

// Para biriminin varsayilan ondalik hanesi (JPY icin 0). TRY/USD/EUR 2.
function varsayilanOndalik(currency) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits;
  } catch {
    return 2;
  }
}

export function paraBiriminiFormatla(value, currency = "TRY", options = {}) {
  // JPY gibi kurussuz birimlerde ondalik gosterilmez; diger birimlerde
  // istenen hane aynen kullanilir (TRY ciktisi degismez).
  const maximumFractionDigits = varsayilanOndalik(currency) === 0 ? 0 : (options.maximumFractionDigits ?? 2);
  const minimumFractionDigits = Math.min(options.minimumFractionDigits ?? 2, maximumFractionDigits);
  const yerel = options.locale || locale();
  const anahtar = `${yerel}:${currency}:${minimumFractionDigits}:${maximumFractionDigits}`;
  if (!PARA_FORMATLARI.has(anahtar)) {
    PARA_FORMATLARI.set(anahtar, new Intl.NumberFormat(yerel, {
      style: "currency",
      currency,
      // en-US'de TRY "TRY 1,234.56" diye yazilir; dar simge "₺" gosterir.
      // tr-TR bicimine dokunulmaz ki web ciktisi birebir ayni kalsin.
      ...(yerel === "tr-TR" ? {} : { currencyDisplay: "narrowSymbol" }),
      minimumFractionDigits,
      maximumFractionDigits,
    }));
  }
  return PARA_FORMATLARI.get(anahtar).format(Number(value) || 0);
}

// Sabit Turkce lira bicimi; yonetim ekranlari ve SEO sayfalari icin.
export function turkLirasiFormatla(value, options = {}) {
  return paraBiriminiFormatla(value, "TRY", { locale: "tr-TR", ...options });
}

// Kullanici ekranlari icin: para birimi kullanici seciminden, bicim
// secili dilden gelir. Web'de ikisi de varsayilan (TRY, tr-TR) kalir.
export function kullaniciParaFormatla(value, options = {}) {
  return paraBiriminiFormatla(value, kullaniciParaBirimi(), options);
}

function ayiricilar(dilKodu) {
  return dilKodu === "en"
    ? { binlik: ",", ondalik: "." }
    : { binlik: ".", ondalik: "," };
}

// Ekrandaki para girdisini hesaplamada kullanilan "1234.56" bicimine cevirir.
// tr: 1.234,56 · en: 1,234.56
export function paraGirdisiniCoz(value, dilKodu = dil()) {
  const metin = String(value ?? "").trim().replace(/\s/g, "");
  if (!metin) return "";
  const { binlik, ondalik } = ayiricilar(dilKodu);

  const ayirici = metin.indexOf(ondalik);
  if (ayirici >= 0) {
    const tam = sadeceRakam(metin.slice(0, ayirici));
    const kurus = sadeceRakam(metin.slice(ayirici + 1)).slice(0, 2);
    if (!tam && !kurus) return "";
    return `${tam || "0"}.${kurus}`;
  }

  return sadeceRakam(metin.split(binlik).join(""));
}

// "1234.56" bicimindeki ham degeri secili dilin ayiricilariyla gosterir.
export function paraGirdisiniFormatla(value, dilKodu = dil()) {
  if (value === "" || value === null || value === undefined) return "";
  const { binlik, ondalik } = ayiricilar(dilKodu);

  const metin = String(value).trim().replace(/\s/g, "").replace(",", ".");
  const [hamTam = "", ...ondalikParcalari] = metin.split(".");
  const tam = sadeceRakam(hamTam).replace(/^0+(?=\d)/, "") || "0";
  const kurusVar = ondalikParcalari.length > 0;
  const kurus = sadeceRakam(ondalikParcalari.join("")).slice(0, 2);
  const gruplu = tam.replace(/\B(?=(\d{3})+(?!\d))/g, binlik);

  return kurusVar ? `${gruplu}${ondalik}${kurus}` : gruplu;
}

// Cihazin bolge kodu ("US", "DE"); bilinmiyorsa "". Web'de kullanilmaz.
export function cihazBolgesi() {
  return bolgeKodu(cihazYerelAyari());
}
