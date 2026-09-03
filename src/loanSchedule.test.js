import test from "node:test";
import assert from "node:assert/strict";
import { loanIsDueInMonth, loanStartsInMonths, loanPaymentKey } from "./loanSchedule.js";

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
