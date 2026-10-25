import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const appSource = fs.readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

test("krediler üst şeridi yalnız tek yeni kredi aksiyonu gösterir", () => {
  const stripStart = appSource.indexOf('<div className="bt-strip">');
  const stripEnd = appSource.indexOf('{kategori === "cards"', stripStart);
  const stripSource = appSource.slice(stripStart, stripEnd);

  assert.match(stripSource, /setKrediEklemeSecimiAcik\(true\)/);
  assert.match(stripSource, /"Yeni kredi"/);
  assert.doesNotMatch(stripSource, /> Ödeme planı yükle/);
  assert.doesNotMatch(stripSource, /"Yeni kredi ekle"/);
});

test("yeni kredi seçimi manuel giriş ve ödeme planı yükleme yollarını açar", () => {
  const modalStart = appSource.indexOf("{krediEklemeSecimiAcik && (");
  const modalEnd = appSource.indexOf("{krediPlaniYuklemePenceresi && (", modalStart);
  const modalSource = appSource.slice(modalStart, modalEnd);

  assert.match(modalSource, /Krediyi nasıl eklemek istersin\?/);
  assert.match(modalSource, /<strong>Manuel gir<\/strong>/);
  assert.match(modalSource, /setForm\(\{ liste: "loans", veri: \{\} \}\)/);
  assert.match(modalSource, /<strong>Ödeme planı yükle<\/strong>/);
  assert.match(modalSource, /setKrediPlaniYuklemePenceresi\(true\)/);
});
