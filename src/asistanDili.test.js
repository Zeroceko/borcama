import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION,
  buildFinancialAssistantSystemInstruction,
  financialAssistantLanguage,
  normalizeFinancialAssistantMarkers,
} from "../supabase/functions/_shared/financialAssistantPrompt.js";
import { validateFinancialAssistantResponse } from "../supabase/functions/_shared/financialAssistantValidation.js";
import { asistanKullaniciTercihleri } from "./assistantContext.js";
import { asistanYanitiniSunumaDonustur, yanitIsaretleriniCevir } from "./assistantPresentation.js";

test("dil alanı yoksa veya tanınmıyorsa Türkçe kabul edilir", () => {
  assert.equal(financialAssistantLanguage(undefined), "tr");
  assert.equal(financialAssistantLanguage("xx"), "tr");
  assert.equal(financialAssistantLanguage("EN"), "en");
  assert.equal(financialAssistantLanguage("de-DE"), "de");
});

test("Türkçe sistem talimatı birebir aynı kalır, diğer dillerde dil kuralı eklenir", () => {
  assert.equal(buildFinancialAssistantSystemInstruction("tr"), FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION);
  assert.equal(buildFinancialAssistantSystemInstruction(), FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION);
  const en = buildFinancialAssistantSystemInstruction("en");
  assert.ok(en.startsWith(FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION));
  assert.match(en, /Kullanıcının dilinde yanıt ver/);
  assert.match(en, /English \(en\)/);
  assert.match(en, /"Kısa cevap: "/);
  assert.match(buildFinancialAssistantSystemInstruction("it"), /Italiano/);
});

test("çevrilmiş yapı işaretleri Türkçe makine işaretine döner ve doğrulamadan geçer", () => {
  const yanit = {
    title: "Pay the card first",
    answer: "Short answer: Your card costs the most.\n• It charges 3% a month.\n• The loan is cheaper.\nWhat to do: Put extra money on the card.",
    route: "borclar", actionLabel: "Open debts", needsMoreInfo: false, disclaimer: "Estimate only.",
  };
  const duzeltilmis = normalizeFinancialAssistantMarkers(yanit, "en");
  assert.match(duzeltilmis.answer, /^Kısa cevap: Your card/);
  assert.match(duzeltilmis.answer, /\nYapman gereken: Put extra/);
  const sonuc = validateFinancialAssistantResponse({ response: duzeltilmis, context: { kartlar: [{ aylikFaizYuzde: 3 }] }, question: "which first?" });
  assert.deepEqual(sonuc.errors, []);
  assert.equal(normalizeFinancialAssistantMarkers(yanit, "tr"), yanit);
});

test("asistan isteğine dil ve para birimi yalnız web dışı tercihte eklenir", () => {
  assert.deepEqual(asistanKullaniciTercihleri({ dilKodu: "tr", paraBirimi: "TRY" }), {});
  assert.deepEqual(asistanKullaniciTercihleri(), {});
  const en = asistanKullaniciTercihleri({ dilKodu: "en", paraBirimi: "USD" });
  assert.equal(en.kullaniciTercihleri.yanitDili, "en");
  assert.equal(en.kullaniciTercihleri.paraBirimi, "USD");
  const client = readFileSync(new URL("./financialAssistant.js", import.meta.url), "utf8");
  assert.match(client, /language = dil\(\)/);
  assert.match(client, /history: safeHistory, language/);
  const sunucu = readFileSync(new URL("../supabase/functions/financial-assistant/index.ts", import.meta.url), "utf8");
  assert.match(sunucu, /financialAssistantLanguage\(body\?\.language\)/);
  assert.match(sunucu, /buildFinancialAssistantSystemInstruction\(language\)/);
});

test("geçmiş yanıtta Türkçe işaretler yalnız Türkçe dışında gizlenir", () => {
  const ham = "Kısa cevap: Pay the card.\n• Reason.\nYapman gereken: Pay now.";
  assert.equal(yanitIsaretleriniCevir(ham, "tr"), ham);
  assert.equal(yanitIsaretleriniCevir(ham, "en", "What to do:"), "Pay the card.\n• Reason.\nWhat to do: Pay now.");
  const sunum = asistanYanitiniSunumaDonustur(ham);
  assert.equal(sunum.kisaCevap, "Pay the card.");
  assert.equal(sunum.sonrakiAdim, "Pay now.");
});
