import { supabase } from "./supabaseClient.js";

export async function revenueCatProHakkiniSenkronizeEt() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!token || !supabaseUrl) throw new Error("UNAUTHORIZED");
  const cevap = await fetch(`${supabaseUrl}/functions/v1/shopier-entitlement`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "sync_revenuecat_pro" }),
  });
  const sonuc = await cevap.json().catch(() => ({}));
  if (!cevap.ok) throw new Error(sonuc.error || "REVENUECAT_SYNC_FAILED");
  return sonuc;
}
