const positive = (value) => Math.max(Number(value) || 0, 0);
const whole = (value) => Math.floor(positive(value));
const money = (value) => Math.round((positive(value) + Number.EPSILON) * 100) / 100;

function impliedMonthlyRate(principal, installment, installments) {
  if (!(principal > 0) || !(installment > 0) || !(installments > 0)) return null;
  const interestFreePayment = principal / installments;
  if (installment + 0.01 < interestFreePayment) return null;
  if (Math.abs(installment - interestFreePayment) <= 0.01) return 0;

  const paymentAt = (rate) => {
    const factor = (1 + rate) ** installments;
    return principal * rate * factor / (factor - 1);
  };
  let low = 0;
  let high = 1;
  if (paymentAt(high) < installment) return null;
  for (let step = 0; step < 80; step += 1) {
    const middle = (low + high) / 2;
    if (paymentAt(middle) < installment) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

export function estimateManualLoanRemainingPrincipal(
  loan = {},
  additionalCompletedInstallments = 0,
  additionalPaidTotal = 0,
) {
  const principal = positive(loan.anaPara);
  const totalInstallments = whole(loan.toplamTaksit);
  const installment = positive(loan.taksit);
  const statedRate = positive(loan.faiz) / 100;
  const rate = impliedMonthlyRate(principal, installment, totalInstallments) ?? statedRate;
  const remainingInstallments = Math.max(
    whole(loan.kalanTaksit) - whole(additionalCompletedInstallments),
    0,
  );
  const remainingPaymentTotal = Math.max(
    positive(loan.kalanBorc) - positive(additionalPaidTotal),
    0,
  ) || installment * remainingInstallments;

  // Bugünkü anapara, gelecekteki taksit toplamı değildir: kalan ödeme akışını
  // aylık oranla bugüne iskonto ederek henüz işlememiş faizi dışarıda bırakırız.
  if (!(rate > 0) || !(remainingInstallments > 0) || !(remainingPaymentTotal > 0)) return null;
  const averageRemainingPayment = remainingPaymentTotal / remainingInstallments;
  const remainingPrincipal = averageRemainingPayment
    * (1 - (1 + rate) ** (-remainingInstallments)) / rate;
  return money(Math.min(Math.max(remainingPrincipal, 0), remainingPaymentTotal));
}

export function loanPaymentAmount(payment = {}) {
  return positive(payment?.tutar ?? payment?.amount ?? payment?.taksit);
}

export function calculateRemainingLoanPlan({
  schedule = [],
  startInstallmentNumber = 0,
  payments = [],
  completedInstallments = 0,
  baselinePaidTotal = 0,
  baselineCompletedInstallments = 0,
  fallbackTotal = 0,
  fallbackPrincipal = null,
  installment = 0,
  remainingInstallments = 0,
} = {}) {
  const start = positive(startInstallmentNumber);
  const rows = start > 0
    ? schedule.filter((row) => positive(row.number ?? row.sira) >= start)
    : [];
  const recordedPaidTotal = payments.reduce((sum, payment) => sum + loanPaymentAmount(payment), 0);
  const paidTotal = Math.max(recordedPaidTotal - positive(baselinePaidTotal), 0);
  const completedSinceBaseline = Math.max(
    positive(completedInstallments) - positive(baselineCompletedInstallments),
    0,
  );
  const nextRow = rows[Math.min(completedSinceBaseline, Math.max(rows.length - 1, 0))] || null;
  const rowPrincipal = nextRow
    ? positive(nextRow.principal ?? nextRow.anapara) + positive(nextRow.remainingPrincipal ?? nextRow.kalanAnapara)
    : 0;
  const knownFallbackPrincipal = fallbackPrincipal === null || fallbackPrincipal === undefined || fallbackPrincipal === ""
    ? null
    : positive(fallbackPrincipal);
  const remainingPrincipal = rowPrincipal || knownFallbackPrincipal;
  const scheduledTotal = rows.length
    ? rows.reduce((sum, row) => sum + positive(row.installment ?? row.taksit), 0)
    : positive(fallbackTotal) || positive(installment) * positive(remainingInstallments);
  const remainingPaymentTotal = Math.max(scheduledTotal - paidTotal, 0);
  const financingCostIsKnown = remainingPrincipal !== null && remainingPaymentTotal + 0.01 >= remainingPrincipal;
  const installmentAmount = positive(installment);
  const installmentEquivalent = installmentAmount > 0 && remainingPaymentTotal > 0
    ? remainingPaymentTotal / installmentAmount
    : 0;
  const nearestInstallment = Math.round(installmentEquivalent);
  const inferredInstallments = installmentEquivalent > 0
    ? (Math.abs(installmentEquivalent - nearestInstallment) <= 0.02
        ? Math.max(nearestInstallment, 1)
        : Math.ceil(installmentEquivalent))
    : 0;

  return {
    remainingPrincipal,
    remainingPaymentTotal,
    remainingFinancingCost: financingCostIsKnown
      ? Math.max(remainingPaymentTotal - remainingPrincipal, 0)
      : null,
    financingCostIsKnown,
    scheduledTotal,
    paidSinceBaseline: paidTotal,
    completedSinceBaseline,
    remainingInstallments: rows.length
      ? Math.max(rows.length - completedSinceBaseline, 0)
      : inferredInstallments || Math.max(positive(remainingInstallments) - completedSinceBaseline, 0),
  };
}

export function summarizeLoanRecord(loan = {}, paymentHistory = {}) {
  const payments = Object.values(paymentHistory || {})
    .map((month) => month?.[loan.id])
    .filter(Boolean);
  const installment = positive(loan.taksit);
  const recordedPaidTotal = payments.reduce((sum, payment) => sum + loanPaymentAmount(payment), 0);
  const completedInstallments = payments.reduce((total, payment) =>
    total + (loanPaymentAmount(payment) + 0.01 >= installment && installment > 0 ? 1 : 0), 0);
  const manualRemainingPrincipal = estimateManualLoanRemainingPrincipal(
    loan,
    completedInstallments,
    recordedPaidTotal,
  );
  const recordedRemainingPrincipal = loan.kalanAnapara === "" || loan.kalanAnapara === null || loan.kalanAnapara === undefined
    ? manualRemainingPrincipal
    : loan.kalanAnapara;
  return calculateRemainingLoanPlan({
    schedule: loan.odemePlani || [],
    startInstallmentNumber: loan.odemePlaniBelgeOzeti?.sonrakiTaksitNo,
    payments,
    completedInstallments,
    baselinePaidTotal: loan.odemePlaniBelgeOzeti?.odemeGecmisiBaslangicToplami,
    baselineCompletedInstallments: loan.odemePlaniBelgeOzeti?.tamamlananTaksitBaslangici,
    fallbackTotal: loan.kalanBorc,
    fallbackPrincipal: recordedRemainingPrincipal,
    installment,
    remainingInstallments: loan.kalanTaksit,
  });
}
