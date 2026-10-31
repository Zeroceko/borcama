import { version } from "../package.json";
import { supabase, supabaseHazir } from "./supabaseClient.js";
import { nativeMi } from "./platform.js";
import { kullanimOlayiGecerliMi, sayilabilirOrtamMi } from "./kullanimOlaylari.js";

// Ayarlardaki "Kullanım istatistikleri" izni (iOS). Varsayılan kapalı; izin
// sunucuda hesapla birlikte kayıtlıdır, cihazdaki kopya yalnız izin yokken
// istek atmamak için. Olaylar hesaba, cihaza veya oturuma bağlanmaz.
export const KULLANIM_METIN_SURUMU = "2026-10-31";
const IZIN_ANAHTARI = "borcama:kullanim-istatistigi";

function depo() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function kullanimIzniVarMi() {
  try { return depo()?.getItem(IZIN_ANAHTARI) === "evet"; } catch { return false; }
}

function yerelIzniYaz(izinVar) {
  try {
    if (izinVar) depo()?.setItem(IZIN_ANAHTARI, "evet");
    else depo()?.removeItem(IZIN_ANAHTARI);
  } catch { /* depo kapalıysa izin kapalı sayılır */ }
}

// Sunucudaki izin kaydını cihaza indirir (yeniden kurulum, başka cihaz).
export async function kullanimIzniniEsitle() {
  if (!nativeMi || !supabaseHazir) return kullanimIzniVarMi();
  try {
    const { data, error } = await supabase.rpc("kullanim_izni_oku");
    if (error) return kullanimIzniVarMi();
    yerelIzniYaz(data === true);
    return data === true;
  } catch {
    return kullanimIzniVarMi();
  }
}

// Önce sunucu: kayıt yazılamazsa izin değişmemiş sayılır.
export async function kullanimIzniniAyarla(izinVar) {
  if (!supabaseHazir) return kullanimIzniVarMi();
  try {
    const { error } = await supabase.rpc("kullanim_izni_ayarla", {
      p_izin: Boolean(izinVar),
      p_metin_surumu: KULLANIM_METIN_SURUMU,
    });
    if (error) return kullanimIzniVarMi();
    yerelIzniYaz(Boolean(izinVar));
    return Boolean(izinVar);
  } catch {
    return kullanimIzniVarMi();
  }
}

// Yalnız tamamlanmış eylemden sonra çağrılır. Sonuç beklenmez; ölçüm hiçbir
// akışı yavaşlatmaz ya da bozmaz.
export function kullanimOlayi(olay, ayrinti = null) {
  if (!nativeMi || !supabaseHazir || !kullanimIzniVarMi()) return;
  if (!sayilabilirOrtamMi(import.meta.env.PROD, globalThis) || !kullanimOlayiGecerliMi(olay, ayrinti)) return;
  try {
    void supabase.rpc("kullanim_olayi_kaydet", {
      p_olay: olay,
      p_ayrinti: ayrinti,
      p_surum: version,
    }).then(() => {}, () => {});
  } catch { /* ölçüm hatası sessizce geçer */ }
}
