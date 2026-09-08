import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://borcama.com",
  "https://www.borcama.com",
  ...Array.from({ length: 30 }, (_, i) => `http://127.0.0.1:${5173 + i}`),
  ...Array.from({ length: 30 }, (_, i) => `http://localhost:${5173 + i}`),
]);

function cors(origin: string | null) {
  const safeOrigin = origin && allowedOrigins.has(origin) ? origin : "https://borcama.com";
  return {
    "Access-Control-Allow-Origin": safeOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: Record<string, unknown>, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

function normalEposta(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function paddleYapilandirmasi() {
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

async function paddleIstegi(path: string, init: RequestInit = {}) {
  const { apiKey, baseUrl } = paddleYapilandirmasi();
  const cevap = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const sonuc = await cevap.json().catch(() => null);
  if (!cevap.ok)
    throw new Error(String(sonuc?.error?.code || sonuc?.error?.type || "PADDLE_REQUEST_FAILED"));
  return sonuc;
}

async function etkinPaddleAboneligi(email: string, userId: string) {
  const musteriler = await paddleIstegi(`/customers?email=${encodeURIComponent(email)}&per_page=30`);
  const eslesenMusteriler = (Array.isArray(musteriler?.data) ? musteriler.data : [])
    .filter((musteri: Record<string, unknown>) => normalEposta(musteri.email) === email);
  if (!eslesenMusteriler.length) return null;

  const abonelikler: Array<Record<string, unknown>> = [];
  for (const musteri of eslesenMusteriler) {
    const customerId = String(musteri?.id || "");
    if (!/^ctm_[a-z\d]{26}$/.test(customerId)) continue;
    const cevap = await paddleIstegi(`/subscriptions?customer_id=${encodeURIComponent(customerId)}&per_page=30`);
    abonelikler.push(...(Array.isArray(cevap?.data) ? cevap.data : []));
  }

  const etkin = abonelikler.filter((abonelik) => ["active", "trialing", "paused"].includes(String(abonelik?.status || "")));
  if (!etkin.length) return null;
  const kullaniciyaAit = etkin.filter((abonelik) => {
    const ozelVeri = abonelik?.custom_data as Record<string, unknown> | null;
    return [ozelVeri?.app_user_id, ozelVeri?.appUserId, ozelVeri?.user_id]
      .some((deger) => String(deger || "") === userId);
  });
  const adaylar = kullaniciyaAit.length ? kullaniciyaAit : etkin;
  if (adaylar.length !== 1) throw new Error("PADDLE_SUBSCRIPTION_AMBIGUOUS");
  return adaylar[0];
}

async function paddleAboneliginiHemenIptalEt(email: string, userId: string) {
  const abonelik = await etkinPaddleAboneligi(email, userId);
  if (!abonelik) return false;
  const subscriptionId = String(abonelik.id || "");
  if (!/^sub_[a-z\d]{26}$/.test(subscriptionId)) throw new Error("PADDLE_SUBSCRIPTION_INVALID");
  await paddleIstegi(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ effective_from: "immediately" }),
  });
  return true;
}

Deno.serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405, headers);
  if (!allowedOrigins.has(req.headers.get("origin") || ""))
    return json({ error: "ORIGIN_NOT_ALLOWED" }, 403, headers);

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "UNAUTHORIZED" }, 401, headers);
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const user = authData.user;
  if (authError || !user?.id || !user.email)
    return json({ error: "UNAUTHORIZED" }, 401, headers);

  const body = await req.json().catch(() => null);
  if (String(body?.confirmation || "") !== "HESABIMI SİL")
    return json({ error: "CONFIRMATION_REQUIRED" }, 422, headers);

  let subscriptionCancelled = false;
  try {
    subscriptionCancelled = await paddleAboneliginiHemenIptalEt(normalEposta(user.email), user.id);
  } catch (error) {
    const code = error instanceof Error ? error.message : "SUBSCRIPTION_CANCELLATION_FAILED";
    return json({ error: `SUBSCRIPTION_CANCELLATION_FAILED:${code}` }, 409, headers);
  }

  const { error: deleteError } = await admin.rpc("delete_borcama_account", {
    target_user_id: user.id,
    target_email: normalEposta(user.email),
  });
  if (deleteError) return json({ error: "ACCOUNT_DELETE_FAILED" }, 500, headers);

  return json({ ok: true, subscriptionCancelled }, 200, headers);
});
