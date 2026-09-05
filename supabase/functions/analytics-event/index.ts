import { createClient } from "npm:@supabase/supabase-js@2";

const izinliOriginler = new Set([
  "https://borcama.com",
  "https://www.borcama.com",
  ...Array.from({ length: 20 }, (_, i) => `http://127.0.0.1:${5173 + i}`),
  ...Array.from({ length: 20 }, (_, i) => `http://localhost:${5173 + i}`),
]);
const izinliEtkinlikler = new Set([
  "landing_visit",
  "register_view",
  "deposit_result_view",
  "deposit_product_click",
]);
const guvenliEdinimKarakterleri = /[^\p{L}\p{N}._/ -]+/gu;

function cors(origin: string | null) {
  const izinli = origin && izinliOriginler.has(origin) ? origin : "https://borcama.com";
  return {
    "Access-Control-Allow-Origin": izinli,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function metin(value: unknown, limit = 100) {
  return String(value || "").trim().replace(/[\u0000-\u001f]/g, "").slice(0, limit);
}

function edinimMetni(value: unknown, limit = 100, lower = false) {
  const temiz = String(value || "").normalize("NFKC")
    .replace(guvenliEdinimKarakterleri, " ").replace(/\s+/g, " ").trim().slice(0, limit);
  return lower ? temiz.toLowerCase() : temiz;
}

function base64Url(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sessionImzasi(sessionId: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(sessionId)));
}

function sabitZamanliEsit(a: string, b: string) {
  if (a.length !== b.length) return false;
  let fark = 0;
  for (let i = 0; i < a.length; i += 1) fark |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return fark === 0;
}

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get("origin")), "Content-Type": "application/json; charset=utf-8" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405, headers });
  if (!izinliOriginler.has(req.headers.get("origin") || ""))
    return new Response(JSON.stringify({ error: "ORIGIN_NOT_ALLOWED" }), { status: 403, headers });

  const body = await req.json().catch(() => null);
  const eventName = metin(body?.event_name, 40);
  const sessionId = metin(body?.session_id, 40);
  if (!izinliEtkinlikler.has(eventName) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId))
    return new Response(JSON.stringify({ error: "INVALID_EVENT" }), { status: 422, headers });

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const expectedToken = await sessionImzasi(
    sessionId,
    Deno.env.get("ANALYTICS_SESSION_SECRET") || serviceKey,
  );
  const suppliedToken = metin(body?.session_token, 100);
  const { data: existing, error: sessionError } = await admin.from("analytics_events")
    .select("event_name").eq("session_id", sessionId).limit(2);
  if (sessionError)
    return new Response(JSON.stringify({ error: "SESSION_UNAVAILABLE" }), { status: 500, headers });
  const ayniEtkinlikVar = (existing || []).some((row) => row.event_name === eventName);
  if (suppliedToken && !sabitZamanliEsit(suppliedToken, expectedToken))
    return new Response(JSON.stringify({ error: "INVALID_SESSION_TOKEN" }), { status: 401, headers });
  if (!suppliedToken && (existing || []).length > 0 && !ayniEtkinlikVar)
    return new Response(JSON.stringify({ error: "SESSION_TOKEN_REQUIRED" }), { status: 401, headers });

  const plan = edinimMetni(body?.plan, 30, true);
  const experimentId = edinimMetni(body?.experiment_id, 30, true);
  const experimentVariant = edinimMetni(body?.experiment_variant, 20, true);
  const guvenliDeney = experimentId === "landing-001" && ["control", "variant"].includes(experimentVariant);
  const { error } = await admin.rpc("record_analytics_event", {
    p_session_id: sessionId,
    p_event_name: eventName,
    p_path: metin(body?.path, 120),
    p_source: edinimMetni(body?.source, 100, true) || "direct",
    p_medium: edinimMetni(body?.medium, 100, true),
    p_campaign: edinimMetni(body?.campaign, 120),
    p_content: edinimMetni(body?.content, 120),
    p_term: edinimMetni(body?.term, 120),
    p_paid_click: Boolean(metin(body?.click_id, 160)),
    p_plan: ["free", "pro"].includes(plan) ? plan : "",
    p_experiment_id: guvenliDeney ? experimentId : "",
    p_experiment_variant: guvenliDeney ? experimentVariant : "",
  });
  if (error) {
    const sinirAsildi = String(error.message || "").includes("ANALYTICS_RATE_LIMITED");
    return new Response(JSON.stringify({ error: sinirAsildi ? "RATE_LIMITED" : "EVENT_NOT_SAVED" }), {
      status: sinirAsildi ? 429 : 500,
      headers,
    });
  }
  return new Response(JSON.stringify({ session_token: expectedToken }), { status: 200, headers });
});
