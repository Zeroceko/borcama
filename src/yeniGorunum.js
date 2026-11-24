// "Yeni görünüm" (3 sekmeli sade düzen) için saf yardımcılar. Ekrana bağlı
// değildir; test edilebilir. Klasik görünüm bu dosyayı kullanmaz.

export const GORUNUM_ANAHTARI = "borcama_gorunum";

export function gorunumOku(depo) {
  try {
    const kaynak = depo ?? (typeof localStorage !== "undefined" ? localStorage : null);
    return kaynak?.getItem(GORUNUM_ANAHTARI) === "yeni" ? "yeni" : "klasik";
  } catch {
    return "klasik";
  }
}

export function gorunumYaz(deger, depo) {
  try {
    const kaynak = depo ?? (typeof localStorage !== "undefined" ? localStorage : null);
    kaynak?.setItem(GORUNUM_ANAHTARI, deger === "yeni" ? "yeni" : "klasik");
  } catch {
    // Depolama kapalıysa seçim yalnız bu oturumda geçerli kalır.
  }
}

// Ödemenin bugüne göre kovası. gun: bugünden kaç gün sonra (eksi = gecikti).
export function odemeKovasi(gun) {
  if (!Number.isFinite(gun)) return null;
  if (gun < 0) return "gecikti";
  if (gun === 0) return "bugun";
  if (gun === 1) return "yarin";
  if (gun <= 7) return "buHafta";
  if (gun <= 30) return "sonraki";
  return null;
}

export const KOVA_SIRASI = ["gecikti", "bugun", "yarin", "buHafta", "sonraki"];

// Kapanmış (tamamı ödenmiş) satırlar listede kalır ama toplamlara girmez.
export function odemeleriGrupla(odemeler = []) {
  const kovalar = new Map(KOVA_SIRASI.map((k) => [k, []]));
  odemeler.forEach((odeme) => {
    const kova = odemeKovasi(odeme.gun);
    if (kova) kovalar.get(kova).push(odeme);
  });
  return KOVA_SIRASI
    .map((kova) => {
      const liste = kovalar.get(kova).slice().sort((a, b) => a.gun - b.gun);
      const acikToplam = liste
        .filter((o) => !o.odendi)
        .reduce((t, o) => t + Math.max(+o.tutar || 0, 0), 0);
      return { kova, odemeler: liste, acikToplam };
    })
    .filter((grup) => grup.odemeler.length > 0);
}

// Başlık kartı: önce gecikmiş, sonra en yakın açık ödeme.
export function enAcilOdeme(odemeler = []) {
  return odemeler
    .filter((o) => !o.odendi && !o.gelecek && Number.isFinite(o.gun) && (+o.tutar || 0) > 0.01)
    .sort((a, b) => a.gun - b.gun)[0] || null;
}

const yuvarla = (n) => Math.round(n * 100) / 100;

// Kart için "ne kadar ödersen ne olur" tahmini (bir ay). Oranlar aylık %.
// vergiOrani: faize eklenen vergi/fon (TRY'de 0.3), diğer birimlerde 0.
export function kartSenaryolari({ borc = 0, minimum = 0, akdi = 0, gecikme = 0, vergiOrani = 0 } = {}) {
  const b = Math.max(+borc || 0, 0);
  const m = Math.min(Math.max(+minimum || 0, 0), b);
  const carpan = 1 + Math.max(+vergiOrani || 0, 0);
  return {
    tamami: { odeme: yuvarla(b), faiz: 0 },
    minimum: { odeme: yuvarla(m), kalan: yuvarla(b - m), faiz: yuvarla(((b - m) * (+akdi || 0)) / 100 * carpan) },
    hic: { odeme: 0, faiz: yuvarla((b * (+gecikme || 0)) / 100 * carpan) },
  };
}

// Kart ödemesinin durumu: tamamı / minimum / ödenmedi.
export function kartOdemeDurumu({ kalanToplam = 0, minimumKalan = 0, yapilanOdeme = 0 } = {}) {
  if ((+kalanToplam || 0) <= 0.01) return "tamami";
  if ((+yapilanOdeme || 0) > 0 && (+minimumKalan || 0) <= 0.01) return "minimum";
  if ((+yapilanOdeme || 0) > 0) return "kismi";
  return "odenmedi";
}

// Kredi taksit numarası: toplam taksit ve bu ay ödendikten sonra kalan sayıdan.
export function taksitNumarasi({ toplamTaksit, kalanTaksit, buAyOdendi = false } = {}) {
  const toplam = Math.floor(+toplamTaksit || 0);
  const kalan = Math.floor(+kalanTaksit || 0);
  if (toplam < 1 || kalan < 0 || kalan > toplam) return null;
  const odenen = toplam - kalan;
  const no = buAyOdendi ? odenen : odenen + 1;
  if (no < 1 || no > toplam) return null;
  return { no, toplam, odenen };
}

// Aylık borç kayıtlarından (veri.snapshots: { "YYYY-AA": toplam }) son N ay.
// İki aydan az kayıt varsa grafik çizilmez.
export function borcTrendi(snapshots = {}, adet = 6) {
  const noktalar = Object.entries(snapshots || {})
    .filter(([ay, tutar]) => /^\d{4}-\d{2}$/.test(ay) && Number.isFinite(+tutar))
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-adet)
    .map(([ay, tutar]) => ({ ay, tutar: +tutar }));
  return noktalar.length >= 2 ? noktalar : [];
}

export function gunlukFaiz(aylikFaiz) {
  const a = Math.max(+aylikFaiz || 0, 0);
  return a / 30;
}

// Harcama kalemleri: [{ kategori, tutar, kartId }]. kartId "hepsi" ise tümü.
export function harcamaOzeti(kalemler = [], kartId = "hepsi") {
  const secili = kartId === "hepsi" ? kalemler : kalemler.filter((k) => k.kartId === kartId);
  const toplamlar = {};
  secili.forEach((k) => {
    const tutar = Math.max(+k.tutar || 0, 0);
    if (!tutar) return;
    const ad = k.kategori || "Diğer";
    toplamlar[ad] = (toplamlar[ad] || 0) + tutar;
  });
  const kategoriler = Object.entries(toplamlar)
    .map(([kategori, tutar]) => ({ kategori, tutar: yuvarla(tutar) }))
    .sort((a, b) => b.tutar - a.tutar);
  return { toplam: yuvarla(kategoriler.reduce((t, k) => t + k.tutar, 0)), kategoriler };
}
