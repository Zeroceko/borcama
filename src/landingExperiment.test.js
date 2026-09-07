import assert from "node:assert/strict";
import { test } from "node:test";
import { landingDeneyiVaryantiBelirle, aktifLandingDeneyiOku, landingDeneyiAta } from "./landingExperiment.js";

const pmax = { source: "google", medium: "cpc", campaign: "tr_pmax_borcama" };

test("LANDING-002 tüm yeni landing ziyaretçilerini eşit iki kola ayırır", () => {
  assert.equal(landingDeneyiVaryantiBelirle({ source: pmax, randomValue: 0.1 }), "control");
  assert.equal(landingDeneyiVaryantiBelirle({ source: pmax, randomValue: 0.9 }), "variant");
  assert.equal(landingDeneyiVaryantiBelirle({ source: { source: "google", medium: "organic" }, randomValue: 0.9 }), "variant");
});

test("atanmış ziyaretçi sonraki oturumda aynı varyantı görür", () => {
  assert.equal(landingDeneyiVaryantiBelirle({ source: {}, storedVariant: "variant", randomValue: 0.1 }), "variant");
  assert.equal(landingDeneyiVaryantiBelirle({ source: pmax, storedVariant: "control", randomValue: 0.9 }), "control");
});
