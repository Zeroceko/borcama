import { t } from "./i18n.js";

// A challenge token is single-use, including rejected authentication attempts.
export async function runAuthAttempt(request, finish) {
  try {
    return await request();
  } catch {
    return { data: null, error: { code: "network_error" } };
  } finally {
    finish();
  }
}

export function recoveryErrorMessage(error) {
  if (error.status === 429 || error.code === "over_request_rate_limit")
    return t("hata.cokFazlaDeneme");
  if (["captcha_failed", "captcha_provider_disabled"].includes(error.code))
    return t("hata.dogrulamaYenilendi");
  if (error.code === "network_error")
    return t("hata.baglantiYok");
  return t("hata.yenilemeGonderilemedi");
}
