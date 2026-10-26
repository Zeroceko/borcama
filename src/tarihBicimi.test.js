import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isoTarihGoster } from "./i18n.js";

test("web'de Türkçe arayüzde kayıt tarihleri bugünkü GG.AA.YYYY biçiminde kalır", () => {
  assert.equal(isoTarihGoster("2026-10-05"), "05.10.2026");
  assert.equal(isoTarihGoster("2026-10-05", { native: false, yerel: "tr-TR" }), "05.10.2026");
});

test("web'de diğer dillerde tarih seçili dilin yerel biçimine uyar (native ile aynı)", () => {
  assert.equal(isoTarihGoster("2026-10-05", { native: false, yerel: "en-US" }), "10/5/2026");
  assert.equal(isoTarihGoster("2026-10-05", { native: false, yerel: "de-DE" }), "5.10.2026");
});

test("native'de tarih seçili dilin yerel biçimine uyar", () => {
  assert.equal(isoTarihGoster("2026-10-05", { native: true, yerel: "en-US" }), "10/5/2026");
  assert.equal(isoTarihGoster("2026-10-05", { native: true, yerel: "tr-TR" }), "05.10.2026");
  assert.equal(isoTarihGoster("2026-10-05", { native: true, yerel: "de-DE" }), "5.10.2026");
  assert.equal(isoTarihGoster("geçersiz", { native: true, yerel: "en-US" }), "geçersiz");
});

test("gelir-gider, ekstre dönemi ve kredi ilk taksit tarihleri elle biçimlenmez", () => {
  const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(app, /\.split\("-"\)\.reverse\(\)\.join\("\."\)/);
});
