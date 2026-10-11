import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("yeni kart tek formda: 3 zorunlu alan, ayrıntılar isteğe bağlı, kart ve bu ayın ekstresi birlikte oluşur", async () => {
  const app = await readFile(new URL("./App.jsx", import.meta.url), "utf8");
  const yeniKart = app.slice(app.indexOf("] : [\n      { k: \"banka\", e: \"Banka\", t: \"text\", z: true },\n      { k: \"yeniDonemEkstreBorcu\""), app.indexOf("    loans: ["));
  assert.equal((yeniKart.match(/z: true/g) || []).length, 3);
  assert.match(yeniKart, /k: "limit".*ek: true/);
  assert.match(yeniKart, /k: "kesimGunu".*ek: true/);
  assert.match(app, /Daha fazla bilgi \(isteğe bağlı\)/);
  assert.match(app, /kategori === "cards" && !f\.id && String\(f\.yeniDonemEkstreBorcu \?\? ""\)\.trim\(\) !== ""/);
  assert.match(app, /ekstreAyi: guncelEkstreAyi,\n        yapilanOdeme: "0",/);
  // mevcut kart düzenleme formu değişmedi
  assert.match(app, /cards: form\?\.veri\?\.id \? \[\n      \{ k: "banka", e: "Banka", t: "text", z: true \},\n      \{ k: "ad", e: "Kart adı \(Bonus, World…\)", t: "text", z: true \},/);
});

test("ilk plan kurulumu bitene kadar Bugün dışındaki ekranlarda sıradaki adım şeridi görünür", async () => {
  const app = await readFile(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /function SiradakiAdimSeridi\(\{ durum, onBaslat \}\)/);
  assert.match(app, /anaSekme !== "ozet" && \(\(\) => \{\n\s+const kurulum = getActivationState\(veri\);/);
  assert.match(app, /!kurulum\.tamam && kurulum\.siradaki && kurulum\.tamamlanan > 0/);
});
