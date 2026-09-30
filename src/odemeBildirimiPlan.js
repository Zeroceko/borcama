// Odeme hatirlatmasinin saf planlama mantigi. Capacitor'a bagimli degildir,
// bu sayede dogrudan test edilebilir.
//
// Kural (iOS gonderim kaydi):
//   - bildirim odeme tarihinden BIR GUN ONCE yerel saatle 09:00
//   - ayni gune denk gelen odemeler TEK bildirimde gruplanir
//   - odenmis veya sifir tutarli kayitlar atlanir
//   - gecmis zamanlar planlanmaz
export const BILDIRIM_SAATI = 9;
export const AZAMI_BILDIRIM = 30; // iOS bekleyen bildirimleri 64 ile siniriyor

function yerelGunAnahtari(tarih) {
  const y = tarih.getFullYear();
  const a = String(tarih.getMonth() + 1).padStart(2, "0");
  const g = String(tarih.getDate()).padStart(2, "0");
  return `${y}-${a}-${g}`;
}

export function bildirimZamanlari(yaklasan, simdi = new Date()) {
  const gunler = new Set();
  (yaklasan || []).forEach((odeme) => {
    if (!odeme || odeme.odendi) return;
    if (!((+odeme.tutar || 0) > 0.01)) return;
    const tarih = odeme.tarih instanceof Date ? odeme.tarih : new Date(odeme.tarih);
    if (Number.isNaN(tarih.getTime())) return;
    gunler.add(yerelGunAnahtari(tarih));
  });

  return [...gunler]
    .sort()
    .map((anahtar) => {
      const [yil, ay, gun] = anahtar.split("-").map(Number);
      return { anahtar, zaman: new Date(yil, ay - 1, gun - 1, BILDIRIM_SAATI, 0, 0, 0) };
    })
    .filter(({ zaman }) => zaman.getTime() > simdi.getTime())
    .slice(0, AZAMI_BILDIRIM);
}

// Anahtardan kararli bir tamsayi kimlik uretir; ayni gun icin hep ayni id.
export function bildirimKimligi(anahtar) {
  let h = 0;
  for (let i = 0; i < anahtar.length; i += 1) {
    h = (h * 31 + anahtar.charCodeAt(i)) % 2147483647;
  }
  return h;
}
