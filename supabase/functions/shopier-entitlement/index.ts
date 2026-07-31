import { createClient } from "npm:@supabase/supabase-js@2";

const izinliOriginler = new Set([
  "https://borcama.com",
  "https://www.borcama.com",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5173",
  "http://localhost:5174",
]);

function cors(origin: string | null) {
  const izinli = origin && izinliOriginler.has(origin) ? origin : "https://borcama.com";
  return {
    "Access-Control-Allow-Origin": izinli,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-borcama-shopier-secret",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

function sabitSureliEsit(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let sonuc = 0;
  for (let i = 0; i < a.length; i += 1)
    sonuc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return sonuc === 0;
}

function normalEposta(value: unknown) {
  return String(value || "").trim().toLocaleLowerCase("en-US");
}

async function kullaniciBul(admin: ReturnType<typeof createClient>, email: string) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const bulunan = data.users.find((u) => normalEposta(u.email) === email);
    if (bulunan) return bulunan;
    if (data.users.length < 1000) break;
  }
  return null;
}

async function hakTanimla(
  admin: ReturnType<typeof createClient>,
  userId: string,
  orderId: string,
) {
  const simdi = new Date().toISOString();
  const { error } = await admin.from("user_entitlements").upsert(
    {
      user_id: userId,
      ad_free_lifetime: true,
      source: "shopier",
      purchase_id: orderId,
      granted_at: simdi,
      updated_at: simdi,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

Deno.serve(async (req) => {
  const headers = {
    ...cors(req.headers.get("origin")),
    "Content-Type": "application/json; charset=utf-8",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === "GET") {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token)
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers,
      });
    const { data, error } = await admin.auth.getUser(token);
    const user = data.user;
    if (error || !user?.id || !user.email)
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers,
      });

    const email = normalEposta(user.email);
    const { data: satinAlimlar } = await admin
      .from("shopier_purchases")
      .select("order_id")
      .eq("buyer_email", email)
      .eq("status", "paid")
      .order("purchased_at", { ascending: false })
      .limit(1);
    const satinAlim = satinAlimlar?.[0];
    if (satinAlim) {
      await admin
        .from("shopier_purchases")
        .update({ user_id: user.id, updated_at: new Date().toISOString() })
        .eq("order_id", satinAlim.order_id);
      await hakTanimla(admin, user.id, satinAlim.order_id);
    }

    const { data: hak } = await admin
      .from("user_entitlements")
      .select("ad_free_lifetime,source,granted_at")
      .eq("user_id", user.id)
      .maybeSingle();
    return new Response(
      JSON.stringify({
        adFreeLifetime: !!hak?.ad_free_lifetime,
        source: hak?.source || null,
        grantedAt: hak?.granted_at || null,
      }),
      { status: 200, headers },
    );
  }

  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers,
    });

  const gelenGizli = req.headers.get("x-borcama-shopier-secret") || "";
  const beklenenGizli = Deno.env.get("SHOPIER_BRIDGE_SECRET") || "";
  if (!sabitSureliEsit(gelenGizli, beklenenGizli))
    return new Response(JSON.stringify({ error: "FORBIDDEN" }), {
      status: 403,
      headers,
    });

  const body = await req.json().catch(() => null);
  const event = String(body?.event || "");
  const order = body?.order || null;
  const productId = String(Deno.env.get("SHOPIER_PRODUCT_ID") || "49351033");
  const urunVar = Array.isArray(order?.lineItems)
    ? order.lineItems.some((x: Record<string, unknown>) => String(x.productId) === productId)
    : false;
  if (!order?.id || order.paymentStatus !== "paid" || !urunVar)
    return new Response(JSON.stringify({ ignored: true }), {
      status: 200,
      headers,
    });

  if (event === "order.created") {
    const email = normalEposta(order?.billingInfo?.email || order?.shippingInfo?.email);
    if (!email)
      return new Response(JSON.stringify({ error: "BUYER_EMAIL_MISSING" }), {
        status: 422,
        headers,
      });
    const lineItem = order.lineItems.find(
      (x: Record<string, unknown>) => String(x.productId) === productId,
    );
    const simdi = new Date().toISOString();
    const user = await kullaniciBul(admin, email);
    const { error } = await admin.from("shopier_purchases").upsert(
      {
        order_id: String(order.id),
        user_id: user?.id || null,
        buyer_email: email,
        product_id: productId,
        amount: Number(lineItem?.total || order?.totals?.total || 0),
        currency: String(order.currency || "TRY"),
        status: "paid",
        purchased_at: order.dateCreated || simdi,
        updated_at: simdi,
      },
      { onConflict: "order_id" },
    );
    if (error) throw error;
    if (user) await hakTanimla(admin, user.id, String(order.id));
    return new Response(JSON.stringify({ ok: true, matched: !!user }), {
      status: 200,
      headers,
    });
  }

  if (event === "refund.updated" && body?.refund?.status === "succeeded") {
    const orderId = String(body.refund.orderId || order.id);
    const simdi = new Date().toISOString();
    const { data: satinAlim } = await admin
      .from("shopier_purchases")
      .update({ status: "refunded", updated_at: simdi })
      .eq("order_id", orderId)
      .select("user_id")
      .maybeSingle();
    if (satinAlim?.user_id) {
      const { count } = await admin
        .from("shopier_purchases")
        .select("order_id", { count: "exact", head: true })
        .eq("user_id", satinAlim.user_id)
        .eq("status", "paid");
      if (!count)
        await admin
          .from("user_entitlements")
          .update({ ad_free_lifetime: false, updated_at: simdi })
          .eq("user_id", satinAlim.user_id)
          .eq("purchase_id", orderId);
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ ignored: true }), {
    status: 200,
    headers,
  });
});

