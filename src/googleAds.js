const GOOGLE_ADS_ID = "AW-18403194146";
const KAYIT_DONUSUM_ETIKETI = "sVgPCI2w0eUcEKLqqcdE";
const IZIN_ANAHTARI = "borcama:reklam-olcum-izni";
const BEKLEYEN_KAYIT_ANAHTARI = "borcama:bekleyen-kayit-donusumu";

let baslatildi = false;

function gtag(...args) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

function izinVerildiMi() {
  return localStorage.getItem(IZIN_ANAHTARI) === "evet";
}

function izinDurumunuUygula(izinVar) {
  gtag("consent", "update", {
    ad_storage: izinVar ? "granted" : "denied",
    analytics_storage: izinVar ? "granted" : "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function etiketiYukle() {
  if (document.querySelector(`script[data-borcama-google-ads="${GOOGLE_ADS_ID}"]`))
    return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  script.dataset.borcamaGoogleAds = GOOGLE_ADS_ID;
  document.head.appendChild(script);
}

function kayitDonusumunuGonder() {
  if (!izinVerildiMi()) return Promise.resolve(false);

  return new Promise((resolve) => {
    let tamamlandi = false;
    const tamamla = () => {
      if (tamamlandi) return;
      tamamlandi = true;
      localStorage.removeItem(BEKLEYEN_KAYIT_ANAHTARI);
      resolve(true);
    };

    gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${KAYIT_DONUSUM_ETIKETI}`,
      value: 1,
      currency: "TRY",
      event_callback: tamamla,
    });
    window.setTimeout(tamamla, 1200);
  });
}

export function googleAdsBaslat() {
  if (baslatildi || typeof window === "undefined") return;
  baslatildi = true;

  gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
  etiketiYukle();
  gtag("js", new Date());
  gtag("config", GOOGLE_ADS_ID);

  const izinVar = izinVerildiMi();
  izinDurumunuUygula(izinVar);
  if (izinVar && localStorage.getItem(BEKLEYEN_KAYIT_ANAHTARI) === "1")
    kayitDonusumunuGonder();
}

export function googleAdsOlcumTercihi() {
  const tercih = localStorage.getItem(IZIN_ANAHTARI);
  if (tercih === "evet") return true;
  if (tercih === "hayir") return false;
  return null;
}

export function googleAdsOlcumIzniAyarla(izinVar) {
  localStorage.setItem(IZIN_ANAHTARI, izinVar ? "evet" : "hayir");
  izinDurumunuUygula(izinVar);
  if (izinVar && localStorage.getItem(BEKLEYEN_KAYIT_ANAHTARI) === "1")
    return kayitDonusumunuGonder();
  if (!izinVar) localStorage.removeItem(BEKLEYEN_KAYIT_ANAHTARI);
  return Promise.resolve(false);
}

export function googleAdsKayitDonusumu() {
  localStorage.setItem(BEKLEYEN_KAYIT_ANAHTARI, "1");
  return kayitDonusumunuGonder();
}
