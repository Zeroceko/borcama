import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://borcama.com",
  "https://www.borcama.com",
  "https://crm.borcama.com",
]);

function cors(origin: string | null) {
  const local = !!origin && /^http:\/\/(127\.0\.0\.1|localhost):51\d{2}$/.test(origin);
  const allowed = origin && (allowedOrigins.has(origin) || local) ? origin : "https://borcama.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

function normalize(value: unknown) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
}

function makeCode() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(7));
  return `BRCM${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

Deno.serve(async (request) => {
  const headers = { ...cors(request.headers.get("origin")), "Content-Type": "application/json; charset=utf-8" };
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (!new Set(["GET", "POST"]).has(request.method))
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405, headers });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const action = String(body?.action || (request.method === "GET" ? "status" : ""));

  if (action === "validate") {
    const code = normalize(body?.code);
    if (code.length < 8)
      return new Response(JSON.stringify({ valid: false }), { status: 200, headers });
    const { data } = await admin.from("referral_codes").select("id").eq("code", code).eq("status", "active").maybeSingle();
    return new Response(JSON.stringify({ valid: !!data }), { status: 200, headers });
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const user = authData.user;
  if (authError || !user?.id)
    return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers });

  let { data: codeRow, error: codeError } = await admin
    .from("referral_codes")
    .select("id,code,status,created_at")
    .eq("user_id", user.id)
    .in("status", ["active", "paused"])
    .maybeSingle();
  if (codeError) return new Response(JSON.stringify({ error: "REFERRAL_CODE_UNAVAILABLE" }), { status: 500, headers });

  if (!codeRow) {
    for (let attempt = 0; attempt < 6 && !codeRow; attempt += 1) {
      const candidate = makeCode();
      const result = await admin.from("referral_codes").insert({ user_id: user.id, code: candidate }).select("id,code,status,created_at").single();
      if (!result.error) codeRow = result.data;
      else if (result.error.code === "23505") {
        const existing = await admin.from("referral_codes")
          .select("id,code,status,created_at")
          .eq("user_id", user.id)
          .in("status", ["active", "paused"])
          .maybeSingle();
        if (existing.data) codeRow = existing.data;
      } else
        return new Response(JSON.stringify({ error: "REFERRAL_CODE_CREATE_FAILED" }), { status: 500, headers });
    }
  }
  if (!codeRow)
    return new Response(JSON.stringify({ error: "REFERRAL_CODE_CREATE_FAILED" }), { status: 500, headers });

  const [{ data: invitations, error: invitationError }, { data: rewards, error: rewardError }] = await Promise.all([
    admin.from("referrals").select("id,status,attributed_at,verified_at,rewarded_at,risk_reason").eq("referrer_user_id", user.id).order("created_at", { ascending: false }),
    admin.from("referral_rewards").select("id,status,days,role,starts_at,ends_at,applied_at").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  if (invitationError || rewardError)
    return new Response(JSON.stringify({ error: "REFERRAL_STATUS_UNAVAILABLE" }), { status: 500, headers });

  const rewardRows = rewards || [];
  return new Response(JSON.stringify({
    code: codeRow.code,
    codeStatus: codeRow.status,
    inviteUrl: `https://borcama.com/davet/${encodeURIComponent(codeRow.code)}`,
    totals: {
      registered: (invitations || []).length,
      waiting: (invitations || []).filter((item) => item.status === "registered").length,
      rewarded: (invitations || []).filter((item) => item.status === "rewarded").length,
      review: (invitations || []).filter((item) => item.status === "review").length,
      earnedDays: rewardRows.filter((item) => item.status === "applied").reduce((sum, item) => sum + Number(item.days || 0), 0),
      pendingDays: rewardRows.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.days || 0), 0),
    },
    invitations: (invitations || []).map((item) => ({
      id: item.id,
      status: item.status,
      attributedAt: item.attributed_at,
      verifiedAt: item.verified_at,
      rewardedAt: item.rewarded_at,
    })),
  }), { status: 200, headers });
});
