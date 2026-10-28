import test from "node:test";
import assert from "node:assert/strict";
import { kodGecerli, kodHataAnahtari, kodTemizle } from "./authKod.js";

test("kodTemizle yalnız rakamları alır ve 8 haneyle sınırlar", () => {
  assert.equal(kodTemizle(" 123 456-78 "), "12345678");
  assert.equal(kodTemizle("1234567890"), "12345678");
  assert.equal(kodTemizle(null), "");
});

test("kodGecerli 6–8 haneyi kabul eder", () => {
  assert.equal(kodGecerli("123456"), true);
  assert.equal(kodGecerli("12345678"), true);
  assert.equal(kodGecerli("12345"), false);
  assert.equal(kodGecerli(""), false);
});

test("kodHataAnahtari Supabase hatalarını mesaja çevirir", () => {
  assert.equal(kodHataAnahtari({ code: "otp_expired", status: 403 }), "auth.hata.kodYanlis");
  assert.equal(kodHataAnahtari({ status: 429 }), "auth.hata.cokDenemeTekrar");
  assert.equal(kodHataAnahtari({ code: "unexpected" }), "auth.hata.kodDogrulanamadi");
});
