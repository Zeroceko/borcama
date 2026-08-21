import test from "node:test";
import assert from "node:assert/strict";
import {
  borcKapatmaHesapla,
  borcPlaniHesapla,
  bruttenNeteMaas2026,
  kidemTazminatiHesapla2026,
  krediKartiAsgariOdemeHesapla,
  krediKartiAsgariOrani,
  krediOdemePlaniHesapla,
  mevduatFaiziHesapla,
  nettenBruteMaas2026,
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

test("mevduat hesabı brüt faizden stopajı düşerek net getiriyi bulur", () => {
  const sonuc = mevduatFaiziHesapla({ anaPara: 100_000, yillikFaiz: 40, vadeGunu: 365, stopaj: 15 });
  assert.equal(sonuc.hesaplandi, true);
  assert.equal(sonuc.brutFaiz, 40_000);
  assert.equal(sonuc.stopajTutari, 6_000);
  assert.equal(sonuc.netFaiz, 34_000);
  assert.equal(sonuc.vadeSonuTutar, 134_000);
});

test("kredi ödeme planı eşit taksitleri ve son kalan bakiyeyi hesaplar", () => {
  const sonuc = krediOdemePlaniHesapla({ krediTutari: 120_000, aylikFaiz: 3, vadeAy: 12 });
  assert.equal(sonuc.hesaplandi, true);
  assert.equal(sonuc.takvim.length, 12);
  assert.ok(sonuc.aylikTaksit > 12_000);
  assert.ok(sonuc.toplamFaiz > 0);
  assert.ok(sonuc.takvim.at(-1).kalan < 0.01);
});

test("2026 asgari ücretinde gelir ve damga vergisi kesilmez", () => {
  const sonuc = bruttenNeteMaas2026({ brutMaas: 33_030, ay: 1 });
  assert.equal(sonuc.net, 28_075.5);
  assert.equal(sonuc.gelirVergisi, 0);
  assert.equal(sonuc.damgaVergisi, 0);
});

test("netten brüte dönüşüm hedef net maaşı geri üretir", () => {
  const hedef = 60_000;
  const sonuc = nettenBruteMaas2026({ netMaas: hedef, ay: 8 });
  assert.ok(Math.abs(sonuc.net - hedef) < 0.01);
  assert.ok(sonuc.brut > hedef);
});

test("kıdem tazminatı güncel tavanı ve damga vergisini uygular", () => {
  const sonuc = kidemTazminatiHesapla2026({ brutMaas: 100_000, aylikEkOdemeler: 5_000, yil: 2 });
  assert.equal(sonuc.hesaplamayaEsasAylik, 73_729.87);
  assert.ok(sonuc.netTazminat < sonuc.brutTazminat);
  assert.ok(sonuc.netTazminat > 145_000);
});
