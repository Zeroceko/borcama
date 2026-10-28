// Borcama iOS uygulamasının App Store sayfası (24 Ekim 2026'da yayında).
export const APP_STORE_ID = "6817634876";
export const APP_STORE_URL = `https://apps.apple.com/tr/app/borcama/id${APP_STORE_ID}`;
export const APP_STORE_ROZET = "/app-store-rozet-tr.svg";

// App Store Connect > Uygulama Analizi'nde kaynak ölçümü için kampanya
// bağlantısı. `pt` (sağlayıcı kodu) App Store Connect'ten alınır; boşken
// yalnız `ct` ve `mt` eklenir.
export const APP_STORE_SAGLAYICI = "";

export function appStoreBaglantisi(ct) {
  const parametreler = new URLSearchParams();
  if (APP_STORE_SAGLAYICI) parametreler.set("pt", APP_STORE_SAGLAYICI);
  if (ct) parametreler.set("ct", ct);
  parametreler.set("mt", "8");
  return `${APP_STORE_URL}?${parametreler}`;
}
