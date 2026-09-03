import test from "node:test";
import assert from "node:assert/strict";

import { summarizeComparableAssets } from "./assetSummary.js";

test("maliyeti bilinmeyen varlık toplam değerde kalır, kazanç hesabına girmez", () => {
  assert.deepEqual(summarizeComparableAssets([
    { value: 150, cost: 100, costKnown: true },
    { value: 80, cost: 0, costKnown: false },
  ]), {
    total: 230,
    comparableValue: 150,
    cost: 100,
    gain: 50,
    comparableCount: 1,
    missingCostCount: 1,
  });
});
