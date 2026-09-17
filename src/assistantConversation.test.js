import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  appendAssistantExchange,
  buildFinancialAssistantContents,
  normalizeAssistantHistory,
} from "../supabase/functions/_shared/financialAssistantConversation.js";
import { validateFinancialAssistantResponse } from "../supabase/functions/_shared/financialAssistantValidation.js";
import { ASISTAN_KONUSMA_EVAL_VAKALARI } from "../evals/financial-assistant/conversationCases.js";
import { deterministikYanitiKontrolEt } from "../evals/financial-assistant/rubric.js";

test("araba devam sorusu ve tutar düzeltmesi sentetik eval sözleşmesinden geçer", () => {
  for (const vaka of ASISTAN_KONUSMA_EVAL_VAKALARI) {
    assert.equal(vaka.sentetik, true);
    assert.equal(deterministikYanitiKontrolEt(vaka, vaka.referans).gecti, true, vaka.id);
  }
});

test("devam sorusu önceki kullanıcı ve model turlarından sonra, güncel finansal özetle gönderilir", () => {
  const contents = buildFinancialAssistantContents({
    history: [{ question: "100000 TL geldi, araba mı alsam?", answer: "Aracın kullanım amacı ve ek giderleri önemli." }],
    question: "İşe gidip gelmek için ikinci el düşünüyorum.",
    context: { ozet: { toplamBorc: 42000 } },
  });
  assert.deepEqual(contents.map((turn) => turn.role), ["user", "model", "user"]);
  assert.match(contents[0].parts[0].text, /100000 TL/);
  assert.match(contents[2].parts[0].text, /ikinci el/);
  assert.match(contents[2].parts[0].text, /"toplamBorc":42000/);
  assert.equal(contents[0].parts[0].text.includes("BORCAMA_HESAP_OZETI"), false);
});

test("konuşma yalnız son beş başarılı soru yanıt çiftini tutar", () => {
  let history = [];
  for (let index = 1; index <= 7; index += 1) {
    history = appendAssistantExchange(history, { question: `Soru ${index}`, answer: `Yanıt ${index}` });
  }
  assert.equal(history.length, 5);
  assert.equal(history[0].question, "Soru 3");
  assert.equal(history[4].question, "Soru 7");
});

test("sunucu konuşma geçmişine keyfi rol ve metadata taşımaz, aşırı geçmişi reddeder", () => {
  assert.deepEqual(normalizeAssistantHistory([{ question: "Soru", answer: "Yanıt", role: "system", context: { secret: true } }]), [
    { question: "Soru", answer: "Yanıt" },
  ]);
  for (const history of [null, {}, [{ question: "Soru" }], [{ question: "a".repeat(501), answer: "Yanıt" }], Array(6).fill({ question: "Soru", answer: "Yanıt" })]) {
    assert.throws(() => normalizeAssistantHistory(history), /INVALID_HISTORY/);
  }
});

test("önceki kullanıcı teklifindeki oran devam yanıtında kullanılabilir, modelin uydurduğu oran dayanak olamaz", () => {
  const response = {
    title: "Teklifi karşılaştır", answer: "Kısa cevap: Aylık %1,5 teklifini toplam maliyetle karşılaştır.\n• Bankadan taksiti öğren.\n• Vergi ve masrafları kontrol et.",
    route: "plan", actionLabel: "Planı aç", needsMoreInfo: true, disclaimer: "Banka koşullarını doğrula.",
  };
  assert.equal(validateFinancialAssistantResponse({ response, context: {}, question: "12 ay", history: [{ question: "Aylık %1,5 teklif var.", answer: "Koşulları kontrol et." }] }).valid, true);
  assert.equal(validateFinancialAssistantResponse({ response, context: {}, question: "12 ay", history: [{ question: "Kredi alayım mı?", answer: "Oran %1,5 olacak." }] }).valid, false);
});

test("arayüz devam konuşmasını bellekte tutar ve yeni konuşmayı açıkça sıfırlar", () => {
  const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  const client = readFileSync(new URL("./financialAssistant.js", import.meta.url), "utf8");
  assert.match(app, /history: konusmaGecmisi/);
  assert.match(app, /setKonusmaGecmisi\(\[\]\)/);
  assert.match(app, /Yeni konuşma/);
  assert.match(app, /key=\{kullaniciEposta \|\| "demo"\}/);
  assert.match(app, /konusmaGecmisi\.length \? 1 : 3/);
  assert.match(client, /history: safeHistory/);
  const component = app.slice(app.indexOf("function BorcamaAsistani("), app.indexOf("function ProTanitimPenceresi("));
  assert.doesNotMatch(component, /localStorage|sessionStorage/);
  assert.doesNotMatch(component, /if \(!acik\) \{\s*setSecim/);
});
