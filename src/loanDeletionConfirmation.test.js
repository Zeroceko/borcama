import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tr } from "./locales/bolumler/borclar.js";
import { tr as ortak } from "./locales/bolumler/ortak.js";

const source = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

test("kredi silme düğmesi doğrudan silmek yerine onay penceresini açar", () => {
  assert.match(source, /kategori === "loans"[\s\S]{0,120}silmeOnayiAc\?\.\(meta\.liste, k\)/);
  assert.match(source, /t\("borclar\.krediSil\.baslik"\)/);
  assert.equal(tr["borclar.krediSil.baslik"], "Kredi kaydı silinsin mi?");
  assert.match(source, /t\("borclar\.krediSil\.evet"\)/);
  assert.equal(tr["borclar.krediSil.evet"], "Evet, krediyi sil");
  assert.match(source, /setSilinecekBorc\(null\)\}>\s*\{t\("ortak\.vazgec"\)\}/);
  assert.equal(ortak["ortak.vazgec"], "Vazgeç");
});

test("onaylanan kredi silme işlemi mevcut geri alınabilir silme yolunu kullanır", () => {
  assert.match(source, /sil\(silinecekBorc\.liste, silinecekBorc\.kayit\.id\);/);
  assert.match(source, /anahtar="borclar\.krediSil\.aciklama"/);
  assert.match(tr["borclar.krediSil.aciklama"], /Yanlışlıkla silersen son işlemlerden geri alabilirsin/);
});
