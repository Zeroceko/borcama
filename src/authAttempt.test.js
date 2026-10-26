import test from "node:test";
import assert from "node:assert/strict";
import { runAuthAttempt, recoveryErrorMessage } from "./authAttempt.js";

test("auth challenge is renewed only after the pending request settles", async () => {
  let settle;
  let renewals = 0;
  const pending = runAuthAttempt(() => new Promise(resolve => { settle = resolve; }), () => renewals++);
  assert.equal(renewals, 0);
  settle({ error: { code: "invalid_credentials" } });
  assert.equal((await pending).error.code, "invalid_credentials");
  assert.equal(renewals, 1);
});
test("auth network failure releases loading and renews challenge once", async () => {
  let renewals = 0;
  const result = await runAuthAttempt(() => { throw new Error("private details"); }, () => renewals++);
  assert.equal(result.error.code, "network_error");
  assert.equal(renewals, 1);
  assert.match(recoveryErrorMessage(result.error), /İnternet/);
});
test("recovery distinguishes a consumed captcha from delivery failure", () => {
  assert.match(recoveryErrorMessage({ code: "captcha_failed" }), /doğrulaması yenilendi/);
  assert.match(recoveryErrorMessage({ status: 429 }), /bekleyin/);
});
test("auth and Apple sign-in errors keep their Turkish text and have English", async () => {
  const { tr, en } = await import("./locales/bolumler/hatalar-sss.js");
  const { readFileSync } = await import("node:fs");
  const apple = readFileSync(new URL("./appleGiris.js", import.meta.url), "utf8");
  assert.equal(recoveryErrorMessage({ status: 429 }), "Çok fazla deneme yapıldı. Lütfen biraz bekleyin.");
  assert.equal(recoveryErrorMessage({ code: "network_error" }), "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.");
  assert.match(recoveryErrorMessage({ code: "other" }), /zero@borcama\.com/);
  assert.match(apple, /return t\("hata\.appleBaglanti"\)/);
  assert.match(apple, /return t\("hata\.appleTamamlanamadi"\)/);
  assert.equal(tr["hata.appleBaglanti"], "Apple ile giriş için bağlantı kurulamadı. Bağlantını kontrol edip tekrar dene.");
  assert.equal(tr["hata.appleTamamlanamadi"], "Apple ile giriş tamamlanamadı. Lütfen tekrar dene ya da parolanla giriş yap.");
  for (const anahtar of Object.keys(tr)) assert.ok(en[anahtar], `en eksik: ${anahtar}`);
  for (const anahtar of Object.keys(en)) assert.ok(anahtar in tr, `tr eksik: ${anahtar}`);
  assert.match(en["sss.banka.cevap"], /Turkish banks/);
  assert.doesNotMatch(Object.values(en).join(" "), /referral|invite code|Paddle|Beta|Coming soon|magic link/i);
});
