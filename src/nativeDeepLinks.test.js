import assert from "node:assert/strict";
import { test } from "node:test";
import { nativeDerinBaglantiHedefi } from "./nativeDeepLinks.js";

test("Borcama auth universal link hedefini sorgu ve hash ile korur", () => {
  assert.equal(
    nativeDerinBaglantiHedefi("https://borcama.com/reset-password?code=abc#token=xyz"),
    "/reset-password?code=abc#token=xyz",
  );
  assert.equal(nativeDerinBaglantiHedefi("https://www.borcama.com/summary"), "/summary");
});
test("harici alan ve native disi yollar reddedilir", () => {
  assert.equal(nativeDerinBaglantiHedefi("https://example.com/login"), null);
  assert.equal(nativeDerinBaglantiHedefi("http://borcama.com/login"), null);
  assert.equal(nativeDerinBaglantiHedefi("https://borcama.com/ceo"), null);
  assert.equal(nativeDerinBaglantiHedefi("gecersiz"), null);
});
