const number = (value) => Math.max(Number(value) || 0, 0);

// A missing purchase cost is not a zero purchase cost. Keep total assets useful,
// but calculate gain/loss only for the comparable subset.
export function summarizeComparableAssets(items = []) {
  const total = items.reduce((sum, item) => sum + number(item?.value), 0);
  const comparable = items.filter((item) => item?.costKnown === true);
  const comparableValue = comparable.reduce((sum, item) => sum + number(item?.value), 0);
  const cost = comparable.reduce((sum, item) => sum + number(item?.cost), 0);
  return {
    total,
    comparableValue,
    cost,
    gain: comparableValue - cost,
    comparableCount: comparable.length,
    missingCostCount: Math.max(items.length - comparable.length, 0),
  };
}
