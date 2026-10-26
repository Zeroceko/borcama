import test from "node:test";
import assert from "node:assert/strict";
import { bildirimKimligi, bildirimZamanlari } from "./odemeBildirimiPlan.js";

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
