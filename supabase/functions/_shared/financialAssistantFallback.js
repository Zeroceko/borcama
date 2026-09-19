const money = (value) => new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 2,
}).format(Number(value) || 0);

export function buildFinancialAssistantFallback({ context, question }) {
  if (!/faiz|borç maliyet|borc maliyet/i.test(String(question || ""))) return null;
  const summary = context?.faizMaliyetOzeti;
  const monthlyWithTax = Number(summary?.kartVeEkHesapAylikFaizVergiDahilTahmin);
  const monthlyWithoutTax = Number(summary?.kartVeEkHesapAylikFaizVergiHaricTahmin);
  if (!Number.isFinite(monthlyWithTax) || !Number.isFinite(monthlyWithoutTax)) return null;

  const knownLoanCost = Number(summary?.planiBilinenKredilerKalanFinansmanMaliyeti) || 0;
  const knownLoanCount = Number(summary?.planiBilinenKrediSayisi) || 0;
  const activeLoanCount = Number(summary?.aktifKrediSayisi) || 0;
  const loanCoverage = activeLoanCount > 0
    ? `${knownLoanCount}/${activeLoanCount} aktif kredinin ödeme planı bu hesaba dahil.`
    : "Aktif kredi kaydı bulunmadığı için kredi maliyeti eklenmedi.";

  return {
    title: "Faiz yükünün hesaplanabilen kısmı",
    answer: [
      `Kısa cevap: Kart ve ek hesapların için vergiler dahil bir aylık tahmini faiz yükü ${money(monthlyWithTax)} TL.`,
      `• Vergiler hariç aylık kart ve ek hesap faizi ${money(monthlyWithoutTax)} TL; referans oran kullanılan kalemler banka tahakkukuyla değişebilir.`,
      `• Ödeme planı bilinen kredilerde kalan finansman maliyeti ${money(knownLoanCost)} TL. ${loanCoverage}`,
      "Yapman gereken: Bu iki rakam farklı dönemleri anlattığı için tek toplam gibi toplama; banka ekstreleri geldikçe karşılaştır.",
    ].join("\n"),
    route: "borclar",
    actionLabel: "Borç detaylarını incele",
    needsMoreInfo: knownLoanCount < activeLoanCount,
    disclaimer: "Kart ve KMH tutarı bir aylık tahmindir; kredi tutarı kayıtlı kalan ödeme planına dayanır.",
  };
}
