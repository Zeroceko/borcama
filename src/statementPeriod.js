const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

export function addStatementMonths(monthKey, amount = 1) {
  if (!MONTH_KEY_PATTERN.test(String(monthKey || ""))) return "";
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function statementPeriodForTransaction(transactionDate, cutoffDay) {
  const match = String(transactionDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return "";

  const lastDayOfMonth = new Date(year, month, 0).getDate();
  if (day > lastDayOfMonth) return "";

  const normalizedCutoff = Math.min(Math.max(Number.parseInt(cutoffDay, 10) || 1, 1), 31);
  const effectiveCutoff = Math.min(normalizedCutoff, lastDayOfMonth);
  const calendarMonth = `${year}-${String(month).padStart(2, "0")}`;

  return day > effectiveCutoff ? addStatementMonths(calendarMonth, 1) : calendarMonth;
}

export function statementPeriodsForExpense(expense, card) {
  if (!expense?.tarih || !card) return [];
  const firstPeriod =
    expense.ekstreAyi ||
    statementPeriodForTransaction(expense.tarih, card.kesimGunu);
  if (!firstPeriod) return [];

  const installmentCount = Math.min(
    Math.max(Number.parseInt(expense.taksitSayisi, 10) || 1, 1),
    60,
  );
  return Array.from({ length: installmentCount }, (_, index) =>
    addStatementMonths(firstPeriod, index),
  );
}

export function expenseInstallmentAmountForPeriod(expense, card, period) {
  if (!expense || !card || !MONTH_KEY_PATTERN.test(String(period || ""))) {
    return 0;
  }
  const periods = statementPeriodsForExpense(expense, card);
  const installmentIndex = periods.indexOf(period);
  if (installmentIndex < 0) return 0;

  const installmentCount = periods.length || 1;
  const totalCents = Math.round((Number(expense.tutar) || 0) * 100);
  const regularInstallmentCents = Math.floor(totalCents / installmentCount);
  const installmentCents =
    installmentIndex === installmentCount - 1
      ? totalCents - regularInstallmentCents * (installmentCount - 1)
      : regularInstallmentCents;
  return installmentCents / 100;
}
