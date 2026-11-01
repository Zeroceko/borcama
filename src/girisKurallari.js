// Web giris/kayit ekraninin saf kurallari (Auth.jsx). Node testleri bu dosyayi
// dogrudan yukler; Vite/Supabase ice aktarmasi yok.

export const EPOSTA_DESENI = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PAROLA_EN_AZ = 8; // supabase/config.toml > minimum_password_length
// Supabase e-posta basina 60 sn'de bir kod gonderir; sayac bunu asmaz.
export const KOD_TEKRAR_SN = 60;

export function epostaGecerli(eposta) {
  return EPOSTA_DESENI.test(String(eposta ?? "").trim());
}

// 0 bos, 1 zayif, 2 idare eder, 3 iyi, 4 guclu. 8 karakterden kisa parola
// Supabase'te reddedilir; her zaman zayif sayilir.
export const PAROLA_SEVIYELERI = ["", "zayif", "idareEder", "iyi", "guclu"];
export function parolaGucu(parola) {
  const p = String(parola ?? "");
  if (!p) return 0;
  if (p.length < PAROLA_EN_AZ) return 1;
  const puan = (p.length >= 12 ? 1 : 0)
    + (/[a-zçğıöşü]/.test(p) && /[A-ZÇĞİÖŞÜ]/.test(p) ? 1 : 0)
    + (/\d/.test(p) ? 1 : 0)
    + (/[^\p{L}\d]/u.test(p) ? 1 : 0);
  return Math.min(4, puan + 1);
}

// Gizli tuzak alanini yalniz botlar doldurur; doluysa istek atilmaz.
export function botMu(tuzak) {
  return String(tuzak ?? "").trim().length > 0;
}

// Supabase hatasinin hangi alanin altinda gosterilecegi; null = genel kutu.
export function hataAlani(hata) {
  const kod = hata?.code || "";
  if (kod === "invalid_credentials") return "parola";
  if (kod === "weak_password") return "parola";
  if (kod === "email_address_invalid" || kod === "email_not_confirmed") return "eposta";
  if (["otp_expired", "validation_failed"].includes(kod) || (hata?.status === 403 && !kod)) return "kod";
  return null;
}

// Giris <-> kayit sekmesi adres cubugunu da degistirir (sorgu korunur).
export function modYolu(kayit, arama = "") {
  return `${kayit ? "/register" : "/login"}${arama || ""}`;
}
