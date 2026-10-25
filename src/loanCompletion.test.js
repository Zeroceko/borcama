import test from "node:test";
import assert from "node:assert/strict";
import {
  completedLoanInstallments,
  loanClosesAfterPayment,
  loanIsClosed,
} from "./loanCompletion.js";

const loan = { id: "loan-1", taksit: 1000, kalanTaksit: 3 };

test("son normal taksit krediyi otomatik kapatir", () => {
  const history = {
    "2026-08": { "loan-1": { tutar: 1000 } },
    "2026-09": { "loan-1": { tutar: 1000 } },
  };
  assert.equal(
    loanClosesAfterPayment({
      loan,
      history,
      period: "2026-10",
      periodPaymentTotal: 1000,
      paymentType: "taksit",
    }),
    true,
  );
});

test("eksik veya erken odeme krediyi kapatmaz", () => {
  const history = { "2026-08": { "loan-1": { tutar: 1000 } } };
  assert.equal(completedLoanInstallments(history, "loan-1", 1000), 1);
  assert.equal(
    loanClosesAfterPayment({
      loan,
      history,
      period: "2026-09",
      periodPaymentTotal: 500,
      paymentType: "kismi",
    }),
    false,
  );
});

test("tam kapatma secenegi taksit sayisindan bagimsizdir", () => {
  assert.equal(
    loanClosesAfterPayment({
      loan,
      history: {},
      period: "2026-10",
      periodPaymentTotal: 200,
      paymentType: "kapat",
    }),
    true,
  );
});

test("eksik eski kredi kaydi kapatilan kredi sanilmaz", () => {
  assert.equal(loanIsClosed({ id: "legacy-loan" }), false);
  assert.equal(loanIsClosed({ id: "open-loan", kalanBorc: 1200 }), false);
  assert.equal(loanIsClosed({ id: "closed-loan", kalanBorc: 0 }), true);
  assert.equal(
    loanIsClosed({ id: "closed-loan", kalanBorc: 1200, kapatildiTarihi: "2026-10-01" }),
    true,
  );
});

test("son taksiti eski surumde kaydedilen kredi gecmisten kapanmis sayilir", () => {
  const history = {
    "2026-10": { "legacy-paid-loan": { tutar: 8468.38 } },
  };
  assert.equal(
    loanIsClosed(
      {
        id: "legacy-paid-loan",
        kalanBorc: 8468.38,
        kalanTaksit: 1,
        taksit: 8468.38,
      },
      history,
    ),
    true,
  );
});

test("eksik taksit gecmisi krediyi erkenden kapatmaz", () => {
  const history = {
    "2026-09": { "still-open": { tutar: 1000 } },
  };
  assert.equal(
    loanIsClosed(
      { id: "still-open", kalanBorc: 3000, kalanTaksit: 3, taksit: 1000 },
      history,
    ),
    false,
  );
});
