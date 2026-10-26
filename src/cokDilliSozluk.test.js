import test from "node:test";
import assert from "node:assert/strict";
import en from "./locales/en.js";
import { cevir, dilSozlugunuYukle } from "./i18n.js";
import de from "./locales/de.js";
import fr from "./locales/fr.js";
import es from "./locales/es.js";
import it from "./locales/it.js";

const yerTutucular = (metin) => new Set(String(metin).match(/\{\w+\}/g) || []);

for (const [kod, sozluk] of Object.entries({ de, fr, es, it })) {
  test(`${kod} sözlüğünde her değer dolu ve yer tutucular İngilizceyle aynı`, () => {
    for (const [anahtar, metin] of Object.entries(sozluk)) {
      assert.equal(typeof metin, "string", `${kod}:${anahtar}`);
      assert.ok(metin.length > 0, `${kod}:${anahtar} boş`);
      assert.ok(anahtar in en, `${kod}:${anahtar} İngilizcede yok`);
      assert.deepEqual(yerTutucular(metin), yerTutucular(en[anahtar]), `${kod}:${anahtar}`);
    }
  });
}

test("yeni dil sözlüğü yüklenince o dil, yüklenmeden önce İngilizce kullanılır", async () => {
  assert.equal(cevir("de", "dil.degistir"), en["dil.degistir"]);
  await dilSozlugunuYukle("de");
  assert.equal(cevir("de", "dil.degistir"), de["dil.degistir"]);
});
