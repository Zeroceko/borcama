import { nativeMi } from "./platform.js";

// Biyometrik kilit yalniz native'de anlamli; eklenti dinamik import ile
// yuklenir ve tarayici paketine girmez.
const AYAR_ANAHTARI = "borcama_biyometrik_kilit";

let sdkPromise = null;
function biyometriSdk() {
  if (!sdkPromise) sdkPromise = import("@aparajita/capacitor-biometric-auth");
  return sdkPromise;
}

// Kullanicinin tercihi cihazda tutulur; hesabin bir parcasi degildir,
// cihazdan cihaza tasinmaz. Sunucuya hicbir sey gitmez.
export function kilitAcikMi() {
  if (!nativeMi) return false;
  try {
    return localStorage.getItem(AYAR_ANAHTARI) === "1";
  } catch {
    return false;
  }
}

export function kilidiAyarla(acik) {
  if (!nativeMi) return;
  try {
    if (acik) localStorage.setItem(AYAR_ANAHTARI, "1");
    else localStorage.removeItem(AYAR_ANAHTARI);
  } catch {
    /* depolama kapaliysa sessizce gec */
  }
}

// Cihaz biyometri destekliyor ve kullanici kaydetmis mi?
export async function biyometriKullanilabilir() {
  if (!nativeMi) return { kullanilabilir: false, tur: "" };
  try {
    const { BiometricAuth } = await biyometriSdk();
    const durum = await BiometricAuth.checkBiometry();
    return {
      kullanilabilir: Boolean(durum?.isAvailable),
      tur: durum?.biometryType ? String(durum.biometryType) : "",
    };
  } catch {
    return { kullanilabilir: false, tur: "" };
  }
}

// Kilidi acmak icin dogrulama ister. Basarili olursa true doner.
// Iptal ve hata durumlarinda false doner; cagiran taraf kilidi acik tutar.
export async function kimlikDogrula() {
  if (!nativeMi) return true;
  try {
    const { BiometricAuth } = await biyometriSdk();
    await BiometricAuth.authenticate({
      reason: "Borcama'yı açmak için kimliğini doğrula",
      cancelTitle: "Vazgeç",
      allowDeviceCredential: true,
      iosFallbackTitle: "Cihaz şifresini kullan",
    });
    return true;
  } catch {
    return false;
  }
}
