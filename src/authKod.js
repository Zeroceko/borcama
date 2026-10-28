// Tek kullanimlik e-posta kodu (Supabase email OTP) icin saf yardimcilar.
// Kod uzunlugu projede 8 hane (supabase/config.toml > otp_length); eski
// ayarla gonderilmis 6 haneli kodlar da kabul edilir.

export const KOD_EN_AZ = 6;
export const KOD_EN_COK = 8;

// Yapistirilan "123 456-78" gibi metinlerden yalniz rakamlari alir.
export function kodTemizle(metin) {
  return String(metin ?? "").replace(/\D/g, "").slice(0, KOD_EN_COK);
}

export function kodGecerli(kod) {
  const temiz = kodTemizle(kod);
  return temiz.length >= KOD_EN_AZ && temiz.length <= KOD_EN_COK;
}

// Supabase'in kod hatalarini tek mesaja indirger: yanlis/suresi dolmus kod
// "kodYanlis", istek siniri "cokDenemeTekrar", digerleri "kodDogrulanamadi".
export function kodHataAnahtari(hata) {
  const kod = hata?.code || "";
  if (hata?.status === 429 || kod === "over_request_rate_limit" || kod === "over_email_send_rate_limit") return "auth.hata.cokDenemeTekrar";
  if (["otp_expired", "otp_disabled", "invalid_credentials", "validation_failed"].includes(kod) || hata?.status === 403) return "auth.hata.kodYanlis";
  return "auth.hata.kodDogrulanamadi";
}
