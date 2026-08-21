import { createClient } from "npm:@supabase/supabase-js@2";
import { denemeBasladiHtml, denemeBitiyorHtml } from "../_shared/borcama-email.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

type Campaign = { id: string; slug: string; subject: string };

async function kampanya(admin: ReturnType<typeof createClient>, slug: string): Promise<Campaign> {
  const { data, error } = await admin.from("marketing_campaigns")
    .select("id,slug,subject").eq("slug", slug).eq("status", "active").single();
  if (error || !data) throw new Error("CAMPAIGN_UNAVAILABLE");
  return data;
}

async function takipliGonder(params: {
  admin: ReturnType<typeof createClient>;
  campaign: Campaign;
  userId: string;
  email: string;
  html: (url: string) => string;
  destination: string;
}) {
  const { admin, campaign, userId, email, html, destination } = params;
  const apiKey = String(Deno.env.get("RESEND_API_KEY") || "").trim();
  if (!apiKey) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");

  const { data: existing } = await admin.from("marketing_deliveries")
    .select("id,status").eq("campaign_id", campaign.id).eq("user_id", userId).maybeSingle();
  if (existing && existing.status !== "failed") return { sent: false, duplicate: true };

  let deliveryId = existing?.id;
  if (!deliveryId) {
    const { data, error } = await admin.from("marketing_deliveries").insert({
      campaign_id: campaign.id,
      user_id: userId,
      recipient_email: email,
      status: "queued",
    }).select("id").single();
    if (error || !data) throw new Error("DELIVERY_CREATE_FAILED");
    deliveryId = data.id;
  }

  const base = String(Deno.env.get("PUBLIC_SITE_URL") || "https://borcama.com").replace(/\/$/, "");
  const trackingUrl = `${String(Deno.env.get("SUPABASE_URL"))}/functions/v1/email-redirect?id=${encodeURIComponent(deliveryId)}&to=${encodeURIComponent(destination)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Borcama <zero@borcama.com>",
      to: [email],
      reply_to: "zero@borcama.com",
      subject: campaign.subject,
      html: html(trackingUrl),
      tags: [{ name: "campaign", value: campaign.slug }, { name: "delivery", value: deliveryId }],
      headers: { "List-Unsubscribe": `<mailto:zero@borcama.com?subject=Abonelikten%20ayril>` },
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result?.id) {
    await admin.from("marketing_deliveries").update({ status: "failed", error_code: `resend_${response.status}`, updated_at: new Date().toISOString() }).eq("id", deliveryId);
    throw new Error("EMAIL_SEND_FAILED");
  }
  const now = new Date().toISOString();
  await admin.from("marketing_deliveries").update({ resend_email_id: result.id, status: "sent", sent_at: now, last_event_at: now, updated_at: now }).eq("id", deliveryId);
  return { sent: true, duplicate: false, base };
}

Deno.serve(async (req) => {
  if (!["GET", "POST"].includes(req.method)) return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  const expected = String(Deno.env.get("LIFECYCLE_CRON_SECRET") || "").trim();
  const supplied = String(req.headers.get("x-borcama-cron-secret") || "").trim();
  if (!expected || supplied !== expected) return json({ error: "UNAUTHORIZED" }, 401);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    const [startedCampaign, endingCampaign] = await Promise.all([
      kampanya(admin, "trial-started"), kampanya(admin, "trial-ending-3d"),
    ]);
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 86400000);
    const { data: entitlements, error } = await admin.from("user_entitlements")
      .select("user_id,trial_started_at,trial_ends_at,pro_expires_at,trial_started_email_sent_at,trial_ending_email_sent_at")
      .not("trial_ends_at", "is", null)
      .gt("trial_ends_at", now.toISOString());
    if (error) throw new Error("ENTITLEMENTS_UNAVAILABLE");

    let started = 0, ending = 0, skipped = 0;
    for (const entitlement of entitlements || []) {
      const paid = entitlement.pro_expires_at && new Date(entitlement.pro_expires_at).getTime() > now.getTime();
      if (paid) { skipped += 1; continue; }
      const { data } = await admin.auth.admin.getUserById(entitlement.user_id);
      const user = data.user;
      if (!user?.email || !user.email_confirmed_at) { skipped += 1; continue; }
      const email = user.email.trim().toLowerCase();
      const days = Math.max(1, Math.ceil((new Date(entitlement.trial_ends_at).getTime() - now.getTime()) / 86400000));
      if (!entitlement.trial_started_email_sent_at) {
        const result = await takipliGonder({
          admin, campaign: startedCampaign, userId: user.id, email,
          destination: "/summary", html: (url) => denemeBasladiHtml(days, url),
        });
        if (result.sent || result.duplicate) {
          await admin.from("user_entitlements").update({ trial_started_email_sent_at: now.toISOString(), updated_at: now.toISOString() }).eq("user_id", user.id);
          if (result.sent) started += 1;
        }
      }
      if (!entitlement.trial_ending_email_sent_at && new Date(entitlement.trial_ends_at) <= threeDays) {
        const result = await takipliGonder({
          admin, campaign: endingCampaign, userId: user.id, email,
          destination: "/upgrade?source=trial-ending-email", html: (url) => denemeBitiyorHtml(days, url),
        });
        if (result.sent || result.duplicate) {
          await admin.from("user_entitlements").update({ trial_ending_email_sent_at: now.toISOString(), updated_at: now.toISOString() }).eq("user_id", user.id);
          if (result.sent) ending += 1;
        }
      }
    }
    return json({ ok: true, trial_started_sent: started, trial_ending_sent: ending, skipped });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "LIFECYCLE_EMAIL_FAILED" }, 500);
  }
});
