import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const id = String(url.searchParams.get("id") || "");
  const requested = String(url.searchParams.get("to") || "/summary");
  const base = String(Deno.env.get("PUBLIC_SITE_URL") || "https://borcama.com").replace(/\/$/, "");
  const supabaseVerifyPrefix = `${String(Deno.env.get("SUPABASE_URL") || "").replace(/\/$/, "")}/auth/v1/verify`;
  const destination = requested.startsWith("/") && !requested.startsWith("//")
    ? `${base}${requested}`
    : requested.startsWith(supabaseVerifyPrefix)
      ? requested
      : `${base}/summary`;
  if (/^[0-9a-f-]{36}$/i.test(id)) {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data } = await admin.from("marketing_deliveries").select("visit_count").eq("id", id).maybeSingle();
    if (data) {
      const now = new Date().toISOString();
      await admin.from("marketing_deliveries").update({
        visited_at: now, visit_count: Number(data.visit_count || 0) + 1, last_event_at: now, updated_at: now,
      }).eq("id", id);
    }
  }
  return Response.redirect(destination, 302);
});
