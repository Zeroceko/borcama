export function loanStartsInMonths(loan, date = new Date()) {
  const match = String(loan.ilkOdemeTarihi || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return 0; // Preserve existing loans without a start date.
  return Math.max(0, (+match[1] - date.getFullYear()) * 12 + +match[2] - 1 - date.getMonth());
}

export function loanIsDueInMonth(loan, date = new Date()) {
  return loanStartsInMonths(loan, date) === 0;
}

// BDDK yapılandırma kararlarına göre kart borcu yapılandırma taksiti her ay kartın
// asgari ödemesine eklenir: taksit kart ekstresinde gelir, kart ödenince ödenmiş
// olur. Bu yüzden ayrı ödeme günü, "gecikti" uyarısı ve aylık yük olarak sayılmaz.
export function kartEkstresiyleOdenir(loan) {
  return loan?.kaynak === "card_restructuring" && loan?.kartEkstresineEklenir !== false;
}

export function loanPaymentKey(loan, currentMonth) {
  return `kredi-${loan.id}-${loan._donem || currentMonth}`;
}
