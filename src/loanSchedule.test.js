import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loanIsDueInMonth, loanStartsInMonths, loanPaymentKey } from "./loanSchedule.js";

const appSource = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

test("ilk taksitten önce kredi o ayın ödeme yükünde yer almaz", () => {
  const loan = { ilkOdemeTarihi: "2026-10-15" };
  assert.equal(loanIsDueInMonth(loan, new Date(2026, 8, 4)), false);
  assert.equal(loanIsDueInMonth(loan, new Date(2026, 9, 1)), true);
  assert.equal(loanStartsInMonths(loan, new Date(2026, 8, 4)), 1);
  assert.equal(loanIsDueInMonth({}, new Date(2026, 8, 4)), true);
});
test("bu ayki ödeme gelecek ayın veya arşiv ayının taksidini işaretlemez", () => {
  const paid = { "kredi-a-2026-09": true };
  assert.equal(paid[loanPaymentKey({id:"a"}, "2026-09")], true);
  assert.equal(!!paid[loanPaymentKey({id:"a", _donem:"2026-10"}, "2026-09")], false);
  assert.equal(!!paid[loanPaymentKey({id:"a", _donem:"2026-08"}, "2026-09")], false);
});

test("ilk taksiti gelecek ay olan krediye ve gelecek ay görünümüne ödeme girilebilir", () => {
  assert.match(appSource, /\(!arsiv \|\| k\._gelecek\) && krediPlanOzeti\.remainingPaymentTotal > 0/);
  assert.match(appSource, /krediOdemeGecmisi\?\.\[krediOdemeDonemi\]\?\.\[k\.id\]/);
  assert.match(appSource, /\(!arsiv \|\| \(kategori === "loans" && k\._gelecek\)\)/);
});
