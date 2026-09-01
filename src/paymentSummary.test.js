import test from "node:test";
import assert from "node:assert/strict";

import {
  isMandatoryPaymentPending,
  mergeArchivedCardStatement,
  summarizeMandatoryPayments,
} from "./paymentSummary.js";

test("asgari hedefi tamamlanan kart kalan bakiyesi olsa da bekleyen sayılmaz", () => {
  assert.equal(
    isMandatoryPaymentPending({
      kartOdemesi: true,
      minimumTamam: true,
      tamamiOdendi: false,
      kalanToplam: 46_404.49,
    }),
    false,
  );
});

test("arşiv ekstre güncel kartın kesin tarihlerini miras almaz", () => {
  const record = mergeArchivedCardStatement(
    {
      id: "card-1",
      sonOdemeTarihi: "2026-09-04",
      hesapKesimTarihi: "2026-08-25",
      sonOdemeGunu: 4,
      kesimGunu: 25,
    },
    { ekstreAyi: "2026-05", toplamEkstreBorcu: 40_000 },
  );

  assert.equal(record.id, "card-1");
  assert.equal(record.ekstreAyi, "2026-05");
  assert.equal(record.sonOdemeTarihi, undefined);
  assert.equal(record.hesapKesimTarihi, undefined);
  assert.equal(record.sonOdemeGunu, 4);
  assert.equal(record.kesimGunu, 25);
});

test("asgari hedefi eksik kart ve ödenmemiş kredi bekleyen sayılır", () => {
  assert.equal(
    isMandatoryPaymentPending({ kartOdemesi: true, minimumTamam: false }),
    true,
  );
  assert.equal(isMandatoryPaymentPending({ odendi: false }), true);
});

test("zorunlu ödeme özeti fazla ödemeyi hedef tutarla sınırlar", () => {
  const summary = summarizeMandatoryPayments([
    { hedefTutar: 30_000, tutar: 0, yapilanOdeme: 47_000 },
    { hedefTutar: 20_000, tutar: 8_000, yapilanOdeme: 12_000 },
  ]);

  assert.deepEqual(summary, {
    total: 50_000,
    covered: 42_000,
    remaining: 8_000,
  });
});
