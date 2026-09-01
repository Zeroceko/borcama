import test from "node:test";
import assert from "node:assert/strict";

import {
  googleDonusumuRaporlanabilirMi,
  googleOlcumUrliniTemizle,
} from "./googleAds.js";

test("Google ölçüm URL'sinde yalnız kampanya parametreleri kalır", () => {
  const sonuc = googleOlcumUrliniTemizle(
    "https://www.borcama.com/auth?code=gizli&email=test%40example.com&utm_source=google&utm_medium=cpc&gclid=abc123&plan=annual#access_token=gizli",
  );

  assert.equal(
    sonuc,
    "https://www.borcama.com/auth?utm_source=google&utm_medium=cpc&gclid=abc123&plan=annual",
  );
});

test("doğrulama ve oturum parametreleri kampanya bilgisi yoksa tamamen temizlenir", () => {
  const sonuc = googleOlcumUrliniTemizle(
    "/summary?token=secret&refresh_token=secret&redirect=%2Fsummary#session",
  );

  assert.equal(sonuc, "https://www.borcama.com/summary");
});

test("sandbox satın almaları canlı Google dönüşümü olarak raporlanmaz", () => {
  assert.equal(googleDonusumuRaporlanabilirMi({ transactionId: "live-1" }), true);
  assert.equal(
    googleDonusumuRaporlanabilirMi({ transactionId: "sandbox-1", isSandbox: true }),
    false,
  );
  assert.equal(googleDonusumuRaporlanabilirMi({ isSandbox: false }), false);
});
