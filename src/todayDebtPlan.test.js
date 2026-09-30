import test from "node:test";
import assert from "node:assert/strict";
import { buildTodayDebtPlan } from "./todayDebtPlan.js";

test("Bugün ekranı değişken faizli borçların aylık faizini ve önceliğini çıkarır", () => {
  const result = buildTodayDebtPlan({
    debtItems: [
      { id: "kart-1", tur: "kart", bakiye: 60000, faiz: 4.25, faizTutari: 2550 },
      { id: "ek-1", tur: "ek", bakiye: 20000, faiz: 4.5, faizTutari: 900 },
      { id: "kredi-1", tur: "kredi", bakiye: 90000, faiz: 3, faizTutari: 2700, sabitTaksit: true },
    ],
  });

  assert.equal(result.monthlyInterest, 3450);
  assert.deepEqual(result.priorityItems.map((item) => item.id), ["ek-1", "kart-1"]);
});
