import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { guncelPiyasaKurlari, piyasaKurlariniOzetle } from "../supabase/functions/_shared/financialAssistantRates.js";
import { FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION } from "../supabase/functions/_shared/financialAssistantPrompt.js";

const kok = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("piyasa yanıtından asistan için kur özeti çıkar", () => {
  const k = piyasaKurlariniOzetle({ updatedAt: "2026-10-14T16:31:04Z", prices: { usdTry: 49.39291, eurTry: 55.3, goldGramTry: 6481.1804, crypto: { bitcoin: 1 } } });
  assert.equal(k.usdTry, 49.3929);
  assert.equal(k.gramAltinTry, 6481.18);
  assert.equal(k.guncellenme, "2026-10-14T16:31:04Z");
  assert.equal("crypto" in k, false);
  assert.equal(piyasaKurlariniOzetle({ prices: {} }), null);
});

test("kur servisi hata verirse null döner", async () => {
  assert.equal(await guncelPiyasaKurlari(async () => ({ ok: false })), null);
  assert.equal(await guncelPiyasaKurlari(async () => { throw new Error("ağ"); }), null);
});

test("kurlar sunucuda bağlama eklenir, istemci kuru atılır; prompt çeviri ve route=none kuralını içerir", () => {
  const fn = readFileSync(resolve(kok, "supabase/functions/financial-assistant/index.ts"), "utf8");
  assert.match(fn, /const \{ guncelPiyasaKurlari: _istemciKuru, \.\.\.temizBaglam \} = istemciBaglami;/);
  assert.match(fn, /guncelPiyasaKurlari: kurlar/);
  assert.match(FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION, /guncelPiyasaKurlari/);
  assert.match(FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION, /route="none"/);
  const app = readFileSync(resolve(kok, "src/App.jsx"), "utf8");
  assert.match(app, /!\(secim === "model" && modelYaniti\?\.route === "none"\) && <div className="bt-assistant-action">/);
});
