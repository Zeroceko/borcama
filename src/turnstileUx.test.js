import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const authKaynagi = () => readFile(new URL("./Auth.jsx", import.meta.url), "utf8");

test("Turnstile normal ziyaretçide gizli kalır ve riske göre etkileşim ister", async () => {
  const auth = await authKaynagi();
  assert.match(auth, /appearance: 'interaction-only'/);
  assert.match(auth, /execution: 'render'/);
  assert.match(auth, /'before-interactive-callback'/);
  assert.match(auth, /captchaToken: captchaToken \|\| undefined/);
});

test("Turnstile hata ve zaman aşımında sessizce kilitlenmez", async () => {
  const auth = await authKaynagi();
  assert.match(auth, /TURNSTILE_RECOVERY_TIMEOUT_MS = 25000/);
  assert.match(auth, /TURNSTILE_SCRIPT_ID = "borcama-turnstile-script"/);
  assert.match(auth, /function turnstileYuklemesiniYenile\(\)/);
  assert.match(auth, /turnstileYukle\(\)[\s\S]+\.catch\(\(\) => kontrolTamamlandi\('error:script'\)\)/);
  assert.match(auth, /'error-callback'/);
  assert.match(auth, /'timeout-callback'/);
  assert.match(auth, /'unsupported-callback'/);
  assert.match(auth, /içerik engelleyici tarafından durduruldu/);
  assert.match(auth, /Yeniden dene/);
});
