import test from "node:test";
import assert from "node:assert/strict";
import { ekHesapBorcuEkle, ekHesapOdemesiUygula, ekHesapOdemesiKaldir } from "./overdraftPayments.js";

const bakiye = (k) => k.kullanilan - k.yapilanOdeme;
test("kapatılan ek hesap yeniden borçlandırılır, ödeme geçmişi korunur", () => {
  const eski = { id: "kmh", limit: 10000, kullanilan: 10000, yapilanOdeme: 0 };
  const kapali = ekHesapOdemesiUygula(eski, { tutar: 10000, tarih: "2026-09-18", yeniId: "odeme", kapat: true }).hesap;
  const yeni = ekHesapBorcuEkle(kapali, { tutar: 3000, yeniId: "borc" });
  assert.equal(yeni.tamam, true);
  assert.equal(bakiye(yeni.hesap), 3000);
  assert.deepEqual(yeni.hesap.odemeGecmisi, kapali.odemeGecmisi);
  assert.equal(kapali.kullanilan, 10000);
  const tekrarKapali = ekHesapOdemesiUygula(yeni.hesap, { tutar: 3000, tarih: "2026-09-18", yeniId: "odeme2", kapat: true }).hesap;
  assert.equal(bakiye(tekrarKapali), 0);
  const ucuncu = ekHesapBorcuEkle(tekrarKapali, { tutar: 2000, yeniId: "borc2" }).hesap;
  assert.equal(bakiye(ucuncu), 2000);
  assert.equal(ucuncu.odemeGecmisi.length, 2);
  assert.equal(bakiye(ekHesapOdemesiKaldir(ucuncu, ucuncu.odemeGecmisi[1])), 5000);
});
test("limit geçmiş toplam kullanıma değil kalan borca uygulanır", () => {
  const hesap = { limit: 10000, kullanilan: 20000, yapilanOdeme: 15000 };
  assert.equal(ekHesapBorcuEkle(hesap, { tutar: 5000 }).tamam, true);
  assert.equal(ekHesapBorcuEkle(hesap, { tutar: 5000.01 }).tamam, false);
});
test("geçersiz tutar ve tarih reddedilir, kuruşlar korunur", () => {
  for (const tutar of [0, -1, "", "abc", Infinity, NaN])
    assert.equal(ekHesapBorcuEkle({}, { tutar }).tamam, false);
  assert.equal(ekHesapBorcuEkle({}, { tutar: 10, tarih: "x" }).tamam, false);
  assert.equal(ekHesapBorcuEkle({ kullanilan: 0.1 }, { tutar: 0.2 }).hesap.kullanilan, 0.3);
});
