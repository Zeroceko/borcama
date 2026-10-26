import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tr } from "./locales/bolumler/borclar.js";
import { ekHesapFaizOrani } from "./bolgeKurallari.js";

const kaynak = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "App.jsx"), "utf8");
const parca = kaynak.slice(kaynak.indexOf("function ekHesapHesabi"), kaynak.indexOf("const BOS_VERI"));
const ekHesaplariAyir = new Function("ekHesapFaizOrani", `${parca}; return ekHesaplariAyir;`)(ekHesapFaizOrani);

test("kapanan ek hesaplar ayrı gruba ayrılır, sıra kendi içinde korunur", () => {
  const { acik, kapanan } = ekHesaplariAyir([
    { id: "a", kullanilan: 5000, yapilanOdeme: 5000 },
    { id: "b", kullanilan: 3000, yapilanOdeme: 1000 },
    { id: "c", kullanilan: 0 },
    { id: "d", kullanilan: 800 },
  ]);
  assert.equal(acik.map((k) => k.id).join(","), "b,d");
  assert.equal(kapanan.map((k) => k.id).join(","), "a,c");
});

test("kapanan ek hesaplar 'Kapattığın borçlar' başlığı altında gösterilir", () => {
  assert.match(kaynak, /kategori === "od"\s*\?\s*ekHesaplariAyir\(kayitlar\)\.acik/);
  assert.match(kaynak, /id="kapanan-ek-hesaplar-baslik">\{t\("borclar\.kapanan\.baslik"\)\}</);
  assert.equal(tr["borclar.kapanan.baslik"], "Kapattığın borçlar");
  assert.match(kaynak, /kapananEkHesaplar\.map\(borcSatiri\)/);
});
