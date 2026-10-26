import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { tr } from "./locales/bolumler/borclar.js";

const appSource = fs.readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

test("krediler üst şeridi yalnız tek yeni kredi aksiyonu gösterir", () => {
  const stripStart = appSource.indexOf('<div className="bt-strip">');
  const stripEnd = appSource.indexOf('{kategori === "cards"', stripStart);
  const stripSource = appSource.slice(stripStart, stripEnd);

  assert.match(stripSource, /setKrediEklemeSecimiAcik\(true\)/);
  assert.match(stripSource, /t\("borclar\.serit\.yeniKredi"\)/);
  assert.equal(tr["borclar.serit.yeniKredi"], "Yeni kredi");
  assert.doesNotMatch(stripSource, /> Ödeme planı yükle|borclar\.krediYontem\.plan/);
  assert.doesNotMatch(stripSource, /"Yeni kredi ekle"/);
});

test("yeni kredi seçimi manuel giriş ve ödeme planı yükleme yollarını açar", () => {
  const modalStart = appSource.indexOf("{krediEklemeSecimiAcik && (");
  const modalEnd = appSource.indexOf("{krediPlaniYuklemePenceresi && (", modalStart);
  const modalSource = appSource.slice(modalStart, modalEnd);

  assert.match(modalSource, /t\("borclar\.krediYontem\.baslik"\)/);
  assert.equal(tr["borclar.krediYontem.baslik"], "Krediyi nasıl eklemek istersin?");
  assert.match(modalSource, /<strong>\{t\("borclar\.krediYontem\.manuel"\)\}<\/strong>/);
  assert.equal(tr["borclar.krediYontem.manuel"], "Manuel gir");
  assert.match(modalSource, /setForm\(\{ liste: "loans", veri: \{\} \}\)/);
  assert.match(modalSource, /<strong>\{t\("borclar\.krediYontem\.plan"\)\}<\/strong>/);
  assert.equal(tr["borclar.krediYontem.plan"], "Ödeme planı yükle");
  assert.match(modalSource, /setKrediPlaniYuklemePenceresi\(true\)/);
});
