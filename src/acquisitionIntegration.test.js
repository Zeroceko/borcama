import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const oku = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("edinim kaydı kullanıcı metadata'sı yerine server-owned tabloya sabitlenir", async () => {
  const [migration, backoffice, auth] = await Promise.all([
    oku("../supabase/migrations/20260902183000_funnel_source_conversions.sql"),
    oku("../supabase/functions/backoffice/index.ts"),
    oku("./Auth.jsx"),
  ]);
  assert.match(migration, /create table if not exists public\.user_acquisition/);
  assert.match(migration, /after insert on auth\.users/);
  assert.match(migration, /on conflict \(user_id\) do nothing/);
  assert.match(migration, /revoke all on public\.user_acquisition from public, anon, authenticated/);
  assert.match(backoffice, /from\("user_acquisition"\)/);
  assert.doesNotMatch(backoffice, /meta\.funnel_source/);
  assert.doesNotMatch(auth, /funnel_source:/);
  assert.doesNotMatch(auth, /funnel_click_id:/);
});

test("kaynak raporu adımları aynı session_id kohortunda birleştirir", async () => {
  const migration = await oku("../supabase/migrations/20260902183000_funnel_source_conversions.sql");
  assert.match(migration, /distinct on \(ae\.session_id\)/);
  assert.match(migration, /join event_steps e using \(session_id\)/);
  assert.match(migration, /left join account_steps a using \(session_id\)/);
  assert.match(migration, /where f\.first_touch_at >= p_since/);
  assert.doesNotMatch(migration, /raw_user_meta_data ->> 'funnel_source'/);
});

test("analytics alımı session tokenı ve atomik oran sınırı ister", async () => {
  const [edge, migration, client] = await Promise.all([
    oku("../supabase/functions/analytics-event/index.ts"),
    oku("../supabase/migrations/20260902183000_funnel_source_conversions.sql"),
    oku("./funnelAnalytics.js"),
  ]);
  assert.match(edge, /SESSION_TOKEN_REQUIRED/);
  assert.match(edge, /sessionImzasi/);
  assert.match(edge, /record_analytics_event/);
  assert.match(migration, /current_count > 1200/);
  assert.match(migration, /ANALYTICS_RATE_LIMITED/);
  assert.match(client, /borcama:funnel-session-token/);
});

test("ham reklam tıklama kimliği yeni analytics satırına yazılmaz", async () => {
  const [edge, migration] = await Promise.all([
    oku("../supabase/functions/analytics-event/index.ts"),
    oku("../supabase/migrations/20260902183000_funnel_source_conversions.sql"),
  ]);
  assert.match(edge, /p_paid_click: Boolean/);
  assert.doesNotMatch(edge, /click_id: metin/);
  assert.match(migration, /'', coalesce\(p_paid_click, false\), p_plan/);
});

test("PMax kontrol hunisi deney exposure olmadan yalnız ilk temas kohortunu sayar", async () => {
  const [migration, backoffice, analytics] = await Promise.all([
    oku("../supabase/migrations/20260905110000_pmax_control_funnel.sql"),
    oku("../supabase/functions/backoffice/index.ts"),
    oku("./Analytics.jsx"),
  ]);
  assert.match(migration, /admin_pmax_control_funnel/);
  assert.match(migration, /select distinct on \(ae\.session_id\)[\s\S]+from public\.analytics_events ae[\s\S]+pmax_sessions as/);
  assert.match(migration, /f\.source = 'google'[\s\S]+f\.medium = 'cpc'[\s\S]+f\.campaign = 'tr_pmax_borcama'/);
  assert.match(migration, /first_debt_or_statement/);
  assert.doesNotMatch(migration, /experiment_assignment|experiment_variant|experiment_id/);
  assert.match(backoffice, /admin_pmax_control_funnel/);
  assert.match(analytics, /PMax kontrol hunisi/);
  assert.match(migration, /al\.created_at >= f\.first_touch_at/);
  assert.doesNotMatch(migration, /ua\.first_touch_at/);
});

test("LANDING-002 mevcut ve yeni tam sayfayı ayrı ölçer; LANDING-001 tarihsel kalır", async () => {
  const [landing, experiment, main, client, edge, historicalMigration, migration, backoffice, analytics] = await Promise.all([
    oku("./LandingGrowth.jsx"),
    oku("./landingExperiment.js"),
    oku("./main.jsx"),
    oku("./funnelAnalytics.js"),
    oku("../supabase/functions/analytics-event/index.ts"),
    oku("../supabase/migrations/20260905123000_landing_experiment.sql"),
    oku("../supabase/migrations/20260908100000_landing_002_full_page_experiment.sql"),
    oku("../supabase/functions/backoffice/index.ts"),
    oku("./Analytics.jsx"),
  ]);
  assert.match(experiment, /LANDING_DENEYI = "landing-002"/);
  assert.match(experiment, /LANDING_DENEYI_AKTIF = true/);
  assert.match(landing, /Örnek hesabı incele/);
  assert.match(landing, /\/demo/);
  assert.doesNotMatch(landing, /experiment_id|experiment_variant|landingDeneyiAta/);
  assert.match(main, /LandingControl/);
  assert.match(main, /LandingVariant/);
  assert.match(main, /experiment\.experiment_variant === "variant"/);
  assert.match(client, /aktifLandingDeneyiOku/);
  assert.match(edge, /"landing-001", "landing-002"/);
  assert.match(historicalMigration, /experiment_id = 'landing-001'/);
  assert.match(migration, /admin_landing_experiment_funnel/);
  assert.match(migration, /experiment_id in \('', 'landing-001', 'landing-002'\)/);
  assert.match(migration, /experiment_id = 'landing-002'/);
  assert.match(migration, /experiment_variant in \('control', 'variant'\)/);
  assert.match(backoffice, /admin_landing_experiment_funnel/);
  assert.match(analytics, /LANDING-002 · Tam sayfa deneyi/);
});

test("mevduat aracı sonuçtan ürüne güvenli ve ölçülebilir bir köprü kurar", async () => {
  const [seo, client, edge, migration, backoffice, analytics, auth, prerender] = await Promise.all([
    oku("./SeoPages.jsx"),
    oku("./funnelAnalytics.js"),
    oku("../supabase/functions/analytics-event/index.ts"),
    oku("../supabase/migrations/20260905180000_deposit_product_bridge.sql"),
    oku("../supabase/functions/backoffice/index.ts"),
    oku("./Analytics.jsx"),
    oku("./Auth.jsx"),
    oku("../scripts/prerender-seo.mjs"),
  ]);
  assert.match(seo, /deposit_result_view/);
  assert.match(seo, /deposit_product_click/);
  assert.match(seo, /redirect=%2Fassets/);
  assert.match(client, /deposit_result_view/);
  assert.match(client, /kayitSirasi/);
  assert.match(edge, /deposit_product_click/);
  assert.match(migration, /admin_deposit_tool_funnel/);
  assert.match(migration, /al\.event_type = 'asset_added'/);
  assert.doesNotMatch(migration, /(?:activity_logs|kv_store)\.(?:metadata|value)|select\([^)]*email/);
  assert.match(backoffice, /admin_deposit_tool_funnel/);
  assert.match(analytics, /Mevduat aracı → Borcama hunisi/);
  assert.match(auth, /kayitModu[\s\S]+sorguYonlendirmesi \|\| "\/summary"/);
  assert.match(prerender, /Tek hesaplamadan bütün finansal tabloya/);
});
