import { createClient } from "npm:@supabase/supabase-js@2";

const izinliOriginler = new Set([
  "https://borcama.com",
  "https://www.borcama.com",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://localhost:5173",
  "http://localhost:5174",
]);

function cors(origin: string | null) {
  const yerelOnizleme = !!origin && /^http:\/\/(127\.0\.0\.1|localhost):51\d{2}$/.test(origin);
  const izinli = origin && (izinliOriginler.has(origin) || yerelOnizleme)
    ? origin
    : "https://borcama.com";
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

async function reklamsizHakTanimla(
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

async function proHakTanimla(
  admin: ReturnType<typeof createClient>,
  userId: string,
  orderId: string,
  purchasedAt: string,
) {
  const satinAlim = new Date(purchasedAt);
  const baslangic = Number.isNaN(satinAlim.getTime()) ? new Date() : satinAlim;
  const bitis = new Date(baslangic);
  bitis.setMonth(bitis.getMonth() + 1);
  const { data: mevcut } = await admin
    .from("user_entitlements")
    .select("pro_expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  const mevcutBitis = mevcut?.pro_expires_at ? new Date(mevcut.pro_expires_at) : null;
  const korunacakBitis = mevcutBitis && mevcutBitis.getTime() > bitis.getTime()
    ? mevcutBitis
    : bitis;
  const simdi = new Date().toISOString();
  const { error } = await admin.from("user_entitlements").upsert(
    {
      user_id: userId,
      pro_expires_at: korunacakBitis.toISOString(),
      pro_purchase_id: orderId,
      source: "shopier",
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
  const postBody = req.method === "POST"
    ? await req.clone().json().catch(() => null)
    : null;

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
    const reklamsizUrunId = String(Deno.env.get("SHOPIER_PRODUCT_ID") || "49351033");
    const proUrunId = String(Deno.env.get("SHOPIER_PRO_PRODUCT_ID") || "49524249");
    const { data: satinAlimlar } = await admin
      .from("shopier_purchases")
      .select("order_id,product_id,purchased_at")
      .eq("buyer_email", email)
      .eq("status", "paid")
      .order("purchased_at", { ascending: false })
      .limit(20);
    let sonProSiparisiIslendi = false;
    for (const satinAlim of satinAlimlar || []) {
      await admin
        .from("shopier_purchases")
        .update({ user_id: user.id, updated_at: new Date().toISOString() })
        .eq("order_id", satinAlim.order_id);
      if (String(satinAlim.product_id) === reklamsizUrunId)
        await reklamsizHakTanimla(admin, user.id, satinAlim.order_id);
      if (
        !sonProSiparisiIslendi &&
        proUrunId &&
        String(satinAlim.product_id) === proUrunId
      ) {
        await proHakTanimla(
          admin,
          user.id,
          satinAlim.order_id,
          satinAlim.purchased_at,
        );
        sonProSiparisiIslendi = true;
      }
    }

    let { data: hak } = await admin
      .from("user_entitlements")
      .select("ad_free_lifetime,pro_expires_at,source,granted_at,trial_started_at,trial_ends_at")
      .eq("user_id", user.id)
      .maybeSingle();
    const hesapYasi = Date.now() - new Date(user.created_at).getTime();
    const yeniHesap = hesapYasi >= 0 && hesapYasi <= 7 * 24 * 60 * 60 * 1000;
    const denemeEngelli = ["admin_revoked", "self_revoked"].includes(String(hak?.source || ""));
    if (!hak?.trial_started_at && yeniHesap && !denemeEngelli) {
      const baslangic = new Date();
      const bitis = new Date(baslangic.getTime() + 30 * 24 * 60 * 60 * 1000);
      const { error: denemeHatasi } = await admin.from("user_entitlements").upsert(
        {
          user_id: user.id,
          trial_started_at: baslangic.toISOString(),
          trial_ends_at: bitis.toISOString(),
          updated_at: baslangic.toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (!denemeHatasi) {
        hak = {
          ...(hak || {}),
          trial_started_at: baslangic.toISOString(),
          trial_ends_at: bitis.toISOString(),
        };
      }
    }
    const proExpiresAt = hak?.pro_expires_at || null;
    const trialEndsAt = hak?.trial_ends_at || null;
    const trialActive = !!trialEndsAt && new Date(trialEndsAt).getTime() > Date.now();
    return new Response(
      JSON.stringify({
        adFreeLifetime: !!hak?.ad_free_lifetime,
        proActive: !!proExpiresAt && new Date(proExpiresAt).getTime() > Date.now(),
        proExpiresAt,
        trialActive,
        trialStartedAt: hak?.trial_started_at || null,
        trialEndsAt,
        trialDaysRemaining: trialActive
          ? Math.max(1, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
          : 0,
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

  const kullaniciAksiyonu = String(postBody?.action || "");
  if (["revoke_self_manual_pro", "activate_revenuecat_pro"].includes(kullaniciAksiyonu)) {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token)
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers,
      });
    const { data, error } = await admin.auth.getUser(token);
    const user = data.user;
    if (error || !user?.id)
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers,
      });

    const simdi = new Date().toISOString();
    if (kullaniciAksiyonu === "revoke_self_manual_pro") {
      const { data: mevcut } = await admin
        .from("user_entitlements")
        .select("source")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!["admin_manual", "shopier"].includes(String(mevcut?.source || "")))
        return new Response(JSON.stringify({ error: "PAID_SUBSCRIPTION_REQUIRES_PORTAL" }), {
          status: 409,
          headers,
        });
      const { error: guncellemeHatasi } = await admin
        .from("user_entitlements")
        .update({
          pro_expires_at: null,
          pro_purchase_id: null,
          source: "self_revoked",
          updated_at: simdi,
        })
        .eq("user_id", user.id);
      if (guncellemeHatasi)
        return new Response(JSON.stringify({ error: "ENTITLEMENT_UPDATE_FAILED" }), {
          status: 500,
          headers,
        });
    } else {
      const bitisTarihi = postBody?.expiresAt
        ? new Date(String(postBody.expiresAt))
        : null;
      if (bitisTarihi && !Number.isFinite(bitisTarihi.getTime()))
        return new Response(JSON.stringify({ error: "INVALID_EXPIRATION" }), {
          status: 422,
          headers,
        });
      const expiresAt = bitisTarihi?.toISOString() || null;
      const { error: guncellemeHatasi } = await admin.from("user_entitlements").upsert(
        {
          user_id: user.id,
          pro_expires_at: expiresAt,
          pro_purchase_id: null,
          source: "revenuecat",
          updated_at: simdi,
        },
        { onConflict: "user_id" },
      );
      if (guncellemeHatasi)
        return new Response(JSON.stringify({ error: "ENTITLEMENT_UPDATE_FAILED" }), {
          status: 500,
          headers,
        });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  const gelenGizli = req.headers.get("x-borcama-shopier-secret") || "";
  const beklenenGizli = Deno.env.get("SHOPIER_BRIDGE_SECRET") || "";
  if (!sabitSureliEsit(gelenGizli, beklenenGizli))
    return new Response(JSON.stringify({ error: "FORBIDDEN" }), {
      status: 403,
      headers,
    });

  const body = postBody;
  const event = String(body?.event || "");
  const order = body?.order || null;
  const reklamsizUrunId = String(Deno.env.get("SHOPIER_PRODUCT_ID") || "49351033");
  const proUrunId = String(Deno.env.get("SHOPIER_PRO_PRODUCT_ID") || "49524249");
  const urun = Array.isArray(order?.lineItems)
    ? order.lineItems.find((x: Record<string, unknown>) => {
        const id = String(x.productId);
        return id === reklamsizUrunId || (!!proUrunId && id === proUrunId);
      })
    : null;
  const productId = String(urun?.productId || "");
  if (!order?.id || order.paymentStatus !== "paid" || !urun)
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
    const lineItem = urun;
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
    if (user && productId === reklamsizUrunId)
      await reklamsizHakTanimla(admin, user.id, String(order.id));
    if (user && proUrunId && productId === proUrunId)
      await proHakTanimla(
        admin,
        user.id,
        String(order.id),
        order.dateCreated || simdi,
      );
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
      .select("user_id,product_id")
      .maybeSingle();
    if (satinAlim?.user_id && String(satinAlim.product_id) === reklamsizUrunId) {
      const { count } = await admin
        .from("shopier_purchases")
        .select("order_id", { count: "exact", head: true })
        .eq("user_id", satinAlim.user_id)
        .eq("product_id", reklamsizUrunId)
        .eq("status", "paid");
      if (!count)
        await admin
          .from("user_entitlements")
          .update({ ad_free_lifetime: false, updated_at: simdi })
          .eq("user_id", satinAlim.user_id)
          .eq("purchase_id", orderId);
    }
    if (
      satinAlim?.user_id &&
      proUrunId &&
      String(satinAlim.product_id) === proUrunId
    )
      await admin
        .from("user_entitlements")
        .update({
          pro_expires_at: null,
          pro_purchase_id: null,
          updated_at: simdi,
        })
        .eq("user_id", satinAlim.user_id)
        .eq("pro_purchase_id", orderId);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ ignored: true }), {
    status: 200,
    headers,
  });
});
