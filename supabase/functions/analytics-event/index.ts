import { createClient } from "npm:@supabase/supabase-js@2";

const izinliOriginler = new Set([
  "https://borcama.com",
  "https://www.borcama.com",
  ...Array.from({ length: 20 }, (_, i) => `http://127.0.0.1:${5173 + i}`),
  ...Array.from({ length: 20 }, (_, i) => `http://localhost:${5173 + i}`),
]);
const izinliEtkinlikler = new Set(["landing_visit", "register_view"]);

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

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await admin.from("analytics_events").upsert({
    session_id: sessionId,
    event_name: eventName,
    path: metin(body?.path, 120),
    source: metin(body?.source, 100) || "direct",
    medium: metin(body?.medium, 100),
    campaign: metin(body?.campaign, 120),
    plan: metin(body?.plan, 30),
  }, { onConflict: "session_id,event_name", ignoreDuplicates: true });
  if (error) return new Response(JSON.stringify({ error: "EVENT_NOT_SAVED" }), { status: 500, headers });
  return new Response(null, { status: 204, headers });
});
