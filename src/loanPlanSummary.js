const positive = (value) => Math.max(Number(value) || 0, 0);

export function calculateRemainingLoanPlan({
  schedule = [],
  startInstallmentNumber = 0,
  payments = [],
  completedInstallments = 0,
  baselinePaidTotal = 0,
  baselineCompletedInstallments = 0,
  fallbackPrincipal = 0,
  installment = 0,
  remainingInstallments = 0,
} = {}) {
  const start = positive(startInstallmentNumber);
  const rows = start > 0
    ? schedule.filter((row) => positive(row.number ?? row.sira) >= start)
    : [];
  const recordedPaidTotal = payments.reduce((sum, payment) => sum + positive(payment?.amount ?? payment?.tutar), 0);
  const paidTotal = Math.max(recordedPaidTotal - positive(baselinePaidTotal), 0);
  const completedSinceBaseline = Math.max(
    positive(completedInstallments) - positive(baselineCompletedInstallments),
    0,
  );
  const nextRow = rows[Math.min(completedSinceBaseline, Math.max(rows.length - 1, 0))] || null;
  const rowPrincipal = nextRow
    ? positive(nextRow.principal ?? nextRow.anapara) + positive(nextRow.remainingPrincipal ?? nextRow.kalanAnapara)
    : 0;
  const remainingPrincipal = rowPrincipal || positive(fallbackPrincipal);
  const scheduledTotal = rows.length
    ? rows.reduce((sum, row) => sum + positive(row.installment ?? row.taksit), 0)
    : positive(installment) * positive(remainingInstallments);
  const remainingPaymentTotal = Math.max(scheduledTotal - paidTotal, 0);

  return {
    remainingPrincipal,
    remainingPaymentTotal,
    remainingFinancingCost: Math.max(remainingPaymentTotal - remainingPrincipal, 0),
    completedSinceBaseline,
    remainingInstallments: Math.max(positive(remainingInstallments) - completedSinceBaseline, 0),
  };
}
