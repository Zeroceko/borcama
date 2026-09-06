const sayi = (deger) => {
  const sonuc = Number(deger);
  return Number.isFinite(sonuc) ? Math.max(sonuc, 0) : 0;
};

const ay = (tarih) => String(tarih || "").slice(0, 7);
const ayKaydir = (ayDegeri, fark) => {
  const [yil, ayNo] = String(ayDegeri).split("-").map(Number);
  const tarih = new Date(yil, ayNo - 1 + fark, 1);
  return `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, "0")}`;
};
const varlikDegeri = (varlik) => sayi(
  varlik.guncelDeger ?? varlik.besToplamTutar ??
  (sayi(varlik.miktar) * sayi(varlik.fonBirimFiyati || varlik.hisseBirimFiyati || varlik.kriptoBirimFiyati)),
);
const LIKIT_VARLIK_TURLERI = new Set([
  "mevduat", "usd", "eur", "gbp", "chf", "fon", "hisse", "hisse_abd",
]);
const likitVarlikMi = (varlik) => {
  const tur = String(varlik?.tur || "").toLowerCase();
  const kategori = String(varlik?.kategori || "").toLowerCase();
  return LIKIT_VARLIK_TURLERI.has(tur) || tur.startsWith("kripto") ||
    ["doviz", "emtia", "kripto", "fon", "hisse", "nakit"].includes(kategori);
};

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
  const sonAltiAy = Array.from({ length: 6 }, (_, index) => ayKaydir(buAy, -index)).map((donem) => {
    const giderler = (veri?.expenses || []).filter((gider) => ay(gider.tarih) === donem);
    const gelirler = (veri?.incomes || []).filter((gelir) => gelir.tekrar === "Her ay" || ay(gelir.tarih) === donem);
    return {
      donem,
      gider: giderler.reduce((toplam, gider) => toplam + sayi(gider.tutar), 0),
      gelir: gelirler.reduce((toplam, gelir) => toplam + sayi(gelir.tutar), 0),
      giderKaydi: giderler.length,
    };
  });
  const sabitGider = (veri?.expenses || []).filter((gider) => gider.tekrar === "Her ay")
    .reduce((toplam, gider) => toplam + sayi(gider.tutar), 0);
  const sabitGelir = (veri?.incomes || []).filter((gelir) => gelir.tekrar !== "Tek seferlik")
    .reduce((toplam, gelir) => toplam + sayi(gelir.tutar), 0);
  const toplamVarlik = (veri?.assets || []).reduce((toplam, varlik) => toplam + varlikDegeri(varlik), 0);
  const likitVarlik = (veri?.assets || []).filter(likitVarlikMi)
    .reduce((toplam, varlik) => toplam + varlikDegeri(varlik), 0);
  const toplamBorc = kalemler.reduce((toplam, kalem) => toplam + sayi(kalem.bakiye), 0);
  const odemeKaydi = [
    ...Object.values(veri?.cardPaymentHistory || {}).flat(),
    ...Object.values(veri?.loanPaymentHistory || {}).flat(),
    ...(veri?.overdrafts || []).flatMap((hesap) => hesap.odemeGecmisi || []),
  ].filter(Boolean);

  return {
    donem: buAy,
    ozet: {
      aylikGelir: sayi(gelir),
      zorunluOdeme: sayi(zorunluOdeme),
      kayitliHarcama: sayi(harcama),
      aylikAcik: sayi(planAcigi),
      toplamBorc,
      toplamVarlik,
      likitVarlik,
      netFinansalDurum: toplamVarlik - toplamBorc,
      sabitGelir,
      sabitGider,
      borcOdemeYukuYuzde: sayi(gelir) > 0 ? Math.round((sayi(zorunluOdeme) / sayi(gelir)) * 1000) / 10 : null,
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
    donemTrendi: sonAltiAy,
    varlikDagilimi: (veri?.assets || []).reduce((sonuc, varlik) => {
      const tur = String(varlik.kategori || varlik.tur || "diger").slice(0, 30);
      sonuc[tur] = sayi(sonuc[tur]) + varlikDegeri(varlik);
      return sonuc;
    }, {}),
    odemeOzeti: {
      toplamKayit: odemeKaydi.length,
      buAyKayit: odemeKaydi.filter((odeme) => ay(odeme.tarih) === buAy).length,
      buAyOdenen: odemeKaydi.filter((odeme) => ay(odeme.tarih) === buAy)
        .reduce((toplam, odeme) => toplam + sayi(odeme.tutar), 0),
    },
    finansalProfil: {
      aylikSonuc: sayi(planAcigi) > 0 ? "acik" : "dengeli",
      likitVarlikBorcaYeterMi: likitVarlik > 0 ? likitVarlik >= toplamBorc : null,
      pahaliBorcVar: [
        ...(veri?.loans || []).map((kredi) => sayi(kredi.faiz)),
        ...(veri?.overdrafts || []).map((hesap) => sayi(hesap.faiz)),
        ...(veri?.cards || []).map((kart) => sayi(kart.faiz ?? kart.aylikFaiz)),
      ].some((oran) => oran >= 3),
      veriEksikleri: [
        !(veri?.incomes || []).length && "gelir",
        !(veri?.expenses || []).length && "gider",
        !kalemler.length && "borc",
        !(veri?.assets || []).length && "varlik",
      ].filter(Boolean),
    },
    veriKapsami: {
      kartSayisi: (veri?.cards || []).length,
      krediSayisi: (veri?.loans || []).length,
      ekHesapSayisi: (veri?.overdrafts || []).length,
      buAyGiderKaydi: (veri?.expenses || []).filter((gider) => ay(gider.tarih) === buAy).length,
      gelirKaydi: (veri?.incomes || []).length,
      varlikKaydi: (veri?.assets || []).length,
      odemeKaydi: odemeKaydi.length,
    },
  };
}
