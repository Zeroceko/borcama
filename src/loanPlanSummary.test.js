import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateRemainingLoanPlan,
  estimateManualLoanRemainingPrincipal,
  summarizeLoanRecord,
} from "./loanPlanSummary.js";

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
    financingCostIsKnown: true,
    scheduledTotal: 90000,
    paidSinceBaseline: 0,
    completedSinceBaseline: 0,
    remainingInstallments: 3,
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
    fallbackTotal: 100000,
    installment: 10000,
    remainingInstallments: 10,
  });

  assert.equal(result.remainingPaymentTotal, 100000);
  assert.equal(result.remainingPrincipal, null);
  assert.equal(result.remainingFinancingCost, null);
  assert.equal(result.financingCostIsKnown, false);
});

test("manuel kredide çekilen tutar ve taksit ilerlemesinden kalan anaparayı tahmin eder", () => {
  const monthlyRate = 0.03;
  const totalInstallments = 12;
  const principal = 100000;
  const factor = (1 + monthlyRate) ** totalInstallments;
  const installment = principal * monthlyRate * factor / (factor - 1);
  const remaining = estimateManualLoanRemainingPrincipal({
    anaPara: principal,
    taksit: installment,
    toplamTaksit: totalInstallments,
    odenenTaksit: 4,
    kalanTaksit: 8,
    kalanBorc: installment * 8,
    faiz: 3,
  });

  assert.ok(remaining > 0 && remaining < principal);
  const summary = summarizeLoanRecord({
    id: "manuel-1",
    anaPara: principal,
    taksit: installment,
    toplamTaksit: totalInstallments,
    odenenTaksit: 4,
    kalanTaksit: 8,
    kalanBorc: installment * 8,
    faiz: 3,
  });
  assert.equal(summary.remainingPrincipal, remaining);
  assert.equal(summary.financingCostIsKnown, true);
  assert.ok(summary.remainingPaymentTotal > summary.remainingPrincipal);
});

test("kalan taksit toplamındaki gelecekteki faizi bugün kapatma tahmininden çıkarır", () => {
  const summary = summarizeLoanRecord({
    id: "eski",
    anaPara: 186000,
    faiz: 3.49,
    taksit: 12400,
    kalanTaksit: 15,
    kalanBorc: 168000,
  });

  assert.equal(summary.remainingPaymentTotal, 168000);
  assert.equal(Math.round(summary.remainingPrincipal), 129087);
  assert.equal(summary.financingCostIsKnown, true);
  assert.equal(Math.round(summary.remainingFinancingCost), 38913);
});

test("eski kredi kaydındaki kalan borcu anapara sanmadan ödemeleri düşer", () => {
  const result = summarizeLoanRecord({
    id: "vakif-canli",
    kalanBorc: 2172834.2,
    taksit: 60356.09,
    kalanTaksit: 36,
  }, {
    "2026-08": { "vakif-canli": { taksit: 60356.09 } },
    "2026-09": { "vakif-canli": { taksit: 60356.09 } },
  });

  assert.equal(Math.round(result.remainingPaymentTotal * 100) / 100, 2052122.02);
  assert.equal(result.remainingInstallments, 34);
  assert.equal(result.remainingPrincipal, null);
  assert.equal(result.remainingFinancingCost, null);
  assert.equal(result.financingCostIsKnown, false);
});

test("kalan para bir taksitken eski sayaç sıfır olsa bile bir taksit gösterir", () => {
  const result = calculateRemainingLoanPlan({
    fallbackTotal: 25405.11,
    installment: 8468.38,
    remainingInstallments: 2,
    payments: [{ tutar: 8468.38 }, { taksit: 8468.38 }],
    completedInstallments: 2,
  });

  assert.equal(Math.round(result.remainingPaymentTotal * 100) / 100, 8468.35);
  assert.equal(result.remainingInstallments, 1);
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
