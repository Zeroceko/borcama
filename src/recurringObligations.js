import { loanIsDueInMonth } from "./loanSchedule.js";

const pozitifSayi = (deger) => {
  const sayi = Number(deger);
  return Number.isFinite(sayi) ? Math.max(sayi, 0) : 0;
};

export function duzenliBorcOdemeleri(krediler = [], tarih = new Date()) {
  return krediler
    .filter(
      (kredi) =>
        pozitifSayi(kredi?.kalanBorc) > 0 && pozitifSayi(kredi?.taksit) > 0,
    )
    .map((kredi) => ({
      id: kredi.id,
      banka: kredi.banka || "Banka",
      ad: kredi.ad || "Kredi",
      taksit: pozitifSayi(kredi.taksit),
      kalanBorc: pozitifSayi(kredi.kalanBorc),
      kalanTaksit: Math.floor(pozitifSayi(kredi.kalanTaksit)),
      ilkOdemeTarihi: kredi.ilkOdemeTarihi || "",
      yapilandirma: kredi.kaynak === "card_restructuring",
      buAyOdenecek: loanIsDueInMonth(kredi, tarih),
    }))
    .sort(
      (a, b) =>
        Number(b.buAyOdenecek) - Number(a.buAyOdenecek) || b.taksit - a.taksit,
    );
}

export function buAyDuzenliBorcToplami(krediler = [], tarih = new Date()) {
  return duzenliBorcOdemeleri(krediler, tarih)
    .filter((odeme) => odeme.buAyOdenecek)
    .reduce((toplam, odeme) => toplam + odeme.taksit, 0);
}
