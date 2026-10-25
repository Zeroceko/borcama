import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const oku = (yol) => readFile(new URL(yol, import.meta.url), "utf8");
const YENI_OLAYLAR = ["landing_cta_click", "landing_scroll_half", "content_product_click"];

test("yeni ölçüm olayları istemci, Edge Function ve veritabanında aynı", async () => {
  const [client, edge, migration] = await Promise.all([
    oku("./funnelAnalytics.js"),
    oku("../supabase/functions/analytics-event/index.ts"),
    oku("../supabase/migrations/20261010160000_measurement_content_bridge.sql"),
  ]);
  for (const ad of YENI_OLAYLAR) {
    assert.match(client, new RegExp(`"${ad}"`));
    assert.match(edge, new RegExp(`"${ad}"`));
    assert.match(migration, new RegExp(`'${ad}'`));
  }
});

test("bot filtresi istemci ve sunucuda aynı deseni kullanır", async () => {
  const [nav, edge] = await Promise.all([oku("./funnelNavigation.js"), oku("../supabase/functions/analytics-event/index.ts")]);
  const desen = (metin) => metin.match(/\/bot\|crawl[^/]+\/i/)?.[0];
  assert.ok(desen(nav));
  assert.equal(desen(nav), desen(edge));
  assert.match(edge, /ignored: true/);
});

test("sözlük, rehber ve borç araçları ürüne ölçülen bir köprü kurar", async () => {
  const seo = await oku("./SeoPages.jsx");
  for (const id of ["sozluk-sonraki-adim", "rehber-sonraki-adim", "asgari-sonraki-adim", "kredi-sonraki-adim", "borc-plani-sonraki-adim", "takvim-sonraki-adim"])
    assert.match(seo, new RegExp(`id="${id}"`));
  assert.match(seo, /funnelTiklamasiKaydedipGit\(olay, "content_product_click"\)/);
  assert.match(seo, /funnelTiklamasiKaydedipGit\(olay, "debt_payoff_product_click"\)/);
  assert.doesNotMatch(seo, /UrunKoprusu[^;]*(borc|tutar|value)=\{/);
});

test("landing CTA tıklaması ve kaydırma ölçülür", async () => {
  const [landing, olcum] = await Promise.all([oku("./LandingAlt.jsx"), oku("./landingMeasurement.js")]);
  assert.match(landing, /landingOlcumunuBaslat\(kok\.current\)/);
  assert.match(olcum, /a\[href\^="\/register"\]/);
  assert.match(olcum, /"landing_cta_click"/);
  assert.match(olcum, /"landing_scroll_half"/);
});
