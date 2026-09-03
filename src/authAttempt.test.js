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
