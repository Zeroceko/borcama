import test from "node:test";
import assert from "node:assert/strict";
import {
  addStatementMonths,
  expenseInstallmentAmountForPeriod,
  statementPeriodForTransaction,
  statementPeriodsForExpense,
} from "./statementPeriod.js";

test("kesim gününden sonraki harcamayı sonraki ekstre dönemine taşır", () => {
  assert.equal(statementPeriodForTransaction("2026-08-21", 20), "2026-09");
});

test("kesim günündeki harcamayı aynı ekstre döneminde tutar", () => {
  assert.equal(statementPeriodForTransaction("2026-08-20", 20), "2026-08");
});

test("ayın gün sayısından büyük kesim gününü ay sonuna sabitler", () => {
  assert.equal(statementPeriodForTransaction("2026-02-28", 31), "2026-02");
});

test("geçersiz takvim tarihini ekstre dönemine dönüştürmez", () => {
  assert.equal(statementPeriodForTransaction("2026-02-31", 20), "");
});

test("taksitli harcamanın bütün ekstre aylarını üretir", () => {
  assert.deepEqual(
    statementPeriodsForExpense(
      { tarih: "2026-08-21", taksitSayisi: 3 },
      { kesimGunu: 20 },
    ),
    ["2026-09", "2026-10", "2026-11"],
  );
});

test("yıl geçişinde ekstre ayını doğru artırır", () => {
  assert.equal(addStatementMonths("2026-12", 1), "2027-01");
});

test("taksitli harcamayı ekstre aylarına eşit dağıtır", () => {
  const expense = { tarih: "2026-08-10", taksitSayisi: 3, tutar: 18000 };
  const card = { kesimGunu: 20 };
  assert.equal(expenseInstallmentAmountForPeriod(expense, card, "2026-08"), 6000);
  assert.equal(expenseInstallmentAmountForPeriod(expense, card, "2026-09"), 6000);
  assert.equal(expenseInstallmentAmountForPeriod(expense, card, "2026-10"), 6000);
  assert.equal(expenseInstallmentAmountForPeriod(expense, card, "2026-11"), 0);
});

test("bölünemeyen kuruş farkını son taksite ekler", () => {
  const expense = { tarih: "2026-08-10", taksitSayisi: 3, tutar: 100 };
  const card = { kesimGunu: 20 };
  assert.equal(expenseInstallmentAmountForPeriod(expense, card, "2026-08"), 33.33);
  assert.equal(expenseInstallmentAmountForPeriod(expense, card, "2026-09"), 33.33);
  assert.equal(expenseInstallmentAmountForPeriod(expense, card, "2026-10"), 33.34);
});
