import { createClient } from "npm:@supabase/supabase-js@2";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GUNCELLEYEN_OLAYLAR = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "CANCELLATION",
  "BILLING_ISSUE",
  "TEMPORARY_ENTITLEMENT_GRANT",
]);

function sabitSureliEsit(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let sonuc = 0;
  for (let i = 0; i < a.length; i += 1) sonuc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return sonuc === 0;
}

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function imzaGecerliMi(req: Request, hamGövde: string) {
  const beklenenYetki = String(Deno.env.get("REVENUECAT_WEBHOOK_AUTHORIZATION") || "").trim();
  if (!sabitSureliEsit(req.headers.get("authorization") || "", beklenenYetki)) return false;

  const gizli = String(Deno.env.get("REVENUECAT_WEBHOOK_SIGNING_SECRET") || "").trim();
  const baslik = req.headers.get("x-revenuecat-webhook-signature") || "";
  if (!gizli || !baslik) return false;
  const alanlar = Object.fromEntries(baslik.split(",").map((parca) => parca.trim().split("=", 2)));
  const zaman = Number(alanlar.t);
  const gelen = String(alanlar.v1 || "").toLowerCase();
  if (!Number.isFinite(zaman) || Math.abs(Date.now() / 1000 - zaman) > 300) return false;
  const anahtar = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(gizli),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const imza = await crypto.subtle.sign("HMAC", anahtar, new TextEncoder().encode(`${zaman}.${hamGövde}`));
  return sabitSureliEsit(hex(imza), gelen);
}

function iso(ms: unknown) {
  const sayi = Number(ms);
  return Number.isFinite(sayi) && sayi > 0 ? new Date(sayi).toISOString() : null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const hamGövde = await req.text();
  if (!(await imzaGecerliMi(req, hamGövde))) return new Response("Invalid signature", { status: 401 });

  let payload: Record<string, any>;
  try {
    payload = JSON.parse(hamGövde);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const olay = payload?.event || {};
  const id = String(olay.id || "").trim();
  const tur = String(olay.type || "").trim().toUpperCase();
  const ortam = String(olay.environment || "").trim().toUpperCase();
  const store = String(olay.store || "").trim().toUpperCase();
  const uygulamaId = String(olay.app_id || "").trim();
  const beklenenUygulamaId = String(Deno.env.get("REVENUECAT_IOS_APP_ID") || "").trim();
  const userId = String(olay.app_user_id || "").trim();
  const olayZamani = iso(olay.event_timestamp_ms);
  if (!beklenenUygulamaId)
    return new Response("App configuration missing", { status: 503 });
  if (
    !id || !tur || !["PRODUCTION", "SANDBOX"].includes(ortam) || !olayZamani ||
    !sabitSureliEsit(uygulamaId, beklenenUygulamaId)
  )
    return new Response("Invalid event", { status: 422 });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  let sonKullaniciId: string | null = null;
  if (UUID.test(userId)) {
    const { data: authKullanicisi } = await admin.auth.admin.getUserById(userId);
    sonKullaniciId = authKullanicisi?.user?.id || null;
  }
  const bitis = iso(olay.grace_period_expiration_at_ms || olay.expiration_at_ms);
  const islemId = String(olay.original_transaction_id || olay.transaction_id || "").trim() || null;
  const { data: mevcutOlay } = await admin.from("revenuecat_webhook_events")
    .select("processed_at").eq("id", id).maybeSingle();
  if (mevcutOlay?.processed_at) return new Response("ok");
  if (!mevcutOlay) {
    const { error } = await admin.from("revenuecat_webhook_events").insert({
      id,
      event_type: tur,
      app_user_id: sonKullaniciId,
      environment: ortam,
      store: store || null,
      transaction_id: islemId,
      expiration_at: bitis,
      occurred_at: olayZamani,
    });
    if (error && error.code !== "23505") return new Response("Event store failed", { status: 500 });
  }

  const proOlayi = Array.isArray(olay.entitlement_ids)
    ? olay.entitlement_ids.includes("pro")
    : String(olay.entitlement_id || "") === "pro";
  if (ortam === "PRODUCTION" && store === "APP_STORE" && sonKullaniciId && proOlayi) {
    const { data: mevcut } = await admin.from("user_entitlements")
      .select("pro_expires_at,source,revenuecat_event_at")
      .eq("user_id", sonKullaniciId).maybeSingle();
    const oncekiOlay = mevcut?.revenuecat_event_at ? new Date(mevcut.revenuecat_event_at).getTime() : 0;
    if (new Date(olayZamani).getTime() >= oncekiOlay) {
      if (tur === "EXPIRATION") {
        if (["revenuecat", "revenuecat_ios"].includes(String(mevcut?.source || ""))) {
          const { error } = await admin.from("user_entitlements").upsert({
            user_id: sonKullaniciId,
            pro_expires_at: null,
            pro_purchase_id: null,
            source: "revenuecat_ios",
            revenuecat_event_at: olayZamani,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
          if (error) return new Response("Entitlement update failed", { status: 500 });
        }
      } else if (GUNCELLEYEN_OLAYLAR.has(tur) && bitis) {
        const mevcutBitis = mevcut?.pro_expires_at ? new Date(mevcut.pro_expires_at).getTime() : 0;
        const yeniBitis = Math.max(mevcutBitis, new Date(bitis).getTime());
        const { error } = await admin.from("user_entitlements").upsert({
          user_id: sonKullaniciId,
          pro_expires_at: new Date(yeniBitis).toISOString(),
          pro_purchase_id: null,
          source: "revenuecat_ios",
          revenuecat_event_at: olayZamani,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
        if (error) return new Response("Entitlement update failed", { status: 500 });
      }
    }
  }

  await admin.from("revenuecat_webhook_events")
    .update({ processed_at: new Date().toISOString() }).eq("id", id);
  return new Response("ok");
});
