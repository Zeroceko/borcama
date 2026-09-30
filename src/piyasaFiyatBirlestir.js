// Fiyat servisi kaynaklarindan biri gecici olarak yanit vermediginde yanit
// "partial" isaretiyle doner ve o kaynaga ait alanlar hic gelmez. Bu durumda
// eksik alanlar son basarili degerlerden tamamlanir; yoksa tek bir kaynagin
// hatasi ekrandaki diger varliklari da fiyatsiz birakir.
//
// Yanit tamsa gelen veri oldugu gibi kullanilir: aksi halde kaynaktan
// kaldirilan bir deger (orn. listeden cikan bir coin) eski fiyatiyla
// sonsuza dek ekranda kalirdi.
export function piyasaFiyatlariniBirlestir(onceki = {}, yeni = {}, kismi = false) {
  if (!kismi) return { ...yeni };
  return {
    ...onceki,
    ...yeni,
    // Kripto fiyatlari ic ice nesnedir; ustten yazmak yerine coin bazinda
    // birlestirilir.
    crypto: { ...(onceki.crypto || {}), ...(yeni.crypto || {}) },
    cryptoUsd: { ...(onceki.cryptoUsd || {}), ...(yeni.cryptoUsd || {}) },
  };
}

// Fon ve hisse yanitlari yalniz sorulan kodlari icerir; fiyati alinamayan kod
// yanitta hic yer almaz. Kod bazinda birlestirince digerlerinin son bilinen
// fiyati korunur.
export function kodBazliFiyatlariBirlestir(onceki = {}, yeni = {}) {
  return { ...onceki, ...yeni };
}
