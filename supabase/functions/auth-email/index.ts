import { Webhook } from "npm:standardwebhooks@1.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { dogrulamaHtml, hesapAksiyonuHtml } from "../_shared/borcama-email.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405 });
  const secret = String(Deno.env.get("SEND_EMAIL_HOOK_SECRET") || "").replace(/^v1,whsec_/, "").replace(/^whsec_/, "").trim();
  const apiKey = String(Deno.env.get("RESEND_API_KEY") || "").trim();
  if (!secret || !apiKey) return new Response(JSON.stringify({ error: "EMAIL_HOOK_NOT_CONFIGURED" }), { status: 503 });
  const payload = await req.text();
  let hook: any;
  try {
    hook = new Webhook(secret).verify(payload, {
      "webhook-id": req.headers.get("webhook-id") || "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
      "webhook-signature": req.headers.get("webhook-signature") || "",
    });
  } catch {
    return new Response(JSON.stringify({ error: "INVALID_SIGNATURE" }), { status: 401 });
  }
  const user = hook?.user;
  const emailData = hook?.email_data;
  if (!user?.email || !emailData) return new Response(JSON.stringify({ error: "INVALID_PAYLOAD" }), { status: 422 });
  const actionType = String(emailData.email_action_type || "magiclink");
  const supabaseUrl = String(Deno.env.get("SUPABASE_URL") || "").replace(/\/$/, "");
  const redirectTo = String(emailData.redirect_to || "https://borcama.com/summary");
  const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(emailData.token_hash)}&type=${encodeURIComponent(actionType)}&redirect_to=${encodeURIComponent(redirectTo)}`;
  let subject = actionType === "signup" ? "Borcama hesabını doğrula" : actionType === "recovery" ? "Borcama parolanı yenile" : "Borcama'ya giriş bağlantın";
  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  let trackedUrl = confirmUrl;
  let deliveryId = "";
  if (actionType === "signup") {
    const { data: campaign } = await admin.from("marketing_campaigns").select("id,subject").eq("slug", "auth-confirmation").maybeSingle();
    if (campaign?.subject) subject = campaign.subject;
    if (campaign?.id && user?.id) {
      const { data: existing } = await admin.from("marketing_deliveries").select("id").eq("campaign_id", campaign.id).eq("user_id", user.id).maybeSingle();
      if (existing?.id) deliveryId = existing.id;
      else {
        const { data } = await admin.from("marketing_deliveries").insert({ campaign_id: campaign.id, user_id: user.id, recipient_email: user.email, status: "queued" }).select("id").single();
        deliveryId = data?.id || "";
      }
      if (deliveryId) trackedUrl = `${supabaseUrl}/functions/v1/email-redirect?id=${encodeURIComponent(deliveryId)}&to=${encodeURIComponent(confirmUrl)}`;
    }
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Borcama <zero@borcama.com>", to: [user.email], reply_to: "zero@borcama.com",
      subject, html: actionType === "signup" ? dogrulamaHtml(trackedUrl) : hesapAksiyonuHtml(confirmUrl, actionType),
      tags: [{ name: "campaign", value: "auth-confirmation" }],
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return new Response(JSON.stringify({ error: "EMAIL_SEND_FAILED" }), { status: 502 });
  if (deliveryId && result?.id) {
    const now = new Date().toISOString();
    await admin.from("marketing_deliveries").update({ resend_email_id: result.id, status: "sent", sent_at: now, last_event_at: now, updated_at: now }).eq("id", deliveryId);
  }
  return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
});
