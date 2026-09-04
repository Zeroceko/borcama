import test from "node:test";
import assert from "node:assert/strict";

import {
  googleDonusumuRaporlanabilirMi,
  googleKayitDonusumuRaporlanabilirMi,
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

test("kayıt dönüşümü yalnız doğrulanmış ve uygulama kaynaklı hesapta raporlanabilir", () => {
  const metadata = {
    borcama_registration_event_id: "registration-1",
    borcama_registration_created_at: "2026-09-04T08:00:00.000Z",
  };
  assert.equal(googleKayitDonusumuRaporlanabilirMi({ user_metadata: metadata }), false);
  assert.equal(googleKayitDonusumuRaporlanabilirMi({
    email_confirmed_at: "2026-09-04T08:01:00.000Z",
    user_metadata: metadata,
  }), true);
  assert.equal(googleKayitDonusumuRaporlanabilirMi({
    email_confirmed_at: "2026-09-04T08:01:00.000Z",
    user_metadata: {},
  }), false);
});
