import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const kok = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(resolve(kok, "src/App.jsx"), "utf8");
const migration = readFileSync(resolve(kok, "supabase/migrations/20261014120000_financial_assistant_free_limit_5.sql"), "utf8");

test("ücretsiz plan günde 5, Pro günde 20 asistan sorusu", () => {
  assert.match(migration, /question_limit integer := 5;/);
  assert.match(migration, /question_limit := 20;/);
  assert.match(app, /const ASISTAN_UCRETSIZ_SORU = 5;/);
  assert.match(app, /const ASISTAN_PRO_SORU = 20;/);
});

test("ücretsiz hak bitince Pro'yu aktif et butonu çıkar; plan etiketi sunucu limitinden okunur", () => {
  assert.match(app, /!asistanProKotasi && proAc && modelDurumu\.kota && modelDurumu\.kota\.remaining <= 0/);
  assert.match(app, /Pro'yu aktif et/);
  assert.match(app, /modelDurumu\.kota\?\.limit \? modelDurumu\.kota\.limit >= ASISTAN_PRO_SORU : proAktif/);
});
