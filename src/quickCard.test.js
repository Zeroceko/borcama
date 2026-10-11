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

test("rehber şeridi uygulamaya bağlı; kurulumda Bugün'de ve ilk adımdan önce gizli", async () => {
  const app = await readFile(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /function RehberSeridi\(\{ oneri, onAksiyon, onErtele, onKapat \}\)/);
  assert.match(app, /rehberDurumu\(veri, \{ simdi: new Date\(\), yaklasan \}\)/);
  assert.match(app, /rehber\.asama === "kurulum" && \(anaSekme === "ozet" \|\| rehber\.kurulum\.tamamlanan === 0\)/);
  assert.match(app, /oneri\.tur === "mezuniyet"\) return ayarKaydet\(\{ rehber: rehberiMezunEt/);
});
