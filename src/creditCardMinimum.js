export const KREDI_KARTI_ASGARI_LIMIT_ESIGI = 100_000;

// BDDK asgari odeme orani yalniz Turk lirasi kartlar icin gecerli. Baska
// para biriminde kullanicinin girdigi asgari tutar kullanilir.
export function yasalAsgariUygulanir(paraBirimi = "TRY") {
  return paraBirimi === "TRY";
}

export function krediKartiAsgariOrani(kartLimiti) {
  const sayi = Number(kartLimiti);
  const guvenliLimit = Number.isFinite(sayi) ? Math.max(sayi, 0) : 0;
  return guvenliLimit <= KREDI_KARTI_ASGARI_LIMIT_ESIGI ? 0.2 : 0.4;
}
