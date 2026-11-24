// BDDK 19 Kasım 2026 tarihli 11605 sayılı karar: limit 100 bin TL ve altı
// %20, 100 bin–200 bin TL (dahil) %30, 200 bin TL üzeri %40.
export const KREDI_KARTI_ASGARI_LIMIT_ESIGI = 100_000;
export const KREDI_KARTI_ASGARI_UST_LIMIT_ESIGI = 200_000;

// BDDK asgari odeme orani yalniz Turk lirasi kartlar icin gecerli. Baska
// para biriminde kullanicinin girdigi asgari tutar kullanilir.
export function yasalAsgariUygulanir(paraBirimi = "TRY") {
  return paraBirimi === "TRY";
}

export function krediKartiAsgariOrani(kartLimiti) {
  const sayi = Number(kartLimiti);
  const guvenliLimit = Number.isFinite(sayi) ? Math.max(sayi, 0) : 0;
  if (guvenliLimit <= KREDI_KARTI_ASGARI_LIMIT_ESIGI) return 0.2;
  return guvenliLimit <= KREDI_KARTI_ASGARI_UST_LIMIT_ESIGI ? 0.3 : 0.4;
}
