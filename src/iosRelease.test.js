import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const kok = new URL("../", import.meta.url);
const oku = (yol) => readFile(new URL(yol, kok), "utf8");

test("AASA, Vercel header ve iOS entitlement ayni uygulamayi dogrular", async () => {
  const [aasaHam, vercelHam, entitlement, proje] = await Promise.all([
    oku("public/.well-known/apple-app-site-association"),
    oku("vercel.json"),
    oku("ios/App/App/App.entitlements"),
    oku("ios/App/App.xcodeproj/project.pbxproj"),
  ]);
  const aasa = JSON.parse(aasaHam);
  const vercel = JSON.parse(vercelHam);
  assert.equal(aasa.applinks.details[0].appID, "2SH6N4AK3P.com.borcama.app");
  assert.ok(aasa.applinks.details[0].paths.includes("/reset-password"));
  assert.ok(vercel.headers.some((x) => x.source === "/.well-known/apple-app-site-association"
    && x.headers.some((h) => h.key === "Content-Type" && h.value === "application/json")));
  assert.match(entitlement, /applinks:borcama\.com/);
  assert.match(proje, /CODE_SIGN_ENTITLEMENTS = App\/App\.entitlements/);
});

test("native kabuk Google etiketini yuklemez ve privacy manifest tracking kapali kalir", async () => {
  const [main, manifest, proje] = await Promise.all([
    oku("src/main.jsx"),
    oku("ios/App/App/PrivacyInfo.xcprivacy"),
    oku("ios/App/App.xcodeproj/project.pbxproj"),
  ]);
  assert.match(main, /if \(!nativeMi\) googleAdsBaslat\(\)/);
  assert.match(main, /\{!nativeMi && <GoogleAdsConsent \/>\}/);
  assert.match(manifest, /<key>NSPrivacyTracking<\/key>\s*<false\/>/);
  assert.match(manifest, /NSPrivacyCollectedDataTypeOtherFinancialInfo/);
  assert.match(manifest, /NSPrivacyAccessedAPICategoryUserDefaults/);
  assert.match(proje, /PrivacyInfo\.xcprivacy in Resources/);
});

test("RevenueCat hakki istemci tarihinden degil sunucu dogrulamasindan gelir", async () => {
  const [istemci, satinAlma, fonksiyon, webhook, ayar] = await Promise.all([
    oku("src/revenuecatSync.js"),
    oku("src/App.jsx"),
    oku("supabase/functions/shopier-entitlement/index.ts"),
    oku("supabase/functions/revenuecat-webhook/index.ts"),
    oku("supabase/config.toml"),
  ]);
  assert.match(istemci, /action: "sync_revenuecat_pro"/);
  assert.doesNotMatch(istemci, /expiresAt/);
  assert.doesNotMatch(satinAlma, /activate_revenuecat_pro/);
  assert.doesNotMatch(fonksiyon, /activate_revenuecat_pro/);
  assert.match(fonksiyon, /api\.revenuecat\.com\/v1\/subscribers/);
  assert.match(webhook, /REVENUECAT_WEBHOOK_AUTHORIZATION/);
  assert.match(webhook, /REVENUECAT_WEBHOOK_SIGNING_SECRET/);
  assert.match(webhook, /REVENUECAT_IOS_APP_ID/);
  assert.match(webhook, /ortam === "PRODUCTION" && store === "APP_STORE"/);
  assert.ok(
    satinAlma.indexOf("await revenueCatProHakkiniSenkronizeEt()") <
      satinAlma.indexOf("proAktif: true"),
    "Pro arayuzu sunucu dogrulamasindan once aktif olmamali",
  );
  assert.match(ayar, /\[functions\.revenuecat-webhook\]\s*verify_jwt = false/);
});

test("App Store ikonu 1024px ve opak PNG olarak tutulur", async () => {
  const icerik = await readFile(new URL(
    "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png",
    kok,
  ));
  assert.deepEqual([...icerik.subarray(12, 16)], [73, 72, 68, 82]);
  assert.equal(icerik.readUInt32BE(16), 1024);
  assert.equal(icerik.readUInt32BE(20), 1024);
  assert.equal(icerik[25], 2, "PNG renk tipi RGB (alfa kanalsiz) olmali");
});

test("Supabase auth native donus yollarini izin listesinde tutar", async () => {
  const ayar = await oku("supabase/config.toml");
  for (const yol of ["login", "welcome", "summary", "reset-password"])
    assert.match(ayar, new RegExp(`https://borcama\\.com/${yol}`));
});
