import { nativeMi } from "./platform.js";
import { bildirimKimligi, bildirimZamanlari } from "./odemeBildirimiPlan.js";

// Odeme hatirlatmasi. Kural docs/ios gonderim kaydindan birebir alindi:
//   - yalniz kullanici Ayarlar'dan acarsa kurulur
//   - odeme tarihinden BIR GUN ONCE yerel saatle 09:00
//   - ayni gune denk gelen odemeler TEK bildirimde gruplanir
//   - kilit ekraninda tutar, banka, kart son hanesi veya borc turu YOK
//   - tamamen cihazda hesaplanir; push servisine finansal icerik gitmez
const AYAR_ANAHTARI = "borcama_odeme_hatirlatmasi";
const BASLIK = "Ödeme hatırlatması";
const METIN = "Yarın için kayıtlı ödemen var. Ayrıntıları Borcama'da kontrol et.";

// Ayar ekrani ile planlama ayni listeyi kullanmali; App.jsx'ten prop
// gecirmek yerine son bilinen liste burada tutulur.
let sonYaklasan = [];

export function yaklasaniKaydet(liste) {
  sonYaklasan = Array.isArray(liste) ? liste : [];
}

let sdkPromise = null;
function bildirimSdk() {
  if (!sdkPromise) sdkPromise = import("@capacitor/local-notifications");
  return sdkPromise;
}

export function hatirlatmaAcikMi() {
  if (!nativeMi) return false;
  try {
    return localStorage.getItem(AYAR_ANAHTARI) === "1";
  } catch {
    return false;
  }
}

function hatirlatmayiKaydet(acik) {
  try {
    if (acik) localStorage.setItem(AYAR_ANAHTARI, "1");
    else localStorage.removeItem(AYAR_ANAHTARI);
  } catch {
    /* depolama kapaliysa sessizce gec */
  }
}

// Bildirim izni. Kullanici reddederse false doner ve ayar acilmaz.
export async function hatirlatmaIzniIste() {
  if (!nativeMi) return false;
  try {
    const { LocalNotifications } = await bildirimSdk();
    const mevcut = await LocalNotifications.checkPermissions();
    if (mevcut?.display === "granted") return true;
    const sonuc = await LocalNotifications.requestPermissions();
    return sonuc?.display === "granted";
  } catch {
    return false;
  }
}

export async function bildirimleriPlanla(yaklasan = sonYaklasan) {
  if (!nativeMi) return { planlanan: 0 };
  try {
    const { LocalNotifications } = await bildirimSdk();

    // Once mevcut planlari temizle; veri degistikce tarihler kayabilir.
    const bekleyen = await LocalNotifications.getPending();
    if (bekleyen?.notifications?.length) {
      await LocalNotifications.cancel({ notifications: bekleyen.notifications });
    }

    if (!hatirlatmaAcikMi()) return { planlanan: 0 };

    const zamanlar = bildirimZamanlari(yaklasan);
    if (!zamanlar.length) return { planlanan: 0 };

    await LocalNotifications.schedule({
      notifications: zamanlar.map(({ anahtar, zaman }) => ({
        id: bildirimKimligi(anahtar),
        title: BASLIK,
        body: METIN,
        schedule: { at: zaman, allowWhileIdle: true },
      })),
    });
    return { planlanan: zamanlar.length };
  } catch {
    return { planlanan: 0 };
  }
}

export async function hatirlatmayiAyarla(acik, yaklasan = sonYaklasan) {
  if (!nativeMi) return false;
  if (acik) {
    const izin = await hatirlatmaIzniIste();
    if (!izin) return false;
  }
  hatirlatmayiKaydet(acik);
  await bildirimleriPlanla(yaklasan);
  return acik;
}
