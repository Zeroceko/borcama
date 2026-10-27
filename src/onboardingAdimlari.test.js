import test from "node:test";
import assert from "node:assert/strict";
import {
  adimGecilebilirMi,
  adimSirasi,
  aySonuKalan,
  aylikOdemeler,
  bosDurum,
  borcGecerli,
  durumdanSonuc,
  gunlukTutar,
  ilkBitecekBorc,
  ilkOdeme,
  kurulumGosterilsinMi,
  numaraliAdimlar,
  oncekiAdim,
  onboardingSonucunuUygula,
  planOdemeleri,
  sonuctanDurum,
  sonrakiAdim,
  sonrakiMaas,
  veriyeYaz,
  yasamOnerileri,
} from "./onboardingAdimlari.js";

const kart = { tur: "kart", banka: "Akbank", tutar: "12500", gun: "15" };
const kredi = { tur: "kredi", banka: "QNB", taksit: "4000", kalanTaksit: "18", gun: "5" };

test("web'de isim adımı yok, 10 numaralı adım var; uygulamada isim eklenir", () => {
  const web = adimSirasi({ native: false });
  assert.equal(web.includes("isim"), false);
  assert.equal(numaraliAdimlar(web).length, 10);
  assert.equal(web.at(-1), "hazir");
  const native = adimSirasi({ native: true });
  assert.deepEqual(native.slice(0, 4), ["dil", "ulke", "isim", "hedef"]);
  assert.equal(numaraliAdimlar(native).length, 11);
});

test("\"borç yok\" seçilince ilk borç formu atlanır, türlerden yaşam harcamasına geçilir", () => {
  const sira = adimSirasi({ borcYok: true });
  assert.equal(sira.includes("borc"), false);
  assert.equal(sonrakiAdim("turler", sira), "yasam");
  assert.equal(oncekiAdim("yasam", sira), "turler");
  assert.equal(sonrakiAdim("turler", adimSirasi()), "borc");
});

test("haftalık ve düzensiz gelirde maaş günü sorulmaz", () => {
  for (const siklik of ["haftalik", "duzensiz"]) assert.equal(adimSirasi({ siklik }).includes("gun"), false);
  for (const siklik of ["aylik", "ikiKez"]) assert.equal(adimSirasi({ siklik }).includes("gun"), true);
  assert.equal(sonrakiAdim("siklik", adimSirasi({ siklik: "haftalik" })), "gelir");
});

test("gelir boş veya sıfırsa geçilemez; tür ve borç adımı en az bir seçim ister", () => {
  const durum = bosDurum();
  assert.equal(adimGecilebilirMi("gelir", durum), false);
  assert.equal(adimGecilebilirMi("gelir", { ...durum, gelir: "0" }), false);
  assert.equal(adimGecilebilirMi("gelir", { ...durum, gelir: "70000" }), true);
  assert.equal(adimGecilebilirMi("turler", durum), false);
  assert.equal(adimGecilebilirMi("turler", { ...durum, borcYok: true }), true);
  assert.equal(adimGecilebilirMi("turler", { ...durum, turler: ["kart"] }), true);
  assert.equal(adimGecilebilirMi("borc", durum), false);
  assert.equal(adimGecilebilirMi("borc", { ...durum, borclar: [kart] }), true);
  assert.equal(adimGecilebilirMi("hedef", durum), true);
});

test("yankı: günlük tutar, sonraki maaş tarihi ve kalan gün", () => {
  assert.equal(gunlukTutar("70000"), 2333);
  const bugun = new Date(2026, 9, 27);
  const maas = sonrakiMaas(1, bugun);
  assert.equal(maas.tarih.getMonth(), 10);
  assert.equal(maas.tarih.getDate(), 1);
  assert.equal(maas.kalan, 5);
  assert.equal(sonrakiMaas(27, bugun).kalan, 0);
  // 31 seçilip ay 30 çekiyorsa ayın son günü.
  const kasim = sonrakiMaas(31, new Date(2026, 10, 2));
  assert.equal(kasim.tarih.getDate(), 30);
  // Aralıktan sonra yıl döner.
  assert.equal(sonrakiMaas(1, new Date(2026, 11, 20)).tarih.getFullYear(), 2027);
});

test("ödemeler, yaşam önerileri ve ay sonu kalan", () => {
  assert.equal(aylikOdemeler([kart, kredi, { tur: "kmh", banka: "Enpara", tutar: "9000" }]), 16500);
  assert.deepEqual(yasamOnerileri("70000"), [21000, 31500, 42000]);
  assert.equal(aySonuKalan({ gelir: "70000", borclar: [kart], yasam: 31500 }), 26000);
  assert.equal(aySonuKalan({ gelir: "70000", borclar: [], yasam: null }), 70000);
  // Kartın tamamı sığmıyorsa plan yalnız sığanı öder; ay sonu eksiye düşmez.
  const buyuk = { ...kart, tutar: "120000" };
  assert.equal(planOdemeleri({ gelir: "70000", borclar: [buyuk, kredi], yasam: 31500 }), 38500);
  assert.equal(aySonuKalan({ gelir: "70000", borclar: [buyuk, kredi], yasam: 31500 }), 0);
  // Taksitler gelir - yaşamı aşıyorsa açık görünür.
  assert.equal(aySonuKalan({ gelir: "3000", borclar: [kredi], yasam: 0 }), -1000);
});

test("ilk biten borç ve ilk ödeme tarihi", () => {
  const sonuc = ilkBitecekBorc({ gelir: "70000", borclar: [kart, kredi], yasam: 31500 });
  // Kart: 70.000 - 31.500 - 4.000 = 34.500 ödeme gücü; 12.500 bir ayda biter.
  assert.equal(sonuc.borc, kart);
  assert.equal(sonuc.ay, 1);
  const buyukKart = { ...kart, tutar: "120000" };
  assert.equal(ilkBitecekBorc({ gelir: "70000", borclar: [buyukKart], yasam: 31500 }).ay, 4);
  assert.equal(ilkBitecekBorc({ gelir: "70000", borclar: [kredi], yasam: 0 }).ay, 18);
  assert.equal(ilkBitecekBorc({ gelir: "10000", borclar: [kart], yasam: 12000 }).ay, null);
  assert.equal(ilkBitecekBorc({ gelir: "70000", borclar: [] }), null);
  const odeme = ilkOdeme([kart, kredi], new Date(2026, 9, 27));
  assert.equal(odeme.borc, kredi);
  assert.equal(odeme.tarih.getDate(), 5);
  assert.equal(ilkOdeme([{ tur: "kisi", banka: "Ali", tutar: "500" }]), null);
});

test("borç formu zorunlu alanları kontrol eder", () => {
  assert.equal(borcGecerli(kart), true);
  assert.equal(borcGecerli({ ...kart, banka: " " }), false);
  assert.equal(borcGecerli({ ...kart, gun: "" }), false);
  assert.equal(borcGecerli(kredi), true);
  assert.equal(borcGecerli({ ...kredi, kalanTaksit: "0" }), false);
  assert.equal(borcGecerli({ tur: "kisi", banka: "Ali", tutar: "500" }), true);
});

test("akış sonunda mevcut kayıt yapısına yazar, mevcut kayıtları korur", () => {
  let n = 0;
  const veri = { cards: [], loans: [{ id: "eski" }], overdrafts: [], others: [], incomes: [], expenses: [], ayarlar: { ekstreBorcModeliV3: true } };
  const durum = {
    ...bosDurum(),
    ad: "Özer",
    gelir: "70000",
    turler: ["kart", "kredi", "kmh", "kisi"],
    borclar: [kart, kredi, { tur: "kmh", banka: "Enpara", tutar: "9000" }, { tur: "kisi", banka: "Bakkal", tutar: "750" }],
    yasam: 31500,
    atlanan: ["hedef", "hedef"],
  };
  const simdi = new Date(2026, 9, 27, 12);
  const yeni = veriyeYaz(veri, durum, { native: true, simdi, idUret: () => `id${++n}`, gelirAdi: "Maaş" });
  assert.equal(yeni.cards[0].toplamEkstreBorcu, 12500);
  assert.equal(yeni.cards[0].ekstreAyi, "2026-10");
  assert.equal(yeni.cards[0].sonOdemeGunu, 15);
  // 27 Ekim'de 15'i geçmiş: kart gecikmiş görünmesin, son ödeme 15 Kasım.
  assert.equal(yeni.cards[0].sonOdemeTarihi, "2026-11-15");
  assert.equal(yeni.loans.length, 2);
  assert.equal(yeni.loans[1].kalanBorc, 72000);
  assert.equal(yeni.loans[1].ilkOdemeTarihi, "2026-11-05");
  const ayIcinde = veriyeYaz(veri, { ...durum, borclar: [{ ...kredi, gun: "30" }] }, { simdi, idUret: () => "k", gelirAdi: "Maaş" });
  assert.equal(ayIcinde.loans[1].ilkOdemeTarihi, undefined);
  assert.equal(yeni.overdrafts[0].kullanilan, 9000);
  assert.equal(yeni.others[0].tutar, 750);
  assert.deepEqual(
    { ad: yeni.incomes[0].ad, tutar: yeni.incomes[0].tutar, tekrar: yeni.incomes[0].tekrar },
    { ad: "Maaş", tutar: 70000, tekrar: "Her ay" },
  );
  assert.equal(yeni.expenses[0].tekrar, "Her ay");
  assert.equal(yeni.expenses[0].tarih, "2026-10-27");
  assert.equal(yeni.ayarlar.ad, "Özer");
  assert.equal(yeni.ayarlar.ekstreBorcModeliV3, true);
  assert.equal(yeni.ayarlar.onboarding.hedef, "borc");
  assert.equal(yeni.ayarlar.onboarding.maasGunu, 1);
  assert.deepEqual(yeni.ayarlar.onboarding.atlanan, ["hedef"]);
  assert.ok(yeni.ayarlar.onboarding.tamam);
  // Web'de isim yazılmaz; borç yok seçildiyse borç eklenmez.
  const web = veriyeYaz(veri, { ...durum, borcYok: true, yasam: null }, { simdi, idUret: () => "x", gelirAdi: "Salary" });
  assert.equal(web.ayarlar.ad, undefined);
  assert.equal(web.cards.length, 0);
  assert.equal(web.expenses.length, 0);
});

test("akış yalnız hiç kaydı olmayan ve akışı bitirmemiş hesapta açılır", () => {
  assert.equal(kurulumGosterilsinMi({ veri: {} }), true);
  assert.equal(kurulumGosterilsinMi({ veri: { cards: [], incomes: [] } }), true);
  assert.equal(kurulumGosterilsinMi({ veri: { cards: [{ id: "a" }] } }), false);
  assert.equal(kurulumGosterilsinMi({ veri: { assets: [{ id: "v" }] } }), false);
  assert.equal(kurulumGosterilsinMi({ veri: { ayarlar: { onboarding: { tamam: "2026-10-27" } } } }), false);
});

test("native onboarding sonucu web akışıyla aynı kayıtları yazar", () => {
  const simdi = new Date(2026, 9, 27, 12);
  const veri = { cards: [], loans: [], overdrafts: [], others: [], incomes: [], expenses: [], ayarlar: {} };
  const sonuc = {
    cikis: "misafir",
    dil: "en",
    ulke: "GB",
    paraBirimi: "GBP",
    ad: "  Sam ",
    hedef: "aySonu",
    siklik: "ikiKez",
    maasGunu: 25,
    gelir: 2400,
    borcTurleri: ["kart", "kredi", "kmh", "kisi"],
    borclar: [
      { tur: "kart", ad: "Monzo", tutar: 640, gun: 3 },
      { tur: "kredi", ad: "HSBC", taksit: 210, kalanTaksit: 24, gun: 28 },
      { tur: "kmh", ad: "Barclays", tutar: 300 },
      { tur: "kisi", ad: "Alex", tutar: 50 },
      { tur: "kart", ad: "", tutar: 10, gun: 1 },
      { tur: "bilinmeyen", ad: "X", tutar: 5 },
    ],
    yasam: 900,
    atlanan: ["isim", "uydurma"],
    sure_ms: 61000,
  };
  let n = 0;
  const yeni = onboardingSonucunuUygula(veri, sonuc, { native: true, simdi, idUret: () => `n${++n}`, gelirAdi: "Salary" });
  assert.equal(yeni.cards.length, 1);
  assert.equal(yeni.cards[0].banka, "Monzo");
  assert.equal(yeni.cards[0].sonOdemeTarihi, "2026-11-03");
  assert.equal(yeni.loans[0].kalanBorc, 5040);
  assert.equal(yeni.loans[0].ilkOdemeTarihi, undefined);
  assert.equal(yeni.overdrafts[0].kullanilan, 300);
  assert.equal(yeni.others[0].banka, "Alex");
  assert.equal(yeni.incomes[0].tutar, 2400);
  assert.equal(yeni.expenses[0].tutar, 900);
  assert.equal(yeni.ayarlar.ad, "Sam");
  assert.deepEqual(yeni.ayarlar.onboarding.atlanan, ["isim"]);
  assert.equal(yeni.ayarlar.onboarding.hedef, "aySonu");
  assert.equal(yeni.ayarlar.onboarding.maasGunu, 25);
});

test("eksik veya bozuk sonuç varsayılanlara düşer; web durumu sonuca ve geri çevrilir", () => {
  const durum = sonuctanDurum({ hedef: "x", siklik: "y", maasGunu: 40, gelir: "abc", borclar: "yok" });
  assert.equal(durum.hedef, "borc");
  assert.equal(durum.siklik, "aylik");
  assert.equal(durum.maasGunu, 1);
  assert.equal(durum.gelir, "");
  assert.equal(durum.borcYok, true);
  const webDurumu = { ...bosDurum(), gelir: "70000", turler: ["kart", "kredi"], borclar: [kart, kredi], yasam: 31500 };
  const sonuc = durumdanSonuc(webDurumu, { dil: "tr", ulke: "TR", paraBirimi: "TRY", sure_ms: 5 });
  assert.deepEqual(sonuc.borclar[0], { tur: "kart", ad: "Akbank", tutar: 12500, gun: 15 });
  assert.deepEqual(sonuc.borclar[1], { tur: "kredi", ad: "QNB", taksit: 4000, kalanTaksit: 18, gun: 5 });
  assert.equal(sonuc.gelir, 70000);
  const geri = sonuctanDurum(sonuc);
  assert.equal(aylikOdemeler(geri.borclar), 16500);
  assert.equal(geri.gelir, "70000");
});
