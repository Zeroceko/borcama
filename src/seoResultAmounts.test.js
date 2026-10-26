import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const oku = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("araç sonuç tutarları satıra bölünmez, uzun tutarda yazı küçülür", async () => {
  const [sayfalar, stil] = await Promise.all([oku("./SeoPages.jsx"), oku("./SeoPages.css")]);
  assert.doesNotMatch(sayfalar, /<div className="seo-big-money"><Money/);
  assert.match(sayfalar, /function BuyukTutar\(\{ value \}\)/);
  assert.match(sayfalar, /"--karakter": turkLirasiFormatla\(value\)\.length/);
  assert.match(sayfalar, /<strong style=\{\{ "--karakter": karakterSayisi\(value\) \}\}>/);
  assert.match(stil, /\.seo-result\{container:seo-sonuc\/inline-size\}/);
  assert.match(stil, /\.seo-summary strong\{display:block;white-space:nowrap;overflow-wrap:normal;font-size:clamp\(11px,calc\(100cqi \/ \(var\(--karakter,10\) \* \.64\)\),20px\)\}/);
  assert.match(stil, /\.seo-big-money\{white-space:nowrap;font-size:min\(clamp\(38px,6vw,60px\),calc\(100cqi/);
  assert.match(stil, /@container seo-sonuc \(max-width:520px\)\{\.seo-summary\{grid-template-columns:1fr\}\}/);
});
