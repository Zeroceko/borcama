import test from "node:test";
import assert from "node:assert/strict";
import {
  addStatementMonths,
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
