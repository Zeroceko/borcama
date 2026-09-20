import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const oku = () => readFile(new URL("./LandingAlt.jsx", import.meta.url), "utf8");

test("kontrol landing kısa borç anlatısını ve tek karar akışını korur", async () => {
  const landing = await oku();

  assert.match(landing, /Paran nereye gidiyor\?/);
  assert.match(landing, /la-mark-wrap/);
  assert.match(landing, /Her ay üç cevabın olsun/);
  assert.match(landing, /Banka şifresi yok/);
  assert.match(landing, /İlk 30 gün Pro hediye\. Kart gerekmez\./);
  assert.match(landing, /Gerisini tablonda gör/);

  assert.doesNotMatch(landing, /Tek rakam değil/);
  assert.doesNotMatch(landing, /Borç azalır/);
  assert.doesNotMatch(landing, /TOPLAM YAKLAŞIK VARLIK/);
});
