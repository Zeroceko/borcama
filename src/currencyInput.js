import { dil, locale } from "./i18n.js";

const sadeceRakam = (value) => String(value ?? "").replace(/\D/g, "");

const PARA_FORMATLARI = new Map();

export const PARA_BIRIMI_ANAHTARI = "borcama_para_birimi";
const GECERLI_PARA_BIRIMI = /^[A-Z]{3}$/;

// Kullanicinin gosterim para birimi. Secim yoksa (web dahil) TRY.
export function kullaniciParaBirimi() {
  try {
    const kayitli = globalThis.localStorage?.getItem(PARA_BIRIMI_ANAHTARI);
    return GECERLI_PARA_BIRIMI.test(kayitli || "") ? kayitli : "TRY";
  } catch {
    return "TRY";
  }
}

export function paraBiriminiFormatla(value, currency = "TRY", options = {}) {
  const minimumFractionDigits = options.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;
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
