import { cevir, dil, locale } from "./i18n.js";

// Sunucuya giden sabit onay metni; dil ne olursa olsun degismez.
export const HESAP_SILME_ONAYI = "HESABIMI SİL";
export const HESAP_SILME_YONLENDIRME_SURESI_MS = 5000;

export function hesapSilmeBasarisiVar(search = "") {
  return new URLSearchParams(String(search || "")).get("account_deleted") === "1";
}

// Kullanicinin yazacagi ifade arayuz diline gore degisir (tr: HESABIMI SİL,
// en: DELETE). Sunucuya her zaman HESAP_SILME_ONAYI gider.
export function hesapSilmeOnayIfadesi(dilKodu = dil()) {
  return cevir(dilKodu, "ayarlar.silme.onayIfadesi");
}

export function hesapSilmeOnayiGecerli(metin, dilKodu = dil()) {
  const yazilan = String(metin || "").trim();
  if (yazilan.toLocaleUpperCase("tr-TR") === HESAP_SILME_ONAYI) return true;
  if (dilKodu === "tr") return false;
  return yazilan.toLocaleUpperCase(locale(dilKodu)) === hesapSilmeOnayIfadesi(dilKodu).toLocaleUpperCase(locale(dilKodu));
}

export function hesapSilmeHataMesaji(kod, dilKodu = dil()) {
  const hata = String(kod || "");
  if (hata.includes("UNAUTHORIZED")) return cevir(dilKodu, "ayarlar.silme.hataOturum");
  if (hata.includes("CONFIRMATION_REQUIRED")) return cevir(dilKodu, "ayarlar.silme.hataOnay");
  if (hata.includes("SUBSCRIPTION")) return cevir(dilKodu, "ayarlar.silme.hataAbonelik");
  return cevir(dilKodu, "ayarlar.silme.hataGenel");
}

// Kullanici verisi degil, uygulamanin acilis durumunu tutan teknik isaretler.
// Silinirlerse uygulama acilista e-posta baglantisini ikinci kez islemeye
// calisiyor; tek kullanimlik anahtar coktan harcandigi icin hesap silindikten
// sonra kullanici "baglantinin suresi dolmus" ekraniyla karsilaniyordu.
export const TEMIZLIK_DISI_ANAHTARLAR = new Set(["borcama:derin-baglanti"]);

export function borcamaYerelVerileriniTemizle(local = globalThis.localStorage, session = globalThis.sessionStorage) {
  for (const depo of [local, session]) {
    if (!depo) continue;
    const silinecekler = [];
    for (let index = 0; index < depo.length; index += 1) {
      const anahtar = depo.key(index);
      if (TEMIZLIK_DISI_ANAHTARLAR.has(anahtar)) continue;
      if (anahtar?.startsWith("borcama:") || anahtar?.startsWith("borctakip:"))
        silinecekler.push(anahtar);
    }
    silinecekler.forEach((anahtar) => depo.removeItem(anahtar));
  }
}

export async function borcamaHesabiniSil({ supabase, supabaseUrl, onay, dilKodu = dil(), fetchImpl = fetch }) {
  if (!hesapSilmeOnayiGecerli(onay, dilKodu)) throw new Error("CONFIRMATION_REQUIRED");
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
