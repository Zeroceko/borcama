const positive = (value) => Math.max(Number(value) || 0, 0);

export function buildTodayDebtPlan({
  debtItems = [],
} = {}) {
  const visibleItems = (debtItems || []).filter(
    (item) => positive(item?.bakiye) > 0,
  );
  const revolvingItems = visibleItems.filter((item) => !item.sabitTaksit);
  const priorityItems = [...revolvingItems].sort(
    (left, right) =>
      positive(right.faiz) - positive(left.faiz) ||
      positive(right.bakiye) - positive(left.bakiye),
  );
  const monthlyInterest = revolvingItems.reduce(
    (total, item) => total + positive(item.faizTutari),
    0,
  );
  return {
    monthlyInterest,
    priorityItems,
  };
}
