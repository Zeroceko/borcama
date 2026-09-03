import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const oku = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("CEO büyüme hunisi yalnız server-owned ve finansal ayrıntı içermeyen olaylardan üretilir", async () => {
  const [backoffice, dashboard] = await Promise.all([
    oku("../supabase/functions/backoffice/index.ts"),
    oku("./CeoDashboard.jsx"),
  ]);
  assert.match(backoffice, /const AKTIVASYON_OLAYLARI = \["card_added", "statement_added", "loan_added", "overdraft_added", "other_debt_added"\]/);
  assert.match(backoffice, /from\("activity_logs"\)\.select\("user_id,created_at"\)/);
  assert.match(backoffice, /from\("user_acquisition"\)/);
  assert.match(backoffice, /growth_funnel: buyumeHunisi/);
  assert.match(backoffice, /total_registered/);
  assert.match(backoffice, /used_7d/);
  assert.match(backoffice, /activated_total_observed/);
  const huni = backoffice.match(/async function buyumeHunisiIstatistikleri[\s\S]*?\n}\n\nDeno\.serve/)?.[0] || "";
  assert.doesNotMatch(huni, /select\([^)]*(?:metadata|value|email)/);
  assert.match(dashboard, /Ölçülmedi \/ eski hesap/);
  assert.match(dashboard, /Kişisel veya finansal ayrıntı gösterilmez/);
});
