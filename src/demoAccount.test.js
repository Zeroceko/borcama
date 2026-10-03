import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { demoHesapOzeti, demoVerisiOlustur } from "./demoAccount.js";

const referenceDate = new Date("2026-10-03T12:00:00+03:00");

test("örnek hesap bütün finansal alanları sentetik ve salt okunur olarak doldurur", () => {
  const veri = demoVerisiOlustur(referenceDate);
  assert.deepEqual(veri.demo, { synthetic: true, readOnly: true, version: 1 });
  assert.equal(veri.cards.length, 3);
  assert.equal(veri.loans.length, 1);
  assert.equal(veri.overdrafts.length, 1);
  assert.equal(veri.incomes.length, 1);
  assert.equal(veri.assets.length, 1);
  assert.ok(veri.expenses.length > 10);
  assert.doesNotMatch(JSON.stringify(veri), /@|user_id|ozerocek|zero@borcama/i);
});

test("örnek hesap özeti alt kırılımlarla ve harcama kategorileriyle mutabıktır", () => {
  const veri = demoVerisiOlustur(referenceDate);
  const ozet = demoHesapOzeti(veri, referenceDate);
  assert.equal(ozet.kartBorcu, 93500);
  assert.equal(ozet.krediBorcu, 168000);
  assert.equal(ozet.ekHesapBorcu, 22000);
  assert.equal(ozet.toplamBorc, 283500);
  assert.equal(ozet.varlik, 48000);
  assert.equal(ozet.gelir, 70000);
  assert.equal(ozet.harcama, 33800);
  assert.equal(ozet.kategoriler.reduce((sum, item) => sum + item.amount, 0), ozet.harcama);
  assert.equal(ozet.netDurum, ozet.varlik - ozet.toplamBorc);
  assert.ok(ozet.aylikOdeme > 0);
  assert.equal(ozet.odemeler.length, 4);
});

test("uygulama ve landing aynı demo veri fabrikasını kullanır", async () => {
  const [app, landing, main] = await Promise.all([
    readFile(new URL("./App.jsx", import.meta.url), "utf8"),
    readFile(new URL("./LandingGrowth.jsx", import.meta.url), "utf8"),
    readFile(new URL("./main.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(app, /import \{ demoVerisiOlustur \} from "\.\/demoAccount\.js"/);
  assert.doesNotMatch(app, /function demoVerisiOlustur\(/);
  assert.match(landing, /demoHesapOzeti\(demoData\)/);
  assert.match(landing, /href="\/demo"/);
  assert.match(main, /yol === "\/demo"\) return <App publicDemo/);
  assert.match(app, /Dolu örnek hesap/);
  assert.doesNotMatch(app, /salt okunur/i);
});
