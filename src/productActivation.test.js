import test from "node:test";
import assert from "node:assert/strict";
import {
  getActivationState,
  getMonthlyBalancePresentation,
} from "./productActivation.js";

test("yeni kullanıcı için ilk görev borç veya ekstre eklemektir", () => {
  const durum = getActivationState({});
  assert.equal(durum.tamamlanan, 0);
  assert.equal(durum.siradaki.id, "debt");
});

test("borç, gelir ve hareket eklendiğinde aktivasyon tamamlanır", () => {
  const durum = getActivationState({
    cards: [{ toplamEkstreBorcu: 12000 }],
    incomes: [{ tutar: 50000 }],
    expenses: [{ tutar: 800 }],
  });
  assert.equal(durum.tamamlanan, 3);
  assert.equal(durum.tamam, true);
});

test("yalnızca kart tanımı ekstre olmadan borç görevini tamamlamaz", () => {
  const durum = getActivationState({ cards: [{ banka: "QNB", limit: 50000 }] });
  assert.equal(durum.gorevler[0].tamam, false);
});

test("harcama verisi yoksa aylık kalan para gösterilmez", () => {
  const sunum = getMonthlyBalancePresentation({
    income: 70000,
    mandatoryPayments: 20000,
    expenses: 0,
    expenseCount: 0,
  });
  assert.equal(sunum.tutar, null);
  assert.match(sunum.etiket, /veri eksik/i);
});

test("aylık denge yalnızca kayıtlı harcamalarla ihtiyatlı biçimde hesaplanır", () => {
  const sunum = getMonthlyBalancePresentation({
    income: 70000,
    mandatoryPayments: 19200,
    expenses: 32400,
    expenseCount: 6,
  });
  assert.equal(sunum.tutar, 18400);
  assert.match(sunum.aciklama, /yalnızca kaydettiğin/i);
});
