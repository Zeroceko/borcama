import { nativeMi } from "./platform.js";
import { supabase } from "./supabaseClient.js";
import {
  derinBaglantiAyristir,
  nativeDonusAdresi,
  uygulamaBaglantisiMi,
} from "./derinBaglantiAdres.js";

// Native kabukta webview kaynagi capacitor://borcama.com oldugu icin e-posta
// dogrulama baglantisi oraya donemiyor; Supabase izinli adres listesinde de
// yer alamiyor. Bu yuzden baglanti uygulamanin kendi URL semasina doner, iOS
// onu uygulamaya teslim eder ve oturum burada kurulur. Onceden baglanti
// tarayicida aciliyor, tek kullanimlik anahtar orada harcaniyordu: kullanici
// web'de giris yapmis oluyor, uygulamaya donunce hala "E-postani kontrol et"
// ekraninda kaliyordu.

// Dogrulama ve parola yenileme e-postalarinin donecegi adres. Tarayicida
// davranis degismez.
export function epostaDonusAdresi(yol = "/summary") {
  return nativeMi ? nativeDonusAdresi() : window.location.origin + yol;
}

// Capacitor'un getLaunchUrl() degeri uygulama acik kaldigi surece ayni
// kaliyor. Oturum kurup yonlendirince sayfa bastan yukleniyor, ayni baglanti
// yeniden okunuyor ve uygulama sonsuz dongude bos ekranda kaliyordu. Islenen
// baglanti sekme oturumuna yazilir; yeniden yuklemede atlanir.
const ISLENDI_ANAHTARI = "borcama:derin-baglanti";

function islendiMi(adres) {
  try {
    return sessionStorage.getItem(ISLENDI_ANAHTARI) === adres;
  } catch {
    return false;
  }
}

function islendiYaz(adres) {
  try {
    sessionStorage.setItem(ISLENDI_ANAHTARI, adres);
  } catch {
    // Depolama kapaliysa en fazla bir kez daha denenir.
  }
}

async function oturumKur(adres) {
  if (islendiMi(adres)) return;
  const veri = derinBaglantiAyristir(adres);
  if (!veri) return;
  islendiYaz(adres);
  if (veri.hata) {
    window.location.assign("/login?baglanti=gecersiz");
    return;
  }
  try {
    if (veri.erisimAnahtari && veri.yenilemeAnahtari) {
      const { error } = await supabase.auth.setSession({
        access_token: veri.erisimAnahtari,
        refresh_token: veri.yenilemeAnahtari,
      });
      if (error) throw error;
    } else if (veri.kod) {
      const { error } = await supabase.auth.exchangeCodeForSession(veri.kod);
      if (error) throw error;
    } else {
      return;
    }
  } catch {
    window.location.assign("/login?baglanti=gecersiz");
    return;
  }
  window.location.assign(veri.hedef);
}

// Uygulama acikken gelen baglantilar icin dinleyici; kapaliyken acilmissa
// baslangic adresi okunur.
export async function derinBaglantilariDinle() {
  if (!nativeMi) return;
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("appUrlOpen", (olay) => {
      if (uygulamaBaglantisiMi(olay?.url)) oturumKur(olay.url);
    });
    const baslangic = await App.getLaunchUrl();
    if (uygulamaBaglantisiMi(baslangic?.url)) oturumKur(baslangic.url);
  } catch {
    // Eklenti yoksa akis tarayici davranisina duser.
  }
}
