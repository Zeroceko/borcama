function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(number, 0) : 0;
}

export function loanIsClosed(loan) {
  if (loan?.kapatildiTarihi) return true;
  if (loan?.kalanBorc === "" || loan?.kalanBorc == null) return false;
  const remainingDebt = Number(loan.kalanBorc);
  return Number.isFinite(remainingDebt) && remainingDebt <= 0;
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
