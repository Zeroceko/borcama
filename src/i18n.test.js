import test from "node:test";
import assert from "node:assert/strict";
import { cevir, cevirOgeler, dil, dilBelirle, locale, t } from "./i18n.js";
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

test("İngilizce sözlükte Türkçede olmayan anahtar ya da değişken yok", () => {
  // İngilizce yalnız native'de görünür; web'e özgü değişkenleri (ör. "tarayıcı")
  // kullanmayabilir ama Türkçede olmayan bir değişken isteyemez.
  const degiskenler = (m) => [...String(m).matchAll(/\{(\w+)\}/g)].map((x) => x[1]);
  for (const [anahtar, metin] of Object.entries(en)) {
    assert.ok(anahtar in tr, `tr.js'te eksik: ${anahtar}`);
    assert.equal(typeof metin, "string", `metin değil: ${anahtar}`);
    assert.ok(metin.trim(), `boş çeviri: ${anahtar}`);
    for (const ad of degiskenler(metin)) {
      assert.ok(degiskenler(tr[anahtar]).includes(ad), `${anahtar}: {${ad}} Türkçede yok`);
    }
  }
});

test("öğeli çeviri yer tutucuyu verilen değerle (öğe olabilir) değiştirir", () => {
  const oge = { tip: "b" };
  assert.deepEqual(cevirOgeler("tr", "{e} adresine yolladık.", { e: oge }), [oge, " adresine yolladık."]);
  assert.deepEqual(cevirOgeler("tr", "Önce {a}, sonra {yok}.", { a: 1 }), ["Önce ", 1, ", sonra ", "{yok}", "."]);
});

test("Türkçe anahtarların tamamının İngilizce karşılığı var", () => {
  for (const anahtar of Object.keys(tr)) {
    assert.ok(anahtar in en, `en.js'te eksik: ${anahtar}`);
  }
});

test("çevrilmiş ekranlarda kullanılan her anahtar sözlükte var", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const dosya of ["Onboarding.jsx", "Auth.jsx"]) {
    const kaynak = await readFile(new URL(`./${dosya}`, import.meta.url), "utf8");
    const anahtarlar = [
      ...kaynak.matchAll(/\bt(?:Ogeler)?\("([\w.]+)"/g),
      ...kaynak.matchAll(/anahtar=\{?"([\w.]+)"/g),
      ...kaynak.matchAll(/"((?:onboarding|auth)\.[\w.]+)"/g),
    ].map((m) => m[1]);
    assert.ok(anahtarlar.length > 0, dosya);
    for (const anahtar of anahtarlar) {
      assert.ok(anahtar in tr, `${dosya}: tr.js'te yok: ${anahtar}`);
      assert.ok(anahtar in en, `${dosya}: en.js'te yok: ${anahtar}`);
    }
  }
});
