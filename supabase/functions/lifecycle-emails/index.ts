import { createClient } from "npm:@supabase/supabase-js@2";
import { denemeBasladiHtml, denemeBitiyorHtml, denemeIlkPlanHatirlatmaHtml, referansOduluHtml } from "../_shared/borcama-email.ts";
import { gunlukBorcSnapshotKaydet } from "../_shared/debt-snapshot.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

type Campaign = { id: string; slug: string; subject: string };
type ReferralBillingReward = {
  id: string;
  referral_id: string;
  user_id: string;
  days: number;
  status: string;
  billing_pause_status: string;
  paddle_subscription_id: string | null;
};

function normalEmail(value: unknown) {
  return String(value || "").trim().toLocaleLowerCase("en-US");
}

function paddleConfig() {
  const apiKey = String(Deno.env.get("PADDLE_API_KEY") || "").trim();
  const environment = String(Deno.env.get("PADDLE_ENVIRONMENT") || "").trim();
  if (!apiKey) throw new Error("PADDLE_API_KEY_NOT_CONFIGURED");
  if (!new Set(["production", "sandbox"]).has(environment))
    throw new Error("PADDLE_ENVIRONMENT_NOT_CONFIGURED");
  return {
    apiKey,
    baseUrl: environment === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com",
  };
}

async function paddleRequest(path: string, init: RequestInit = {}) {
  const { apiKey, baseUrl } = paddleConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const code = String(result?.error?.code || result?.error?.type || "PADDLE_REQUEST_FAILED");
    throw new Error(code);
  }
  return result;
}

async function activePaddleSubscription(email: string, userId: string) {
  const customersResult = await paddleRequest(`/customers?email=${encodeURIComponent(email)}&per_page=30`);
  const customers = (Array.isArray(customersResult?.data) ? customersResult.data : [])
    .filter((item: Record<string, unknown>) => normalEmail(item.email) === email);
  if (!customers.length) throw new Error("PADDLE_CUSTOMER_NOT_FOUND");

  const subscriptions: Array<Record<string, unknown>> = [];
  for (const customer of customers) {
    const customerId = String(customer?.id || "");
    if (!/^ctm_[a-z\d]{26}$/.test(customerId)) continue;
    const result = await paddleRequest(`/subscriptions?customer_id=${encodeURIComponent(customerId)}&per_page=30`);
    subscriptions.push(...(Array.isArray(result?.data) ? result.data : []));
  }
  const active = subscriptions.filter((item) => ["active", "trialing", "paused"].includes(String(item?.status || "")));
  const owned = active.filter((item) => {
    const custom = item?.custom_data as Record<string, unknown> | null;
    return [custom?.app_user_id, custom?.appUserId, custom?.user_id]
      .some((value) => String(value || "") === userId);
  });
  const candidates = owned.length ? owned : active;
  if (!candidates.length) throw new Error("PADDLE_ACTIVE_SUBSCRIPTION_NOT_FOUND");
  if (candidates.length !== 1) throw new Error("PADDLE_SUBSCRIPTION_AMBIGUOUS");
  return candidates[0];
}

async function scheduleReferralBillingPause(
  admin: ReturnType<typeof createClient>,
  userId: string,
  email: string,
  rewards: ReferralBillingReward[],
) {
  let subscription = await activePaddleSubscription(email, userId);
  const subscriptionId = String(subscription?.id || "");
  if (!/^sub_[a-z\d]{26}$/.test(subscriptionId)) throw new Error("PADDLE_SUBSCRIPTION_INVALID");
  if (String(subscription?.status || "") === "paused") throw new Error("PADDLE_SUBSCRIPTION_ALREADY_PAUSED");
  const scheduled = subscription?.scheduled_change as Record<string, unknown> | null;
  if (scheduled) {
    const ours = String(scheduled.action || "") === "pause" && rewards.some((reward) =>
      reward.billing_pause_status === "scheduled" && reward.paddle_subscription_id === subscriptionId
    );
    if (!ours) throw new Error("PADDLE_SCHEDULED_CHANGE_CONFLICT");
    const cleared = await paddleRequest(`/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      body: JSON.stringify({ scheduled_change: null }),
    });
    subscription = cleared?.data || subscription;
  }

  const billingPeriod = subscription?.current_billing_period as Record<string, unknown> | null;
  const effectiveAt = new Date(String(subscription?.next_billed_at || billingPeriod?.ends_at || ""));
  if (!Number.isFinite(effectiveAt.getTime()) || effectiveAt.getTime() <= Date.now())
    throw new Error("PADDLE_NEXT_BILLING_DATE_INVALID");
  const days = rewards.reduce((sum, reward) => sum + Math.max(1, Number(reward.days || 0)), 0);
  const resumeAt = new Date(effectiveAt.getTime() + days * 86400000);
  const paused = await paddleRequest(`/subscriptions/${subscriptionId}/pause`, {
    method: "POST",
    body: JSON.stringify({ effective_from: "next_billing_period", resume_at: resumeAt.toISOString() }),
  });
  const confirmedEffective = String(paused?.data?.scheduled_change?.effective_at || effectiveAt.toISOString());
  const confirmedResume = String(paused?.data?.scheduled_change?.resume_at || resumeAt.toISOString());
  const ids = rewards.map((reward) => reward.id);
  const { error } = await admin.from("referral_rewards").update({
    status: "applied",
    starts_at: confirmedEffective,
    ends_at: confirmedResume,
    applied_at: new Date().toISOString(),
    billing_pause_status: "scheduled",
    paddle_subscription_id: subscriptionId,
    billing_pause_effective_at: confirmedEffective,
    billing_resume_at: confirmedResume,
    billing_error: null,
    updated_at: new Date().toISOString(),
  }).in("id", ids);
  if (error) throw new Error("REFERRAL_BILLING_UPDATE_FAILED");

  for (const referralId of [...new Set(rewards.map((reward) => reward.referral_id))]) {
    const { data: related, error: relatedError } = await admin.from("referral_rewards")
      .select("status").eq("referral_id", referralId);
    if (relatedError) throw new Error("REFERRAL_STATUS_UPDATE_FAILED");
    if ((related || []).every((reward) => !["pending", "review"].includes(String(reward.status || "")))) {
      const { error: referralError } = await admin.from("referrals").update({
        status: "rewarded",
        rewarded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", referralId);
      if (referralError) throw new Error("REFERRAL_STATUS_UPDATE_FAILED");
    }
  }
  return rewards.filter((reward) => reward.billing_pause_status !== "scheduled").length;
}

async function processReferralBilling(admin: ReturnType<typeof createClient>) {
  await admin.from("referral_rewards").update({
    billing_pause_status: "completed",
    updated_at: new Date().toISOString(),
  }).eq("billing_pause_status", "scheduled").lte("billing_resume_at", new Date().toISOString());
  const { data, error } = await admin.from("referral_rewards")
    .select("id,referral_id,user_id,days,status,billing_pause_status,paddle_subscription_id")
    .in("billing_pause_status", ["pending", "failed", "scheduled"])
    .order("created_at");
  if (error) throw new Error("REFERRAL_BILLING_REWARDS_UNAVAILABLE");
  const groups = new Map<string, ReferralBillingReward[]>();
  for (const row of (data || []) as ReferralBillingReward[]) {
    if (row.status !== "pending" && row.billing_pause_status !== "scheduled") continue;
    const group = groups.get(row.user_id) || [];
    group.push(row);
    groups.set(row.user_id, group);
  }

  let scheduledCount = 0;
  for (const [userId, rewards] of groups) {
    if (rewards.every((reward) => reward.billing_pause_status === "scheduled")) continue;
    const { data: entitlement, error: entitlementError } = await admin.from("user_entitlements")
      .select("source").eq("user_id", userId).maybeSingle();
    if (entitlementError) continue;
    if (String(entitlement?.source || "") !== "revenuecat") continue;
    const { data: userData } = await admin.auth.admin.getUserById(userId);
    const email = normalEmail(userData.user?.email);
    if (!email) continue;
    try {
      scheduledCount += await scheduleReferralBillingPause(admin, userId, email, rewards);
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "REFERRAL_BILLING_SCHEDULE_FAILED";
      const review = [
        "PADDLE_CUSTOMER_NOT_FOUND",
        "PADDLE_ACTIVE_SUBSCRIPTION_NOT_FOUND",
        "PADDLE_SUBSCRIPTION_AMBIGUOUS",
        "PADDLE_SUBSCRIPTION_ALREADY_PAUSED",
        "PADDLE_SCHEDULED_CHANGE_CONFLICT",
        "PADDLE_NEXT_BILLING_DATE_INVALID",
      ].includes(code);
      await admin.from("referral_rewards").update({
        billing_pause_status: review ? "review" : "failed",
        billing_error: code,
        updated_at: new Date().toISOString(),
      }).in("id", rewards.map((reward) => reward.id));
      if (review) {
        await admin.from("referrals").update({
          status: "review",
          risk_reason: "billing_schedule_conflict",
          updated_at: new Date().toISOString(),
        }).in("id", [...new Set(rewards.map((reward) => reward.referral_id))]);
      }
    }
  }
  return scheduledCount;
}

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
  deliveryKey?: string;
}) {
  const { admin, campaign, userId, email, html, destination, deliveryKey = "default" } = params;
  const istanbulHour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hour12: false }).format(new Date()));
  if (istanbulHour < 10 || istanbulHour >= 18) return { sent: false, duplicate: false, skipped: "quiet_hours" };
  const since14 = new Date(Date.now() - 14 * 86400000).toISOString();
  const since48 = new Date(Date.now() - 48 * 3600000).toISOString();
  const { data: recent } = await admin.from("marketing_deliveries").select("sent_at").eq("user_id", userId).eq("status", "sent").gte("sent_at", since14);
  if ((recent || []).length >= 3 || (recent || []).some((row) => row.sent_at && row.sent_at >= since48)) return { sent: false, duplicate: false, skipped: "frequency_cap" };
  const apiKey = String(Deno.env.get("RESEND_API_KEY") || "").trim();
  if (!apiKey) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");

  const { data: existing } = await admin.from("marketing_deliveries")
    .select("id,status").eq("campaign_id", campaign.id).eq("user_id", userId).eq("delivery_key", deliveryKey).maybeSingle();
  if (existing && existing.status !== "failed") return { sent: false, duplicate: true };

  let deliveryId = existing?.id;
  if (!deliveryId) {
    const { data, error } = await admin.from("marketing_deliveries").insert({
      campaign_id: campaign.id,
      user_id: userId,
      delivery_key: deliveryKey,
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
  let debtSnapshotSaved = false;
  try {
    await gunlukBorcSnapshotKaydet(admin);
    debtSnapshotSaved = true;
  } catch { /* E-posta akışı snapshot hatasından etkilenmez. */ }
  try {
    const referralBillingScheduled = await processReferralBilling(admin);
    const [startedCampaign, endingCampaign, reminderCampaign, referralReferrerCampaign, referralInviteeCampaign] = await Promise.all([
      kampanya(admin, "trial-started"), kampanya(admin, "trial-ending-3d"),
      kampanya(admin, "trial-first-plan-reminder"),
      kampanya(admin, "referral-reward-referrer"), kampanya(admin, "referral-reward-invitee"),
    ]);
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 86400000);
    const { data: entitlements, error } = await admin.from("user_entitlements")
      .select("user_id,trial_started_at,trial_ends_at,pro_expires_at,trial_started_email_sent_at,trial_ending_email_sent_at,trial_reminder_email_sent_at")
      .not("trial_ends_at", "is", null)
      .gt("trial_ends_at", now.toISOString());
    if (error) throw new Error("ENTITLEMENTS_UNAVAILABLE");

    let started = 0, ending = 0, reminder = 0, referralSent = 0, skipped = 0;
    for (const entitlement of entitlements || []) {
      const paid = entitlement.pro_expires_at && new Date(entitlement.pro_expires_at).getTime() > now.getTime();
      if (paid) { skipped += 1; continue; }
      const { data } = await admin.auth.admin.getUserById(entitlement.user_id);
      const user = data.user;
      if (!user?.email || !user.email_confirmed_at) { skipped += 1; continue; }
      const email = user.email.trim().toLowerCase();
      const trialStartedAt = entitlement.trial_started_at ? new Date(entitlement.trial_started_at).getTime() : NaN;
      const minutesSinceTrialStart = Number.isFinite(trialStartedAt) ? (now.getTime() - trialStartedAt) / 60000 : NaN;
      const days = Math.max(1, Math.ceil((new Date(entitlement.trial_ends_at).getTime() - now.getTime()) / 86400000));
      // Cron gecikse bile başlangıç mesajı kaybolmasın; 48 saatten sonra ise
      // kullanıcıya başlangıç ve hatırlatma mesajlarını arka arkaya göndermeyelim.
      if (!entitlement.trial_started_email_sent_at && Number.isFinite(minutesSinceTrialStart) && minutesSinceTrialStart >= 5 && minutesSinceTrialStart < 48 * 60) {
        const result = await takipliGonder({
          admin, campaign: startedCampaign, userId: user.id, email,
          destination: "/summary", html: (url) => denemeBasladiHtml(days, url),
        });
        if (result.sent || result.duplicate) {
          await admin.from("user_entitlements").update({ trial_started_email_sent_at: now.toISOString(), updated_at: now.toISOString() }).eq("user_id", user.id);
          if (result.sent) started += 1;
        }
      }
      if (!entitlement.trial_reminder_email_sent_at && Number.isFinite(trialStartedAt) && now.getTime() - trialStartedAt >= 48 * 3600000) {
        const { data: activity } = await admin.from("activity_logs").select("id").eq("user_id", user.id).gte("created_at", new Date(trialStartedAt).toISOString()).limit(1);
        if (!(activity || []).length) {
          const result = await takipliGonder({ admin, campaign: reminderCampaign, userId: user.id, email, destination: "/summary?source=trial-first-plan-reminder", html: denemeIlkPlanHatirlatmaHtml });
          if (result.sent || result.duplicate) {
            await admin.from("user_entitlements").update({ trial_reminder_email_sent_at: now.toISOString(), updated_at: now.toISOString() }).eq("user_id", user.id);
            if (result.sent) reminder += 1;
          }
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
    const { data: referralRewards, error: referralError } = await admin.from("referral_rewards")
      .select("id,user_id,role,status,email_sent_at")
      .eq("status", "applied").is("email_sent_at", null).order("created_at").limit(100);
    if (referralError) throw new Error("REFERRAL_REWARDS_UNAVAILABLE");
    for (const reward of referralRewards || []) {
      const { data } = await admin.auth.admin.getUserById(reward.user_id);
      const user = data.user;
      if (!user?.email || !user.email_confirmed_at) { skipped += 1; continue; }
      const role = reward.role === "invitee" ? "invitee" : "referrer";
      const result = await takipliGonder({
        admin,
        campaign: role === "invitee" ? referralInviteeCampaign : referralReferrerCampaign,
        userId: user.id,
        email: user.email.trim().toLowerCase(),
        destination: "/settings?source=referral-reward-email",
        deliveryKey: reward.id,
        html: (url) => referansOduluHtml(role, url),
      });
      if (result.sent || result.duplicate) {
        await admin.from("referral_rewards").update({ email_sent_at: now.toISOString(), updated_at: now.toISOString() }).eq("id", reward.id);
        if (result.sent) referralSent += 1;
      }
    }
    return json({ ok: true, trial_started_sent: started, trial_ending_sent: ending, trial_reminder_sent: reminder, referral_reward_sent: referralSent, referral_billing_scheduled: referralBillingScheduled, skipped, debt_snapshot_saved: debtSnapshotSaved });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "LIFECYCLE_EMAIL_FAILED" }, 500);
  }
});
