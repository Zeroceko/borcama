const json = (res, status, body) => res.status(status).json(body);

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  const cronSecret = String(process.env.CRON_SECRET || "").trim();
  const authorization = String(req.headers.authorization || "").trim();
  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return json(res, 401, { error: "UNAUTHORIZED" });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const lifecycleSecret = String(process.env.LIFECYCLE_CRON_SECRET || "").trim();
  if (!supabaseUrl || !lifecycleSecret) {
    return json(res, 503, { error: "LIFECYCLE_EMAILS_NOT_CONFIGURED" });
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/lifecycle-emails`, {
    method: "POST",
    headers: { "x-borcama-cron-secret": lifecycleSecret },
  });
  const body = await response.json().catch(() => ({ error: "INVALID_LIFECYCLE_RESPONSE" }));
  return json(res, response.status, body);
}
