import { t } from "./i18n.js";

// Bugün ekranının en üstündeki tek "Bugün yapman gereken" kartı.
// Saf seçim mantığı: ilk eşleşen kazanır.
//   1) Gecikmiş ödeme  2) 7 gün içinde ödeme  3) Eksik kurulum adımı
//   4) Para ayı çıkarmıyor (tasarruf önerisi)  5) Para artıyor  6) Yapılacak yok
// Dönen nesne: { tur, metin, aksiyon: { etiket, hedef, gorev? } | null, ... }.
// hedef: Bugün'ün setSekme'sine giden sekme adı ya da "aktivasyon" (görev ile).

export const HAFTADA_GUN = 7;
export const AYDA_HAFTA = 4.3;
export const YAKLASAN_GUN_SINIRI = 7;

const sayi = (deger) => {
  const n = Number(deger);
  return Number.isFinite(n) ? n : 0;
};

// Aylık eksiği haftalık ve yuvarlak bir tutara çevirir; yukarı yuvarlar ki
// önerilen kısıntı eksiği gerçekten kapatsın.
export function haftalikTasarruf(aylikEksik) {
  const haftalik = sayi(aylikEksik) / AYDA_HAFTA;
  if (!(haftalik > 0)) return 0;
  const adim = haftalik >= 2000 ? 100 : haftalik >= 200 ? 50 : 10;
  return Math.max(Math.ceil(haftalik / adim) * adim, adim);
}

// En pahalı (her ay faiz işleyen) borca fazla parayı yatırınca aylık
// kurtulunan yaklaşık faiz: yatırılan tutar bakiyeyi aşamaz.
export function kurtulunanFaiz({ artan, borc }) {
  const oran = sayi(borc?.faiz) / 100;
  const bakiye = Math.max(sayi(borc?.bakiye), 0);
  if (!(oran > 0) || !(bakiye > 0) || !(sayi(artan) > 0)) return 0;
  return Math.min(sayi(artan), bakiye) * oran;
}

function odemeSec(odemeler) {
  const acik = (odemeler || []).filter(
    (o) => o && !o.odendi && sayi(o.tutar) > 0.01 && Number.isFinite(o.gun),
  );
  // Ödeme gününden sonra eklenen borç için "gecikti" denmez (rehberle aynı kural).
  const gecikmis = acik
    .filter((o) => o.gun < 0 && !(Number.isFinite(o.eklendiGun) && o.eklendiGun >= o.gun))
    .sort((a, b) => a.gun - b.gun);
  const yaklasan = acik
    .filter((o) => o.gun >= 0 && o.gun <= YAKLASAN_GUN_SINIRI)
    .sort((a, b) => a.gun - b.gun);
  return { gecikmis: gecikmis[0] || null, yaklasan: yaklasan[0] || null };
}

export function bugunAksiyonunuSec({
  odemeler = [],
  aktivasyon = null,
  kurulumSonrasi = false,
  aylikEksik = 0,
  azaltimYetmez = false,
  yasamHarcamasi = null,
  enCokKategori = null,
  artan = 0,
  enPahaliBorc = null,
  borcAdiGoster = true,
  tutarYaz = (n) => String(Math.round(sayi(n))),
} = {}) {
  const { gecikmis, yaklasan } = odemeSec(odemeler);
  const ad = (o) => o.ad || t("ozet.rehber.odemenVarsayilan");

  if (gecikmis) {
    const n = -gecikmis.gun;
    return {
      tur: "gecikme",
      ton: "acil",
      odeme: gecikmis,
      metin: t(n === 1 ? "ozet.bugunAksiyon.gecikmeTekil" : "ozet.bugunAksiyon.gecikmeCogul", { ad: ad(gecikmis), n }),
      aksiyon: { etiket: t("ozet.bugunAksiyon.odemeyeGit"), hedef: "odemeler" },
    };
  }

  if (yaklasan) {
    const tutar = tutarYaz(yaklasan.tutar, yaklasan.paraBirimi);
    const anahtar = yaklasan.gun === 0
      ? "ozet.bugunAksiyon.yaklasanBugun"
      : yaklasan.gun === 1
        ? "ozet.bugunAksiyon.yaklasanTekil"
        : "ozet.bugunAksiyon.yaklasanCogul";
    return {
      tur: "yaklasan",
      ton: yaklasan.gun === 0 ? "acil" : "normal",
      odeme: yaklasan,
      metin: t(anahtar, { ad: ad(yaklasan), tutar, n: yaklasan.gun }),
      aksiyon: { etiket: t("ozet.bugunAksiyon.odemeyiGor"), hedef: "odemeler" },
    };
  }

  const siradaki = aktivasyon && !aktivasyon.tamam ? aktivasyon.siradaki : null;
  if (siradaki) {
    const metinler = {
      debt: ["ozet.bugunAksiyon.kurulumBorc", "ozet.bugunAksiyon.borcEkle"],
      income: ["ozet.bugunAksiyon.kurulumGelir", "ozet.bugunAksiyon.gelirYaz"],
      activity: ["ozet.bugunAksiyon.kurulumHareket", "ozet.aktivasyon.harcamaEkle"],
    }[siradaki.id] || ["ozet.bugunAksiyon.kurulumHareket", "ortak.devamEt"];
    return {
      tur: "kurulum",
      ton: "normal",
      gorev: siradaki,
      // Kurulumu bitirmeyen kullanıcıya kaçıncı adımda olduğu gösterilir.
      adim: kurulumSonrasi ? null : { aktif: Math.min(aktivasyon.tamamlanan + 1, aktivasyon.toplam), toplam: aktivasyon.toplam },
      metin: t(metinler[0]),
      aksiyon: { etiket: t(metinler[1]), hedef: "aktivasyon", gorev: siradaki },
      ikincil: siradaki.id === "activity"
        ? { etiket: t("ozet.aktivasyon.odemeGir"), hedef: "aktivasyon", gorev: { id: "payment" } }
        : null,
    };
  }

  const eksik = sayi(aylikEksik);
  if (eksik > 1) {
    const tutar = tutarYaz(eksik);
    const yasam = yasamHarcamasi === null || yasamHarcamasi === undefined ? null : sayi(yasamHarcamasi);
    const yetmez = Boolean(azaltimYetmez) || (yasam !== null && eksik >= yasam);
    if (yetmez) {
      return {
        tur: "eksik",
        ton: "acil",
        azaltimYetmez: true,
        metin: `${t("ozet.bugunAksiyon.eksik", { tutar })} ${t("ozet.bugunAksiyon.azaltimYetmez")}`,
        aksiyon: { etiket: t("ozet.borcPlaninaGec"), hedef: "plan" },
      };
    }
    const haftalik = haftalikTasarruf(eksik);
    const parcalar = [
      t("ozet.bugunAksiyon.eksik", { tutar }),
      t("ozet.bugunAksiyon.haftalik", { haftalik: tutarYaz(haftalik) }),
    ];
    if (enCokKategori) parcalar.push(t("ozet.bugunAksiyon.enCokKategori", { kategori: enCokKategori }));
    return {
      tur: "eksik",
      ton: "acil",
      azaltimYetmez: false,
      haftalik,
      metin: parcalar.join(" "),
      aksiyon: { etiket: t("ozet.bugunAksiyon.harcamalarinaBak"), hedef: "harcamalar" },
    };
  }

  const fazla = sayi(artan);
  if (fazla >= 1) {
    const tutar = tutarYaz(fazla);
    const faiz = kurtulunanFaiz({ artan: fazla, borc: enPahaliBorc });
    if (faiz >= 1 && borcAdiGoster && enPahaliBorc?.ad) {
      return {
        tur: "artan",
        ton: "olumlu",
        faiz,
        metin: t("ozet.bugunAksiyon.artanBorca", { tutar, borc: enPahaliBorc.ad, faiz: tutarYaz(faiz) }),
        aksiyon: { etiket: t("ozet.borcPlaninaGec"), hedef: "plan" },
      };
    }
    if (faiz >= 1) {
      return {
        tur: "artan",
        ton: "olumlu",
        faiz,
        metin: t("ozet.bugunAksiyon.artanFaizli", { tutar }),
        aksiyon: { etiket: t("ozet.bugunAksiyon.borclariniGor"), hedef: "borclar" },
      };
    }
    return {
      tur: "artan",
      ton: "olumlu",
      faiz: 0,
      metin: t("ozet.bugunAksiyon.artanKenara", { tutar }),
      aksiyon: { etiket: t("ozet.bugunAksiyon.birikimeEkle"), hedef: "varliklar" },
    };
  }

  return {
    tur: "yok",
    ton: "olumlu",
    metin: t("ozet.bugunAksiyon.yok"),
    aksiyon: { etiket: t("ozet.aktivasyon.harcamaEkle"), hedef: "aktivasyon", gorev: { id: "activity" } },
  };
}
