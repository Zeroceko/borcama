import test from "node:test";
import assert from "node:assert/strict";
import { ASISTAN_KONU_AILELERI, asistanBaglamiOlustur } from "./assistantContext.js";

test("asistan bağlamı yalnız normalize edilmiş finansal özet üretir", () => {
  const sonuc = asistanBaglamiOlustur({
    tarih: new Date(2026, 8, 5), gelir: 70000, zorunluOdeme: 19000,
    harcama: 32000, planAcigi: 2400,
    kalemler: [{ tur: "kart", bakiye: 12000 }, { tur: "kredi", bakiye: 50000 }],
    veri: {
      cards: [{ banka: "Banka", ad: "Kart", toplamEkstreBorcu: 12000, kartNo: "SECRET" }],
      loans: [], overdrafts: [], incomes: [{ tutar: 70000 }],
      expenses: [
        { tarih: "2026-09-01", kategori: "Market", tutar: 3000, aciklama: "Özel işyeri" },
        { tarih: "2026-09-02", kategori: "Market", tutar: 2000 },
      ],
    },
  });
  assert.equal(sonuc.ozet.toplamBorc, 62000);
  assert.deepEqual(sonuc.giderKategorileri, [{ kategori: "Market", tutar: 5000 }]);
  assert.equal(JSON.stringify(sonuc).includes("SECRET"), false);
  assert.equal(JSON.stringify(sonuc).includes("Özel işyeri"), false);
  assert.ok(ASISTAN_KONU_AILELERI.length >= 20);
});
