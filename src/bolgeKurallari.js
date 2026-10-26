import { kullaniciParaBirimi } from "./currencyInput.js";

// Turkiye'ye ozgu finans kurallari (TCMB azami kart faizi ve gecikme faizi,
// KKDF/BSMV vergi-fon yuku, KMH varsayilan faizi, Turk bankasi belgesi okuma)
// yalniz TRY ile kullanilan hesaplarda gecerlidir. Web daima TRY oldugu icin
// tarayici davranisi degismez; native'de TRY disi birimde kullanicinin girdigi
// oran esas alinir, girilmemisse faiz varsayilmaz.

export function turkiyeKurallariGecerli(birim = kullaniciParaBirimi()) {
  return birim === "TRY";
}

// KKDF %15 + BSMV %15: faiz tutarina eklenen toplam vergi-fon orani.
export const TURKIYE_VERGI_FON_ORANI = 0.3;
export const TURKIYE_KMH_VARSAYILAN_FAIZI = 4.25;

export function vergiFonOrani(birim = kullaniciParaBirimi()) {
  return turkiyeKurallariGecerli(birim) ? TURKIYE_VERGI_FON_ORANI : 0;
}

// TCMB kredi karti azami akdi ve gecikme faizi (aylik %), bakiye dilimine gore.
export function tcmbKartAzamiFaizi(bakiye) {
  if (bakiye >= 180000) return 4.25;
  if (bakiye >= 30000) return 3.75;
  return 3.25;
}

export function tcmbKartAzamiGecikmeFaizi(bakiye) {
  if (bakiye >= 180000) return 4.55;
  if (bakiye >= 30000) return 4.05;
  return 3.55;
}

function girilenOran(oran) {
  const sayi = Number(oran);
  return Number.isFinite(sayi) && sayi > 0 ? sayi : 0;
}

// Kart icin kullanilacak aylik oranlar.
// TRY: TCMB azami oranlari (kayitli ozel oran varsa cagiran onu ayrica kullanir).
// TRY disi: kullanicinin girdigi aylik oran hem akdi hem gecikme orani olur;
// girilmemisse 0 ve `bilinmiyor` isaretlenir.
export function kartFaizOranlari(bakiye, girilen, birim = kullaniciParaBirimi()) {
  if (turkiyeKurallariGecerli(birim)) {
    return {
      akdi: tcmbKartAzamiFaizi(bakiye),
      gecikme: tcmbKartAzamiGecikmeFaizi(bakiye),
      referans: true,
      bilinmiyor: false,
    };
  }
  const oran = girilenOran(girilen);
  return { akdi: oran, gecikme: oran, referans: false, bilinmiyor: oran === 0 };
}

// Ek hesap (KMH) icin oran. TRY'de girilmemisse %4,25 urun referansi;
// TRY disinda varsayim yok.
export function ekHesapFaizOrani(girilen, birim = kullaniciParaBirimi()) {
  const oran = girilenOran(girilen);
  if (oran > 0) return { oran, tahmini: false, bilinmiyor: false };
  if (turkiyeKurallariGecerli(birim)) return { oran: TURKIYE_KMH_VARSAYILAN_FAIZI, tahmini: true, bilinmiyor: false };
  return { oran: 0, tahmini: false, bilinmiyor: true };
}

// Ekstre ve kredi odeme plani okuyucusu yalniz Turk bankalarinin belgelerini
// taniyor; TRY disinda giris gizlenir, elle giris kalir.
export function belgeOkumaAcik(birim = kullaniciParaBirimi()) {
  return turkiyeKurallariGecerli(birim);
}

// Banka secim listesi. TRY'de Turk bankalari + kullanicinin ekledikleri.
// TRY disinda Turk bankalari gosterilmez; kullanicinin ekledikleri ve
// mevcut kayitlarda gecen bankalar kalir ("Diger" ile serbest metin girilir).
export function bankaSecenekleri({ turkBankalari = [], ozelBankalar = [], kayitliBankalar = [], birim = kullaniciParaBirimi() } = {}) {
  if (turkiyeKurallariGecerli(birim)) return [...new Set([...turkBankalari, ...ozelBankalar])];
  return [...new Set([...ozelBankalar, ...kayitliBankalar].map((b) => String(b || "").trim()).filter(Boolean))];
}
