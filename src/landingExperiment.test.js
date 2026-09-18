import assert from "node:assert/strict";
import { test } from "node:test";
import { landingDeneyiVaryantiBelirle, aktifLandingDeneyiOku, LANDING_DENEYI_ANAHTARI } from "./landingExperiment.js";

const pmax = { source: "google", medium: "cpc", campaign: "tr_pmax_borcama" };

test("LANDING-003 tüm yeni landing ziyaretçilerini eşit iki kola ayırır", () => {
  assert.equal(landingDeneyiVaryantiBelirle({ source: pmax, randomValue: 0.1 }), "control");
  assert.equal(landingDeneyiVaryantiBelirle({ source: pmax, randomValue: 0.9 }), "variant");
  assert.equal(landingDeneyiVaryantiBelirle({ source: { source: "google", medium: "organic" }, randomValue: 0.9 }), "variant");
});

test("atanmış ziyaretçi sonraki oturumda aynı varyantı görür", () => {
  assert.equal(landingDeneyiVaryantiBelirle({ source: {}, storedVariant: "variant", randomValue: 0.1 }), "variant");
  assert.equal(landingDeneyiVaryantiBelirle({ source: pmax, storedVariant: "control", randomValue: 0.9 }), "control");
});

test("LANDING-002 ataması yeni deney için tekrar kullanılmaz", () => {
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.localStorage;
  const requestedKeys = [];
  globalThis.window = {};
  globalThis.localStorage = { getItem(key) { requestedKeys.push(key); return key === "borcama:landing-002-variant" ? "variant" : null; } };
  try {
    assert.deepEqual(aktifLandingDeneyiOku(), { experiment_id: "", experiment_variant: "" });
    assert.deepEqual(requestedKeys, [LANDING_DENEYI_ANAHTARI]);
    assert.equal(LANDING_DENEYI_ANAHTARI, "borcama:landing-003-variant");
  } finally {
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage;
  }
});
