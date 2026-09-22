const positive = (value) => Math.max(Number(value) || 0, 0);

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
    remainingInstallments: Math.max(positive(remainingInstallments) - completedSinceBaseline, 0),
  };
}

export function summarizeLoanRecord(loan = {}, paymentHistory = {}) {
  const payments = Object.values(paymentHistory || {})
    .map((month) => month?.[loan.id])
    .filter(Boolean);
  const installment = positive(loan.taksit);
  const completedInstallments = payments.reduce((total, payment) =>
    total + (loanPaymentAmount(payment) + 0.01 >= installment && installment > 0 ? 1 : 0), 0);
  return calculateRemainingLoanPlan({
    schedule: loan.odemePlani || [],
    startInstallmentNumber: loan.odemePlaniBelgeOzeti?.sonrakiTaksitNo,
    payments,
    completedInstallments,
    baselinePaidTotal: loan.odemePlaniBelgeOzeti?.odemeGecmisiBaslangicToplami,
    baselineCompletedInstallments: loan.odemePlaniBelgeOzeti?.tamamlananTaksitBaslangici,
    fallbackTotal: loan.kalanBorc,
    fallbackPrincipal: loan.kalanAnapara,
    installment,
    remainingInstallments: loan.kalanTaksit,
  });
}
