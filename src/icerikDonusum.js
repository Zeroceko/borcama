// İçerik sayfalarından (sözlük, rehber) kayda geçiş: hangi sayfada hangi
// köprünün görüneceği, mini hesabın sonucu ve ölçümdeki yerleşim adı.
// Saf mantık; Supabase'e dokunmadığı için doğrudan test edilir.
import { borcKapatmaHesapla } from "./seoTools.js";

export { ICERIK_YERLERI, olcumYeri, yerlesimliKaynak } from "./icerikYerleri.js";
import { ICERIK_YERLERI } from "./icerikYerleri.js";

// Kayıt bağlantıları sabit; sayfadaki tutarlar hiçbir zaman eklenmez.
export const BORC_KAYIT_ADRESI = "/register?plan=free&redirect=%2Fdebts";
export const BIRIKIM_KAYIT_ADRESI = "/register?plan=free&redirect=%2Fassets";

// "Borcum ne zaman biter?" hesabının göründüğü sözlük terimleri:
// - "Kredi kartı" kategorisinin tamamı,
// - "Borç yönetimi" kategorisinin tamamı (alacaklı bakışı olan "alacak" ve
//   okuru çoğunlukla fon haberiyle gelen "tasfiye" hariç; orada birikim kutusu var),
// - diğer kategorilerden borçlu okurun aradığı aşağıdaki terimler.
const HESAP_KATEGORILERI = new Set(["Kredi kartı", "Borç yönetimi"]);
const HESAP_DISI_TERIMLER = new Set(["alacak", "tasfiye"]);
export const HESAPLI_EK_TERIMLER = Object.freeze([
  // Faiz ve maliyet
  "faiz", "akdi-faiz", "gecikme-faizi", "temerrut-faizi", "kredi-karti-faizi", "yapilandirma-faizi",
  "bilesik-faiz", "efektif-faiz-orani", "kredi-maliyeti", "yillik-maliyet-orani",
  // Kredi
  "kalan-anapara", "toplam-geri-odeme", "aylik-taksit", "anapara", "vade", "erken-odeme", "ara-odeme",
  "ihtiyac-kredisi", "tuketici-kredisi", "taksit", "odeme-plani", "kredi-kapama-tutari", "kredi-bakiyesi",
  "vade-uzatma", "taksit-erteleme", "kredi-notu", "risk-raporu",
  // Borç ve hukuk
  "icra-takibi", "haciz", "odeme-emri", "odeme-taahhudu", "borclu",
]);
const HESAPLI_EK_SET = new Set(HESAPLI_EK_TERIMLER);

export function sozlukHesabiGosterilsinMi(terim) {
  if (!terim?.slug) return false;
  if (HESAP_DISI_TERIMLER.has(terim.slug)) return false;
  return HESAP_KATEGORILERI.has(terim.category) || HESAPLI_EK_SET.has(terim.slug);
}

// Hesabın göründüğü rehberler: üç kart borcu rehberi ve eski borç rehberleri.
export const HESAPLI_REHBERLER = Object.freeze([
  "kredi-karti-faiz-oranlari-2026",
  "kredi-karti-borcu-yapilandirma",
  "kredi-karti-borcu-odenmezse-ne-olur",
  "borclarimi-nasil-duzenlerim",
  "kredi-karti-borcu-nasil-takip-edilir",
  "asgari-odeme-borcu-nasil-etkiler",
  "birden-fazla-bankadaki-borclar-nasil-yonetilir",
  "borc-kapatma-plani-nasil-hazirlanir",
]);

export function rehberHesabiGosterilsinMi(rehber) {
  return HESAPLI_REHBERLER.includes(rehber?.slug);
}

// Fon / yatırımcı niyetiyle gelinen terimler: birikim kutusu ve ölçüm adı.
const BIRIKIM_KUTULARI = {
  tasfiye: { yer: ICERIK_YERLERI.TASFIYE_BIRIKIM, kicker: "FON HABERİ İÇİN Mİ GELDİN?" },
  "bank-run": { yer: ICERIK_YERLERI.BANK_RUN_BIRIKIM, kicker: "BİRİKİMİN NEREDE DURUYOR?" },
};

export function birikimKutusu(slug) {
  return BIRIKIM_KUTULARI[slug] || null;
}

// "14 ay" ya da "26 ay (2 yıl 2 ay)".
export function sureMetni(ay) {
  const n = Math.max(0, Math.round(Number(ay) || 0));
  if (n < 12) return `${n} ay`;
  const yil = Math.floor(n / 12);
  const kalan = n % 12;
  return `${n} ay (${yil} yıl${kalan ? ` ${kalan} ay` : ""})`;
}

// Mini hesap: araç sayfasıyla aynı formül; ekranda gereken özet.
export function miniBorcHesabi({ borc, aylikFaiz, aylikOdeme }) {
  const sonuc = borcKapatmaHesapla({ borc, aylikFaiz, aylikOdeme });
  if (sonuc.tamamlandi)
    return { durum: "tamam", ay: sonuc.ay, sure: sureMetni(sonuc.ay), toplamFaiz: sonuc.toplamFaiz, toplamOdeme: sonuc.toplamOdeme };
  return { durum: sonuc.neden === "eksik" ? "bos" : sonuc.neden, ay: 0, sure: "", toplamFaiz: 0, toplamOdeme: 0 };
}

// Mobil yapışkan çubuk: kaydırılabilir mesafenin %40'ı geçilince görünür.
// Masaüstünde, kapatıldıysa, çerez/ölçüm bandı açıkken, sayfa sonundaki köprü
// ekrandayken veya klavye açıkken (girdi odakta) görünmez.
export const YAPISKAN_ESIK = 0.4;
export function yapiskanCubukGorunsunMu({
  scrollY = 0, innerHeight = 0, scrollHeight = 0,
  mobil = false, kapatildi = false, izinBandiAcik = false, kopruGorunur = false, girdiOdakta = false,
}) {
  if (!mobil || kapatildi || izinBandiAcik || kopruGorunur || girdiOdakta) return false;
  const kaydirilabilir = scrollHeight - innerHeight;
  if (!(kaydirilabilir > 200)) return false;
  return scrollY >= kaydirilabilir * YAPISKAN_ESIK;
}

export const YAPISKAN_KAPALI_ANAHTARI = "borcama:icerik-yapiskan-kapali";

export function yapiskanKapatildiMi(depo) {
  try {
    return depo?.getItem(YAPISKAN_KAPALI_ANAHTARI) === "1";
  } catch {
    return false;
  }
}

export function yapiskaniKapat(depo) {
  try {
    depo?.setItem(YAPISKAN_KAPALI_ANAHTARI, "1");
    return true;
  } catch {
    return false;
  }
}
