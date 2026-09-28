import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

test("kredi silme düğmesi doğrudan silmek yerine onay penceresini açar", () => {
  assert.match(source, /kategori === "loans"[\s\S]{0,120}silmeOnayiAc\?\.\(meta\.liste, k\)/);
  assert.match(source, /Kredi kaydı silinsin mi\?/);
  assert.match(source, /Evet, krediyi sil/);
  assert.match(source, /Vazgeç/);
});

test("onaylanan kredi silme işlemi mevcut geri alınabilir silme yolunu kullanır", () => {
  assert.match(source, /sil\(silinecekBorc\.liste, silinecekBorc\.kayit\.id\);/);
  assert.match(source, /Yanlışlıkla silersen son işlemlerden geri alabilirsin/);
});
