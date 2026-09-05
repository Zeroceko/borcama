const GOOGLE_ADS_ID = "AW-18403194146";
const GOOGLE_ANALYTICS_ID = "G-98HWSTTPDM";
const KAYIT_DONUSUM_ETIKETI = "sVgPCI2w0eUcEKLqqcdE";
const SATIN_ALMA_DONUSUM_ETIKETI = String(
  import.meta.env?.VITE_GOOGLE_ADS_PURCHASE_LABEL || "Ms2qCOPS_eYcEKLqqcdE",
).trim();
const IZIN_ANAHTARI = "borcama:reklam-olcum-izni";
const BEKLEYEN_KAYIT_ANAHTARI = "borcama:bekleyen-kayit-donusumu";
const BEKLEYEN_SATIN_ALMA_ANAHTARI = "borcama:bekleyen-satin-alma-donusumu";
const BEKLEYEN_DENEME_ANAHTARI = "borcama:bekleyen-pro-deneme-olayi";
const BEKLEYEN_ILK_BORC_ANAHTARI = "borcama:bekleyen-ilk-borc-donusumu";
const GONDERILEN_KAYIT_ON_EKI = "borcama:gonderilen-kayit-donusumu:";
const GONDERILEN_SATIN_ALMA_ON_EKI = "borcama:gonderilen-satin-alma-donusumu:";
const GONDERILEN_DENEME_ON_EKI = "borcama:gonderilen-pro-deneme-olayi:";
const GONDERILEN_ILK_BORC_ANAHTARI = "borcama:gonderilen-ilk-borc-donusumu";
const YONETIM_YOLLARI = new Set(["/ceo", "/backoffice", "/marketing", "/analytics"]);
const GOOGLE_OLCUM_PARAMETRELERI = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "plan",
]);

let baslatildi = false;
let etiketHazir = false;
let sonSayfaYolu = "";
const gonderilenKayitIstekleri = new Set();
const gonderilenSatinAlmaIstekleri = new Set();
const gonderilenDenemeIstekleri = new Set();

// Google etiketi komutları Array değil Arguments nesnesi olarak bekler.
// Resmî gtag.js snippet'iyle aynı kuyruk biçimini kullanmak, yükleme öncesi
// biriken config/consent/event komutlarının etiket tarafından okunmasını sağlar.
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

function guncelSayfaYolu() {
  return `${window.location.pathname}${window.location.search}`;
}

export function googleOlcumUrliniTemizle(hamUrl, tabanUrl = "https://www.borcama.com") {
  try {
    const url = new URL(hamUrl, tabanUrl);
    const temizParametreler = new URLSearchParams();
    for (const [anahtar, deger] of url.searchParams.entries()) {
      const standartAnahtar = anahtar.toLowerCase();
      if (GOOGLE_OLCUM_PARAMETRELERI.has(standartAnahtar)) {
        temizParametreler.append(standartAnahtar, deger);
      }
    }
    url.search = temizParametreler.toString();
    url.hash = "";
    return url.toString();
  } catch {
    return tabanUrl;
  }
}

export function googleDonusumuRaporlanabilirMi(payload) {
  return Boolean(payload?.transactionId) && payload?.isSandbox !== true;
}

// Kayıt hedefi yalnız e-posta doğrulamasını tamamlamış gerçek hesapları sayar.
// Böylece doğrulamasız oturum veya kayıt ekranı ziyaretleri Ads dönüşümüne dönüşmez.
export function googleKayitDonusumuRaporlanabilirMi(user) {
  const metadata = user?.user_metadata || {};
  return Boolean(
    user?.email_confirmed_at
    && String(metadata.borcama_registration_event_id || "").trim()
    && metadata.borcama_registration_created_at,
  );
}

function depodanOku(anahtar) {
  try { return localStorage.getItem(anahtar); } catch { return null; }
}
function depoyaYaz(anahtar, deger) {
  try { localStorage.setItem(anahtar, deger); } catch { /* Ölçüm ürün akışını etkilemez. */ }
}
function depodanSil(anahtar) {
  try { localStorage.removeItem(anahtar); } catch { /* Ölçüm ürün akışını etkilemez. */ }
}
function jsonOku(anahtar) {
  try { return JSON.parse(depodanOku(anahtar) || "null"); } catch { return null; }
}
function izinVerildiMi() { return depodanOku(IZIN_ANAHTARI) === "evet"; }
function izinDurumu() {
  const tercih = depodanOku(IZIN_ANAHTARI);
  if (tercih === "evet") return true;
  if (tercih === "hayir") return false;
  return null;
}
function izinKomutu(tur, izinVar, bekle = false) {
  gtag("consent", tur, {
    ad_storage: izinVar ? "granted" : "denied",
    analytics_storage: izinVar ? "granted" : "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    ...(bekle ? { wait_for_update: 500 } : {}),
  });
}
function etiketiYukle() {
  if (document.querySelector("script[data-borcama-google-tag]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  script.dataset.borcamaGoogleTag = GOOGLE_ADS_ID;
  document.head.appendChild(script);
}
function etiketiHazirla() {
  if (etiketHazir || typeof window === "undefined") return;
  etiketHazir = true;
  etiketiYukle();
  gtag("js", new Date());
  gtag("set", "ads_data_redaction", true);
  gtag("config", GOOGLE_ADS_ID, { allow_enhanced_conversions: false });
  gtag("config", GOOGLE_ANALYTICS_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}
function etiketiUygunZamandaHazirla() {
  if (etiketHazir || typeof window === "undefined") return;
  const baslat = () => etiketiHazirla();
  if ("requestIdleCallback" in window) window.requestIdleCallback(baslat, { timeout: 2000 });
  else window.setTimeout(baslat, 1200);
}
function etkinlikGonder(eventName, params = {}) {
  if (typeof window === "undefined" || izinDurumu() === undefined || !etiketHazir) return false;
  gtag("event", eventName, { send_to: GOOGLE_ANALYTICS_ID, ...params });
  return true;
}

export function googleAnalyticsSayfaGoruntulemesi() {
  if (typeof window === "undefined" || YONETIM_YOLLARI.has(window.location.pathname)) return false;
  sonSayfaYolu = guncelSayfaYolu();
  const temizKonum = googleOlcumUrliniTemizle(window.location.href, window.location.origin);
  const temizUrl = new URL(temizKonum);
  return etkinlikGonder("page_view", {
    page_title: document.title,
    page_location: temizKonum,
    page_path: `${temizUrl.pathname}${temizUrl.search}`,
  });
}

function spaNavigasyonunuIzle() {
  if (window.__borcamaGoogleNavigasyonIzleniyor) return;
  window.__borcamaGoogleNavigasyonIzleniyor = true;
  const sayfaDegisti = () => {
    if (guncelSayfaYolu() === sonSayfaYolu) return;
    window.setTimeout(googleAnalyticsSayfaGoruntulemesi, 0);
  };
  for (const method of ["pushState", "replaceState"]) {
    const asil = window.history[method];
    window.history[method] = function (...args) {
      const sonuc = asil.apply(this, args);
      sayfaDegisti();
      return sonuc;
    };
  }
  window.addEventListener("popstate", sayfaDegisti);
}

function adsDonusumuGonder({ sendTo, value, currency, transactionId, tamamlaninca }) {
  return new Promise((resolve) => {
    let tamamlandi = false;
    const tamamla = () => {
      if (tamamlandi) return;
      tamamlandi = true;
      tamamlaninca?.();
      resolve(true);
    };
    gtag("event", "conversion", {
      send_to: sendTo, value, currency, transaction_id: transactionId, event_callback: tamamla,
    });
    window.setTimeout(tamamla, 1500);
  });
}

function kayitDonusumunuGonder(payload = jsonOku(BEKLEYEN_KAYIT_ANAHTARI)) {
  if (!payload?.transactionId || !izinVerildiMi()) return Promise.resolve(false);
  const gonderildiAnahtari = `${GONDERILEN_KAYIT_ON_EKI}${payload.transactionId}`;
  if (depodanOku(gonderildiAnahtari) === "1") {
    depodanSil(BEKLEYEN_KAYIT_ANAHTARI);
    return Promise.resolve(false);
  }
  if (gonderilenKayitIstekleri.has(payload.transactionId)) return Promise.resolve(false);
  gonderilenKayitIstekleri.add(payload.transactionId);
  etkinlikGonder("sign_up", { method: payload.method || "email", event_id: payload.transactionId });
  if (payload.emailVerified) {
    etkinlikGonder("email_verified", { method: payload.method || "email", event_id: `${payload.transactionId}:verified` });
  }
  return adsDonusumuGonder({
    sendTo: `${GOOGLE_ADS_ID}/${KAYIT_DONUSUM_ETIKETI}`,
    value: 1,
    currency: "TRY",
    transactionId: payload.transactionId,
    tamamlaninca: () => {
      depoyaYaz(gonderildiAnahtari, "1");
      depodanSil(BEKLEYEN_KAYIT_ANAHTARI);
      gonderilenKayitIstekleri.delete(payload.transactionId);
    },
  });
}

function satinAlmaDonusumunuGonder(payload = jsonOku(BEKLEYEN_SATIN_ALMA_ANAHTARI)) {
  if (!googleDonusumuRaporlanabilirMi(payload)) {
    depodanSil(BEKLEYEN_SATIN_ALMA_ANAHTARI);
    return Promise.resolve(false);
  }
  if (!izinVerildiMi()) return Promise.resolve(false);
  const gonderildiAnahtari = `${GONDERILEN_SATIN_ALMA_ON_EKI}${payload.transactionId}`;
  if (depodanOku(gonderildiAnahtari) === "1") {
    depodanSil(BEKLEYEN_SATIN_ALMA_ANAHTARI);
    return Promise.resolve(false);
  }
  if (gonderilenSatinAlmaIstekleri.has(payload.transactionId)) return Promise.resolve(false);
  gonderilenSatinAlmaIstekleri.add(payload.transactionId);
  const value = Number(payload.value || 0);
  const currency = payload.currency || "TRY";
  etkinlikGonder("purchase", {
    transaction_id: payload.transactionId,
    value,
    currency,
    items: [{
      item_id: payload.productId || payload.plan || "borcama_pro",
      item_name: payload.plan === "annual" ? "Borcama Pro Yıllık" : "Borcama Pro Aylık",
      price: value,
      quantity: 1,
    }],
  });
  const tamamla = () => {
    depoyaYaz(gonderildiAnahtari, "1");
    depodanSil(BEKLEYEN_SATIN_ALMA_ANAHTARI);
    gonderilenSatinAlmaIstekleri.delete(payload.transactionId);
  };
  if (!SATIN_ALMA_DONUSUM_ETIKETI) {
    tamamla();
    return Promise.resolve(true);
  }
  return adsDonusumuGonder({
    sendTo: `${GOOGLE_ADS_ID}/${SATIN_ALMA_DONUSUM_ETIKETI}`,
    value, currency, transactionId: payload.transactionId, tamamlaninca: tamamla,
  });
}

function proDenemeOlayiniGonder(payload = jsonOku(BEKLEYEN_DENEME_ANAHTARI)) {
  if (!payload?.eventId || !izinVerildiMi()) return Promise.resolve(false);
  const gonderildiAnahtari = `${GONDERILEN_DENEME_ON_EKI}${payload.eventId}`;
  if (depodanOku(gonderildiAnahtari) === "1") {
    depodanSil(BEKLEYEN_DENEME_ANAHTARI);
    return Promise.resolve(false);
  }
  if (gonderilenDenemeIstekleri.has(payload.eventId)) return Promise.resolve(false);
  gonderilenDenemeIstekleri.add(payload.eventId);
  const gonderildi = etkinlikGonder("trial_started", {
    trial_days: Math.max(1, Number(payload.trialDays) || 30),
    event_id: payload.eventId,
  });
  gonderilenDenemeIstekleri.delete(payload.eventId);
  if (gonderildi) {
    depoyaYaz(gonderildiAnahtari, "1");
    depodanSil(BEKLEYEN_DENEME_ANAHTARI);
  }
  return Promise.resolve(gonderildi);
}

export function googleAdsBaslat() {
  if (baslatildi || typeof window === "undefined") return;
  baslatildi = true;
  // Tag Assistant ve sayfadaki diğer güvenli ölçüm entegrasyonları aynı kuyruğu kullanabilsin.
  window.gtag = window.gtag || gtag;
  // Eski sürümün finansal içerikli ilk borç kuyruğu hiçbir koşulda gönderilmez.
  depodanSil(BEKLEYEN_ILK_BORC_ANAHTARI);
  depodanSil(GONDERILEN_ILK_BORC_ANAHTARI);
  const tercih = izinDurumu();
  // Gelişmiş Consent Mode: etiket izin verilmeden de yüklenir; varsayılan
  // denied durumunda yalnız çerezsiz/modelleme sinyalleri gönderilebilir.
  izinKomutu("default", false, tercih === null);
  etiketiHazirla();
  spaNavigasyonunuIzle();
  googleAnalyticsSayfaGoruntulemesi();
  void kayitDonusumunuGonder();
  void satinAlmaDonusumunuGonder();
  void proDenemeOlayiniGonder();
}

export function googleAdsOlcumTercihi() { return izinDurumu(); }
export function googleAdsOlcumIzniAyarla(izinVar) {
  depoyaYaz(IZIN_ANAHTARI, izinVar ? "evet" : "hayir");
  izinKomutu("update", izinVar);
  window.dispatchEvent(new CustomEvent("borcama:google-consent-change", { detail: izinVar }));
  if (izinVar) {
    etiketiHazirla();
    googleAnalyticsSayfaGoruntulemesi();
    return Promise.all([
      kayitDonusumunuGonder(),
      satinAlmaDonusumunuGonder(),
      proDenemeOlayiniGonder(),
    ]);
  }
  depodanSil(BEKLEYEN_KAYIT_ANAHTARI);
  depodanSil(BEKLEYEN_SATIN_ALMA_ANAHTARI);
  depodanSil(BEKLEYEN_DENEME_ANAHTARI);
  depodanSil(BEKLEYEN_ILK_BORC_ANAHTARI);
  return Promise.resolve(false);
}
export function googleAdsYeniKullaniciDonusumu(user) {
  if (!googleKayitDonusumuRaporlanabilirMi(user)) return Promise.resolve(false);
  const metadata = user?.user_metadata || {};
  const eventId = String(metadata.borcama_registration_event_id || "").trim();
  const payload = {
    transactionId: eventId,
    method: metadata.borcama_registration_method || "email",
    emailVerified: Boolean(user?.email_confirmed_at),
  };
  depoyaYaz(BEKLEYEN_KAYIT_ANAHTARI, JSON.stringify(payload));
  return kayitDonusumunuGonder(payload);
}
export function googleAdsSatinAlmaDonusumu(payload) {
  if (!googleDonusumuRaporlanabilirMi(payload)) {
    depodanSil(BEKLEYEN_SATIN_ALMA_ANAHTARI);
    return Promise.resolve(false);
  }
  depoyaYaz(BEKLEYEN_SATIN_ALMA_ANAHTARI, JSON.stringify(payload));
  return satinAlmaDonusumunuGonder(payload);
}
export function googleAnalyticsProDenemeBaslangici(payload) {
  if (!payload?.userId || !payload?.trialStartedAt) return Promise.resolve(false);
  const eventId = `${payload.userId}:${payload.trialStartedAt}`;
  const olay = { eventId, trialDays: payload.trialDaysRemaining || 30 };
  depoyaYaz(BEKLEYEN_DENEME_ANAHTARI, JSON.stringify(olay));
  return proDenemeOlayiniGonder(olay);
}
