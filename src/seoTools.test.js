import test from "node:test";
import assert from "node:assert/strict";
import {
  borcKapatmaHesapla,
  borcPlaniHesapla,
  krediKartiAsgariOdemeHesapla,
  krediKartiAsgariOrani,
} from "./seoTools.js";

test("50 bin TL ve altı kart limitinde asgari oran yüzde 20'dir", () => {
  assert.equal(krediKartiAsgariOrani(50_000), 0.2);
  assert.equal(krediKartiAsgariOdemeHesapla({ donemBorcu: 20_000, kartLimiti: 50_000 }).tahminiAsgari, 4_000);
});

test("50 bin TL üstü kart limitinde asgari oran yüzde 40'tır", () => {
  assert.equal(krediKartiAsgariOrani(50_001), 0.4);
  assert.equal(krediKartiAsgariOdemeHesapla({ donemBorcu: 20_000, kartLimiti: 100_000 }).tahminiAsgari, 8_000);
});

test("borç kapatma hesabı faiz ve son kısmi ödemeyi içerir", () => {
  const sonuc = borcKapatmaHesapla({ borc: 10_000, aylikFaiz: 3, aylikOdeme: 2_000 });
  assert.equal(sonuc.tamamlandi, true);
  assert.equal(sonuc.ay, 6);
  assert.ok(sonuc.toplamFaiz > 900);
  assert.ok(sonuc.toplamOdeme < 12_000);
});

test("ilk ay faizini karşılamayan ödeme için uyarı döner", () => {
  const sonuc = borcKapatmaHesapla({ borc: 100_000, aylikFaiz: 4, aylikOdeme: 4_000 });
  assert.equal(sonuc.tamamlandi, false);
  assert.equal(sonuc.neden, "yetersiz-odeme");
});

test("borç planı aylık bütçeyle birden fazla borcu kapatır", () => {
  const sonuc = borcPlaniHesapla({
    aylikButce: 12_000,
    strateji: "faiz",
    borclar: [
      { ad: "Kart", kalan: 40_000, faiz: 4, asgari: 4_000 },
      { ad: "Kredi", kalan: 20_000, faiz: 2, asgari: 2_000 },
    ],
  });
  assert.equal(sonuc.tamamlandi, true);
  assert.ok(sonuc.ay > 0 && sonuc.ay < 12);
  assert.ok(sonuc.toplamFaiz > 0);
});
