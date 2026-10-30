// Odeme hatirlatmasinin saf planlama mantigi. Capacitor'a bagimli degildir,
// bu sayede dogrudan test edilebilir.
//
// Kural (iOS gonderim kaydi):
//   - bildirim odeme tarihinden BIR GUN ONCE yerel saatle 09:00
//   - ayni gune denk gelen odemeler TEK bildirimde gruplanir
//   - odenmis veya sifir tutarli kayitlar atlanir
//   - gecmis zamanlar planlanmaz
//   - borcun adi ve tutari yazilir (hassas modda tutar yok); kart son 4
//     hanesi yazilmaz
export const BILDIRIM_SAATI = 9;
export const AZAMI_BILDIRIM = 30; // iOS bekleyen bildirimleri 64 ile siniriyor

function yerelGunAnahtari(tarih) {
  const y = tarih.getFullYear();
  const a = String(tarih.getMonth() + 1).padStart(2, "0");
  const g = String(tarih.getDate()).padStart(2, "0");
  return `${y}-${a}-${g}`;
}

export function bildirimZamanlari(yaklasan, simdi = new Date()) {
  const gunler = new Map();
  (yaklasan || []).forEach((odeme) => {
    if (!odeme || odeme.odendi) return;
    if (!((+odeme.tutar || 0) > 0.01)) return;
    const tarih = odeme.tarih instanceof Date ? odeme.tarih : new Date(odeme.tarih);
    if (Number.isNaN(tarih.getTime())) return;
    const gun = yerelGunAnahtari(tarih);
    if (!gunler.has(gun)) gunler.set(gun, []);
    gunler.get(gun).push(odeme);
  });

  return [...gunler.keys()]
    .sort()
    .map((anahtar) => {
      const [yil, ay, gun] = anahtar.split("-").map(Number);
      return {
        anahtar,
        zaman: new Date(yil, ay - 1, gun - 1, BILDIRIM_SAATI, 0, 0, 0),
        odemeler: gunler.get(anahtar),
      };
    })
    .filter(({ zaman }) => zaman.getTime() > simdi.getTime())
    .slice(0, AZAMI_BILDIRIM);
}

// Bildirimde kartin son 4 hanesi yazilmaz; ad yalniz banka ve kart adidir.
function bildirimAdi(odeme) {
  return String(odeme?.ad || "").replace(/\s*·\s*•+\s*\d{4}\s*$/, "");
}

// Bildirim icerigi. Tek odeme: baslikta borcun adi, metinde tutar; dokununca
// o borcun odeme formu acilir ve "Odedim" / "Yarin hatirlat" eylemleri
// vardir. Ayni gune denk gelen odemeler tek bildirimde listelenir; dokununca
// odemeler ekrani acilir. Hassas modda tutar yazilmaz.
// `t` cagiran tarafin ceviri fonksiyonudur (testte sahtesi verilir).
export function bildirimIcerigi(odemeler, { hassas = false, tutarYaz, t }) {
  if (odemeler.length === 1) {
    const [odeme] = odemeler;
    return {
      baslik: t("bilesen.bildirim.tekBaslik", { ad: bildirimAdi(odeme) }),
      metin: hassas
        ? t("bilesen.bildirim.tekMetinHassas")
        : t("bilesen.bildirim.tekMetin", { tutar: tutarYaz(odeme.tutar, odeme.paraBirimi) }),
      odemeAnahtari: odeme.anahtar || null,
    };
  }
  return {
    baslik: t("bilesen.bildirim.cokBaslik", { n: odemeler.length }),
    metin: odemeler
      .map((odeme) => (hassas ? bildirimAdi(odeme) : `${bildirimAdi(odeme)} ${tutarYaz(odeme.tutar, odeme.paraBirimi)}`))
      .join(" · "),
    odemeAnahtari: null,
  };
}

// "Yarin hatirlat": ertesi gun 09:00. Odeme hala bekliyorsa planlamada
// yeniden kurulur; gecmis ya da odenmis ertelemeler atilir.
export function ertelemeZamani(simdi = new Date()) {
  return new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate() + 1, BILDIRIM_SAATI, 0, 0, 0);
}

export function gecerliErtelemeler(ertelemeler, yaklasan, simdi = new Date()) {
  const bekleyen = new Map(
    (yaklasan || [])
      .filter((o) => o && !o.odendi && (+o.tutar || 0) > 0.01 && o.anahtar)
      .map((o) => [o.anahtar, o]),
  );
  return (ertelemeler || [])
    .map((e) => ({ ...e, zaman: new Date(e.zaman) }))
    .filter((e) => bekleyen.has(e.odemeAnahtari) && e.zaman.getTime() > simdi.getTime())
    .map((e) => ({ ...e, odeme: bekleyen.get(e.odemeAnahtari) }));
}

// Anahtardan kararli bir tamsayi kimlik uretir; ayni gun icin hep ayni id.
export function bildirimKimligi(anahtar) {
  let h = 0;
  for (let i = 0; i < anahtar.length; i += 1) {
    h = (h * 31 + anahtar.charCodeAt(i)) % 2147483647;
  }
  return h;
}
