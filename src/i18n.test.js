import test from "node:test";
import assert from "node:assert/strict";
import { cevir, dil, dilBelirle, locale, t } from "./i18n.js";
import tr from "./locales/tr.js";
import en from "./locales/en.js";

test("web her koşulda Türkçe kalır", () => {
  assert.equal(dilBelirle({ native: false, kayitli: "en", tarayiciDili: "en-US" }), "tr");
  assert.equal(dil(), "tr");
  assert.equal(locale(), "tr-TR");
});

test("native'de kayıtlı seçim cihaz dilinden önce gelir", () => {
  assert.equal(dilBelirle({ native: true, kayitli: "tr", tarayiciDili: "en-GB" }), "tr");
  assert.equal(dilBelirle({ native: true, kayitli: "en", tarayiciDili: "tr-TR" }), "en");
});

test("native'de kayıt yoksa cihaz diline bakar, Türkçe dışı her şey İngilizce", () => {
  assert.equal(dilBelirle({ native: true, tarayiciDili: "tr-TR" }), "tr");
  assert.equal(dilBelirle({ native: true, tarayiciDili: "TR" }), "tr");
  assert.equal(dilBelirle({ native: true, tarayiciDili: "de-DE" }), "en");
  assert.equal(dilBelirle({ native: true, kayitli: "fr", tarayiciDili: "" }), "en");
});

test("locale dil koduna karşılık gelir", () => {
  assert.equal(locale("tr"), "tr-TR");
  assert.equal(locale("en"), "en-US");
  assert.equal(locale("xx"), "tr-TR");
});

test("eksik anahtar Türkçeye, o da yoksa anahtarın kendisine düşer", () => {
  assert.equal(cevir("en", "__yok__"), "__yok__");
  const ilk = Object.keys(tr)[0];
  if (ilk) assert.equal(cevir("tr", ilk), tr[ilk]);
});

test("değişkenler yerine konur, tanımsız olanlar korunur", () => {
  assert.equal(cevir("tr", "Merhaba {ad}, {yok}", { ad: "Özer" }), "Merhaba Özer, {yok}");
  assert.equal(t("{n} borç", { n: 3 }), "3 borç");
});

test("İngilizce sözlükte Türkçede olmayan anahtar yok, değişkenler eşleşir", () => {
  const degiskenler = (m) => [...String(m).matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(",");
  for (const [anahtar, metin] of Object.entries(en)) {
    assert.ok(anahtar in tr, `tr.js'te eksik: ${anahtar}`);
    assert.equal(degiskenler(metin), degiskenler(tr[anahtar]), `değişken uyuşmazlığı: ${anahtar}`);
  }
});

test("Türkçe anahtarların tamamının İngilizce karşılığı var", () => {
  for (const anahtar of Object.keys(tr)) {
    assert.ok(anahtar in en, `en.js'te eksik: ${anahtar}`);
  }
});
