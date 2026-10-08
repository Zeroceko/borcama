import { iosMu } from "./platform.js";
import { supabase } from "./supabaseClient.js";

// Apple ile giris yalniz iOS uygulamasinda sunuluyor. Tarayici surumunde ve
// Android'de dugme hic cizilmiyor; akis orada e-posta ve parola ile surer.
export const appleGirisiVarMi = iosMu;

// Apple, yeniden oynatma saldirisina karsi istege bir nonce bekliyor: istege
// nonce'un SHA-256 ozeti, dogrulamaya ise ham hali gonderilir. Supabase ham
// nonce ile kimlik belirtecini karsilastirip dogruluyor.
function hamNonceUret() {
  const bayt = new Uint8Array(32);
  crypto.getRandomValues(bayt);
  return Array.from(bayt, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Ozet(metin) {
  const veri = new TextEncoder().encode(metin);
  const ozet = await crypto.subtle.digest("SHA-256", veri);
  return Array.from(new Uint8Array(ozet), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function appleHataMesaji(hata) {
  const metin = String(hata?.message || hata || "");
  // Kullanici Apple sayfasini kapattiginda hata gostermeye gerek yok.
  if (/cancel/i.test(metin) || hata?.code === "1001") return "";
  if (/network|internet|connection/i.test(metin))
    return "Apple ile giriş için bağlantı kurulamadı. Bağlantını kontrol edip tekrar dene.";
  return "Apple ile giriş tamamlanamadı. Lütfen tekrar dene ya da parolanla giriş yap.";
}

// Apple'dan kimlik belirtecini alir ve Supabase oturumunu kurar. Basarili
// olursa true doner; kullanici vazgecerse hata firlatmadan false doner.
export async function appleIleGirisYap() {
  if (!appleGirisiVarMi) return false;
  const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
  const hamNonce = hamNonceUret();
  const sonuc = await SignInWithApple.authorize({
    clientId: "com.borcama.app",
    redirectURI: "https://borcama.com/auth-callback",
    scopes: "email",
    nonce: await sha256Ozet(hamNonce),
  });
  const belirtec = sonuc?.response?.identityToken;
  if (!belirtec) throw new Error("Apple kimlik belirteci alınamadı.");
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: belirtec,
    nonce: hamNonce,
  });
  if (error) throw error;
  return true;
}
