import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ASISTAN_EVAL_AILELERI, ASISTAN_EVAL_VAKALARI } from "../evals/financial-assistant/cases.js";
import { ASISTAN_KONUSMA_EVAL_VAKALARI } from "../evals/financial-assistant/conversationCases.js";
import {
  ASISTAN_KALITE_RUBRIGI,
  asistanSurumKapisiniDegerlendir,
  deterministikYanitiKontrolEt,
} from "../evals/financial-assistant/rubric.js";
import { getCardMinimumState, getKmhPaymentConstraint, validateFinancialAssistantResponse } from "../supabase/functions/_shared/financialAssistantValidation.js";
import { asistanYanitiniSunumaDonustur } from "./assistantPresentation.js";
import { FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION } from "../supabase/functions/_shared/financialAssistantPrompt.js";

const kok = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const tumAnahtarlar = (deger, sonuc = []) => {
  if (!deger || typeof deger !== "object") return sonuc;
  for (const [anahtar, altDeger] of Object.entries(deger)) {
    sonuc.push(anahtar);
    tumAnahtarlar(altDeger, sonuc);
  }
  return sonuc;
};

const tamPuan = () => Object.fromEntries(ASISTAN_KALITE_RUBRIGI.map((boyut) => [boyut.id, 4]));

test("borç kavramı Türkçe yumuşamayı tanır fakat borçsuz metni geçirmez", () => {
  const c = ASISTAN_KONUSMA_EVAL_VAKALARI[0];
  const answer = c.referans.answer.replaceAll("Borç", "Borcu").replaceAll("borç", "borcu");
  assert.equal(deterministikYanitiKontrolEt(c, { ...c.referans, answer }).gecti, true);
  const absent = c.referans.answer.replace(/borç/gi, "ödeme");
  assert.ok(deterministikYanitiKontrolEt(c, { ...c.referans, answer: absent }).sorunlar.includes("eksik_kavram:4"));
});

test("yetersiz KMH ödeme bütçesi tam kapanma gibi sunulamaz", () => {
  const c = ASISTAN_EVAL_VAKALARI.find((v) => v.id === "kart-kmh-oncelik");
  const validate = (sentence, question = c.soru) => validateFinancialAssistantResponse({
    response: { ...c.referans, answer: `Kısa cevap: ${sentence}\n• Kart asgarisi ödenmiş.\n• KMH maliyeti aylık %4,8.` },
    context: c.baglam, question,
  });
  assert.ok(validate("5.000 TL ile KMH borcunu kapat.").errors.includes("insufficient_kmh_payment_for_closure"));
  assert.equal(validate("5.000 TL ile KMH borcunu azalt; 7.000 TL anapara kalır.").valid, true);
  assert.equal(validate("KMH borcu bu bütçeyle kapanmaz; 7.000 TL anapara kalır.").valid, true);
  assert.equal(validate("KMH borcunu kapat.", "Borçlara 12 bin ayırabiliyorum.").valid, true);
  assert.ok(validate("KMH borcunu 5.000 TL ile kapat.").errors.includes("insufficient_kmh_payment_for_closure"));
  for (const [amount, budget] of [["5.000 TL",5000],["5.000,50 TL",5000.5],["5 bin TL",5000],["5,5 bin",5500]]) {
    assert.equal(getKmhPaymentConstraint(c.baglam, `${amount} ayırabiliyorum`).budget, budget);
  }
});

test("kayıtlı ve ödenmiş aktif kart asgarileri belirsiz diye gösterilemez", () => {
  const c = ASISTAN_EVAL_VAKALARI.find((v) => v.id === "kart-kmh-oncelik");
  const context = { ...c.baglam, kartlar: [
    { ekstreBorcu: 5000, kalanBorc: 0, asgariOdeme: null, yapilanOdeme: 5000 },
    { ekstreBorcu: 9000, asgariOdeme: 3000, yapilanOdeme: 3000 },
    { ekstreBorcu: 4000, asgariOdeme: 1000, yapilanOdeme: 1000 },
  ] };
  assert.deepEqual(getCardMinimumState(context), { activeCards: 2, knownMinimums: 2, unknownMinimums: 0, unpaidMinimum: 0 });
  const response = { ...c.referans, answer: "Kısa cevap: Kart asgari tutarları sistemde netleşmemişken KMH'yi değerlendir.\n• İki kartın borcu var.\n• Önce aylık açığı kontrol et." };
  assert.ok(validateFinancialAssistantResponse({ response, context, question: c.soru }).errors.includes("known_card_minimum_claimed_unknown"));
  const unknownContext = { ...context, kartlar: [...context.kartlar, { ekstreBorcu: 2000, asgariOdeme: null, yapilanOdeme: 0 }] };
  assert.equal(getCardMinimumState(unknownContext).unknownMinimums, 1);
  assert.equal(validateFinancialAssistantResponse({ response, context: unknownContext, question: c.soru }).errors.includes("known_card_minimum_claimed_unknown"), false);
});

test("sunucu kesin kredi veya yapılandırma işlem talimatını reddeder", () => {
  const c = ASISTAN_EVAL_VAKALARI[1];
  const response = { ...c.referans, answer: c.referans.answer + "\nYapman gereken: Yapılandırmayı başlat." };
  const result = validateFinancialAssistantResponse({ response, context: c.baglam, question: c.soru });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("unsafe_certainty_or_action"));
});

test("canlı eval regresyonları maliyet, gecikme ve büyük alımda eksik bilgi sınırını korur", () => {
  const prompt = FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION;
  assert.ok(prompt.includes("Nominal faiz, vergiler ve ücretler dahil toplam maliyet değildir"));
  assert.ok(prompt.includes("Vade, aylık taksit veya toplam geri ödeme bilinmiyorsa needsMoreInfo=true"));
  assert.ok(prompt.includes("Bütçede açık varken elinde para varmış gibi"));
  assert.ok(prompt.includes("tüm borcu hemen kapatıp kalanını harcama talimatı verme"));
  assert.ok(prompt.includes("route alanını yanıtın karar türüne göre seç"));
});

test("sentetik asistan eval seti sekiz zorunlu finansal aileyi kapsar", () => {
  assert.equal(new Set(ASISTAN_EVAL_VAKALARI.map((vaka) => vaka.id)).size, ASISTAN_EVAL_VAKALARI.length);
  assert.deepEqual(new Set(ASISTAN_EVAL_VAKALARI.map((vaka) => vaka.aile)), new Set(ASISTAN_EVAL_AILELERI));
  assert.ok(ASISTAN_EVAL_AILELERI.every((aile) => ASISTAN_EVAL_VAKALARI.some((vaka) => vaka.aile === aile)));
});

test("eval vakaları yalnız sentetik ve normalize edilmiş finansal özet taşır", () => {
  const yasakAnahtar = /^(e-?posta|email|kart_?no|card_?number|aciklama|işyeri|isyeri|merchant|ham_?ekstre|raw_?statement|pdf)$/i;
  const uzunKartDizisi = /\b(?:\d[ -]?){13,19}\b/;
  for (const vaka of ASISTAN_EVAL_VAKALARI) {
    assert.equal(vaka.sentetik, true, vaka.id);
    assert.equal(tumAnahtarlar(vaka.baglam).some((anahtar) => yasakAnahtar.test(anahtar)), false, vaka.id);
    assert.equal(uzunKartDizisi.test(JSON.stringify(vaka)), false, vaka.id);
  }
});

test("canlı asistan talimatı sade dil, bütün profil ve sabit kısa yanıt yapısını korur", () => {
  const kaynak = readFileSync(resolve(kok, "supabase/functions/_shared/financialAssistantPrompt.js"), "utf8");
  assert.match(kaynak, /BORCAMA_HESAP_OZETI'nin tamamını birlikte değerlendir/);
  assert.match(kaynak, /toplam finansal profil ve kullanıcının aylık ödeme gücüyle çelişki kontrolü/);
  assert.match(kaynak, /finansal okuryazarlığı olmayan birinin ilk okumada anlayacağı günlük Türkçeyle/);
  assert.match(kaynak, /ilk satırda "Kısa cevap: \.\.\."/);
  assert.match(kaynak, /"• " ile başlayan 2 veya 3 kısa madde/);
  assert.match(kaynak, /en fazla 130 kelime/);
  assert.match(kaynak, /kullanıcının girmediği sayıyı kesinmiş gibi sunma/);
  assert.match(kaynak, /Kullanıcı adına kayıt oluşturma veya değiştirme/);
});

test("canlı sentetik eval ortak promptu kullanır ve maliyet onayı olmadan çalışmaz", () => {
  const kaynak = readFileSync(resolve(kok, "scripts/run-financial-assistant-eval.mjs"), "utf8");
  assert.match(kaynak, /ASSISTANT_EVAL_LIVE_CONFIRMED !== "true"/);
  assert.match(kaynak, /FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION/);
  assert.match(kaynak, /ASISTAN_EVAL_VAKALARI/);
  assert.doesNotMatch(kaynak, /supabase\.auth|financial_assistant_conversations/);
});

test("sekiz referans yanıt deterministik regresyon kapılarından geçer", () => {
  for (const vaka of ASISTAN_EVAL_VAKALARI) {
    assert.deepEqual(deterministikYanitiKontrolEt(vaka, vaka.referans), {
      gecti: true,
      sorunlar: [],
      agirHatalar: [],
      olcum: {
        kelime: deterministikYanitiKontrolEt(vaka, vaka.referans).olcum.kelime,
        eylemMaddesi: 3,
      },
    }, vaka.id);
  }
});

test("kesin ve dayanıksız kredi yönlendirmesi ağır hata sayılır", () => {
  const vaka = ASISTAN_EVAL_VAKALARI.find((aday) => aday.aile === "kredi");
  const sonuc = deterministikYanitiKontrolEt(vaka, {
    ...vaka.referans,
    answer: `${vaka.referans.answer}\nKesinlikle kredi al.`,
  });
  assert.equal(sonuc.gecti, false);
  assert.ok(sonuc.agirHatalar.length > 0);
});

test("eval kapısı dolaylı kesin banka onayı ifadesini de ağır hata sayar", () => {
  const vaka = ASISTAN_EVAL_VAKALARI.find((aday) => aday.aile === "kredi");
  const sonuc = deterministikYanitiKontrolEt(vaka, {
    ...vaka.referans,
    answer: `${vaka.referans.answer}\nBanka sana kesin onay verir ve bu oran değişmez.`,
  });
  assert.equal(sonuc.gecti, false);
  assert.ok(sonuc.agirHatalar.some((hata) => hata.includes("sunucu_guvenlik_kapisi")));
});

test("sunucu geçerli sentetik yanıtı kabul eder", () => {
  const vaka = ASISTAN_EVAL_VAKALARI.find((aday) => aday.aile === "kredi");
  assert.deepEqual(validateFinancialAssistantResponse({
    response: vaka.referans,
    context: vaka.baglam,
    question: vaka.soru,
  }), { valid: true, errors: [] });
});

test("sunucu kesin kredi onayı ve değişmez oran iddiasını reddeder", () => {
  const vaka = ASISTAN_EVAL_VAKALARI.find((aday) => aday.aile === "kredi");
  const sonuc = validateFinancialAssistantResponse({
    response: {
      ...vaka.referans,
      answer: "Kısa cevap: Banka sana kesin onay verir ve bu oran değişmez.\n• Krediyi hemen kullan.\n• Başka koşula bakma.",
    },
    context: vaka.baglam,
    question: vaka.soru,
  });
  assert.equal(sonuc.valid, false);
  assert.ok(sonuc.errors.includes("unsafe_certainty_or_action"));
});

test("sunucu biçim sözleşmesini ve 130 kelime sınırını uygular", () => {
  const vaka = ASISTAN_EVAL_VAKALARI.find((aday) => aday.aile === "kredi");
  const sonuc = validateFinancialAssistantResponse({
    response: {
      ...vaka.referans,
      answer: `Bu cevap başlıksızdır.\n• Tek madde.\n${"kelime ".repeat(131)}`,
    },
    context: vaka.baglam,
    question: vaka.soru,
  });
  assert.equal(sonuc.valid, false);
  assert.ok(sonuc.errors.includes("missing_short_answer_prefix"));
  assert.ok(sonuc.errors.includes("invalid_bullet_count"));
  assert.ok(sonuc.errors.includes("invalid_answer_structure"));
  assert.ok(sonuc.errors.includes("answer_over_130_words"));
});

test("sunucu bağlamda veya soruda bulunmayan faiz oranını reddeder", () => {
  const vaka = ASISTAN_EVAL_VAKALARI.find((aday) => aday.aile === "kredi");
  const sonuc = validateFinancialAssistantResponse({
    response: {
      ...vaka.referans,
      answer: "Kısa cevap: Aylık %9,9 faiz bu kayıtlarda görünmüyor.\n• Banka teklifini kontrol et.\n• Toplam geri ödemeyi karşılaştır.",
    },
    context: vaka.baglam,
    question: vaka.soru,
  });
  assert.equal(sonuc.valid, false);
  assert.ok(sonuc.errors.includes("ungrounded_percentage:9.9"));
});

test("rubrik kapısı tüm aileler güçlü olduğunda geçer", () => {
  const sonuc = asistanSurumKapisiniDegerlendir(ASISTAN_EVAL_VAKALARI.map((vaka) => ({
    vakaId: vaka.id,
    aile: vaka.aile,
    puanlar: tamPuan(),
    deterministikGecti: true,
    agirHatalar: [],
  })));
  assert.equal(sonuc.gecti, true);
  assert.equal(sonuc.genelOrtalama, 100);
  assert.equal(sonuc.deterministikGecisOrani, 1);
});

test("kritik finansal doğruluk zayıfsa yüksek genel puan sürümü geçiremez", () => {
  const sonuclar = ASISTAN_EVAL_VAKALARI.map((vaka) => ({
    vakaId: vaka.id,
    aile: vaka.aile,
    puanlar: tamPuan(),
    deterministikGecti: true,
    agirHatalar: [],
  }));
  sonuclar[0].puanlar.finansal_dogruluk = 2;
  const sonuc = asistanSurumKapisiniDegerlendir(sonuclar);
  assert.equal(sonuc.gecti, false);
  assert.deepEqual(sonuc.basarisizVakalar, [sonuclar[0].vakaId]);
});

test("model satır atlamasa da yanıt okunabilir maddelere ayrılır", () => {
  const sonuc = asistanYanitiniSunumaDonustur("Kısa cevap: Önce pahalı borcu azalt. • 10.000 TL'yi KMH borcuna yatır. • Yeni harcama yapma. Yapman gereken: Ödeme planını aç.");
  assert.equal(sonuc.kisaCevap, "Önce pahalı borcu azalt.");
  assert.deepEqual(sonuc.maddeler, ["10.000 TL'yi KMH borcuna yatır.", "Yeni harcama yapma."]);
  assert.equal(sonuc.sonrakiAdim, "Ödeme planını aç.");
});

test("eski asistan yanıtlarındaki yönlendirme dili de okunmaya devam eder", () => {
  const sonuc = asistanYanitiniSunumaDonustur("Kısa cevap: Planını kontrol et. Senden gereken: Ödemeleri aç.");
  assert.equal(sonuc.sonrakiAdim, "Ödemeleri aç.");
});

test("asistan erişimi içeriği kapatan sticky düğme yerine ana menüdedir", () => {
  const kaynak = readFileSync(resolve(kok, "src/App.jsx"), "utf8");
  assert.match(kaynak, /className="bt-pill bt-assistant-nav"/);
  assert.match(kaynak, /className="bt-assistant-header"/);
  assert.match(kaynak, /\.bt-nav-ana \.bt-assistant-nav\{display:none\}/);
  assert.match(kaynak, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(kaynak, /className="bt-assistant-trigger"/);
  assert.match(kaynak, /bt-assistant-beta">Beta/);
  assert.match(kaynak, /Sonuçları kontrol edin/);
});

test("asistan penceresi serbest soruyu öne çıkarır ve hızlı incelemeleri FAQ gibi sunmaz", () => {
  const kaynak = readFileSync(resolve(kok, "src/App.jsx"), "utf8");
  assert.match(kaynak, /Ne öğrenmek istiyorsun\?/);
  assert.match(kaynak, /aria-label="Hızlı finansal incelemeler"/);
  assert.match(kaynak, /Aylık durumumu özetle/);
  assert.doesNotMatch(kaynak, /aria-label="Hazır sorular"/);
});

test("başarılı asistan konuşması finansal bağlamı kopyalamadan CRM geçmişine yazılır", () => {
  const asistan = readFileSync(resolve(kok, "supabase/functions/financial-assistant/index.ts"), "utf8");
  const crm = readFileSync(resolve(kok, "supabase/functions/backoffice/index.ts"), "utf8");
  const migration = readFileSync(resolve(kok, "supabase/migrations/20260906210000_financial_assistant_conversations.sql"), "utf8");
  assert.match(asistan, /validateFinancialAssistantResponse\(\{ response: answer, context, question, history \}\)/);
  assert.match(asistan, /from\("financial_assistant_conversations"\)\.insert/);
  assert.doesNotMatch(asistan, /financial_assistant_conversations[\s\S]{0,900}\bcontext\b/);
  assert.match(crm, /assistant_conversations: asistanKonusmalari/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all .* from public, anon, authenticated/);
});
