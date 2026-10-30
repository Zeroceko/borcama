import test from "node:test";
import assert from "node:assert/strict";
import { bildirimIcerigi, bildirimKimligi, bildirimZamanlari, ertelemeZamani, gecerliErtelemeler } from "./odemeBildirimiPlan.js";

const SIMDI = new Date(2026, 9, 1, 12, 0, 0); // 1 Ekim 2026, ogleden sonra

function odeme(gun, ek = {}) {
  return { id: `o-${gun}`, tutar: 500, odendi: false, tarih: new Date(2026, 9, gun), ...ek };
}

test("bildirimi odeme gununden bir gun once 09:00'a kurar", () => {
  const [ilk] = bildirimZamanlari([odeme(10)], SIMDI);
  assert.equal(ilk.zaman.getDate(), 9);
  assert.equal(ilk.zaman.getMonth(), 9);
  assert.equal(ilk.zaman.getHours(), 9);
  assert.equal(ilk.zaman.getMinutes(), 0);
});

test("ayni gune denk gelen odemeleri tek bildirimde gruplar", () => {
  const sonuc = bildirimZamanlari([odeme(10), odeme(10), odeme(10)], SIMDI);
  assert.equal(sonuc.length, 1);
});

test("farkli gunler icin ayri bildirim kurar", () => {
  const sonuc = bildirimZamanlari([odeme(10), odeme(15)], SIMDI);
  assert.equal(sonuc.length, 2);
});

test("odenmis kayitlari atlar", () => {
  assert.equal(bildirimZamanlari([odeme(10, { odendi: true })], SIMDI).length, 0);
});

test("sifir ve yok denecek kadar kucuk tutarlari atlar", () => {
  assert.equal(bildirimZamanlari([odeme(10, { tutar: 0 })], SIMDI).length, 0);
  assert.equal(bildirimZamanlari([odeme(10, { tutar: 0.005 })], SIMDI).length, 0);
});

test("gecmis zamanli bildirim kurmaz", () => {
  // 1 Ekim odemesi icin bildirim 30 Eylul 09:00'da olurdu; simdi 1 Ekim.
  assert.equal(bildirimZamanlari([odeme(1)], SIMDI).length, 0);
});

test("ayni gun icin bildirimin zamani sinirdaysa dogru karar verir", () => {
  const odemeler = [odeme(2)]; // bildirim 1 Ekim 09:00
  const sabahErken = new Date(2026, 9, 1, 8, 0, 0);
  const ogleden = new Date(2026, 9, 1, 10, 0, 0);
  assert.equal(bildirimZamanlari(odemeler, sabahErken).length, 1);
  assert.equal(bildirimZamanlari(odemeler, ogleden).length, 0);
});

test("ay sinirinda bir onceki gune dogru gecer", () => {
  const [ilk] = bildirimZamanlari([{ tutar: 100, odendi: false, tarih: new Date(2026, 10, 1) }], SIMDI);
  assert.equal(ilk.zaman.getMonth(), 9); // Ekim
  assert.equal(ilk.zaman.getDate(), 31);
});

test("gecersiz tarihleri gormezden gelir", () => {
  assert.equal(bildirimZamanlari([{ tutar: 100, odendi: false, tarih: "olmayan-tarih" }], SIMDI).length, 0);
});

test("bos veya tanimsiz girdide cokmez", () => {
  assert.equal(bildirimZamanlari([], SIMDI).length, 0);
  assert.equal(bildirimZamanlari(undefined, SIMDI).length, 0);
});

test("azami bildirim sayisini asmaz", () => {
  const cokOdeme = Array.from({ length: 50 }, (_, i) => odeme(5 + i));
  assert.ok(bildirimZamanlari(cokOdeme, SIMDI).length <= 30);
});

test("ayni gun icin kimlik kararlidir, farkli gun icin degisir", () => {
  assert.equal(bildirimKimligi("2026-10-09"), bildirimKimligi("2026-10-09"));
  assert.notEqual(bildirimKimligi("2026-10-09"), bildirimKimligi("2026-10-10"));
  assert.ok(bildirimKimligi("2026-10-09") >= 0);
});

const ceviri = (anahtar, d = {}) => `${anahtar}|${Object.values(d).join(",")}`;
const tutarYaz = (n) => `₺${n}`;

test("tek ödemeli bildirim borcun adını ve tutarını yazar, ödeme anahtarını taşır", () => {
  const icerik = bildirimIcerigi(
    [{ ad: "Akbank · Axess · •••• 1234", tutar: 6200, anahtar: "kart-1-ekstre-2026-10" }],
    { tutarYaz, t: ceviri },
  );
  assert.equal(icerik.baslik, "bilesen.bildirim.tekBaslik|Akbank · Axess");
  assert.equal(icerik.metin, "bilesen.bildirim.tekMetin|₺6200");
  assert.equal(icerik.odemeAnahtari, "kart-1-ekstre-2026-10");
});

test("hassas modda tutar yazılmaz", () => {
  const tek = bildirimIcerigi([{ ad: "QNB", tutar: 4150, anahtar: "k" }], { hassas: true, tutarYaz, t: ceviri });
  assert.doesNotMatch(tek.metin, /4150/);
  const cok = bildirimIcerigi(
    [{ ad: "QNB", tutar: 4150 }, { ad: "Enpara", tutar: 1900 }],
    { hassas: true, tutarYaz, t: ceviri },
  );
  assert.equal(cok.metin, "QNB · Enpara");
});

test("aynı gün birden fazla ödeme: adlar listelenir, ödeme anahtarı yok", () => {
  const icerik = bildirimIcerigi(
    [{ ad: "QNB", tutar: 4150, anahtar: "a" }, { ad: "Enpara", tutar: 1900, anahtar: "b" }],
    { tutarYaz, t: ceviri },
  );
  assert.equal(icerik.baslik, "bilesen.bildirim.cokBaslik|2");
  assert.equal(icerik.metin, "QNB ₺4150 · Enpara ₺1900");
  assert.equal(icerik.odemeAnahtari, null);
});

test("günlük planda o günün ödemeleri taşınır", () => {
  const [gun] = bildirimZamanlari([odeme(10), odeme(10, { id: "ikinci" })], SIMDI);
  assert.equal(gun.odemeler.length, 2);
});

test("erteleme ertesi gün 09:00; ödenen ya da geçmiş ertelemeler atılır", () => {
  const zaman = ertelemeZamani(SIMDI);
  assert.equal(zaman.getDate(), 2);
  assert.equal(zaman.getHours(), 9);
  const yaklasan = [odeme(10, { anahtar: "bekliyor" }), odeme(10, { anahtar: "odendi", odendi: true })];
  const gecerli = gecerliErtelemeler(
    [
      { odemeAnahtari: "bekliyor", zaman: zaman.toISOString() },
      { odemeAnahtari: "odendi", zaman: zaman.toISOString() },
      { odemeAnahtari: "bekliyor", zaman: new Date(2026, 8, 1).toISOString() },
    ],
    yaklasan,
    SIMDI,
  );
  assert.equal(gecerli.length, 1);
  assert.equal(gecerli[0].odeme.anahtar, "bekliyor");
});
