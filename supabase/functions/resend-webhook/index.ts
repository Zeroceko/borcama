import { createClient } from "npm:@supabase/supabase-js@2";
import { Webhook } from "npm:svix@1.74.1";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = String(Deno.env.get("RESEND_WEBHOOK_SECRET") || "").trim();
  if (!secret) return new Response("Webhook not configured", { status: 503 });
  const payload = await req.text();
  let event: any;
  try {
    event = new Webhook(secret).verify(payload, {
      "svix-id": req.headers.get("svix-id") || "",
      "svix-timestamp": req.headers.get("svix-timestamp") || "",
      "svix-signature": req.headers.get("svix-signature") || "",
    });
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }
  const emailId = String(event?.data?.email_id || "");
  if (!emailId) return new Response("ok");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data } = await admin.from("marketing_deliveries").select("id,open_count,click_count").eq("resend_email_id", emailId).maybeSingle();
  if (!data) return new Response("ok");
  const now = new Date().toISOString();
  const update: Record<string, unknown> = { last_event_at: now, updated_at: now };
  if (event.type === "email.delivered") Object.assign(update, { status: "delivered", delivered_at: now });
  if (event.type === "email.opened") Object.assign(update, { status: "opened", opened_at: now, open_count: Number(data.open_count || 0) + 1 });
  if (event.type === "email.clicked") Object.assign(update, { status: "clicked", clicked_at: now, click_count: Number(data.click_count || 0) + 1 });
  if (["email.bounced", "email.failed", "email.complained"].includes(event.type)) Object.assign(update, { status: event.type.replace("email.", ""), error_code: event.type });
  await admin.from("marketing_deliveries").update(update).eq("id", data.id);
  return new Response("ok");
});
