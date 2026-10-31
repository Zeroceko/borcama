import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  KULLANIM_OLAYLARI,
  ekstreEslesmeTuru,
  kullanimOlayiGecerliMi,
  sayilabilirOrtamMi,
} from "./kullanimOlaylari.js";

const kaynak = (yol) => readFile(new URL(yol, import.meta.url), "utf8");

test("yalnız listedeki olay ve ayrıntı kabul edilir", () => {
  assert.equal(kullanimOlayiGecerliMi("ekstre_okundu", "paylas"), true);
  assert.equal(kullanimOlayiGecerliMi("harcama_kaydedildi"), true);
  assert.equal(kullanimOlayiGecerliMi("harcama_kaydedildi", "kart"), false);
  assert.equal(kullanimOlayiGecerliMi("ekstre_okundu", "Garanti BBVA"), false);
  assert.equal(kullanimOlayiGecerliMi("odeme_kaydedildi", "1250.40"), false);
  assert.equal(kullanimOlayiGecerliMi("toString"), false);
  assert.equal(kullanimOlayiGecerliMi("borc_eklendi", "yok"), false);
});

test("ayrıntılar sunucudaki biçime uyar; olay listesi migration ile aynı", async () => {
  for (const ayrintilar of Object.values(KULLANIM_OLAYLARI))
    for (const a of ayrintilar) if (a !== null) assert.match(a, /^[a-z0-9_]{1,32}$/);
  const sql = await kaynak("../supabase/migrations/20261031120000_kullanim_istatistikleri.sql");
  const blok = sql.slice(sql.indexOf("olay text not null check (olay in ("), sql.indexOf("ayrinti text check"));
  const sqlOlaylari = [...blok.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual(sqlOlaylari, Object.keys(KULLANIM_OLAYLARI).sort());
});

test("geliştirme ve TestFlight sayılmaz", () => {
  assert.equal(sayilabilirOrtamMi(true, {}), true);
  assert.equal(sayilabilirOrtamMi(false, {}), false);
  assert.equal(sayilabilirOrtamMi(true, { borcamaOrtam: "testflight" }), false);
});

test("ekstre eşleşme türü kart bilgisi taşımaz", () => {
  const kart = { id: "k1" };
  assert.equal(ekstreEslesmeTuru("__new__", null), "yeni_kart");
  assert.equal(ekstreEslesmeTuru("k1", { card: kart, reason: "last4" }), "otomatik_son4");
  assert.equal(ekstreEslesmeTuru("k1", { card: kart, reason: "bank-details" }), "otomatik_banka");
  assert.equal(ekstreEslesmeTuru("k2", { card: kart, reason: "last4" }), "elle");
  assert.equal(ekstreEslesmeTuru("k2", null), "elle");
});

test("izin anahtarı varsayılan kapalı, yalnız hesaplı kullanıcıda ve uygulamada", async () => {
  const ayar = await kaynak("./KullanimIstatistigiAyari.jsx");
  assert.match(ayar, /if \(!nativeMi\) return null;/);
  const modul = await kaynak("./kullanimIstatistigi.js");
  assert.match(modul, /getItem\(IZIN_ANAHTARI\) === "evet"/);
  assert.match(modul, /!kullanimIzniVarMi\(\)\) return;/);
  const app = await kaynak("./App.jsx");
  assert.match(app, /\{!misafir && <KullanimIstatistigiAyari \/>\}/);
});
