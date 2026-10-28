import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

// Satır içi form açıkken gizlenir (formun alanı sanılmasın). Masaüstünde
// (≥1024, web) form sağ panelde açıldığı için liste ve seçici yerinde kalır
// (docs/web-akis-direktifi.md B11): satirIci = acik && !masaustu.
test("kart ve kredi dönem seçicisi satır içi form açıkken gizlenir", () => {
  assert.match(source, /const satirIci = acik && !masaustu;/);
  for (const baslik of ["borclar.donem.ekstreBaslik", "borclar.donem.krediBaslik"]) {
    const konum = source.indexOf(`<strong>{t("${baslik}")}</strong>`);
    assert.ok(konum > 0, baslik);
    const kosul = source.lastIndexOf("{", source.lastIndexOf('<div className="bt-borc-donem-satiri">', konum));
    const satir = source.slice(kosul, source.indexOf("\n", kosul));
    assert.match(satir, /^\{!satirIci && kategori === "(cards|loans)"/, baslik);
  }
});
