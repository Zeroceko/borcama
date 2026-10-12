import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const kaynak = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "App.jsx"), "utf8");
const parca = kaynak.slice(kaynak.indexOf("const VARSAYILAN_FAIZ_EK_HESAP"), kaynak.indexOf("const BOS_VERI"));
const ekHesaplariSirala = new Function(`${parca}; return ekHesaplariSirala;`)();

test("kapanan ek hesaplar listenin altına iner, sıra kendi içinde korunur", () => {
  const liste = [
    { id: "a", kullanilan: 5000, yapilanOdeme: 5000 },
    { id: "b", kullanilan: 3000, yapilanOdeme: 1000 },
    { id: "c", kullanilan: 0 },
    { id: "d", kullanilan: 800 },
  ];
  assert.equal(ekHesaplariSirala(liste).map((k) => k.id).join(","), "b,d,a,c");
  assert.equal(liste[0].id, "a");
});

test("ek hesap listesi görünümde sıralanır", () => {
  assert.match(kaynak, /kategori === "od"\s*\?\s*ekHesaplariSirala\(kayitlar\)/);
});
