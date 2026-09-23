import assert from "node:assert/strict";
import { test } from "node:test";
import { applyCardRestructuring, bindCardRestructuringsToStatement, calculateRestructuringInstallment, cardRestructurableBalance, latestCardRestructuring } from "./cardRestructuring.js";

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
  assert.equal(latestCardRestructuring(result.data.cards[0]).taksitSayisi, 6);
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

test("anapara, faiz, vergiler ve vadeden aylık taksiti hesaplar", () => {
  const installment = calculateRestructuringInstallment({ amount: 46000, installmentCount: 6, monthlyInterest: 3.75, kkdfRate: 15, bsmvRate: 15 });
  assert.ok(Math.abs(installment - 9026.61) < 0.01);
  const result = applyCardRestructuring(data, { ...plan, installment: "", monthlyInterest: 3.75, kkdfRate: 15, bsmvRate: 15 });
  assert.ok(result.data.loans[0].taksit > 0);
});

test("bankanın kayıtlı bakiyeyi aşan tutarı kabul edilir ve kart negatif olmaz", () => {
  const result = applyCardRestructuring(data, { ...plan, amount: 11000, installment: 2000, totalRepayment: 12000 });
  assert.equal(result.error, undefined);
  assert.equal(result.loan.yapilandirilanTutar, 11000);
  assert.equal(result.loan.kalanBorc, 12000);
  assert.equal(cardRestructurableBalance(result.data.cards[0]), 0);
  assert.equal(latestCardRestructuring(result.data.cards[0]).karttanDusulenTutar, 9000);
});

test("geçersiz yapılandırma girişleri engellenir", () => {
  assert.equal(applyCardRestructuring(data, { ...plan, amount: 0 }).error, "INVALID_AMOUNT");
  assert.equal(applyCardRestructuring(data, { ...plan, installment: 0 }).error, "INVALID_INSTALLMENT");
  assert.equal(applyCardRestructuring(data, { ...plan, firstPaymentDate: "geçersiz" }).error, "INVALID_FIRST_PAYMENT_DATE");
});

test("eski kart verisi yapılandırma kaydı olmadan aynı davranışı korur", () => {
  assert.equal(cardRestructurableBalance({ id: "eski", borc: 12000, donemIciEklenen: 500 }), 12500);
});

test("yapılandırma yalnız ait olduğu ekstre döneminin borcundan düşülür", () => {
  const card = {
    id: "donemli",
    ekstreAyi: "2026-09",
    toplamEkstreBorcu: 52110.52,
    yapilanOdeme: 0,
    yapilandirmaKayitlari: [
      { ekstreAyi: "2026-08", karttanDusulenTutar: 46404.49 },
    ],
  };
  assert.equal(cardRestructurableBalance(card), 52110.52);
  assert.equal(latestCardRestructuring(card), null);
});

test("dönemsiz eski yapılandırma yeni ekstre yükleme tarihinden önceyse yeniden düşülmez", () => {
  const card = {
    id: "legacy",
    ekstreAyi: "2026-09",
    toplamEkstreBorcu: 52110.52,
    yapilanOdeme: 0,
    ekstreBelgeOzeti: { yuklenmeTarihi: "2026-09-23T10:00:00.000Z" },
    yapilandirmaKayitlari: [
      { olusturulmaTarihi: "2026-09-10T10:00:00.000Z", karttanDusulenTutar: 46404.49 },
    ],
  };
  assert.equal(cardRestructurableBalance(card), 52110.52);
});

test("dönemsiz eski yapılandırmalar yeni ekstreye geçerken önceki döneme bağlanır", () => {
  const records = bindCardRestructuringsToStatement({
    ekstreAyi: "2026-08",
    yapilandirmaKayitlari: [{ id: "eski", karttanDusulenTutar: 4000 }],
  });
  assert.equal(records[0].ekstreAyi, "2026-08");
});

test("yeni yapılandırma oluşturulduğu ekstre dönemini kaydeder", () => {
  const result = applyCardRestructuring({
    cards: [{ id: "kart-2", ekstreAyi: "2026-09", toplamEkstreBorcu: 10000, yapilanOdeme: 0 }],
    loans: [],
  }, { ...plan, cardId: "kart-2" });
  assert.equal(result.data.cards[0].yapilandirmaKayitlari[0].ekstreAyi, "2026-09");
});
