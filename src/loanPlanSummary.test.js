import test from "node:test";
import assert from "node:assert/strict";
import { calculateRemainingLoanPlan } from "./loanPlanSummary.js";

test("yüklenen ödeme planında anapara, kalan toplam ve finansman maliyetini ayırır", () => {
  const result = calculateRemainingLoanPlan({
    startInstallmentNumber: 3,
    schedule: [
      { sira: 2, taksit: 30000, anapara: 20000, kalanAnapara: 75000 },
      { sira: 3, taksit: 30000, anapara: 25000, kalanAnapara: 50000 },
      { sira: 4, taksit: 30000, anapara: 26000, kalanAnapara: 24000 },
      { sira: 5, taksit: 30000, anapara: 24000, kalanAnapara: 0 },
    ],
  });

  assert.deepEqual(result, {
    remainingPrincipal: 75000,
    remainingPaymentTotal: 90000,
    remainingFinancingCost: 15000,
    completedSinceBaseline: 0,
    remainingInstallments: 0,
  });
});

test("tamamlanan ve kısmi ödemeleri kalan plan toplamından düşer", () => {
  const result = calculateRemainingLoanPlan({
    startInstallmentNumber: 3,
    completedInstallments: 1,
    payments: [{ tutar: 30000 }, { tutar: 5000 }],
    schedule: [
      { sira: 3, taksit: 30000, anapara: 25000, kalanAnapara: 50000 },
      { sira: 4, taksit: 30000, anapara: 26000, kalanAnapara: 24000 },
      { sira: 5, taksit: 30000, anapara: 24000, kalanAnapara: 0 },
    ],
  });

  assert.equal(result.remainingPrincipal, 50000);
  assert.equal(result.remainingPaymentTotal, 55000);
  assert.equal(result.remainingFinancingCost, 5000);
  assert.equal(result.completedSinceBaseline, 1);
});

test("ödeme planı olmayan kredide taksit çarpımını güvenli yedek olarak kullanır", () => {
  const result = calculateRemainingLoanPlan({
    fallbackPrincipal: 90000,
    installment: 10000,
    remainingInstallments: 10,
  });

  assert.equal(result.remainingPaymentTotal, 100000);
  assert.equal(result.remainingFinancingCost, 10000);
});

test("plan yüklenmeden önceki ödeme geçmişini ikinci kez düşmez", () => {
  const result = calculateRemainingLoanPlan({
    startInstallmentNumber: 4,
    completedInstallments: 3,
    baselineCompletedInstallments: 2,
    baselinePaidTotal: 20000,
    payments: [{ tutar: 10000 }, { tutar: 10000 }, { tutar: 10000 }],
    remainingInstallments: 2,
    schedule: [
      { sira: 4, taksit: 10000, anapara: 8000, kalanAnapara: 8000 },
      { sira: 5, taksit: 10000, anapara: 8000, kalanAnapara: 0 },
    ],
  });

  assert.equal(result.remainingPrincipal, 8000);
  assert.equal(result.remainingPaymentTotal, 10000);
  assert.equal(result.remainingFinancingCost, 2000);
  assert.equal(result.remainingInstallments, 1);
});
