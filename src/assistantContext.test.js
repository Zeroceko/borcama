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

test("dönem eğilimi düzenli gelir ve giderleri aynı kuralla, tarihli kalemleri ilgili ayda hesaplar", () => {
  const sonuc = asistanBaglamiOlustur({
    tarih: new Date(2026, 8, 6), gelir: 75000, zorunluOdeme: 0,
    harcama: 14000, planAcigi: 0, kalemler: [],
    veri: {
      cards: [], loans: [], overdrafts: [], assets: [],
      incomes: [
        { tutar: 70000, tekrar: "Aylık" },
        { tutar: 5000, tekrar: "Tek seferlik", tarih: "2026-09-03" },
        { tutar: 3000, tekrar: "Tek seferlik", tarih: "2026-08-03" },
      ],
      expenses: [
        { tutar: 12000, tekrar: "Her ay", kategori: "Kira", tarih: "" },
        { tutar: 2000, tekrar: "Tek seferlik", kategori: "Market", tarih: "2026-09-02" },
        { tutar: 1000, tekrar: "Tek seferlik", kategori: "Market", tarih: "2026-08-02" },
      ],
    },
  });

  assert.deepEqual(sonuc.donemTrendi[0], {
    donem: "2026-09", gider: 14000, gelir: 75000,
    duzenliGider: 12000, duzenliGelir: 70000,
    donemselGider: 2000, donemselGelir: 5000,
    giderKaydi: 2, gelirKaydi: 2,
  });
  assert.equal(sonuc.donemTrendi[1].gider, 13000);
  assert.equal(sonuc.donemTrendi[1].gelir, 73000);
  assert.equal(sonuc.donemTrendi[2].gider, 12000);
  assert.equal(sonuc.donemTrendi[2].gelir, 70000);
  assert.match(sonuc.donemTrendiYontemi, /tahmindir/);
  assert.deepEqual(sonuc.giderKategorileri, [
    { kategori: "Kira", tutar: 12000 },
    { kategori: "Market", tutar: 2000 },
  ]);
});

test("eksik finansal alanlar gerçek sıfırdan ayrılır", () => {
  const sonuc = asistanBaglamiOlustur({
    tarih: new Date(2026, 8, 6), gelir: 0, zorunluOdeme: 0,
    harcama: 0, planAcigi: 0,
    kalemler: [{ tur: "kredi", bakiye: 0 }],
    veri: {
      cards: [{ toplamEkstreBorcu: 0, asgariOdeme: "", yapilanOdeme: 0 }],
      loans: [{ kalanBorc: 0, taksit: "", faiz: undefined }],
      overdrafts: [{ kullanilan: 0, yapilanOdeme: 0, faiz: "" }],
      incomes: [], expenses: [], assets: [{ tur: "gayrimenkul", guncelDeger: 0 }],
    },
  });

  assert.equal(sonuc.krediler[0].kalanBorc, 0);
  assert.equal(sonuc.krediler[0].aylikTaksit, null);
  assert.equal(sonuc.krediler[0].aylikFaizYuzde, null);
  assert.equal(sonuc.kartlar[0].ekstreBorcu, 0);
  assert.equal(sonuc.kartlar[0].asgariOdeme, null);
  assert.equal(sonuc.kartlar[0].yapilanOdeme, 0);
  assert.equal(sonuc.ekHesaplar[0].kullanilan, 0);
  assert.equal(sonuc.ekHesaplar[0].aylikFaizYuzde, null);
  assert.equal(sonuc.finansalProfil.pahaliBorcVar, null);
  assert.ok(sonuc.finansalProfil.veriEksikleri.includes("kredi_taksiti"));
  assert.ok(sonuc.finansalProfil.veriEksikleri.includes("kredi_faizi"));
  assert.ok(sonuc.finansalProfil.veriEksikleri.includes("kart_asgari_odemesi"));
  assert.ok(sonuc.finansalProfil.veriEksikleri.includes("ek_hesap_faizi"));
});

test("varlık dağılımı genel kategori yerine gerçek varlık türünü korur", () => {
  const sonuc = asistanBaglamiOlustur({
    tarih: new Date(2026, 8, 6), gelir: 0, zorunluOdeme: 0,
    harcama: 0, planAcigi: 0, kalemler: [],
    veri: {
      cards: [], loans: [], overdrafts: [], incomes: [], expenses: [],
      assets: [
        { tur: "mevduat", kategori: "nakit", guncelDeger: 25000 },
        { tur: "gayrimenkul", kategori: "diger", guncelDeger: 500000 },
        { tur: "arac", kategori: "diger", guncelDeger: 300000 },
      ],
    },
  });

  assert.deepEqual(sonuc.varlikDagilimi, { mevduat: 25000, gayrimenkul: 500000, arac: 300000 });
});
