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
    return "Çok fazla deneme yapıldı. Lütfen biraz bekleyin.";
  if (["captcha_failed", "captcha_provider_disabled"].includes(error.code))
    return "Güvenlik doğrulaması yenilendi. Doğrulama tamamlanınca tekrar gönderin.";
  if (error.code === "network_error")
    return "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.";
  return "Parola yenileme bağlantısı gönderilemedi. Tekrar deneyin; sorun sürerse zero@borcama.com adresine yazın.";
}
