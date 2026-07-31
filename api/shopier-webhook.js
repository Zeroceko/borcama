const SHOPIER_API = "https://api.shopier.com/v1";

async function shopierGet(path) {
  const token = process.env.SHOPIER_ACCESS_TOKEN;
  if (!token) throw new Error("SHOPIER_ACCESS_TOKEN_MISSING");
  const response = await fetch(`${SHOPIER_API}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "Borcama/1.0 (https://borcama.com)",
    },
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error(`SHOPIER_API_${response.status}`);
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const event = String(req.headers["shopier-event"] || "");
    if (!["order.created", "refund.updated"].includes(event))
      return res.status(200).json({ ignored: true });

    const payload = req.body || {};
    const id = String(payload.id || "");
    if (!id) return res.status(200).json({ ignored: true });

    let order;
    let refund = null;
    if (event === "order.created") order = await shopierGet(`/orders/${encodeURIComponent(id)}`);
    else {
      refund = await shopierGet(`/refunds/${encodeURIComponent(id)}`);
      order = await shopierGet(`/orders/${encodeURIComponent(refund.orderId)}`);
    }

    const productId = String(process.env.SHOPIER_PRODUCT_ID || "49351033");
    const urunVar = Array.isArray(order?.lineItems)
      ? order.lineItems.some((x) => String(x.productId) === productId)
      : false;
    if (order?.paymentStatus !== "paid" || !urunVar)
      return res.status(200).json({ ignored: true });

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const bridgeSecret = process.env.SHOPIER_BRIDGE_SECRET;
    if (!supabaseUrl || !bridgeSecret)
      throw new Error("SHOPIER_BRIDGE_CONFIG_MISSING");

    const response = await fetch(`${supabaseUrl}/functions/v1/shopier-entitlement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-borcama-shopier-secret": bridgeSecret,
      },
      body: JSON.stringify({ event, order, refund }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error(`ENTITLEMENT_${response.status}`);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Shopier webhook error:", error?.message || error);
    return res.status(500).json({ error: "WEBHOOK_PROCESSING_FAILED" });
  }
}

