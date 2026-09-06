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
      loans: [{ faiz: 3.49, kalanBorc: 50000 }], overdrafts: [], incomes: [{ tutar: 70000, tekrar: "Her ay" }],
      assets: [{ kategori: "nakit", guncelDeger: 10000 }],
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
  assert.equal(sonuc.ozet.toplamVarlik, 10000);
  assert.equal(sonuc.ozet.likitVarlik, 10000);
  assert.equal(sonuc.ozet.netFinansalDurum, -52000);
  assert.equal(sonuc.ozet.borcOdemeYukuYuzde, 27.1);
  assert.equal(sonuc.finansalProfil.pahaliBorcVar, true);
  assert.equal(sonuc.donemTrendi.length, 6);
  assert.ok(ASISTAN_KONU_AILELERI.length >= 20);
});

test("gayrimenkul ve araç hazır nakit gibi değerlendirilmez", () => {
  const sonuc = asistanBaglamiOlustur({
    tarih: new Date(2026, 8, 6), gelir: 50000, zorunluOdeme: 20000,
    harcama: 10000, planAcigi: 0,
    kalemler: [{ tur: "kredi", bakiye: 100000 }],
    veri: {
      cards: [], loans: [], overdrafts: [], incomes: [], expenses: [],
      assets: [
        { tur: "gayrimenkul", guncelDeger: 500000 },
        { tur: "arac", guncelDeger: 300000 },
        { tur: "mevduat", guncelDeger: 25000 },
      ],
    },
  });

  assert.equal(sonuc.ozet.toplamVarlik, 825000);
  assert.equal(sonuc.ozet.likitVarlik, 25000);
  assert.equal(sonuc.finansalProfil.likitVarlikBorcaYeterMi, false);
});
