import assert from "node:assert/strict";
import { test } from "node:test";
import { applyCardRestructuring, cardRestructurableBalance } from "./cardRestructuring.js";

const data = { cards: [{ id: "kart-1", banka: "Banka", toplamEkstreBorcu: 10000, yapilanOdeme: 1000 }], loans: [] };
const plan = { cardId: "kart-1", amount: 4000, installment: 850, installmentCount: 6, firstPaymentDate: "2026-10-05", totalRepayment: 5100, restructuringId: "y1", loanId: "k1", createdAt: "2026-09-03T00:00:00.000Z" };

test("kart yapılandırması kısmi borcu tek kez krediye taşır", () => {
  const result = applyCardRestructuring(data, plan);
  assert.equal(result.error, undefined);
  assert.equal(cardRestructurableBalance(result.data.cards[0]), 5000);
  assert.equal(result.data.loans[0].kalanBorc, 5100);
  assert.equal(cardRestructurableBalance(result.data.cards[0]) + result.data.loans[0].kalanBorc, 10100);
  assert.equal(result.data.loans[0].taksit, 850);
  assert.equal(result.data.loans[0].kaynakKartId, "kart-1");
});

test("tam yapılandırma kartta kalan borç bırakmaz", () => {
  const result = applyCardRestructuring(data, { ...plan, amount: 9000, totalRepayment: 9900 });
  assert.equal(cardRestructurableBalance(result.data.cards[0]), 0);
});

test("kesin banka taksiti tahmini oranla ezilmez", () => {
  const result = applyCardRestructuring(data, { ...plan, installment: 777.25, monthlyInterest: "4.2", kkdfRate: "15", bsmvRate: "15" });
  assert.equal(result.data.loans[0].taksit, 777.25);
  assert.equal(result.data.loans[0].aylikNominalFaiz, 4.2);
});

test("geçersiz veya mevcut bakiyeyi aşan yapılandırma engellenir", () => {
  assert.equal(applyCardRestructuring(data, { ...plan, amount: 9001 }).error, "INVALID_AMOUNT");
  assert.equal(applyCardRestructuring(data, { ...plan, installment: 0 }).error, "INVALID_INSTALLMENT");
  assert.equal(applyCardRestructuring(data, { ...plan, firstPaymentDate: "geçersiz" }).error, "INVALID_FIRST_PAYMENT_DATE");
});

test("eski kart verisi yapılandırma kaydı olmadan aynı davranışı korur", () => {
  assert.equal(cardRestructurableBalance({ id: "eski", borc: 12000, donemIciEklenen: 500 }), 12500);
});
