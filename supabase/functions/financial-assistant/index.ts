import { createClient } from "npm:@supabase/supabase-js@2";
import {
  FINANCIAL_ASSISTANT_ROUTE_IDS,
  validateFinancialAssistantResponse,
} from "../_shared/financialAssistantValidation.js";
import { FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION } from "../_shared/financialAssistantPrompt.js";
import { buildFinancialAssistantContents, normalizeAssistantHistory } from "../_shared/financialAssistantConversation.js";
import { buildFinancialAssistantFallback } from "../_shared/financialAssistantFallback.js";

const allowedOrigins = new Set([
  "https://borcama.com", "https://www.borcama.com",
  ...Array.from({ length: 30 }, (_, i) => `http://127.0.0.1:${5173 + i}`),
  ...Array.from({ length: 30 }, (_, i) => `http://localhost:${5173 + i}`),
]);

function cors(origin: string | null) {
  const safeOrigin = origin && allowedOrigins.has(origin) ? origin : "https://borcama.com";
  return {
    "Access-Control-Allow-Origin": safeOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get("origin")), "Content-Type": "application/json; charset=utf-8" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405, headers });
  if (!allowedOrigins.has(req.headers.get("origin") || ""))
    return new Response(JSON.stringify({ error: "ORIGIN_NOT_ALLOWED" }), { status: 403, headers });

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user)
    return new Response(JSON.stringify({ error: "AUTH_REQUIRED" }), { status: 401, headers });

  const body = await req.json().catch(() => null);
  const question = String(body?.question || "").trim().slice(0, 500);
  const context = body?.context;
  let history;
  try { history = normalizeAssistantHistory(body?.history); } catch {
    return new Response(JSON.stringify({ error: "INVALID_HISTORY" }), { status: 422, headers });
  }
  if (question.length < (history.length ? 1 : 3) || !context || JSON.stringify(context).length > 30000)
    return new Response(JSON.stringify({ error: "INVALID_REQUEST" }), { status: 422, headers });

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "MODEL_NOT_CONFIGURED" }), { status: 503, headers });
  if (Deno.env.get("GEMINI_PAID_SERVICE_CONFIRMED") !== "true")
    return new Response(JSON.stringify({ error: "PAID_SERVICE_REQUIRED" }), { status: 503, headers });
  const { data: quota, error: quotaError } = await admin.rpc("consume_financial_assistant_question", { p_user_id: authData.user.id });
  if (quotaError) return new Response(JSON.stringify({ error: "QUOTA_UNAVAILABLE" }), { status: 500, headers });
  if (!quota?.allowed)
    return new Response(JSON.stringify({ error: "DAILY_LIMIT", quota }), { status: 429, headers });
  const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.7-flash";
  const fallback = buildFinancialAssistantFallback({ context, question });
  let gemini: Response | null = null;
  let answer = null;
  try {
    gemini = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: FINANCIAL_ASSISTANT_SYSTEM_INSTRUCTION }] },
        contents: buildFinancialAssistantContents({ question, context, history }),
        generationConfig: {
          thinkingConfig: { thinkingLevel: "LOW" },
          maxOutputTokens: 1000,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" }, answer: { type: "STRING" },
            route: { type: "STRING", enum: [...FINANCIAL_ASSISTANT_ROUTE_IDS] }, actionLabel: { type: "STRING" },
            needsMoreInfo: { type: "BOOLEAN" }, disclaimer: { type: "STRING" },
          },
          required: ["title", "answer", "route", "actionLabel", "needsMoreInfo", "disclaimer"],
        },
        },
      }),
    });
  } catch {
    answer = fallback;
  }
  if (gemini && !gemini.ok) answer = fallback;
  if (!gemini && !answer) {
    await admin.rpc("refund_financial_assistant_question", { p_user_id: authData.user.id });
    return new Response(JSON.stringify({ error: "MODEL_UNAVAILABLE", quota: { ...quota, remaining: quota.remaining + 1 } }), { status: 502, headers });
  }
  if (gemini?.ok) {
    const payload = await gemini.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    try { answer = JSON.parse(text); } catch { answer = null; }
  }
  let validation = validateFinancialAssistantResponse({ response: answer, context, question, history });
  if (!validation.valid && fallback) {
    answer = fallback;
    validation = validateFinancialAssistantResponse({ response: answer, context, question, history });
  }
  if (!validation.valid) {
    await admin.rpc("refund_financial_assistant_question", { p_user_id: authData.user.id });
    return new Response(JSON.stringify({ error: "INVALID_MODEL_RESPONSE", quota: { ...quota, remaining: quota.remaining + 1 } }), { status: 502, headers });
  }

  await admin.from("financial_assistant_conversations").insert({
    user_id: authData.user.id,
    question,
    answer_title: String(answer.title || "Borcama yanıtı").slice(0, 100),
    answer: String(answer.answer).slice(0, 1800),
    route: answer.route,
    action_label: String(answer.actionLabel || "İlgili ekranı aç").slice(0, 60),
    needs_more_info: Boolean(answer.needsMoreInfo),
    model,
  });

  return new Response(JSON.stringify({
    title: String(answer.title || "Borcama yanıtı").slice(0, 100),
    answer: String(answer.answer).slice(0, 1800), route: answer.route,
    actionLabel: String(answer.actionLabel || "İlgili ekranı aç").slice(0, 60),
    needsMoreInfo: Boolean(answer.needsMoreInfo), disclaimer: String(answer.disclaimer || "").slice(0, 240), quota,
  }), { status: 200, headers });
});
