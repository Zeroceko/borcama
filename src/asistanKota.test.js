import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tr as asistanTr } from "./locales/bolumler/asistan.js";

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
  assert.match(app, /t\("asistan\.upsell\.buton"\)/);
  assert.equal(asistanTr["asistan.upsell.buton"], "Pro'yu aktif et");
  assert.match(app, /modelDurumu\.kota\?\.limit \? modelDurumu\.kota\.limit >= ASISTAN_PRO_SORU : proAktif/);
});

test("Pro günlük 20 soru, ücretsiz kullanımdan ayrı sayılır", () => {
  const ayri = readFileSync(resolve(kok, "supabase/migrations/20261014180000_financial_assistant_separate_pro_quota.sql"), "utf8");
  assert.match(ayri, /add column if not exists pro_question_count/);
  assert.match(ayri, /question_limit := case when pro then 20 else 5 end;/);
  assert.match(ayri, /pro_question_count < question_limit/);
  assert.match(ayri, /question_count - public\.financial_assistant_daily_usage\.pro_question_count < question_limit/);
});

test("Pro asistanda aylık 80 soru sınırı; dolunca aylık mesaj", () => {
  const ay = readFileSync(resolve(kok, "supabase/migrations/20261027120000_financial_assistant_pro_monthly_cap.sql"), "utf8");
  assert.match(ay, /monthly_limit constant integer := 80;/);
  assert.match(ay, /'period', 'month'/);
  assert.match(app, /const ASISTAN_PRO_AYLIK_SORU = 80;/);
  assert.match(app, /error\.quota\?\.period === "month"/);
});
