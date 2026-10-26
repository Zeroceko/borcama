// Borc bazinda para birimi icin kur cevirisi.
//
// Her borc kaydi istege bagli `paraBirimi` tasir; yoksa kullanicinin ana
// birimindedir. Toplamlar (toplam borc, aylik zorunlu odeme, plan, Bugun,
// oneriler) ana birime bu moduldeki kurla cevrilir. Ana birimle ayni birimdeki
// kayitlarda carpan daima 1'dir; tek birimli kullanicinin hesaplari bu yuzden
// birebir ayni kalir.
//
// Kur kaynagi: /api/market-prices yaniti. TCMB satis kurlari (usdTry, eurTry,
// gbpTry, chfTry) ve ECB referans kurlari (Frankfurter, `fx.eur`: 1 EUR
// karsiligi) birlikte kullanilir; TCMB'de olan birimde TCMB oncelikli.
// Yanit uygulamada `borcama:piyasa:v1` altinda saklanir; son bilinen kur da
// ayrica `borcama:kurlar:v1` altinda tutulur ki fiyat servisi yanit vermese
// de cevrim surer. Kur hic yoksa kayit toplama katilmaz, "kur bekliyor"
// diye ayrica sayilir (sessizce 0 sayilmaz).

export const KUR_DEPO_ANAHTARI = "borcama:kurlar:v1";
const PIYASA_DEPO_ANAHTARI = "borcama:piyasa:v1";

const TCMB_ALANLARI = { USD: "usdTry", EUR: "eurTry", GBP: "gbpTry", CHF: "chfTry" };

const pozitif = (deger) => {
  const sayi = Number(deger);
  return Number.isFinite(sayi) && sayi > 0 ? sayi : 0;
};

// Piyasa fiyatlarindan "1 birim kac TRY" tablosu. Bos fiyatta null.
export function kurTablosuOlustur(prices = {}, updatedAt = null) {
  const tryKarsiligi = { TRY: 1 };
  Object.entries(TCMB_ALANLARI).forEach(([kod, alan]) => {
    const deger = pozitif(prices?.[alan]);
    if (deger) tryKarsiligi[kod] = deger;
  });
  const ecb = prices?.fx?.eur || {};
  const eurTry = tryKarsiligi.EUR || pozitif(ecb.TRY);
  if (eurTry) {
    if (!tryKarsiligi.EUR) tryKarsiligi.EUR = eurTry;
    Object.entries(ecb).forEach(([kod, birimBasinaEur]) => {
      const oran = pozitif(birimBasinaEur);
      if (!oran || tryKarsiligi[kod] || !/^[A-Z]{3}$/.test(kod)) return;
      tryKarsiligi[kod] = eurTry / oran;
    });
  }
  if (Object.keys(tryKarsiligi).length <= 1) return null;
  return {
    tryKarsiligi,
    tarih: updatedAt || prices?.fx?.tarih || null,
  };
}

// `kaynak` birimindeki 1 birimin `hedef` birimindeki karsiligi. Ayni birimde
// daima 1; kur bilinmiyorsa null.
export function kurCarpani(kaynak, hedef, tablo = aktifKurTablosu()) {
  if (!kaynak || !hedef || kaynak === hedef) return 1;
  const a = pozitif(tablo?.tryKarsiligi?.[kaynak]);
  const b = pozitif(tablo?.tryKarsiligi?.[hedef]);
  return a && b ? a / b : null;
}

export function tutarCevir(tutar, kaynak, hedef, tablo = aktifKurTablosu()) {
  const carpan = kurCarpani(kaynak, hedef, tablo);
  return carpan === null ? null : (Number(tutar) || 0) * carpan;
}

function depoOku(anahtar) {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(anahtar) || "null");
  } catch {
    return null;
  }
}

let aktifTablo;

// Son bilinen kur: once ayri kur kaydi, yoksa saklanan piyasa yaniti.
function depodanKurTablosu() {
  const kayit = depoOku(KUR_DEPO_ANAHTARI);
  if (kayit?.tryKarsiligi) return kayit;
  const piyasa = depoOku(PIYASA_DEPO_ANAHTARI);
  return piyasa?.prices ? kurTablosuOlustur(piyasa.prices, piyasa.updatedAt) : null;
}

export function aktifKurTablosu() {
  if (aktifTablo === undefined) aktifTablo = depodanKurTablosu();
  return aktifTablo;
}

// Yeni kur geldiginde cagrilir. Bos tablo son bilinen kuru silmez.
// Yeni tabloda olmayan birimin son bilinen kuru korunur (ör. ECB yaniti
// gelmediginde JPY kuru silinmez).
export function kurTablosunuAyarla(tablo) {
  if (!tablo?.tryKarsiligi) return aktifKurTablosu();
  const onceki = aktifKurTablosu();
  aktifTablo = {
    ...tablo,
    tryKarsiligi: { ...(onceki?.tryKarsiligi || {}), ...tablo.tryKarsiligi },
  };
  try {
    globalThis.localStorage?.setItem(KUR_DEPO_ANAHTARI, JSON.stringify(aktifTablo));
  } catch {
    // Depolama yoksa yalniz bu oturumda kullanilir.
  }
  return aktifTablo;
}

// Testler icin.
export function kurTablosunuSifirla(tablo) {
  aktifTablo = tablo;
}

// Borc kayitlarindaki para alanlari; ana birim gorunumunde bu alanlar kurla
// carpilir (yuzde, gun, adet alanlarina dokunulmaz).
const PARA_ALANLARI = {
  cards: [
    "borc", "donemIciToplam", "donemIciEklenen", "yeniDonemEkstreBorcu", "toplamEkstreBorcu",
    "oncekiDonemBorcu", "oncekiAydanKalan", "yapilanOdeme", "asgari", "asgariOdeme", "limit",
    "belgedenToplamEkstreBorcu",
  ],
  loans: [
    "anaPara", "kalanBorc", "taksit", "kalanAnapara", "toplamGeriOdeme", "yapilandirilanTutar",
  ],
  overdrafts: ["limit", "kullanilan", "yapilanOdeme"],
  others: ["tutar"],
};

function alanlariCarp(kayit, alanlar, carpan) {
  const yeni = { ...kayit };
  alanlar.forEach((alan) => {
    if (yeni[alan] === undefined || yeni[alan] === null || yeni[alan] === "") return;
    const sayi = Number(yeni[alan]);
    if (Number.isFinite(sayi)) yeni[alan] = sayi * carpan;
  });
  return yeni;
}

// Bir borc listesini ana birime cevirir (senaryo ve aylik tahminler icin;
// kredi odeme plani satirlari cevrilmez). Ana birimdeki kayit oldugu gibi
// (ayni nesne) doner; kuru bilinmeyen kayit listeden cikar.
export function borcListesiniAnaBirimeCevir(liste = [], tur, { anaBirim, kayitBirimi, tablo = aktifKurTablosu() } = {}) {
  const alanlar = PARA_ALANLARI[tur] || [];
  const sonuc = [];
  (liste || []).forEach((kayit) => {
    const birim = kayitBirimi(kayit);
    if (birim === anaBirim) {
      sonuc.push(kayit);
      return;
    }
    const carpan = kurCarpani(birim, anaBirim, tablo);
    if (carpan === null) return;
    const yeni = alanlariCarp(kayit, alanlar, carpan);
    if (tur === "cards" && Array.isArray(kayit.ekstreGecmisi)) {
      yeni.ekstreGecmisi = kayit.ekstreGecmisi.map((ekstre) => alanlariCarp(ekstre, alanlar, carpan));
    }
    sonuc.push(yeni);
  });
  return sonuc;
}

// Kayit listelerinde ana birim disi ve kuru bilinmeyen kayitlar.
export function kurBekleyenKayitlar(listeler = [], { anaBirim, kayitBirimi, tablo = aktifKurTablosu() } = {}) {
  return listeler.flat().filter((kayit) => {
    if (!kayit) return false;
    const birim = kayitBirimi(kayit);
    return birim !== anaBirim && kurCarpani(birim, anaBirim, tablo) === null;
  });
}
