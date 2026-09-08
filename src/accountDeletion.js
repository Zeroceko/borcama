export const HESAP_SILME_ONAYI = "HESABIMI SİL";

export function hesapSilmeOnayiGecerli(metin) {
  return String(metin || "").trim().toLocaleUpperCase("tr-TR") === HESAP_SILME_ONAYI;
}

export function hesapSilmeHataMesaji(kod) {
  const hata = String(kod || "");
  if (hata.includes("UNAUTHORIZED"))
    return "Oturumun sona ermiş. Yeniden giriş yapıp tekrar dene.";
  if (hata.includes("CONFIRMATION_REQUIRED"))
    return "Silme onayı doğrulanamadı.";
  if (hata.includes("SUBSCRIPTION"))
    return "Aktif aboneliğin durdurulamadığı için hesabın silinmedi. Lütfen tekrar dene veya destekle iletişime geç.";
  return "Hesabın silinemedi. Hiçbir verin kaldırılmadı; lütfen tekrar dene.";
}

export function borcamaYerelVerileriniTemizle(local = globalThis.localStorage, session = globalThis.sessionStorage) {
  for (const depo of [local, session]) {
    if (!depo) continue;
    const silinecekler = [];
    for (let index = 0; index < depo.length; index += 1) {
      const anahtar = depo.key(index);
      if (anahtar?.startsWith("borcama:") || anahtar?.startsWith("borctakip:"))
        silinecekler.push(anahtar);
    }
    silinecekler.forEach((anahtar) => depo.removeItem(anahtar));
  }
}

export async function borcamaHesabiniSil({ supabase, supabaseUrl, onay, fetchImpl = fetch }) {
  if (!hesapSilmeOnayiGecerli(onay)) throw new Error("CONFIRMATION_REQUIRED");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("UNAUTHORIZED");

  const cevap = await fetchImpl(`${supabaseUrl}/functions/v1/delete-account`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ confirmation: HESAP_SILME_ONAYI }),
  });
  const sonuc = await cevap.json().catch(() => ({}));
  if (!cevap.ok || !sonuc.ok) throw new Error(sonuc.error || "ACCOUNT_DELETE_FAILED");
  return sonuc;
}
