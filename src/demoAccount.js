import { krediKartiAsgariOrani } from "./creditCardMinimum.js";

const ayAnahtari = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const ayEkle = (ay, fark) => {
  const [yil, ayNo] = ay.split("-").map(Number);
  const date = new Date(yil, ayNo - 1 + fark, 1);
  return ayAnahtari(date);
};

const tarih = (ay, gun) => `${ay}-${String(gun).padStart(2, "0")}`;

export function demoVerisiOlustur(referenceDate = new Date()) {
  const buAy = ayAnahtari(referenceDate);
  const oncekiAy = ayEkle(buAy, -1);

  return {
    demo: { synthetic: true, readOnly: true, version: 1 },
    cards: [
      {
        id: "demo-bonus", banka: "Garanti BBVA", ad: "Bonus", limit: 120000,
        kesimGunu: 10, sonOdemeGunu: 20, ekstreAyi: buAy,
        yeniDonemEkstreBorcu: 31000, oncekiAydanKalan: 11000,
        toplamEkstreBorcu: 42000, yapilanOdeme: 10000,
        ekstreGecmisi: [{ ekstreAyi: oncekiAy, yeniDonemEkstreBorcu: 28500, oncekiAydanKalan: 0, toplamEkstreBorcu: 28500, yapilanOdeme: 17500, kesimGunu: 10, sonOdemeGunu: 20 }],
      },
      {
        id: "demo-world", banka: "Yapı Kredi", ad: "World", limit: 50000,
        kesimGunu: 25, sonOdemeGunu: 7, ekstreAyi: buAy,
        yeniDonemEkstreBorcu: 46000, oncekiAydanKalan: 0,
        toplamEkstreBorcu: 46000, yapilanOdeme: 0, ekstreGecmisi: [],
      },
      {
        id: "demo-maximum", banka: "İş Bankası", ad: "Maximum", limit: 95000,
        kesimGunu: 22, sonOdemeGunu: 5, ekstreAyi: buAy,
        yeniDonemEkstreBorcu: 18500, oncekiAydanKalan: 0,
        toplamEkstreBorcu: 18500, yapilanOdeme: 3000, ekstreGecmisi: [],
      },
    ],
    loans: [{
      id: "demo-kredi", banka: "QNB", ad: "İhtiyaç kredisi",
      krediTutari: 220000, kalanBorc: 168000, taksit: 12400,
      toplamTaksit: 24, odenenTaksit: 9, kalanTaksit: 15,
      faiz: 3.49, odemeGunu: 8,
    }],
    overdrafts: [{
      id: "demo-kmh", banka: "Enpara", limit: 50000, kullanilan: 27000,
      yapilanOdeme: 5000, faiz: 4.25,
      odemeGecmisi: [{ id: "demo-kmh-odeme", tutar: 5000, tarih: referenceDate.toISOString() }],
    }],
    others: [],
    expenses: [
      { id: "dh1", tarih: tarih(buAy, 3), kategori: "Market", tutar: 4200, kaynak: "Yapı Kredi · World" },
      { id: "dh2", tarih: tarih(buAy, 7), kategori: "Yeme-İçme", tutar: 6800, kaynak: "Garanti BBVA · Bonus" },
      { id: "dh3", tarih: tarih(buAy, 12), kategori: "Yeme-İçme", tutar: 5900, kaynak: "Garanti BBVA · Bonus" },
      { id: "dh4", tarih: tarih(buAy, 17), kategori: "Yeme-İçme", tutar: 5300, kaynak: "İş Bankası · Maximum" },
      { id: "dh5", tarih: tarih(buAy, 19), kategori: "Ulaşım", tutar: 3600, kaynak: "Yapı Kredi · World" },
      { id: "dh6", tarih: tarih(buAy, 22), kategori: "Fatura", tutar: 4100, kaynak: "Banka hesabı" },
      { id: "dh7", tarih: tarih(buAy, 25), kategori: "Market", tutar: 3900, kaynak: "Yapı Kredi · World" },
      { id: "do1", tarih: tarih(oncekiAy, 4), kategori: "Market", tutar: 3600, kaynak: "Yapı Kredi · World" },
      { id: "do2", tarih: tarih(oncekiAy, 11), kategori: "Yeme-İçme", tutar: 4500, kaynak: "Garanti BBVA · Bonus" },
      { id: "do3", tarih: tarih(oncekiAy, 18), kategori: "Yeme-İçme", tutar: 3500, kaynak: "İş Bankası · Maximum" },
      { id: "do4", tarih: tarih(oncekiAy, 24), kategori: "Market", tutar: 3400, kaynak: "Yapı Kredi · World" },
      { id: "do5", tarih: tarih(oncekiAy, 26), kategori: "Ulaşım", tutar: 3100, kaynak: "Banka hesabı" },
    ],
    incomes: [{ id: "demo-maas", ad: "Maaş", tutar: 70000, tekrar: "Aylık", tarih: tarih(buAy, 1) }],
    assets: [{ id: "demo-mevduat", kategori: "nakit", tur: "mevduat", ad: "Acil durum birikimi", kurum: "Banka hesabı", paraBirimi: "TRY", guncelDeger: 48000, toplamMaliyet: 48000 }],
    feedbacks: [], paid: {}, cardPaymentHistory: {}, loanPaymentHistory: {}, activityHistory: [],
    ayarlar: { ekstreDonemleriV2: true, ekstreBorcModeliV3: true, ilkKullanimRehberiV1: true },
    snapshots: { [oncekiAy]: 250000 },
  };
}

const toplam = (liste, alan) => liste.reduce((sum, item) => sum + Math.max(Number(item[alan]) || 0, 0), 0);

export function demoHesapOzeti(veri, referenceDate = new Date()) {
  const buAy = ayAnahtari(referenceDate);
  const kartlar = veri.cards.map((kart) => {
    const toplamBorc = Math.max(Number(kart.toplamEkstreBorcu) || 0, 0);
    const odenen = Math.min(Math.max(Number(kart.yapilanOdeme) || 0, 0), toplamBorc);
    const kalan = toplamBorc - odenen;
    const asgari = toplamBorc * krediKartiAsgariOrani(kart.limit);
    return { ...kart, toplamBorc, odenen, kalan, kalanAsgari: Math.max(asgari - odenen, 0) };
  });
  const krediler = veri.loans.map((kredi) => ({ ...kredi, kalan: Math.max(Number(kredi.kalanBorc) || 0, 0) }));
  const ekHesaplar = veri.overdrafts.map((hesap) => {
    const kalan = Math.max((Number(hesap.kullanilan) || 0) - (Number(hesap.yapilanOdeme) || 0), 0);
    return { ...hesap, kalan, aylikFaiz: kalan * (Number(hesap.faiz) || 0) / 100 };
  });
  const buAykiHarcamalar = veri.expenses.filter((item) => String(item.tarih).startsWith(buAy));
  const kategoriler = Object.entries(buAykiHarcamalar.reduce((acc, item) => {
    acc[item.kategori] = (acc[item.kategori] || 0) + (Number(item.tutar) || 0);
    return acc;
  }, {})).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
  const gelir = veri.incomes.filter((item) => String(item.tarih).startsWith(buAy)).reduce((sum, item) => sum + (Number(item.tutar) || 0), 0);
  const harcama = buAykiHarcamalar.reduce((sum, item) => sum + (Number(item.tutar) || 0), 0);
  const kartAsgari = kartlar.reduce((sum, kart) => sum + kart.kalanAsgari, 0);
  const krediTaksit = toplam(krediler, "taksit");
  const ekHesapFaizi = ekHesaplar.reduce((sum, hesap) => sum + hesap.aylikFaiz, 0);
  const aylikOdeme = kartAsgari + krediTaksit + ekHesapFaizi;
  const kartBorcu = toplam(kartlar, "kalan");
  const krediBorcu = toplam(krediler, "kalan");
  const ekHesapBorcu = toplam(ekHesaplar, "kalan");
  const varlik = toplam(veri.assets, "guncelDeger");
  const aylikSonuc = gelir - harcama - aylikOdeme;
  const odemeler = [
    ...krediler.map((item) => ({ id: item.id, name: `${item.banka} · ${item.ad}`, day: item.odemeGunu, amount: item.taksit, type: "Kredi taksidi" })),
    ...kartlar.map((item) => ({ id: item.id, name: `${item.banka} · ${item.ad}`, day: item.sonOdemeGunu, amount: item.kalanAsgari, type: "Kalan asgari" })),
  ].filter((item) => item.amount > 0).sort((a, b) => a.day - b.day);

  return {
    ay: new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(referenceDate),
    kartlar, krediler, ekHesaplar, kategoriler, odemeler,
    gelir, harcama, aylikOdeme, aylikSonuc, varlik,
    kartBorcu, krediBorcu, ekHesapBorcu,
    toplamBorc: kartBorcu + krediBorcu + ekHesapBorcu,
    netDurum: varlik - kartBorcu - krediBorcu - ekHesapBorcu,
  };
}
