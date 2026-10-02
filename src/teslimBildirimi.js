// E-posta dogrulama baglantisi artik takip yonlendirmesi kullanmiyor; acilan
// ekran ziyareti kendisi bildirir. Basarisiz olmasi akisi etkilemez.
export function teslimZiyaretiniBildir(teslimKimligi) {
  if (!teslimKimligi) return;
  const taban = import.meta.env.VITE_SUPABASE_URL;
  if (!taban) return;
  try {
    fetch(
      `${taban}/functions/v1/email-redirect?ping=1&id=${encodeURIComponent(teslimKimligi)}`,
      { method: "GET", mode: "cors", keepalive: true },
    ).catch(() => {});
  } catch {
    // Bildirim gonderilemezse dogrulama akisi aynen devam eder.
  }
}
