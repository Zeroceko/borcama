import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import tr from "./locales/tr.js";

test("yeni kart tek formda: 3 zorunlu alan, ayrıntılar isteğe bağlı, kart ve bu ayın ekstresi birlikte oluşur", async () => {
  const app = await readFile(new URL("./App.jsx", import.meta.url), "utf8");
  const bas = app.indexOf("] : [\n      { k: \"banka\", e: t(\"ortak.banka\"), t: \"text\", z: true },\n      { k: \"yeniDonemEkstreBorcu\"");
  const yeniKart = app.slice(bas, app.indexOf("    loans: ", bas));
  assert.equal((yeniKart.match(/z: true/g) || []).length, 3);
  assert.match(yeniKart, /k: "limit".*ek: true/);
  assert.match(yeniKart, /k: "kesimGunu".*ek: true/);
  assert.match(app, /<summary>\{t\("borclar\.alan\.dahaFazla"\)\}<\/summary>/);
  assert.equal(tr["borclar.alan.dahaFazla"], "Daha fazla bilgi (isteğe bağlı)");
  assert.match(app, /kategori === "cards" && !f\.id && String\(f\.yeniDonemEkstreBorcu \?\? ""\)\.trim\(\) !== ""/);
  assert.match(app, /ekstreAyi: guncelEkstreAyi,\n        yapilanOdeme: "0",/);
  // mevcut kart düzenleme formu değişmedi
  assert.match(app, /cards: form\?\.veri\?\.id \? \[\n      \{ k: "banka", e: t\("ortak\.banka"\), t: "text", z: true \},\n      \{ k: "ad", e: t\("borclar\.alan\.kartAdi"\), t: "text", z: true \},/);
  assert.equal(tr["ortak.banka"], "Banka");
  assert.equal(tr["borclar.alan.kartAdi"], "Kart adı (Bonus, World…)");
});

test("rehber şeridi uygulamaya bağlı; kurulumda Bugün'de ve ilk adımdan önce gizli", async () => {
  const app = await readFile(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /function RehberSeridi\(\{ oneri, onAksiyon, onErtele, onKapat \}\)/);
  assert.match(app, /rehberDurumu\(veri, \{ simdi: new Date\(\), yaklasan: yaklasan\.map\(\(o\) => \(\{ \.\.\.o, eklendi: kaynakKayit\(o\)\?\.eklendi \}\)\) \}\)/);
  assert.match(app, /rehber\.asama === "kurulum" && \(anaSekme === "ozet" \|\| rehber\.kurulum\.tamamlanan === 0\)/);
  assert.match(app, /oneri\.tur === "mezuniyet"\) return ayarKaydet\(\{ rehber: rehberiMezunEt/);
  // form açıkken rehber gizlenir; seçilen borç türünün formu doğrudan açılır
  assert.match(app, /if \(form\) return null;/);
  assert.match(app, /setForm\(\{ liste: KATEGORI_META\[secenek\]\?\.liste \|\| "cards", veri: \{\} \}\)/);
});

test("hızlı kredide kalan borç aylık taksit × kalan taksitten hesaplanır", async () => {
  const app = await readFile(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /const hizliKredi = !f\.id && !String\(f\.toplamTaksit \?\? ""\)\.trim\(\) && !String\(f\.odenenTaksit \?\? ""\)\.trim\(\);/);
  assert.match(app, /kalanBorc: Math\.round\(\(\+f\.taksit \|\| 0\) \* \(\+f\.kalanTaksit \|\| 0\) \* 100\) \/ 100/);
});

test("rehberden sabit gider formu doğrudan açılır", async () => {
  const app = await readFile(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /if \(oneri\.id === "sabit-gider"\) \{\n      setSekme\("sabit-giderler"\);\n      setForm\(\{ liste: "expenses", veri: \{\} \}\);/);
});
