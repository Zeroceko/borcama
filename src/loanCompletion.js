function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(number, 0) : 0;
}

export function loanIsClosed(loan, history = {}) {
  if (loan?.kapatildiTarihi) return true;
  if (loan?.kalanBorc !== "" && loan?.kalanBorc != null) {
    const remainingDebt = Number(loan.kalanBorc);
    if (Number.isFinite(remainingDebt) && remainingDebt <= 0) return true;
  }

  const installment = positiveNumber(loan?.taksit);
  const remainingInstallments = Math.floor(positiveNumber(loan?.kalanTaksit));
  return (
    installment > 0 &&
    remainingInstallments > 0 &&
    completedLoanInstallments(history, loan?.id, installment) >= remainingInstallments
  );
}

export function completedLoanInstallments(
  history = {},
  loanId,
  installment,
  excludedPeriod = "",
) {
  const target = positiveNumber(installment);
  if (!loanId || target <= 0) return 0;

  return Object.entries(history).reduce((count, [period, payments]) => {
    if (period === excludedPeriod) return count;
    const payment = payments?.[loanId];
    return count + (positiveNumber(payment?.tutar) + 0.01 >= target ? 1 : 0);
  }, 0);
}

export function loanClosesAfterPayment({
  loan,
  history = {},
  period,
  periodPaymentTotal,
  paymentType,
}) {
  if (paymentType === "kapat") return true;

  const installment = positiveNumber(loan?.taksit);
  const remainingInstallments = Math.floor(positiveNumber(loan?.kalanTaksit));
  if (installment <= 0 || remainingInstallments <= 0) return false;

  const previouslyCompleted = completedLoanInstallments(
    history,
    loan?.id,
    installment,
    period,
  );
  const currentCompleted =
    positiveNumber(periodPaymentTotal) + 0.01 >= installment ? 1 : 0;
  return previouslyCompleted + currentCompleted >= remainingInstallments;
}

// Kredi kapanış kutlaması kullanıcı verisinde, kredinin kendi kaydında tutulur;
// böylece hangi cihaz veya tarayıcı olursa olsun bir kez görünür.
// ISO tarih: kutlama bu tarihte gösterildi (tebrik e-postası buna bakar).
// "gecmis": bu alan eklenmeden önce kapanmış ve kutlaması zaten gösterilmiş.
export const KREDI_KAPANISI_GECMIS = "gecmis";

// Kutlaması işaretlenmemiş ya da yalnız taksit geçmişiyle kapanmış (kalan
// borcu hâlâ dolu) ilk kredi. İkincisi Bugün ekranında açık borç gibi
// görünmesin diye açıkça kapatılır.
export function kutlanacakKapaliKredi(kapaliKrediler = [], buOturumdaIslenen = new Set()) {
  return kapaliKrediler.find(
    (kredi) => kredi?.id && !buOturumdaIslenen.has(kredi.id) &&
      (!kredi.kapanisKutlandi || !loanIsClosed(kredi)),
  ) || null;
}

// Taksit geçmişine göre bitmiş ama kaydı açık kalmış krediyi, son taksit
// ödeme ekranından girilmiş gibi kapatır: kalan borç ve taksit 0, kapanış
// tarihi son ödemenin tarihi. Böylece Bugün, toplamlar ve asistan da krediyi
// kapalı görür. Zaten açıkça kapalıysa veya geçmiş yetmiyorsa null döner.
export function gecmisleKapananKrediAlanlari(kredi, history = {}) {
  if (!kredi?.id || loanIsClosed(kredi) || !loanIsClosed(kredi, history)) return null;
  const sonOdeme = Object.values(history || {})
    .map((ay) => ay?.[kredi.id])
    .filter((odeme) => odeme?.tutar != null && odeme?.odendiTarihi)
    .map((odeme) => String(odeme.odendiTarihi))
    .sort()
    .pop();
  return { kalanBorc: 0, kalanTaksit: 0, kapatildiTarihi: sonOdeme || new Date().toISOString() };
}

// Alan eklenmeden önceki kapanışlar: ödeme ekranından kapatılan kredi o anda
// kutlanmıştı (kapatildiTarihi); kalan borcu elle sıfırlanan kredi hiç
// kutlanmazdı; taksit geçmişinden tanınan kredi ise bu tarayıcıda
// gösterildiyse yerel bir iz bıraktı. Bunların hiçbiri yeniden kutlanmaz.
export function krediKapanisiOncedenKutlandiMi(kredi, yerelIzVar = false) {
  return loanIsClosed(kredi) || Boolean(yerelIzVar);
}

export function krediKapanisKutlamasiniIsaretle(krediler = [], krediId, deger, ekAlanlar = null) {
  return krediler.map((kredi) => (kredi?.id === krediId ? { ...kredi, ...(ekAlanlar || {}), kapanisKutlandi: deger } : kredi));
}
