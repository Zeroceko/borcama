import { bolgedenParaBirimi, cihazBolgesi, kullaniciParaBirimi } from "./currencyInput.js";
import { locale } from "./i18n.js";

// Turkiye'ye ozgu finans kurallari (TCMB azami kart faizi ve gecikme faizi,
// KKDF/BSMV vergi-fon yuku, KMH varsayilan faizi, Turk bankasi belgesi okuma)
// yalniz TRY ile kullanilan hesaplarda gecerlidir. Web daima TRY oldugu icin
// tarayici davranisi degismez. Native'de TRY disi birimde kullanicinin girdigi
// oran esas alinir; girilmemisse ulkenin tipik oranlari (BOLGE_PROFILLERI)
// varsayilan olarak kullanilir ve ekranda "ulke ortalamasi" diye belirtilir.

export function turkiyeKurallariGecerli(birim = kullaniciParaBirimi()) {
  return birim === "TRY";
}

// KKDF %15 + BSMV %15: faiz tutarina eklenen toplam vergi-fon orani.
export const TURKIYE_VERGI_FON_ORANI = 0.3;
export const TURKIYE_KMH_VARSAYILAN_FAIZI = 4.25;

export function vergiFonOrani(birim = kullaniciParaBirimi()) {
  return turkiyeKurallariGecerli(birim) ? TURKIYE_VERGI_FON_ORANI : 0;
}

// TCMB kredi karti azami akdi ve gecikme faizi (aylik %), bakiye dilimine gore.
export function tcmbKartAzamiFaizi(bakiye) {
  if (bakiye >= 180000) return 4.25;
  if (bakiye >= 30000) return 3.75;
  return 3.25;
}

export function tcmbKartAzamiGecikmeFaizi(bakiye) {
  if (bakiye >= 180000) return 4.55;
  if (bakiye >= 30000) return 4.05;
  return 3.55;
}

function girilenOran(oran) {
  const sayi = Number(oran);
  return Number.isFinite(sayi) && sayi > 0 ? sayi : 0;
}

// Ulkeye gore tipik oranlar (yillik %, 2026 civari yaklasik; kesin banka
// sozlesmesi yerine gecmez, kullanici kendi oranini girebilir). Kaynaklar:
// US: Federal Reserve G.19 (kredi karti APR ~%21-22), overdraft faiz yerine
//   sabit ucretle isler; asgari genelde max($25, bakiyenin %1'i + faiz).
// GB: Bank of England (kart APR ~%24, arranged overdraft ~%39,9 EAR),
//   asgari max(£25, %1 + faiz).
// DE: Bundesbank MFI faizleri (Dispo ~%11,5, revolving kart ~%17), asgari %3 / 25 €.
// FR: Banque de France (decouvert ~%16, credit renouvelable ~%20), asgari %3.
// ES: Banco de Espana (tarjeta revolving ~%20 TAE, descubierto ~%12), asgari %3 / 30 €.
// IT: Banca d'Italia (carta revolving ~%16 TAEG, scoperto ~%10), asgari %3.
// Diger euro ulkeleri (NL, BE, AT, PT, IE...): ECB MFI faizleri ~%16 kart, ~%12 overdraft.
// CH ~%12, CA ~%20, AU ~%20 kart APR; bilinmeyen bolge kart %20, overdraft %15.
// Kredi (ihtiyac kredisi) orani yalniz referanstir: taksitli kredilerde
// faiz zaten taksite dahil oldugu icin plana ayrica eklenmez.
const ASGARI_YUZDE3 = { yuzde: 3, taban: 0, faizDahil: false };
export const BOLGE_PROFILLERI = {
  US: { kartYillikFaiz: 22, ekHesapYillikFaiz: 0, krediYillikFaiz: 12, asgari: { yuzde: 1, taban: 25, faizDahil: true } },
  GB: { kartYillikFaiz: 24, ekHesapYillikFaiz: 39.9, krediYillikFaiz: 9, asgari: { yuzde: 1, taban: 25, faizDahil: true } },
  DE: { kartYillikFaiz: 17, ekHesapYillikFaiz: 11.5, krediYillikFaiz: 7, asgari: { yuzde: 3, taban: 25, faizDahil: false } },
  FR: { kartYillikFaiz: 20, ekHesapYillikFaiz: 16, krediYillikFaiz: 6, asgari: ASGARI_YUZDE3 },
  ES: { kartYillikFaiz: 20, ekHesapYillikFaiz: 12, krediYillikFaiz: 8, asgari: { yuzde: 3, taban: 30, faizDahil: false } },
  IT: { kartYillikFaiz: 16, ekHesapYillikFaiz: 10, krediYillikFaiz: 8, asgari: ASGARI_YUZDE3 },
  EURO: { kartYillikFaiz: 16, ekHesapYillikFaiz: 12, krediYillikFaiz: 7, asgari: ASGARI_YUZDE3 },
  CH: { kartYillikFaiz: 12, ekHesapYillikFaiz: 12, krediYillikFaiz: 7, asgari: ASGARI_YUZDE3 },
  CA: { kartYillikFaiz: 20, ekHesapYillikFaiz: 21, krediYillikFaiz: 9, asgari: { yuzde: 3, taban: 10, faizDahil: false } },
  AU: { kartYillikFaiz: 20, ekHesapYillikFaiz: 15, krediYillikFaiz: 11, asgari: { yuzde: 2, taban: 25, faizDahil: false } },
  VARSAYILAN: { kartYillikFaiz: 20, ekHesapYillikFaiz: 15, krediYillikFaiz: 10, asgari: ASGARI_YUZDE3 },
};
const PARA_BIRIMI_PROFILI = { USD: "US", GBP: "GB", CHF: "CH", CAD: "CA", AUD: "AU", EUR: "EURO" };

// Secili para birimi ve cihaz bolgesinden profil. Bolgenin kendi para birimi
// secili birimle ayniysa o ulke (ör. NL + EUR -> euro profili, adi Hollanda);
// degilse para biriminden (USD -> ABD). TRY'de null: Turkiye kurallari gecerli.
export function bolgeProfili(birim = kullaniciParaBirimi(), bolge = cihazBolgesi()) {
  if (turkiyeKurallariGecerli(birim)) return null;
  const kod = String(bolge || "").toUpperCase();
  if (kod && bolgedenParaBirimi(`und-${kod}`) === birim) {
    if (BOLGE_PROFILLERI[kod] && kod !== "EURO" && kod !== "VARSAYILAN") return { ...BOLGE_PROFILLERI[kod], kod, ulke: kod };
    if (birim === "EUR") return { ...BOLGE_PROFILLERI.EURO, kod: "EURO", ulke: kod };
  }
  const profilKodu = PARA_BIRIMI_PROFILI[birim];
  if (profilKodu === "EURO") return { ...BOLGE_PROFILLERI.EURO, kod: "EURO", ulke: "EU" };
  if (profilKodu) return { ...BOLGE_PROFILLERI[profilKodu], kod: profilKodu, ulke: profilKodu };
  return { ...BOLGE_PROFILLERI.VARSAYILAN, kod: "VARSAYILAN", ulke: null };
}

// Ekranda gosterilecek ulke adi (secili dilde); bilinmeyen bolgede null.
export function profilUlkeAdi(profil = bolgeProfili(), yerel = locale()) {
  if (!profil?.ulke) return null;
  try {
    return new Intl.DisplayNames([yerel], { type: "region" }).of(profil.ulke) || null;
  } catch {
    return null;
  }
}

const aylik = (yillik) => Math.round((Number(yillik) / 12) * 10000) / 10000;

// Kart icin kullanilacak aylik oranlar.
// TRY: TCMB azami oranlari (kayitli ozel oran varsa cagiran onu ayrica kullanir).
// TRY disi: kullanicinin girdigi aylik oran; girilmemisse ulke ortalamasi
// (yillik / 12) ve `varsayilan` isaretlenir.
export function kartFaizOranlari(bakiye, girilen, birim = kullaniciParaBirimi(), profil = bolgeProfili(birim)) {
  if (turkiyeKurallariGecerli(birim)) {
    return {
      akdi: tcmbKartAzamiFaizi(bakiye),
      gecikme: tcmbKartAzamiGecikmeFaizi(bakiye),
      referans: true,
      varsayilan: false,
      bilinmiyor: false,
    };
  }
  const oran = girilenOran(girilen);
  if (oran > 0) return { akdi: oran, gecikme: oran, referans: false, varsayilan: false, bilinmiyor: false };
  const ortalama = aylik((profil || BOLGE_PROFILLERI.VARSAYILAN).kartYillikFaiz);
  return { akdi: ortalama, gecikme: ortalama, referans: false, varsayilan: true, bilinmiyor: false };
}

// Ek hesap (KMH / overdraft / Dispo) icin oran. TRY'de girilmemisse %4,25
// urun referansi; TRY disinda ulke ortalamasi. ABD'de overdraft faiz yerine
// ucretle isledigi icin ortalama 0 ve `ucretle` isaretlenir.
export function ekHesapFaizOrani(girilen, birim = kullaniciParaBirimi(), profil = bolgeProfili(birim)) {
  const oran = girilenOran(girilen);
  if (oran > 0) return { oran, tahmini: false, varsayilan: false, ucretle: false };
  if (turkiyeKurallariGecerli(birim)) return { oran: TURKIYE_KMH_VARSAYILAN_FAIZI, tahmini: true, varsayilan: false, ucretle: false };
  const ortalama = aylik((profil || BOLGE_PROFILLERI.VARSAYILAN).ekHesapYillikFaiz);
  return { oran: ortalama, tahmini: false, varsayilan: true, ucretle: ortalama === 0 };
}

// Kartta asgari tutar girilmemisse ulke kuralina gore tahmini asgari odeme
// (TRY'de BDDK orani ayrica uygulanir, bu fonksiyon cagrilmaz).
export function bolgeAsgariOdemesi(bakiye, aylikOranYuzde = 0, profil = bolgeProfili()) {
  const borc = Math.max(Number(bakiye) || 0, 0);
  if (!borc) return 0;
  const kural = (profil || BOLGE_PROFILLERI.VARSAYILAN).asgari;
  const faiz = kural.faizDahil ? (borc * Math.max(Number(aylikOranYuzde) || 0, 0)) / 100 : 0;
  const temel = (borc * kural.yuzde) / 100 + faiz;
  return Math.min(Math.max(temel, kural.taban), borc);
}

// Ornek/placeholder tutarlar ve "anlamli tutar" esikleri TRY icin yazildi.
// Diger birimlerde yasam maliyeti olcegine gore kuculturulur (kur cevirisi
// degildir): USD/EUR/GBP/CHF ≈ 1/20, CAD/AUD/NZD ≈ 1/14, SEK/NOK/DKK ≈ 1/2,
// JPY ≈ 150 × USD olcegi.
const ORNEK_TUTAR_OLCEGI = {
  TRY: 1, USD: 0.05, EUR: 0.05, GBP: 0.05, CHF: 0.05,
  CAD: 0.07, AUD: 0.07, NZD: 0.07, SEK: 0.5, NOK: 0.5, DKK: 0.5, JPY: 7.5,
};

export function ornekTutarOlcegi(birim = kullaniciParaBirimi()) {
  return ORNEK_TUTAR_OLCEGI[birim] ?? 0.05;
}

// Esik karsilastirmalari icin ham olcekli tutar. TRY'de aynen doner.
export function esikTutar(tryTutari, birim = kullaniciParaBirimi()) {
  return turkiyeKurallariGecerli(birim) ? tryTutari : tryTutari * ornekTutarOlcegi(birim);
}

// Ekranda gosterilecek ornek tutar: iki anlamli haneye yuvarlanir
// (284.750 TL -> 14.000 USD). TRY'de aynen doner.
export function ornekTutar(tryTutari, birim = kullaniciParaBirimi()) {
  if (turkiyeKurallariGecerli(birim)) return tryTutari;
  const deger = tryTutari * ornekTutarOlcegi(birim);
  if (deger <= 0) return 0;
  const adim = 10 ** Math.max(Math.floor(Math.log10(deger)) - 1, 0);
  return Math.round(deger / adim) * adim;
}

// Ekstre ve kredi odeme plani okuyucusu yalniz Turk bankalarinin belgelerini
// taniyor; TRY disinda giris gizlenir, elle giris kalir.
export function belgeOkumaAcik(birim = kullaniciParaBirimi()) {
  return turkiyeKurallariGecerli(birim);
}

// Banka secim listesi. TRY'de Turk bankalari + kullanicinin ekledikleri.
// TRY disinda Turk bankalari gosterilmez; kullanicinin ekledikleri ve
// mevcut kayitlarda gecen bankalar kalir ("Diger" ile serbest metin girilir).
export function bankaSecenekleri({ turkBankalari = [], ozelBankalar = [], kayitliBankalar = [], birim = kullaniciParaBirimi() } = {}) {
  if (turkiyeKurallariGecerli(birim)) return [...new Set([...turkBankalari, ...ozelBankalar])];
  return [...new Set([...ozelBankalar, ...kayitliBankalar].map((b) => String(b || "").trim()).filter(Boolean))];
}
