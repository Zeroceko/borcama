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
  assert.equal(result.months, 4);
  assert.equal(Math.round(result.reserveBalance), 5000);
});

test("bütçe yetmiyorsa harcamayı ne kadar azaltması gerektiğini söyler", () => {
  const result = calculateRevolvingDebtScenario({
    currentDate: new Date(2026, 7, 27),
    income: 70000,
    cards: [{ ekstreAyi: "2026-08", yeniDonemEkstreBorcu: 62000 }],
    loans: [{ kalanBorc: 148800, taksit: 12400, kalanTaksit: 12 }],
    debts: [{ bakiye: 100000, faiz: 4 }],
  });

  assert.equal(result.status, "structural_gap");
  assert.equal(Math.round(result.recommendation.recommendedLivingBudget), 52227);
  assert.equal(Math.round(result.recommendation.recommendedDailyLiving), 1741);
  assert.equal(Math.round(result.recommendation.livingReductionNeeded), 9773);
  assert.equal(result.recommendation.targetRevolvingMonths, 24);
  assert.equal(result.assumptions.newRevolvingDebt, 0);
});

test("mevcut plan kapanıyor olsa bile daha hızlı harcama hedefi üretir", () => {
  const result = calculateRevolvingDebtScenario({
    currentDate: new Date(2026, 7, 27),
    income: 70000,
    cards: [{ ekstreAyi: "2026-08", yeniDonemEkstreBorcu: 62000 }],
    debts: [{ bakiye: 100000, faiz: 4 }],
  });

  assert.equal(result.status, "ok");
  assert.ok(result.months > 0);
  assert.equal(result.recommendation.method, "monthly_simulation_bisection");
  assert.ok(result.recommendation.recommendedLivingBudget <= result.livingBudget);
  assert.equal(result.assumptions.livingSpendFundedFromIncome, true);
});

test("kart ve KMH faizine KKDF ile BSMV ekler", () => {
  const result = calculateRevolvingDebtScenario({
    currentDate: new Date(2026, 7, 27),
    income: 200000,
    cards: [{ ekstreAyi: "2026-08", yeniDonemEkstreBorcu: 50000 }],
    debts: [{ bakiye: 100000, faiz: 4, vergiFonOrani: 0.3 }],
  });

  assert.equal(Math.round(result.recommendation.firstMonthInterest), 5200);
  assert.equal(result.assumptions.kkdfRate, 0.15);
  assert.equal(result.assumptions.bsmvRate, 0.15);
});

test("faiz oranını kendiliğinden artırmaz ve enflasyon uygulamaz", () => {
  const result = calculateRevolvingDebtScenario({
    currentDate: new Date(2026, 7, 27),
    income: 100000,
    cards: [{ ekstreAyi: "2026-08", yeniDonemEkstreBorcu: 20000 }],
    debts: [{ bakiye: 50000, faiz: 4 }],
  });

  assert.equal(result.assumptions.interestRatesStayAsEntered, true);
  assert.equal(result.assumptions.inflationApplied, false);
  assert.equal(result.assumptions.incomeGrowthApplied, false);
});

test("asgari toplamı ödeme gücünü aşıyorsa yapısal açık verir", () => {
  const result = calculateRevolvingDebtScenario({
    currentDate: new Date(2026, 7, 27),
    income: 50000,
    cards: [{ ekstreAyi: "2026-08", yeniDonemEkstreBorcu: 20000 }],
    debts: [{ bakiye: 100000, faiz: 4, minimumOdeme: 35000, minimumOran: 0.4 }],
  });

  assert.equal(result.status, "structural_gap");
  assert.ok(result.monthlyGap > 0);
  assert.ok(result.requiredMinimum >= 35000);
});

test("harcama azaltma senaryolarında süre ve faiz kötüleşmez", () => {
  const result = calculateRevolvingDebtScenario({
    currentDate: new Date(2026, 7, 27),
    income: 120000,
    cards: [{ ekstreAyi: "2026-08", yeniDonemEkstreBorcu: 45000 }],
    debts: [{ bakiye: 180000, faiz: 4, minimumOdeme: 30000, minimumOran: 0.2 }],
  });
  const closed = result.spendingScenarios.filter((scenario) => scenario.status === "ok");

  assert.equal(result.spendingScenarios.length, 4);
  for (let index = 1; index < closed.length; index += 1) {
    assert.ok(closed[index].months <= closed[index - 1].months);
    assert.ok(closed[index].totalInterest <= closed[index - 1].totalInterest + 0.01);
  }
});
