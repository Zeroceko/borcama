import { cardRestructurableBalance } from "./cardRestructuring.js";
import { calculateRemainingLoanPlan } from "./loanPlanSummary.js";

const sayi = (deger) => {
  const sonuc = Number(deger);
  return Number.isFinite(sonuc) ? Math.max(sonuc, 0) : 0;
};
const paraYuvarla = (deger) => Math.round((sayi(deger) + Number.EPSILON) * 100) / 100;

const opsiyonelSayi = (deger) => {
  if (deger === null || deger === undefined || (typeof deger === "string" && !deger.trim())) return null;
  const sonuc = Number(deger);
  return Number.isFinite(sonuc) ? Math.max(sonuc, 0) : null;
};

const opsiyonelTamSayi = (deger) => {
  const sonuc = opsiyonelSayi(deger);
  return sonuc === null ? null : Math.floor(sonuc);
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
const varlikDegeriBiliniyorMu = (varlik) => {
  if (opsiyonelSayi(varlik.guncelDeger ?? varlik.besToplamTutar) !== null) return true;
  const miktar = opsiyonelSayi(varlik.miktar);
  const birimFiyat = opsiyonelSayi(varlik.fonBirimFiyati || varlik.hisseBirimFiyati || varlik.kriptoBirimFiyati);
  return miktar !== null && birimFiyat !== null;
};
const LIKIT_VARLIK_TURLERI = new Set([
  "nakit", "mevduat", "usd", "eur", "gbp", "chf", "fon", "hisse", "hisse_abd",
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
  const kartlar = veri?.cards || [];
  const krediler = veri?.loans || [];
  const ekHesaplar = veri?.overdrafts || [];
  const gelirler = veri?.incomes || [];
  const giderler = veri?.expenses || [];
  const varliklar = veri?.assets || [];
  const buAy = `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, "0")}`;
  const kategoriler = {};
  giderler.filter((gider) => gider.tekrar === "Her ay" || ay(gider.tarih) === buAy).forEach((gider) => {
    const kategori = String(gider.kategori || "Diğer").slice(0, 40);
    kategoriler[kategori] = sayi(kategoriler[kategori]) + sayi(gider.tutar);
  });
  const duzenliGiderler = giderler.filter((gider) => gider.tekrar === "Her ay");
  const duzenliGelirler = gelirler.filter((gelir) => gelir.tekrar !== "Tek seferlik");
  const sonAltiAy = Array.from({ length: 6 }, (_, index) => ayKaydir(buAy, -index)).map((donem) => {
    const donemselGiderler = giderler.filter((gider) => gider.tekrar !== "Her ay" && ay(gider.tarih) === donem);
    const donemselGelirler = gelirler.filter((gelir) => gelir.tekrar === "Tek seferlik" && ay(gelir.tarih) === donem);
    const duzenliGiderToplami = duzenliGiderler.reduce((toplam, gider) => toplam + sayi(gider.tutar), 0);
    const duzenliGelirToplami = duzenliGelirler.reduce((toplam, gelir) => toplam + sayi(gelir.tutar), 0);
    const donemselGiderToplami = donemselGiderler.reduce((toplam, gider) => toplam + sayi(gider.tutar), 0);
    const donemselGelirToplami = donemselGelirler.reduce((toplam, gelir) => toplam + sayi(gelir.tutar), 0);
    return {
      donem,
      gider: duzenliGiderToplami + donemselGiderToplami,
      gelir: duzenliGelirToplami + donemselGelirToplami,
      duzenliGider: duzenliGiderToplami,
      duzenliGelir: duzenliGelirToplami,
      donemselGider: donemselGiderToplami,
      donemselGelir: donemselGelirToplami,
      giderKaydi: duzenliGiderler.length + donemselGiderler.length,
      gelirKaydi: duzenliGelirler.length + donemselGelirler.length,
    };
  });
  const sabitGider = duzenliGiderler.reduce((toplam, gider) => toplam + sayi(gider.tutar), 0);
  const sabitGelir = duzenliGelirler.reduce((toplam, gelir) => toplam + sayi(gelir.tutar), 0);
  const toplamVarlik = varliklar.reduce((toplam, varlik) => toplam + varlikDegeri(varlik), 0);
  const likitVarlik = varliklar.filter(likitVarlikMi)
    .reduce((toplam, varlik) => toplam + varlikDegeri(varlik), 0);
  const toplamBorc = kalemler.reduce((toplam, kalem) => toplam + sayi(kalem.bakiye), 0);
  const aktifKrediMi = (kredi) => sayi(kredi.kalanBorc) > 0;
  const aktifKartMi = (kart) => cardRestructurableBalance(kart) > 0;
  const ekHesapKalanBorc = (hesap) => Math.max(sayi(hesap.kullanilan) - sayi(hesap.yapilanOdeme), 0);
  const aktifEkHesapMi = (hesap) => ekHesapKalanBorc(hesap) > 0;
  const odemeKaydi = [
    ...Object.values(veri?.cardPaymentHistory || {}).flat(),
    ...Object.values(veri?.loanPaymentHistory || {}).flat(),
    ...(veri?.overdrafts || []).flatMap((hesap) => hesap.odemeGecmisi || []),
  ].filter(Boolean);
  const kalemFaizi = (tur, id) => {
    const kalem = kalemler.find((aday) => aday.id === `${tur}-${id}`);
    const oran = opsiyonelSayi(kalem?.faiz);
    return oran === null ? null : { oran, tahmini: Boolean(kalem?.faizTahmini) };
  };
  const kartFaizBilgileri = kartlar.map((kart) => {
    const kayitli = opsiyonelSayi(kart.faiz ?? kart.aylikFaiz);
    return kayitli !== null && kayitli > 0
      ? { oran: kayitli, tahmini: false, kaynak: "kullanıcı kaydı" }
      : (() => {
          const hesaplanan = kalemFaizi("kart", kart.id);
          return hesaplanan ? { ...hesaplanan, kaynak: "TCMB azami oranı" } : null;
        })();
  });
  const ekHesapFaizBilgileri = ekHesaplar.map((hesap) => {
    const kayitli = opsiyonelSayi(hesap.faiz);
    return kayitli !== null && kayitli > 0
      ? { oran: kayitli, tahmini: false, kaynak: "kullanıcı kaydı" }
      : (() => {
          const hesaplanan = kalemFaizi("ek", hesap.id);
          return hesaplanan ? { ...hesaplanan, kaynak: "ürün referans oranı" } : null;
        })();
  });
  const krediFaizBilgileri = krediler.map((kredi) => {
    const oran = opsiyonelSayi(kredi.faiz);
    return oran === null ? null : { oran, tahmini: false, kaynak: "kullanıcı kaydı" };
  });
  const digerBorclar = (veri?.others || []).map((borc) => {
    const oran = opsiyonelSayi(borc.faiz);
    const kalem = kalemFaizi("diger", borc.id);
    return { borc, faiz: oran !== null ? { oran, tahmini: false, kaynak: "kullanıcı kaydı" } : kalem };
  });
  const bilinenFaizler = [
    ...krediFaizBilgileri, ...ekHesapFaizBilgileri, ...kartFaizBilgileri,
    ...digerBorclar.map(({ faiz }) => faiz),
  ].filter(Boolean).map(({ oran }) => oran);
  const kartAylikFaizTahmini = kartlar.reduce((toplam, kart, index) => {
    const faiz = kartFaizBilgileri[index];
    if (!aktifKartMi(kart) || !faiz) return toplam;
    return toplam + (cardRestructurableBalance(kart) * faiz.oran) / 100;
  }, 0);
  const ekHesapAylikFaizTahmini = ekHesaplar.reduce((toplam, hesap, index) => {
    const faiz = ekHesapFaizBilgileri[index];
    if (!aktifEkHesapMi(hesap) || !faiz) return toplam;
    return toplam + (ekHesapKalanBorc(hesap) * faiz.oran) / 100;
  }, 0);
  const krediPlanMaliyetleri = krediler.map((kredi) => {
    const kalanBorc = opsiyonelSayi(kredi.kalanBorc);
    const aylikTaksit = opsiyonelSayi(kredi.taksit);
    const kalanTaksit = opsiyonelTamSayi(kredi.kalanTaksit);
    if (!aktifKrediMi(kredi) || kalanBorc === null || aylikTaksit === null || kalanTaksit === null) return null;
    const odemeler = Object.values(veri?.loanPaymentHistory || {})
      .map((ayKayitlari) => ayKayitlari?.[kredi.id])
      .filter(Boolean);
    const tamamlananTaksit = odemeler.reduce((toplam, odeme) =>
      toplam + (sayi(odeme.tutar) + 0.01 >= aylikTaksit && aylikTaksit > 0 ? 1 : 0), 0);
    const plan = calculateRemainingLoanPlan({
      schedule: kredi.odemePlani || [],
      startInstallmentNumber: kredi.odemePlaniBelgeOzeti?.sonrakiTaksitNo,
      payments: odemeler,
      completedInstallments: tamamlananTaksit,
      baselinePaidTotal: kredi.odemePlaniBelgeOzeti?.odemeGecmisiBaslangicToplami,
      baselineCompletedInstallments: kredi.odemePlaniBelgeOzeti?.tamamlananTaksitBaslangici,
      fallbackPrincipal: kalanBorc,
      installment: aylikTaksit,
      remainingInstallments: kalanTaksit,
    });
    return {
      kalanOdemeToplami: plan.remainingPaymentTotal,
      kalanFinansmanMaliyeti: plan.remainingFinancingCost,
    };
  }).filter(Boolean);
  const degiskenBorcAylikFaizi = kartAylikFaizTahmini + ekHesapAylikFaizTahmini;
  const veriEksikleri = new Set([
    !gelirler.length && "gelir",
    !giderler.length && "gider",
    !kalemler.length && "borc",
    !varliklar.length && "varlik",
    kalemler.some((kalem) => opsiyonelSayi(kalem.bakiye) === null) && "borc_bakiyesi",
    krediler.some((kredi) => aktifKrediMi(kredi) && opsiyonelSayi(kredi.kalanBorc) === null) && "kredi_kalan_borcu",
    krediler.some((kredi) => aktifKrediMi(kredi) && opsiyonelSayi(kredi.taksit) === null) && "kredi_taksiti",
    krediFaizBilgileri.some((faiz, index) => aktifKrediMi(krediler[index]) && !faiz) && "kredi_faizi",
    kartlar.some((kart) => aktifKartMi(kart) && opsiyonelSayi(kart.toplamEkstreBorcu ?? kart.borc) === null) && "kart_ekstre_borcu",
    kartlar.some((kart) => aktifKartMi(kart)
      && opsiyonelSayi(kart.asgariOdeme ?? kart.asgari) === null) && "kart_asgari_odemesi",
    kartFaizBilgileri.some((faiz, index) => aktifKartMi(kartlar[index]) && !faiz) && "kart_faizi",
    ekHesaplar.some((hesap) => aktifEkHesapMi(hesap) && opsiyonelSayi(hesap.kullanilan) === null) && "ek_hesap_kullanimi",
    ekHesapFaizBilgileri.some((faiz, index) => aktifEkHesapMi(ekHesaplar[index]) && !faiz) && "ek_hesap_faizi",
    varliklar.some((varlik) => !varlikDegeriBiliniyorMu(varlik)) && "varlik_degeri",
  ].filter(Boolean));

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
    krediler: krediler.slice(0, 30).map((kredi, index) => ({
      banka: String(kredi.banka || "Banka").slice(0, 40),
      tur: String(kredi.ad || "Kredi").slice(0, 50),
      kalanBorc: opsiyonelSayi(kredi.kalanBorc),
      aylikTaksit: opsiyonelSayi(kredi.taksit),
      kalanTaksit: opsiyonelTamSayi(kredi.kalanTaksit),
      aylikFaizYuzde: krediFaizBilgileri[index]?.oran ?? null,
      faizKaynak: krediFaizBilgileri[index]?.kaynak ?? null,
      aktifBorc: aktifKrediMi(kredi),
      ilkOdemeTarihi: String(kredi.ilkOdemeTarihi || kredi.ilkTaksitTarihi || "").slice(0, 10) || null,
      yapilandirma: kredi.kaynak === "card_restructuring" ? {
        yapilandirilanTutar: opsiyonelSayi(kredi.yapilandirilanTutar),
        toplamGeriOdeme: opsiyonelSayi(kredi.toplamGeriOdeme),
        aylikNominalFaizYuzde: opsiyonelSayi(kredi.aylikNominalFaiz),
        kkdfYuzde: opsiyonelSayi(kredi.kkdfOrani),
        bsmvYuzde: opsiyonelSayi(kredi.bsmvOrani),
        bankaPlaniEsas: Boolean(kredi.bankaPlaniEsas),
      } : null,
    })),
    kartlar: kartlar.slice(0, 30).map((kart, index) => {
      const kayitlar = Array.isArray(kart.yapilandirmaKayitlari) ? kart.yapilandirmaKayitlari : [];
      const yapilandirma = kayitlar[kayitlar.length - 1];
      return {
        banka: String(kart.banka || "Banka").slice(0, 40),
        urun: String(kart.ad || "Kredi kartı").slice(0, 50),
        ekstreBorcu: opsiyonelSayi(kart.toplamEkstreBorcu ?? kart.borc),
        kalanBorc: cardRestructurableBalance(kart),
        asgariOdeme: opsiyonelSayi(kart.asgariOdeme ?? kart.asgari),
        yapilanOdeme: opsiyonelSayi(kart.yapilanOdeme),
        aylikFaizYuzde: kartFaizBilgileri[index]?.oran ?? null,
        faizTahmini: kartFaizBilgileri[index]?.tahmini ?? null,
        faizKaynak: kartFaizBilgileri[index]?.kaynak ?? null,
        aktifBorc: aktifKartMi(kart),
        sonOdemeGunu: opsiyonelTamSayi(kart.sonOdemeGunu),
        yapilandirma: yapilandirma ? {
          yapilandirilanTutar: opsiyonelSayi(yapilandirma.yapilandirilanTutar ?? yapilandirma.tutar),
          taksitSayisi: opsiyonelTamSayi(yapilandirma.taksitSayisi),
          aylikTaksit: opsiyonelSayi(yapilandirma.aylikTaksit),
          toplamGeriOdeme: opsiyonelSayi(yapilandirma.toplamGeriOdeme),
          aylikNominalFaizYuzde: opsiyonelSayi(yapilandirma.aylikNominalFaiz),
          kkdfYuzde: opsiyonelSayi(yapilandirma.kkdfOrani),
          bsmvYuzde: opsiyonelSayi(yapilandirma.bsmvOrani),
        } : null,
      };
    }),
    ekHesaplar: ekHesaplar.slice(0, 30).map((hesap, index) => ({
      banka: String(hesap.banka || "Banka").slice(0, 40),
      kullanilan: opsiyonelSayi(hesap.kullanilan),
      yapilanOdeme: opsiyonelSayi(hesap.yapilanOdeme),
      aylikFaizYuzde: ekHesapFaizBilgileri[index]?.oran ?? null,
      faizTahmini: ekHesapFaizBilgileri[index]?.tahmini ?? null,
      faizKaynak: ekHesapFaizBilgileri[index]?.kaynak ?? null,
      aktifBorc: aktifEkHesapMi(hesap),
    })),
    digerBorclar: digerBorclar.slice(0, 30).map(({ borc, faiz }) => ({
      banka: String(borc.banka || "").slice(0, 40),
      tur: String(borc.ad || "Diğer borç").slice(0, 50),
      bakiye: opsiyonelSayi(borc.tutar),
      aylikFaizYuzde: faiz?.oran ?? null,
      faizKaynak: faiz?.kaynak ?? null,
    })),
    giderKategorileri: Object.entries(kategoriler)
      .sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([kategori, tutar]) => ({ kategori, tutar })),
    donemTrendi: sonAltiAy,
    donemTrendiYontemi: duzenliGelirler.length || duzenliGiderler.length
      ? "Kayitli duzenli tutarlar her aya eklenmis tahmindir; yalniz tarihli kalemler o ayin gercek kaydidir."
      : "Yalniz tarihli kayitlardan hesaplanmistir.",
    varlikDagilimi: varliklar.reduce((sonuc, varlik) => {
      const tur = String(varlik.tur || varlik.kategori || "diger").slice(0, 30);
      sonuc[tur] = sayi(sonuc[tur]) + varlikDegeri(varlik);
      return sonuc;
    }, {}),
    odemeOzeti: {
      toplamKayit: odemeKaydi.length,
      buAyKayit: odemeKaydi.filter((odeme) => ay(odeme.tarih) === buAy).length,
      buAyOdenen: odemeKaydi.filter((odeme) => ay(odeme.tarih) === buAy)
        .reduce((toplam, odeme) => toplam + sayi(odeme.tutar), 0),
    },
    faizMaliyetOzeti: {
      kartAylikFaizVergiHaricTahmin: paraYuvarla(kartAylikFaizTahmini),
      ekHesapAylikFaizVergiHaricTahmin: paraYuvarla(ekHesapAylikFaizTahmini),
      kartVeEkHesapAylikFaizVergiHaricTahmin: paraYuvarla(degiskenBorcAylikFaizi),
      kartVeEkHesapAylikFaizVergiDahilTahmin: paraYuvarla(degiskenBorcAylikFaizi * 1.3),
      vergiToplamYuzde: 30,
      vergiVarsayimi: "Faiz tutarına toplam yüzde 30 BSMV ve KKDF varsayımı eklenmiştir.",
      planiBilinenKredilerKalanOdemeToplami: paraYuvarla(krediPlanMaliyetleri.reduce((toplam, plan) => toplam + plan.kalanOdemeToplami, 0)),
      planiBilinenKredilerKalanFinansmanMaliyeti: paraYuvarla(krediPlanMaliyetleri.reduce((toplam, plan) => toplam + plan.kalanFinansmanMaliyeti, 0)),
      planiBilinenKrediSayisi: krediPlanMaliyetleri.length,
      aktifKrediSayisi: krediler.filter(aktifKrediMi).length,
      yontem: "Kart ve ek hesap için bir aylık tahmin; kredi için kalan taksit toplamı eksi kalan anapara.",
    },
    finansalProfil: {
      aylikSonuc: sayi(planAcigi) > 0 ? "acik" : "dengeli",
      likitVarlikBorcaYeterMi: varliklar.length && toplamBorc > 0 ? likitVarlik >= toplamBorc : null,
      pahaliBorcVar: bilinenFaizler.length ? bilinenFaizler.some((oran) => oran >= 3) : null,
      veriEksikleri: [...veriEksikleri],
    },
    veriKapsami: {
      kartSayisi: kartlar.length,
      krediSayisi: krediler.length,
      ekHesapSayisi: ekHesaplar.length,
      buAyGiderKaydi: giderler.filter((gider) => gider.tekrar === "Her ay" || ay(gider.tarih) === buAy).length,
      gelirKaydi: gelirler.length,
      varlikKaydi: varliklar.length,
      odemeKaydi: odemeKaydi.length,
    },
  };
}
