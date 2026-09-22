import test from "node:test";
import assert from "node:assert/strict";
import { buildFinancialAssistantFallback } from "../supabase/functions/_shared/financialAssistantFallback.js";
import { validateFinancialAssistantResponse } from "../supabase/functions/_shared/financialAssistantValidation.js";

test("faiz sorusu model başarısız olsa bile hesaplanan alt toplamlarla yanıtlanır", () => {
  const context = {
    faizMaliyetOzeti: {
      kartVeEkHesapAylikFaizVergiHaricTahmin: 3954.33,
      kartVeEkHesapAylikFaizVergiDahilTahmin: 5140.62,
      vergiToplamYuzde: 30,
      planiBilinenKredilerKalanFinansmanMaliyeti: 11369,
      planiBilinenKrediSayisi: 2,
      finansmanMaliyetiBilinenKrediSayisi: 2,
      aktifKrediSayisi: 4,
    },
  };
  const response = buildFinancialAssistantFallback({ context, question: "Son durumda ne kadar faiz ödeyeceğim?" });

  assert.match(response.answer, /5\.140,62 TL/);
  assert.match(response.answer, /11\.369 TL/);
  assert.match(response.answer, /2\/4 aktif kredinin/);
  assert.equal(response.needsMoreInfo, true);
  assert.deepEqual(validateFinancialAssistantResponse({ response, context, question: "faizim ne kadar?" }).errors, []);
});

test("anapara dağılımı bilinmeyen kredide sıfır finansman maliyeti uydurmaz", () => {
  const response = buildFinancialAssistantFallback({
    context: {
      faizMaliyetOzeti: {
        kartVeEkHesapAylikFaizVergiHaricTahmin: 0,
        kartVeEkHesapAylikFaizVergiDahilTahmin: 0,
        planiBilinenKredilerKalanFinansmanMaliyeti: 0,
        planiBilinenKrediSayisi: 1,
        finansmanMaliyetiBilinenKrediSayisi: 0,
        aktifKrediSayisi: 1,
      },
    },
    question: "Kredide ne kadar faiz kaldı?",
  });

  assert.match(response.answer, /0 TL varsayılmadı/);
  assert.doesNotMatch(response.answer, /kalan finansman maliyeti 0 TL/);
});

test("faiz dışındaki soruya deterministik yedek yanıt üretilmez", () => {
  assert.equal(buildFinancialAssistantFallback({ context: {}, question: "Aylık durumum nasıl?" }), null);
});
