import test from "node:test";
import assert from "node:assert/strict";
import {
  FINANCIAL_SCENARIO_COPY,
  resolveFinancialScenarioType,
} from "./financialScenarioCopy.js";

test("on farklı ve açıklanabilir finansal senaryo bulunur", () => {
  assert.equal(Object.keys(FINANCIAL_SCENARIO_COPY).length, 10);
  Object.values(FINANCIAL_SCENARIO_COPY).forEach((copy) => {
    assert.equal(copy.titles.length, 2);
    assert.ok(copy.reason.length > 20);
  });
});

test("harcama azaltımı gereken planı doğru sınıflandırır", () => {
  assert.equal(
    resolveFinancialScenarioType({
      status: "not_sustainable",
      monthlyIncome: 70000,
      fixedMonthly: 12400,
      reserve: 3500,
      initialDebtBudget: -7900,
      recommendation: { minimumDebtBudget: 5000, firstMonthInterest: 4000 },
    }),
    "spending_cut",
  );
});

test("gelirin zorunlu yapı taşlarına yetmediği durumu harcamadan ayırır", () => {
  assert.equal(
    resolveFinancialScenarioType({
      status: "not_sustainable",
      monthlyIncome: 10000,
      fixedMonthly: 9000,
      reserve: 500,
      initialDebtBudget: -1000,
      recommendation: { minimumDebtBudget: 2000, firstMonthInterest: 1500 },
    }),
    "structural_gap",
  );
});

test("senaryo metinleri web'de (tr) bugünkü Türkçe metni gösterir", () => {
  assert.deepEqual(FINANCIAL_SCENARIO_COPY.missing_income.titles, [
    "Borç planını hesaplamak için aylık gelirini ekle",
    "Kapanış süresi için gelir bilgisi gerekiyor",
  ]);
  assert.equal(
    FINANCIAL_SCENARIO_COPY.long_payoff.reason,
    "Mevcut bütçe faizin üzerinde ödeme sağlıyor ancak ana para yavaş azalıyor.",
  );
  assert.equal(
    FINANCIAL_SCENARIO_COPY.structural_gap.titles[0],
    "Gelir, mevcut giderler ve zorunlu borç ödemelerine yetmiyor",
  );
});
