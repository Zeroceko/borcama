import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const oku = (yol) => readFile(new URL(yol, import.meta.url), "utf8");

test("ücretli abonelikte elle Pro uzatma reddedilir; ödeme bağı silinmez", async () => {
  const edge = await oku("../supabase/functions/backoffice/index.ts");
  assert.match(edge, /select\("pro_expires_at,pro_purchase_id,source"\)/);
  assert.match(edge, /PAID_SUBSCRIPTION_ACTIVE/);
});

test("eski manuel kampanyalar gönderilemez ve CRM'de görünmez", async () => {
  const [edge, marketing] = await Promise.all([oku("../supabase/functions/backoffice/index.ts"), oku("./Marketing.jsx")]);
  for (const aksiyon of ["send_trial_announcement", "send_features_announcement", "send_release_133_announcement"]) {
    assert.match(edge, new RegExp(`action === "${aksiyon}"\\) \\{\\n      return new Response\\(JSON.stringify\\(\\{ error: "CAMPAIGN_RETIRED" \\}\\)`));
    assert.doesNotMatch(marketing, new RegExp(`action:"${aksiyon}"`));
  }
  assert.match(marketing, /\["draft","paused","archived"\]\.includes\(c\.status\)/);
  assert.match(marketing, /slug:"loan-closed"/);
});

test("CRM alanında Google etiketleri ve çerez bandı yüklenmez", async () => {
  const main = await oku("./main.jsx");
  assert.match(main, /if \(!nativeMi && !crmAlanindaMi\) googleAdsBaslat\(\);/);
  assert.match(main, /!nativeMi && !crmAlanindaMi && <GoogleAdsConsent \/>/);
});

test("Pro tanımlama ve davet onayı onay ister", async () => {
  const [ceo, backoffice] = await Promise.all([oku("./CeoDashboard.jsx"), oku("./Backoffice.jsx")]);
  assert.match(ceo, /window\.confirm\(u\.pro_active\?/);
  assert.match(backoffice, /window\.confirm\("Bu davet ödülü onaylansın mı\?/);
  assert.match(backoffice, /window\.confirm\("Bu kullanıcıya 30 gün Pro tanımlansın mı\?"\)/);
});
