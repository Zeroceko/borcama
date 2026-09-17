import { ASISTAN_EVAL_VAKALARI } from "../evals/financial-assistant/cases.js";
import { deterministikYanitiKontrolEt } from "../evals/financial-assistant/rubric.js";
import { FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION } from "../supabase/functions/_shared/financialAssistantPrompt.js";
import {
  FINANCIAL_ASSISTANT_ROUTE_IDS,
  validateFinancialAssistantResponse,
} from "../supabase/functions/_shared/financialAssistantValidation.js";

if (process.env.ASSISTANT_EVAL_LIVE_CONFIRMED !== "true") {
  throw new Error("Ücretli sentetik model evali için ASSISTANT_EVAL_LIVE_CONFIRMED=true gerekli.");
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY gerekli.");

const model = process.env.GEMINI_MODEL || "gemini-3.7-flash";
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
const results = [];

for (const testCase of ASISTAN_EVAL_VAKALARI) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION }] },
      contents: [{
        role: "user",
        parts: [{ text: `SORU:\n${testCase.soru}\n\nBORCAMA_HESAP_OZETI:\n${JSON.stringify(testCase.baglam)}` }],
      }],
      generationConfig: {
        thinkingConfig: { thinkingLevel: "LOW" },
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            answer: { type: "STRING" },
            route: { type: "STRING", enum: [...FINANCIAL_ASSISTANT_ROUTE_IDS] },
            actionLabel: { type: "STRING" },
            needsMoreInfo: { type: "BOOLEAN" },
            disclaimer: { type: "STRING" },
          },
          required: ["title", "answer", "route", "actionLabel", "needsMoreInfo", "disclaimer"],
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    results.push({ id: testCase.id, passed: false, errors: [`model_http_${response.status}`, detail] });
    process.stdout.write(`FAIL ${testCase.id}: model_http_${response.status}\n`);
    continue;
  }

  const payload = await response.json();
  const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  let answer;
  try { answer = JSON.parse(raw); } catch { answer = null; }

  const runtimeCheck = validateFinancialAssistantResponse({
    response: answer,
    context: testCase.baglam,
    question: testCase.soru,
  });
  const evalCheck = deterministikYanitiKontrolEt(testCase, answer);
  const errors = [...runtimeCheck.errors, ...evalCheck.sorunlar, ...evalCheck.agirHatalar];
  const passed = runtimeCheck.valid && evalCheck.gecti;
  results.push({ id: testCase.id, passed, errors: [...new Set(errors)] });
  process.stdout.write(`${passed ? "PASS" : "FAIL"} ${testCase.id}${errors.length ? `: ${[...new Set(errors)].join(", ")}` : ""}\n`);
}

const passedCount = results.filter((result) => result.passed).length;
process.stdout.write(`\n${passedCount}/${results.length} sentetik model yanıtı deterministik kapıdan geçti (${model}).\n`);
if (passedCount !== results.length) process.exitCode = 1;
