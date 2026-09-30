// Fiyat uc noktalari tarayici surumunde uygulamayla ayni kaynaktan gelir ve
// CORS'a hic girmez. Native kabukta ise uygulama dosyalari cihazdan servis
// edildigi icin webview kaynagi capacitor://borcama.com olur; bu adres izinli
// degilse fiyat istekleri tarayici tarafindan engellenir ve varlik ekraninda
// "Canli fiyatlar alinamadi" uyarisi cikar.
//
// Alt cizgiyle baslayan dosyalar Vercel'de uc nokta olarak yayinlanmaz;
// bu dosya yalniz yardimcidir.
export const IZINLI_KAYNAKLAR = new Set([
  "https://borcama.com",
  "https://www.borcama.com",
  "https://crm.borcama.com",
  "capacitor://borcama.com",
]);

// Izinli kaynaga CORS basliklarini ekler. Preflight istegini kendisi
// yanitlar ve true doner; bu durumda cagiran islem yapmadan cikmalidir.
export function corsUygula(req, res) {
  const kaynak = req.headers?.origin;
  // Yanit kaynaga gore degistigi icin ara belleklerin ayirmasi gerekir.
  res.setHeader("Vary", "Origin");
  if (kaynak && IZINLI_KAYNAKLAR.has(kaynak)) {
    res.setHeader("Access-Control-Allow-Origin", kaynak);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
  }
  if (req.method !== "OPTIONS") return false;
  res.status(204).end();
  return true;
}
