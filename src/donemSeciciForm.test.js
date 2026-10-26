import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

test("kart ve kredi dönem seçicisi form açıkken gizlenir", () => {
  for (const baslik of ["borclar.donem.ekstreBaslik", "borclar.donem.krediBaslik"]) {
    const konum = source.indexOf(`<strong>{t("${baslik}")}</strong>`);
    assert.ok(konum > 0, baslik);
    const kosul = source.lastIndexOf("{", source.lastIndexOf('<div className="bt-borc-donem-satiri">', konum));
    const satir = source.slice(kosul, source.indexOf("\n", kosul));
    assert.match(satir, /^\{!acik && kategori === "(cards|loans)"/, baslik);
  }
});
