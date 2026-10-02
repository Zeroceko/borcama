import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("asgari ödeme bilgilendirmesi resmî kaynak ve doğru eşikle hazırlanır", () => {
  const template = read("../supabase/functions/_shared/borcama-email.ts");
  const preview = read("../public/kredi-karti-asgari-odeme-email-preview.html");
  for (const content of [template, preview]) {
    assert.match(content, /100\.000 TL ve altı/);
    assert.match(content, /%20|yüzde 20/);
    assert.match(content, /%40|yüzde 40/);
    assert.match(content, /DokumanGetir\/1349/);
    assert.match(content, /bankanın güncel ekstr/);
  }
});

test("kampanya Marketing ekranında tek seferlik güvenli gönderime bağlanır", () => {
  const migration = read("../supabase/migrations/20261002230000_credit_card_minimum_campaign.sql");
  const marketing = read("./Marketing.jsx");
  const backoffice = read("../supabase/functions/backoffice/index.ts");
  assert.match(migration, /credit-card-minimum-2026-10/);
  assert.match(migration, /'manual',\s*'active'/s);
  assert.match(marketing, /send_credit_card_minimum_update/);
  assert.match(marketing, /kredi-karti-asgari-odeme-email-preview\.html/);
  assert.match(backoffice, /marketing_opt_out/);
  assert.match(backoffice, /\["bounced", "complained"\]/);
  assert.match(backoffice, /asgari_odeme_2026_10/);
});
