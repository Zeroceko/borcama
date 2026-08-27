import test from "node:test";
import assert from "node:assert/strict";
import { calculateRevolvingDebtScenario, estimateLivingSpend } from "./financialScenario.js";

test("ekstre yeni dönem harcamalarını manuel kayıtlarla iki kez saymaz", () => {
  const result = estimateLivingSpend({
    currentDate: new Date(2026, 7, 27),
    expenses: [
      { tarih: "2026-08-03", tutar: 8000 },
      { tarih: "2026-08-10", tutar: 7000 },
    ],
    cards: [{ ekstreAyi: "2026-08", yeniDonemEkstreBorcu: 20000 }],
  });
  assert.equal(result.monthlyAmount, 20000);
  assert.equal(Math.round(result.dailyAmount), 667);
});

test("kredi taksitlerini sabit gider sayar ve kart borcunu ayrı kapatır", () => {
  const result = calculateRevolvingDebtScenario({
    currentDate: new Date(2026, 7, 27),
    income: 253000,
    expenses: [],
    cards: [
      { ekstreAyi: "2026-08", yeniDonemEkstreBorcu: 20000 },
      { ekstreAyi: "2026-07", yeniDonemEkstreBorcu: 22000 },
    ],
    loans: [
      { kalanBorc: 2172834.2, taksit: 60356.53, kalanTaksit: 36 },
      { kalanBorc: 25405.11, taksit: 8468.38, kalanTaksit: 3 },
      { kalanBorc: 410698.5, taksit: 58671, kalanTaksit: 7 },
    ],
    debts: [
      { bakiye: 216086, faiz: 3.75 },
      { bakiye: 63000, faiz: 4.25 },
    ],
  });
  assert.equal(result.status, "ok");
  assert.equal(Math.round(result.fixedMonthly), 127496);
  assert.equal(Math.round(result.dailyLivingTarget), 700);
  assert.ok(result.months >= 3 && result.months <= 6);
});

test("harcama geçmişi yoksa güvenliymiş gibi günlük limit üretmez", () => {
  const result = calculateRevolvingDebtScenario({
    income: 100000,
    loans: [{ kalanBorc: 500000, taksit: 20000, kalanTaksit: 24 }],
    debts: [{ bakiye: 100000, faiz: 4 }],
  });
  assert.equal(result.status, "missing_spending_history");
  assert.equal(result.dailyLivingTarget, 0);
});

test("uzun vadeli sabit taksit bitince açılan bütçeyi kart borcuna aktarır", () => {
  const result = calculateRevolvingDebtScenario({
    currentDate: new Date(2026, 7, 27),
    income: 100000,
    cards: [{ ekstreAyi: "2026-08", yeniDonemEkstreBorcu: 5000 }],
    loans: [{ kalanBorc: 1620000, taksit: 90000, kalanTaksit: 18 }],
    debts: [{ bakiye: 10000, faiz: 1 }],
  });

  assert.equal(result.status, "ok");
  assert.equal(result.months, 19);
});
