// Uygulamanin kendi URL semasi ve donus adresi cozumlemesi. Bu dosya bilerek
// bagimsiz tutuldu: Capacitor veya Supabase'e dokunmadigi icin dogrudan test
// edilebiliyor.
export const NATIVE_SEMA = "borcama";
export const NATIVE_DONUS_ADRESI = `${NATIVE_SEMA}://auth-callback`;

// E-posta baglantilari dogrudan bu adrese gelir. iOS tarafinda bu bir
// universal link'tir: uygulama kuruluysa tarayici hic acilmaz, ara sayfa
// cikmaz, baglanti uygulamada acilir. Uygulama kurulu degilse ya da
// bilgisayardan aciliyorsa ayni adres tarayicida calisir.
//
// Universal link yalnizca kullanicinin dokundugu baglanti icin calisir;
// sunucu yonlendirmesiyle gelen adres icin iOS uygulamayi acmaz. Bu yuzden
// e-postadaki baglanti Supabase'in /verify adresi degil, dogrudan burasidir
// ve dogrulamayi token_hash ile uygulamanin kendisi yapar.
export const DOGRULAMA_YOLU = "/auth-callback";
export const DOGRULAMA_ADRESI = `https://borcama.com${DOGRULAMA_YOLU}`;

export function nativeDonusAdresi() {
  return DOGRULAMA_ADRESI;
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

// Hem universal link hem de eski ozel sema kabul edilir; ozel sema yedek
// olarak duruyor.
export function uygulamaBaglantisiMi(adres) {
  if (typeof adres !== "string") return false;
  if (adres.startsWith(`${NATIVE_SEMA}://`)) return true;
  try {
    const url = new URL(adres);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      /^(www\.)?borcama\.com$/.test(url.hostname) &&
      url.pathname === DOGRULAMA_YOLU
    );
  } catch {
    return false;
  }
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
    // Universal link akisinda tek kullanimlik dogrulama anahtari gelir;
    // dogrulamayi uygulama yapar.
    dogrulamaAnahtari: oku("token_hash") || oku("token"),
    // E-posta tiklama takibi: yonlendirme yerine ekranin bildirdigi kimlik.
    teslimKimligi: oku("d"),
    erisimAnahtari: oku("access_token"),
    yenilemeAnahtari: oku("refresh_token"),
    kod: oku("code"),
    hata: oku("error_description") || oku("error"),
  };
}
