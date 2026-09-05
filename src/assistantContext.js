const sayi = (deger) => {
  const sonuc = Number(deger);
  return Number.isFinite(sonuc) ? Math.max(sonuc, 0) : 0;
};

const ay = (tarih) => String(tarih || "").slice(0, 7);

export const ASISTAN_KONU_AILELERI = [
  "aylik_butce", "odeme_takvimi", "kart_borcu", "asgari_odeme", "gecikme",
  "kredi", "yeni_kredi", "yapilandirma", "faiz_ve_vergiler", "borc_kapatma",
  "ek_hesap", "harcama_analizi", "sabit_gider", "gelir", "tasarruf",
  "nakit_akisi", "veri_eksigi", "kayit_duzeltme", "urun_kullanimi", "gizlilik",
];

export function asistanBaglamiOlustur({
  veri,
  gelir,
  zorunluOdeme,
  harcama,
  planAcigi,
  kalemler = [],
  tarih = new Date(),
}) {
  const buAy = `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, "0")}`;
  const kategoriler = {};
  (veri?.expenses || []).filter((gider) => ay(gider.tarih) === buAy).forEach((gider) => {
    const kategori = String(gider.kategori || "Diğer").slice(0, 40);
    kategoriler[kategori] = sayi(kategoriler[kategori]) + sayi(gider.tutar);
  });

  return {
    donem: buAy,
    ozet: {
      aylikGelir: sayi(gelir),
      zorunluOdeme: sayi(zorunluOdeme),
      kayitliHarcama: sayi(harcama),
      aylikAcik: sayi(planAcigi),
      toplamBorc: kalemler.reduce((toplam, kalem) => toplam + sayi(kalem.bakiye), 0),
    },
    borcDagilimi: kalemler.reduce((sonuc, kalem) => {
      const tur = ["kart", "kredi", "ek", "diger"].includes(kalem.tur) ? kalem.tur : "diger";
      sonuc[tur] = sayi(sonuc[tur]) + sayi(kalem.bakiye);
      return sonuc;
    }, { kart: 0, kredi: 0, ek: 0, diger: 0 }),
    krediler: (veri?.loans || []).slice(0, 30).map((kredi) => ({
      banka: String(kredi.banka || "Banka").slice(0, 40),
      tur: String(kredi.ad || "Kredi").slice(0, 50),
      kalanBorc: sayi(kredi.kalanBorc),
      aylikTaksit: sayi(kredi.taksit),
      kalanTaksit: Math.floor(sayi(kredi.kalanTaksit)),
      aylikFaizYuzde: sayi(kredi.faiz),
      ilkOdemeTarihi: String(kredi.ilkOdemeTarihi || kredi.ilkTaksitTarihi || "").slice(0, 10),
      yapilandirma: kredi.kaynak === "card_restructuring" ? {
        yapilandirilanTutar: sayi(kredi.yapilandirilanTutar),
        toplamGeriOdeme: sayi(kredi.toplamGeriOdeme),
        aylikNominalFaizYuzde: sayi(kredi.aylikNominalFaiz),
        kkdfYuzde: sayi(kredi.kkdfOrani),
        bsmvYuzde: sayi(kredi.bsmvOrani),
        bankaPlaniEsas: Boolean(kredi.bankaPlaniEsas),
      } : null,
    })),
    kartlar: (veri?.cards || []).slice(0, 30).map((kart) => {
      const kayitlar = Array.isArray(kart.yapilandirmaKayitlari) ? kart.yapilandirmaKayitlari : [];
      const yapilandirma = kayitlar[kayitlar.length - 1];
      return {
        banka: String(kart.banka || "Banka").slice(0, 40),
        urun: String(kart.ad || "Kredi kartı").slice(0, 50),
        ekstreBorcu: sayi(kart.toplamEkstreBorcu ?? kart.borc),
        asgariOdeme: sayi(kart.asgariOdeme),
        yapilanOdeme: sayi(kart.yapilanOdeme),
        aylikFaizYuzde: sayi(kart.faiz ?? kart.aylikFaiz),
        sonOdemeGunu: Math.floor(sayi(kart.sonOdemeGunu)),
        yapilandirma: yapilandirma ? {
          yapilandirilanTutar: sayi(yapilandirma.yapilandirilanTutar ?? yapilandirma.tutar),
          taksitSayisi: Math.floor(sayi(yapilandirma.taksitSayisi)),
          aylikTaksit: sayi(yapilandirma.aylikTaksit),
          toplamGeriOdeme: sayi(yapilandirma.toplamGeriOdeme),
          aylikNominalFaizYuzde: sayi(yapilandirma.aylikNominalFaiz),
          kkdfYuzde: sayi(yapilandirma.kkdfOrani),
          bsmvYuzde: sayi(yapilandirma.bsmvOrani),
        } : null,
      };
    }),
    ekHesaplar: (veri?.overdrafts || []).slice(0, 30).map((hesap) => ({
      banka: String(hesap.banka || "Banka").slice(0, 40),
      kullanilan: sayi(hesap.kullanilan),
      yapilanOdeme: sayi(hesap.yapilanOdeme),
      aylikFaizYuzde: sayi(hesap.faiz),
    })),
    giderKategorileri: Object.entries(kategoriler)
      .sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([kategori, tutar]) => ({ kategori, tutar })),
    veriKapsami: {
      kartSayisi: (veri?.cards || []).length,
      krediSayisi: (veri?.loans || []).length,
      ekHesapSayisi: (veri?.overdrafts || []).length,
      buAyGiderKaydi: (veri?.expenses || []).filter((gider) => ay(gider.tarih) === buAy).length,
      gelirKaydi: (veri?.incomes || []).length,
    },
  };
}
