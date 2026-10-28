// Aylik yasam butcesi (ayarlar.yasamButcesi = { tutar, kaynak }) ve
// kurulum, Bugun, Plan ve Pro karti arasinda tek plan tutari
// (docs/web-akis-direktifi.md B5/A3).
//
// Kurulum yasam giderini sormaz; gelirin %45'ini varsayar
// (onboardingAdimlari.js > yasamVarsayilan) ve bunu kaynak "varsayim" olarak
// yazar. Kullanici Plan ekraninda degistirince kaynak "kullanici" olur.
// Senaryo (financialScenario.js) bu tutari, harcama kaydi yokken ya da
// kullanici kendisi girdiyse yasam butcesi olarak kullanir.

export const YASAM_KAYNAKLARI = ["varsayim", "kullanici"];

export function yasamButcesiKaydi(tutar, kaynak = "kullanici") {
  const sayi = Number(tutar);
  return {
    tutar: Number.isFinite(sayi) ? Math.max(Math.round(sayi), 0) : 0,
    kaynak: YASAM_KAYNAKLARI.includes(kaynak) ? kaynak : "kullanici",
  };
}

// Kayitli butce tutari; yoksa ya da gecersizse null.
export function yasamButcesiTutari(ayarlar) {
  const kayit = ayarlar?.yasamButcesi;
  if (!kayit || typeof kayit !== "object") return null;
  const sayi = Number(kayit.tutar);
  return Number.isFinite(sayi) && sayi >= 0 ? sayi : null;
}

// Senaryoya gecilecek livingBudgetOverride: kullanici girdiyse her zaman;
// kurulum varsayimiysa yalniz hic harcama kaydi yokken (kayitlar gelince
// gercek harcama tahmini kullanilir). Aksi halde null (override yok).
export function senaryoYasamButcesi({ ayarlar, expenses = [] } = {}) {
  const tutar = yasamButcesiTutari(ayarlar);
  if (tutar === null) return null;
  if (ayarlar.yasamButcesi.kaynak === "kullanici") return tutar;
  return (expenses || []).length ? null : tutar;
}

const sayi = (deger) => (Number.isFinite(Number(deger)) ? Number(deger) : 0);

// Ilk ay kart ve KMH'ye giden tutar: kredi taksitleri ve yasam butcesinden
// sonra kalan, en fazla bu borclarin bakiyesi kadar (borctan fazlasi
// odenmez). Kurulumun plan kartiyla ayni kural (planOdemeleri).
export function ilkAyKartKmhOdemesi(senaryo = {}) {
  return Math.min(Math.max(sayi(senaryo.initialDebtBudget), 0), Math.max(sayi(senaryo.initialDebt), 0));
}

// Her maasta odemelere giden tutar: bu ayki kredi taksitleri + kart/KMH.
export function aylikPlanOdemesi(senaryo = {}) {
  return Math.max(sayi(senaryo.fixedMonthly), 0) + ilkAyKartKmhOdemesi(senaryo);
}
