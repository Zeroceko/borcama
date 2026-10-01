// Uygulamanin kendi URL semasi ve donus adresi cozumlemesi. Bu dosya bilerek
// bagimsiz tutuldu: Capacitor veya Supabase'e dokunmadigi icin dogrudan test
// edilebiliyor.
export const NATIVE_SEMA = "borcama";
export const NATIVE_DONUS_ADRESI = `${NATIVE_SEMA}://auth-callback`;

// E-posta baglantilari once borcama.com'daki kopru sayfasina doner, oradan
// uygulamaya aktarilir. Dogrudan borcama:// adresine donmek Safari'de
// calisiyor fakat Chrome kullanici dokunusu olmadan ozel semaya gecisi
// engelleyebiliyor ve masaustunde hicbir sey olmuyordu.
// Supabase izinli adres listesi tam eslesme arar; adrese sorgu eklemiyoruz.
// Hedef ekran, Supabase'in geri gonderdigi "type" alanindan cozulur.
export const KOPRU_SAYFASI = "https://borcama.com/uygulamada-ac.html";

export function nativeDonusAdresi() {
  return KOPRU_SAYFASI;
}

// Dogrulamadan sonra kullanici dogrudan uygulamaya girer. "/welcome" satin
// alma sonrasi ekranidir ("Satin alma tamamlandi" yazar), kayit dogrulamasi
// icin yanlis olur.
const TURE_GORE_HEDEF = {
  recovery: "/reset-password",
  signup: "/summary",
  invite: "/summary",
  magiclink: "/summary",
  email_change: "/settings",
};

export function uygulamaBaglantisiMi(adres) {
  return typeof adres === "string" && adres.startsWith(`${NATIVE_SEMA}://`);
}

// Supabase anahtarlari akisa gore ya adres parcasinda (#access_token=...) ya
// da sorguda (?code=...) gonderir; ikisini de karsiliyoruz.
export function derinBaglantiAyristir(adres) {
  let url;
  try {
    url = new URL(adres);
  } catch {
    return null;
  }
  const parca = new URLSearchParams(String(url.hash || "").replace(/^#/, ""));
  const oku = (ad) => url.searchParams.get(ad) || parca.get(ad) || null;
  const tur = oku("type") || "";
  const hedef = oku("next") || TURE_GORE_HEDEF[tur] || "/summary";
  return {
    tur,
    // Acik yonlendirmeyi onlemek icin yalniz uygulama ici yollar kabul edilir.
    hedef: hedef.startsWith("/") && !hedef.startsWith("//") ? hedef : "/summary",
    erisimAnahtari: oku("access_token"),
    yenilemeAnahtari: oku("refresh_token"),
    kod: oku("code"),
    hata: oku("error_description") || oku("error"),
  };
}
