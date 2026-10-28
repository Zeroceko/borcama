// Kurulum akisinin (Onboarding.jsx > KurulumAkisi) saf kurallari: adim
// sirasi, atlama kurallari, yanki hesaplari ve akisin sonunda veriye
// yazilacak kayitlar. Ekran, dil veya tarayici bilgisi kullanilmaz; testler
// dogrudan cagirir.

export const ADIMLAR = ["dil", "gorunum", "ulke", "isim", "hedef", "siklik", "gun", "gelir", "turler", "borc", "yasam", "plan", "hazir"];

export const HEDEFLER = ["borc", "aySonu", "kontrol"];
export const SIKLIKLAR = ["aylik", "ikiKez", "haftalik", "duzensiz"];
export const BORC_TURLERI = ["kart", "kredi", "kmh", "kisi"];
export const YASAM_ORANLARI = [30, 45, 60];
// Gorunum: "system" cihaz ayarini izler (App.jsx > ayarlar.tema).
export const TEMALAR = ["system", "light", "dark"];

// Durumun bos hali. Varsayilanlar ekranda onceden isaretli gelir.
export function bosDurum() {
  return {
    ad: "",
    tema: "system",
    hedefler: ["borc"],
    siklik: "aylik",
    maasGunu: 1,
    maasHaftaGunu: 1,
    gelir: "",
    turler: [],
    borcYok: false,
    borclar: [],
    yasam: null,
    atlanan: [],
  };
}

// Isim yalniz uygulamada sorulur (web'de hesap zaten e-postayla acik).
// Maas gunu sikliga gore sorulur: ayda bir/iki -> ayin gunu, haftalik ->
// haftanin gunu; duzensiz gelirde sorulmaz. "Borcum yok" secilince ilk borc formu atlanir.
export function adimSirasi({ native = false, siklik = "aylik", borcYok = false } = {}) {
  return ADIMLAR.filter((adim) => {
    if (adim === "isim") return native;
    if (adim === "gun") return siklik !== "duzensiz";
    if (adim === "borc") return !borcYok;
    return true;
  });
}

// Ilerleme cubugunda sayilan adimlar; kapanis ekrani sayilmaz.
export function numaraliAdimlar(sira) {
  return sira.filter((adim) => adim !== "hazir");
}

export function sonrakiAdim(adim, sira) {
  const i = sira.indexOf(adim);
  return i >= 0 && i < sira.length - 1 ? sira[i + 1] : null;
}

export function oncekiAdim(adim, sira) {
  const i = sira.indexOf(adim);
  return i > 0 ? sira[i - 1] : null;
}

// Tutar alanlari "70000", "70.000" veya "70000,50" gelebilir; yerel bicim
// ayiricilari ekranda temizlenir, burada yalniz sayiya cevrilir.
export function tutar(deger) {
  const sayi = Number(String(deger ?? "").replace(",", "."));
  return Number.isFinite(sayi) && sayi > 0 ? sayi : 0;
}

export function gelirGecerli(deger) {
  return tutar(deger) > 0;
}

// Gelir plan icin sart; diger adimlar varsayilanla gecilebilir.
export function adimGecilebilirMi(adim, durum) {
  if (adim === "hedef") return durum.hedefler.length > 0;
  if (adim === "gelir") return gelirGecerli(durum.gelir);
  if (adim === "turler") return durum.borcYok || durum.turler.length > 0;
  if (adim === "borc") return durum.borclar.length > 0;
  return true;
}

// Ilk borc adimini atlama: o ana kadar eklenen borclar kalir; hic yoksa
// borcsuz devam edilir (plan "borcsuz" metni). Adim atlananlara yazilir.
export function borcAdiminiAtla(durum) {
  const borcVar = durum.borclar.length > 0;
  return {
    ...durum,
    borcYok: !borcVar,
    turler: borcVar ? durum.turler : [],
    atlanan: durum.atlanan.includes("borc") ? durum.atlanan : [...durum.atlanan, "borc"],
  };
}

export function gunlukTutar(gelir) {
  return Math.round(tutar(gelir) / 30);
}

const gunBasi = (tarih) => new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate());
const ayinSonGunu = (yil, ay) => new Date(yil, ay + 1, 0).getDate();

// Ayin "gun"u icin bugunden sonraki ilk tarih (bugun dahil). 31 secilip ay
// 30 cekiyorsa ayin son gunu kullanilir.
export function sonrakiGunTarihi(gun, bugun = new Date()) {
  const g = Math.min(Math.max(parseInt(gun, 10) || 1, 1), 31);
  const basla = gunBasi(bugun);
  const buAy = new Date(basla.getFullYear(), basla.getMonth(), Math.min(g, ayinSonGunu(basla.getFullYear(), basla.getMonth())));
  if (buAy >= basla) return buAy;
  const yil = basla.getMonth() === 11 ? basla.getFullYear() + 1 : basla.getFullYear();
  const ay = (basla.getMonth() + 1) % 12;
  return new Date(yil, ay, Math.min(g, ayinSonGunu(yil, ay)));
}

// Haftanin gunu (1 = Pazartesi ... 7 = Pazar) icin bugunden sonraki ilk
// tarih (bugun dahil).
export function sonrakiHaftaGunuTarihi(haftaGunu, bugun = new Date()) {
  const hedef = Math.min(Math.max(parseInt(haftaGunu, 10) || 1, 1), 7) % 7; // JS: 0 = Pazar
  const basla = gunBasi(bugun);
  const fark = (hedef - basla.getDay() + 7) % 7;
  return new Date(basla.getFullYear(), basla.getMonth(), basla.getDate() + fark);
}

// Hedef secimi coklu; en az biri secili kalir.
export function hedefDegistir(hedefler, hedef) {
  if (!HEDEFLER.includes(hedef)) return hedefler;
  if (!hedefler.includes(hedef)) return HEDEFLER.filter((h) => h === hedef || hedefler.includes(h));
  return hedefler.length > 1 ? hedefler.filter((h) => h !== hedef) : hedefler;
}

export function kalanGun(tarih, bugun = new Date()) {
  return Math.round((gunBasi(tarih) - gunBasi(bugun)) / 86400000);
}

export function sonrakiMaas(gun, bugun = new Date()) {
  const tarih = sonrakiGunTarihi(gun, bugun);
  return { tarih, kalan: kalanGun(tarih, bugun) };
}

export function borcGecerli(borc) {
  if (!borc?.banka?.trim()) return false;
  if (borc.tur === "kredi") return tutar(borc.taksit) > 0 && parseInt(borc.kalanTaksit, 10) >= 1 && parseInt(borc.gun, 10) >= 1;
  if (borc.tur === "kart") return tutar(borc.tutar) > 0 && parseInt(borc.gun, 10) >= 1;
  return tutar(borc.tutar) > 0;
}

// Bu ay odemelere giden tutar. Kartta bu ayki borcun tamami, kredide
// taksit; ek hesap ve kisi borcunun sabit bir aylik odemesi yok.
export function aylikOdeme(borc) {
  if (borc.tur === "kart") return tutar(borc.tutar);
  if (borc.tur === "kredi") return tutar(borc.taksit);
  return 0;
}

export function aylikOdemeler(borclar = []) {
  return borclar.reduce((toplam, borc) => toplam + aylikOdeme(borc), 0);
}

export function borcBakiyesi(borc) {
  if (borc.tur === "kredi") return Math.round(tutar(borc.taksit) * (parseInt(borc.kalanTaksit, 10) || 0) * 100) / 100;
  return tutar(borc.tutar);
}

export function yasamOnerileri(gelir) {
  return YASAM_ORANLARI.map((oran) => Math.round((tutar(gelir) * oran) / 100));
}

// Planda bu ay odemelere giden tutar: kredi taksitleri sabit; taksitsiz
// borclara (kart, ek hesap, kisi) gelir - yasam - taksitlerden artan para en
// kucuk bakiyeden baslayarak gider (kartin tamami sigmiyorsa sigan kadari).
export function planOdemeleri({ gelir, borclar = [], yasam = 0 }) {
  const sabit = borclar.filter((borc) => borc.tur === "kredi").reduce((toplam, borc) => toplam + tutar(borc.taksit), 0);
  let guc = Math.max(tutar(gelir) - tutar(yasam) - sabit, 0);
  let degisken = 0;
  for (const borc of borclar.filter((b) => b.tur === "kart").sort((a, b) => borcBakiyesi(a) - borcBakiyesi(b))) {
    const odeme = Math.min(borcBakiyesi(borc), guc);
    degisken += odeme;
    guc -= odeme;
  }
  return sabit + degisken;
}

export function aySonuKalan({ gelir, borclar = [], yasam = 0 }) {
  return tutar(gelir) - planOdemeleri({ gelir, borclar, yasam }) - tutar(yasam);
}

// Ilk bitecek borc: taksitsiz borclarda (kart, ek hesap, kisi) en kucuk
// bakiye once kapanir; o borca her ay gidebilecek tutar = gelir - yasam -
// kredi taksitleri. Kredi kendi taksitiyle biter. Gelir yetmiyorsa ay null.
export function ilkBitecekBorc({ gelir, borclar = [], yasam = 0 }) {
  if (!borclar.length) return null;
  const taksitler = borclar.filter((borc) => borc.tur === "kredi").reduce((toplam, borc) => toplam + tutar(borc.taksit), 0);
  const odemeGucu = tutar(gelir) - tutar(yasam) - taksitler;
  const sureler = borclar.map((borc) => {
    if (borc.tur === "kredi") return { borc, ay: parseInt(borc.kalanTaksit, 10) || null };
    const bakiye = borcBakiyesi(borc);
    return { borc, ay: odemeGucu > 0 && bakiye > 0 ? Math.max(1, Math.ceil(bakiye / odemeGucu)) : null };
  });
  const bilinen = sureler.filter((s) => s.ay);
  if (!bilinen.length) return { borc: sureler[0].borc, ay: null };
  return bilinen.sort((a, b) => a.ay - b.ay || borcBakiyesi(a.borc) - borcBakiyesi(b.borc))[0];
}

// En yakin odeme tarihi: kartta son odeme gunu, kredide taksit gunu.
export function ilkOdeme(borclar = [], bugun = new Date()) {
  const tarihli = borclar
    .filter((borc) => (borc.tur === "kart" || borc.tur === "kredi") && parseInt(borc.gun, 10) >= 1)
    .map((borc) => ({ borc, tarih: sonrakiGunTarihi(borc.gun, bugun) }))
    .sort((a, b) => a.tarih - b.tarih);
  return tarihli[0] || null;
}

const ayAnahtari = (tarih) => `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, "0")}`;
const yerelTarih = (tarih) => `${ayAnahtari(tarih)}-${String(tarih.getDate()).padStart(2, "0")}`;

// Akistaki borcu uygulamanin mevcut kayit yapisina cevirir (yeni veri modeli
// yok). Kart ve bu ayin ekstresi birlikte olusur (hizli kart formu gibi);
// kredide kalan borc = taksit x kalan taksit (hizli kredi formu gibi).
// Odeme gunu bu ay gecmisse borc "gecikmis" gorunmesin diye siradaki odeme
// tarihi yazilir: kartta son odeme tarihi, kredide ilk (siradaki) taksit
// tarihi. Kullanici kalan taksidi zaten bu ayki odemeden sonra giriyor.
export function borcKaydi(borc, { id, simdi = new Date() }) {
  const ortak = { id, banka: borc.banka.trim(), eklendi: simdi.toISOString() };
  const gun = parseInt(borc.gun, 10);
  const siradaki = gun >= 1 ? sonrakiGunTarihi(gun, simdi) : null;
  if (borc.tur === "kart") {
    const borcTutari = tutar(borc.tutar);
    return {
      liste: "cards",
      kayit: { ...ortak, yeniDonemEkstreBorcu: borcTutari, sonOdemeGunu: gun, sonOdemeTarihi: yerelTarih(siradaki), ekstreAyi: ayAnahtari(simdi), yapilanOdeme: "0", toplamEkstreBorcu: borcTutari },
    };
  }
  if (borc.tur === "kredi") {
    const buAyGecti = siradaki && siradaki.getMonth() !== simdi.getMonth();
    return {
      liste: "loans",
      kayit: {
        ...ortak,
        taksit: tutar(borc.taksit),
        kalanTaksit: parseInt(borc.kalanTaksit, 10),
        odemeGunu: gun,
        kalanBorc: borcBakiyesi(borc),
        ...(buAyGecti ? { ilkOdemeTarihi: yerelTarih(siradaki) } : {}),
      },
    };
  }
  if (borc.tur === "kmh") return { liste: "overdrafts", kayit: { ...ortak, kullanilan: tutar(borc.tutar) } };
  return { liste: "others", kayit: { ...ortak, tutar: tutar(borc.tutar) } };
}

// Akis bitince yazilacak veri. Mevcut kayitlar korunur, yenileri eklenir.
// Metinler (gelir adi, yasam kategorisi) cagirandan gelir.
export function veriyeYaz(veri, durum, { native = false, simdi = new Date(), idUret, gelirAdi, yasamKategorisi = "Diğer" }) {
  const yeni = {
    ...veri,
    cards: [...(veri.cards || [])],
    loans: [...(veri.loans || [])],
    overdrafts: [...(veri.overdrafts || [])],
    others: [...(veri.others || [])],
    incomes: [...(veri.incomes || [])],
    expenses: [...(veri.expenses || [])],
  };
  for (const borc of durum.borcYok ? [] : durum.borclar) {
    const { liste, kayit } = borcKaydi(borc, { id: idUret(), simdi });
    yeni[liste].push(kayit);
  }
  if (gelirGecerli(durum.gelir)) {
    yeni.incomes.push({ id: idUret(), ad: gelirAdi, tutar: tutar(durum.gelir), tekrar: "Her ay", tarih: "", eklendi: simdi.toISOString() });
  }
  if (tutar(durum.yasam) > 0) {
    yeni.expenses.push({ id: idUret(), tarih: yerelTarih(simdi), kategori: yasamKategorisi, tutar: tutar(durum.yasam), kaynak: "", tekrar: "Her ay", eklendi: simdi.toISOString() });
  }
  const ad = native ? durum.ad.trim() : "";
  yeni.ayarlar = {
    ...(veri.ayarlar || {}),
    ...(ad ? { ad } : {}),
    ...(TEMALAR.includes(durum.tema) ? { tema: durum.tema } : {}),
    onboarding: {
      tamam: simdi.toISOString(),
      hedef: durum.hedefler[0] || "borc",
      hedefler: [...durum.hedefler],
      siklik: durum.siklik,
      maasGunu: durum.siklik === "aylik" || durum.siklik === "ikiKez" ? durum.maasGunu : null,
      maasHaftaGunu: durum.siklik === "haftalik" ? durum.maasHaftaGunu : null,
      atlanan: [...new Set(durum.atlanan)],
    },
  };
  return yeni;
}

// Akis kimlere acilir: akisi bitirmemis ve hic finansal kaydi olmayan hesap
// veya misafir (kayit sonrasi ilk acilis, ?yeni=1 onizlemesi dahil). Kaydi
// olan mevcut kullaniciya ve akisi bitirmis hesaba acilmaz.
export function kurulumGosterilsinMi({ veri = {} } = {}) {
  if (veri?.ayarlar?.onboarding?.tamam) return false;
  return ["cards", "loans", "overdrafts", "others", "incomes", "expenses", "assets"].every((alan) => !(veri?.[alan] || []).length);
}

// Ulke secimi (web akisi ve native SwiftUI onboarding'e giden liste): sik
// kullanilanlar ustte. Para birimi ulkeden gelir; desteklenmeyen ulkede USD.
export const SIK_ULKELER = ["TR", "GB", "DE", "FR", "ES", "IT"];

// One cikan ulke listesi: 6 sik ulke; tespit edilen bunlardan degilse basa
// gelir ve ilk 5 sik ulke eklenir. Secim yapinca liste degismez (tespit
// edilen ulkeye gore bir kez kurulur).
export function oneCikanUlkeler(tespit) {
  return SIK_ULKELER.includes(tespit) || !/^[A-Z]{2}$/.test(String(tespit || "")) ? [...SIK_ULKELER] : [tespit, ...SIK_ULKELER.slice(0, 5)];
}
export const TUM_ULKELER = [
  "TR", "US", "GB", "DE", "FR", "ES", "IT", "NL", "BE", "AT", "IE", "PT", "FI", "GR", "LU", "SK", "SI", "EE", "LV", "LT",
  "MT", "CY", "HR", "ME", "XK", "CH", "LI", "CA", "AU", "NZ", "JP", "SE", "NO", "DK", "AZ", "AE", "SA", "QA", "IL", "PL",
  "RO", "BG", "HU", "CZ", "RS", "BA", "MK", "AL", "GE", "UA", "KZ", "EG", "MA", "ZA", "BR", "MX", "AR", "IN", "SG", "KR",
];

export const bayrak = (kod) => String.fromCodePoint(...[...String(kod)].map((harf) => 0x1f1e6 + harf.charCodeAt(0) - 65));

// Onboarding sonucu: web akisinin ve native (SwiftUI) onboarding'in ortak
// cikti sekli. Native kabuk `borcamaOnboardingBitti` olayinda bunu gonderir.
// {
//   cikis: "tamam" | "giris" | "misafir",
//   dil, ulke, paraBirimi, ad, tema: "system" | "light" | "dark",
//   hedefler: ["borc"|"aySonu"|"kontrol"] (en az 1), hedef (= hedefler[0]),
//   siklik, maasGunu (1-31; aylik/ikiKez), maasHaftaGunu (1=Pzt..7=Paz; haftalik),
//   gelir (sayi), borcTurleri: ["kart"|"kredi"|"kmh"|"kisi"],
//   borclar: [{ tur, ad, tutar?, gun?, taksit?, kalanTaksit? }],
//   yasam (sayi|null), atlanan: [adim], sure_ms
// }
// Borc alanlari hizli formlarla ayni:
//   kart:  ad (banka), tutar (bu ayki borc), gun (son odeme gunu)
//   kredi: ad (banka), taksit (aylik taksit), kalanTaksit, gun (odeme gunu)
//   kmh:   ad (banka), tutar (kullanilan)
//   kisi:  ad (kime), tutar
export function durumdanSonuc(durum, { cikis = "tamam", dil = null, ulke = null, paraBirimi = null, sure_ms = 0 } = {}) {
  return {
    cikis,
    dil,
    ulke,
    paraBirimi,
    ad: durum.ad || "",
    tema: TEMALAR.includes(durum.tema) ? durum.tema : "system",
    hedef: durum.hedefler[0] || "borc",
    hedefler: [...durum.hedefler],
    siklik: durum.siklik,
    maasGunu: durum.maasGunu,
    maasHaftaGunu: durum.maasHaftaGunu,
    gelir: tutar(durum.gelir),
    borcTurleri: durum.borcYok ? [] : [...durum.turler],
    borclar: durum.borcYok
      ? []
      : durum.borclar.map((borc) => ({
          tur: borc.tur,
          ad: borc.banka,
          ...(borc.tutar !== undefined ? { tutar: tutar(borc.tutar) } : {}),
          ...(borc.gun !== undefined ? { gun: parseInt(borc.gun, 10) } : {}),
          ...(borc.taksit !== undefined ? { taksit: tutar(borc.taksit) } : {}),
          ...(borc.kalanTaksit !== undefined ? { kalanTaksit: parseInt(borc.kalanTaksit, 10) } : {}),
        })),
    yasam: tutar(durum.yasam) || null,
    atlanan: [...durum.atlanan],
    sure_ms,
  };
}

const secenek = (deger, liste, varsayilan) => (liste.includes(deger) ? deger : varsayilan);

// Sonucu (web veya native) akis durumuna cevirir; gecersiz alanlar
// varsayilana duser, eksik borc kayitlari atlanir.
export function sonuctanDurum(sonuc = {}) {
  const borclar = (Array.isArray(sonuc.borclar) ? sonuc.borclar : [])
    .map((borc) => ({
      tur: borc?.tur,
      banka: String(borc?.ad ?? "").slice(0, 60),
      tutar: borc?.tutar,
      gun: borc?.gun,
      taksit: borc?.taksit,
      kalanTaksit: borc?.kalanTaksit,
    }))
    .filter((borc) => BORC_TURLERI.includes(borc.tur) && borcGecerli(borc));
  const gun = parseInt(sonuc.maasGunu, 10);
  const haftaGunu = parseInt(sonuc.maasHaftaGunu, 10);
  const hedefler = HEDEFLER.filter((h) => (Array.isArray(sonuc.hedefler) ? sonuc.hedefler : [sonuc.hedef]).includes(h));
  return {
    ...bosDurum(),
    ad: String(sonuc.ad ?? "").trim().slice(0, 40),
    tema: secenek(sonuc.tema, TEMALAR, "system"),
    hedefler: hedefler.length ? hedefler : ["borc"],
    siklik: secenek(sonuc.siklik, SIKLIKLAR, "aylik"),
    maasGunu: gun >= 1 && gun <= 31 ? gun : 1,
    maasHaftaGunu: haftaGunu >= 1 && haftaGunu <= 7 ? haftaGunu : 1,
    gelir: tutar(sonuc.gelir) ? String(tutar(sonuc.gelir)) : "",
    turler: (Array.isArray(sonuc.borcTurleri) ? sonuc.borcTurleri : []).filter((tur) => BORC_TURLERI.includes(tur)),
    borcYok: borclar.length === 0,
    borclar,
    yasam: tutar(sonuc.yasam) || null,
    atlanan: (Array.isArray(sonuc.atlanan) ? sonuc.atlanan : []).filter((adim) => ADIMLAR.includes(adim)),
  };
}

// Web akisi ve native onboarding ayni yoldan veriye yazar.
export function onboardingSonucunuUygula(veri, sonuc, secenekler) {
  return veriyeYaz(veri, sonuctanDurum(sonuc), secenekler);
}
