// Ziyaretcinin ulkesini (yalniz ISO 3166-1 alpha-2 kodu) doner. Kaynak,
// Vercel'in istege ekledigi x-vercel-ip-country basligidir; IP adresi okunmaz,
// hicbir sey kaydedilmez veya loglanmaz. Web surumu bunu iki karar icin
// kullanir: Pro'nun satista olup olmadigi (yalniz Turkiye) ve yeni
// kullanicinin varsayilan para birimi/bolge kurallari.
//
// Yanit kisiye ozeldir: paylasilan ara bellekler (CDN) saklamamali, tarayici
// da her seferinde yeniden sormali.

const ULKE_KODU = /^[A-Z]{2}$/;
// Vercel bilinmeyen konum icin bazen "XX" veya bos deger gonderir.
const GECERSIZ_KODLAR = new Set(["XX", "ZZ", "T1"]);

export function ulkeBasligindanKod(deger) {
  const kod = String(Array.isArray(deger) ? deger[0] : deger ?? "").trim().toUpperCase();
  return ULKE_KODU.test(kod) && !GECERSIZ_KODLAR.has(kod) ? kod : null;
}

export default function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ ulke: null });
  }
  return res.status(200).json({ ulke: ulkeBasligindanKod(req.headers?.["x-vercel-ip-country"]) });
}
