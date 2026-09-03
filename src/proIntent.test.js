import test from "node:test";
import assert from "node:assert/strict";
import { proNiyetiniOku, proNiyetiniKaydet } from "./proIntent.js";

test("paywall dönüşü kayıtlı Pro niyetini temizler ve tekrar yönlendirmez", () => {
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  globalThis.window = { location: { search: "" } };
  try {
    proNiyetiniKaydet("annual");
    assert.equal(proNiyetiniOku(), "annual");
    window.location.search = "?plan=free";
    assert.equal(proNiyetiniOku(), null);
    window.location.search = "";
    assert.equal(proNiyetiniOku(), null);
  } finally {
    globalThis.window = previousWindow;
    globalThis.localStorage = previousStorage;
  }
});
