import { supabase } from "./supabaseClient.js";
import { referansKodunuTemizle } from "./referralCode.js";
export { davetKayitYolu, davetKodunuYoldanOku, referansKodunuTemizle } from "./referralCode.js";

async function endpoint(body, token = "") {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) throw new Error("REFERRALS_NOT_CONFIGURED");
  const response = await fetch(`${url}/functions/v1/referrals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "REFERRAL_REQUEST_FAILED");
  return result;
}

export async function referansKodunuDogrula(code) {
  const normalized = referansKodunuTemizle(code);
  if (!normalized) return { valid: null, code: "" };
  const result = await endpoint({ action: "validate", code: normalized });
  return { valid: !!result.valid, code: normalized };
}

export async function davetDurumunuGetir() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("UNAUTHORIZED");
  return endpoint({ action: "status" }, token);
}
