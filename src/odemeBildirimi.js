import { nativeMi } from "./platform.js";
import {
  bildirimIcerigi,
  bildirimKimligi,
  bildirimZamanlari,
  ertelemeZamani,
  gecerliErtelemeler,
} from "./odemeBildirimiPlan.js";
import { kullaniciParaBirimi, kullaniciParaFormatla, paraBiriminiFormatla } from "./currencyInput.js";
import { t } from "./i18n.js";

// Odeme hatirlatmasi. Kural docs/ios gonderim kaydindan birebir alindi:
//   - yalniz kullanici Ayarlar'dan acarsa kurulur
//   - odeme tarihinden BIR GUN ONCE yerel saatle 09:00
//   - ayni gune denk gelen odemeler TEK bildirimde gruplanir
//   - bildirimde borcun adi ve tutari yazar (Ozer karari, 30 Ekim 2026);
//     "Hassas mod" acikken tutar yazilmaz; kart son 4 hanesi hic yazilmaz
//   - dokununca o borcun odeme formu acilir; "Odedim" ve "Yarin hatirlat"
//   - tamamen cihazda hesaplanir; push servisine finansal icerik gitmez
const AYAR_ANAHTARI = "borcama_odeme_hatirlatmasi";
const HASSAS_ANAHTARI = "borcama_bildirim_hassas";
const ERTELEME_ANAHTARI = "borcama_odeme_ertelemeleri";
const EYLEM_TURU = "borcama-odeme";

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

function bayrakOku(anahtar) {
  try {
    return localStorage.getItem(anahtar) === "1";
  } catch {
    return false;
  }
}

function bayrakYaz(anahtar, acik) {
  try {
    if (acik) localStorage.setItem(anahtar, "1");
    else localStorage.removeItem(anahtar);
  } catch {
    /* depolama kapaliysa sessizce gec */
  }
}

function hatirlatmayiKaydet(acik) {
  bayrakYaz(AYAR_ANAHTARI, acik);
}

export function hassasModAcikMi() {
  return bayrakOku(HASSAS_ANAHTARI);
}

export async function hassasModuAyarla(acik, yaklasan = sonYaklasan) {
  bayrakYaz(HASSAS_ANAHTARI, acik);
  await bildirimleriPlanla(yaklasan);
  return acik;
}

function ertelemeleriOku() {
  try {
    const liste = JSON.parse(localStorage.getItem(ERTELEME_ANAHTARI) || "[]");
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

function ertelemeleriYaz(liste) {
  try {
    if (liste.length) localStorage.setItem(ERTELEME_ANAHTARI, JSON.stringify(liste));
    else localStorage.removeItem(ERTELEME_ANAHTARI);
  } catch {
    /* depolama kapaliysa sessizce gec */
  }
}

const tutarYaz = (tutar, birim) =>
  birim && birim !== kullaniciParaBirimi()
    ? paraBiriminiFormatla(tutar, birim, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : kullaniciParaFormatla(tutar, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function bildirimNesnesi(id, zaman, odemeler, hassas) {
  const icerik = bildirimIcerigi(odemeler, { hassas, tutarYaz, t });
  return {
    id,
    title: icerik.baslik,
    body: icerik.metin,
    schedule: { at: zaman, allowWhileIdle: true },
    extra: { odemeAnahtari: icerik.odemeAnahtari },
    ...(icerik.odemeAnahtari ? { actionTypeId: EYLEM_TURU } : {}),
  };
}

let eylemlerKayitli = false;
async function eylemleriKaydet(LocalNotifications) {
  if (eylemlerKayitli) return;
  // Iki eylem de uygulamayi acar: kayit ve yeniden planlama web katmaninda
  // yapiliyor; arka planda JS'in calisacagi garanti degil.
  await LocalNotifications.registerActionTypes({
    types: [
      {
        id: EYLEM_TURU,
        actions: [
          { id: "odedim", title: t("bilesen.bildirim.odedim"), foreground: true },
          { id: "yarin", title: t("bilesen.bildirim.yarin"), foreground: true },
        ],
      },
    ],
  });
  eylemlerKayitli = true;
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

    // Bildirim metni planlama anindaki dille yazilir.
    await eylemleriKaydet(LocalNotifications);
    const hassas = hassasModAcikMi();
    const ertelemeler = gecerliErtelemeler(ertelemeleriOku(), yaklasan);
    ertelemeleriYaz(ertelemeler.map(({ odemeAnahtari, zaman }) => ({ odemeAnahtari, zaman: zaman.toISOString() })));
    const bildirimler = [
      ...zamanlar.map(({ anahtar, zaman, odemeler }) =>
        bildirimNesnesi(bildirimKimligi(anahtar), zaman, odemeler, hassas)),
      ...ertelemeler.map(({ odemeAnahtari, zaman, odeme }) =>
        bildirimNesnesi(bildirimKimligi("ertele-" + odemeAnahtari), zaman, [odeme], hassas)),
    ];
    if (!bildirimler.length) return { planlanan: 0 };
    await LocalNotifications.schedule({ notifications: bildirimler });
    return { planlanan: bildirimler.length };
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

// "Yarin hatirlat": odeme ertesi gun 09:00'da yeniden hatirlatilir.
export async function yarinHatirlat(odemeAnahtari, yaklasan = sonYaklasan) {
  if (!odemeAnahtari) return;
  const digerleri = ertelemeleriOku().filter((e) => e.odemeAnahtari !== odemeAnahtari);
  ertelemeleriYaz([...digerleri, { odemeAnahtari, zaman: ertelemeZamani().toISOString() }]);
  await bildirimleriPlanla(yaklasan);
}

// Bildirime dokunma ("tap") ve eylemler ("odedim", "yarin"). Uygulama
// kapaliyken dokunulduysa Capacitor olayi dinleyici eklenene kadar saklar.
export function bildirimEylemleriniDinle(eylemGeldi) {
  if (!nativeMi) return () => {};
  let kaldir = null;
  let iptal = false;
  bildirimSdk()
    .then(({ LocalNotifications }) =>
      LocalNotifications.addListener("localNotificationActionPerformed", (olay) => {
        eylemGeldi({
          eylem: olay?.actionId || "tap",
          odemeAnahtari: olay?.notification?.extra?.odemeAnahtari || null,
        });
      }))
    .then((dinleyici) => {
      if (iptal) dinleyici?.remove?.();
      else kaldir = dinleyici;
    })
    .catch(() => {});
  return () => {
    iptal = true;
    kaldir?.remove?.();
  };
}
