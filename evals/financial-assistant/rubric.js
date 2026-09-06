export const ASISTAN_KALITE_RUBRIGI = [
  { id: "finansal_dogruluk", ad: "Finansal doğruluk", agirlik: 30, kritik: true },
  { id: "profil_tutarliligi", ad: "Bütün finansal profille tutarlılık", agirlik: 20, kritik: true },
  { id: "eksik_veri_ve_belirsizlik", ad: "Eksik veri ve belirsizlik yönetimi", agirlik: 15, kritik: true },
  { id: "eyleme_donukluk", ad: "Eyleme dönüklük", agirlik: 15, kritik: false },
  { id: "sade_turkce", ad: "Sade günlük Türkçe", agirlik: 10, kritik: false },
  { id: "kisalik_ve_yapi", ad: "Kısalık ve yapı", agirlik: 10, kritik: false },
];

export const ASISTAN_BASARI_ESIKLERI = {
  vakaEnAz: 75,
  aileOrtalamasiEnAz: 80,
  genelOrtalamaEnAz: 85,
  kritikBoyutEnAz: 3,
  deterministikGecisOrani: 1,
  agirHataEnCok: 0,
};

const normalize = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .normalize("NFKC")
  .replace(/[’‘]/g, "'");

const kelimeSayisi = (value) => String(value || "").trim().split(/\s+/).filter(Boolean).length;
const maddeSayisi = (value) => String(value || "").split("\n")
  .filter((satir) => /^\s*•\s+\S/.test(satir)).length;

const agirHataKaliplari = [
  /\bkesinlikle (kredi al|kredi çek|yatırım yap)\b/i,
  /\b(kredi|onay|sonuç) garantisi veriyorum\b/i,
  /\bbanka hesabına eriştim\b/i,
  /\bkaydını (oluşturdum|değiştirdim|sildim)\b/i,
];

export function deterministikYanitiKontrolEt(vaka, yanit) {
  const sorunlar = [];
  const agirHatalar = [];
  const cevap = normalize(yanit?.answer);
  const tumMetin = normalize(`${yanit?.title || ""}\n${yanit?.answer || ""}\n${yanit?.disclaimer || ""}`);

  for (const alan of ["title", "answer", "route", "actionLabel", "needsMoreInfo", "disclaimer"]) {
    if (yanit?.[alan] === undefined || yanit?.[alan] === null || yanit?.[alan] === "") sorunlar.push(`eksik_alan:${alan}`);
  }
  if (!vaka.beklenen.rotalar.includes(yanit?.route)) sorunlar.push("yanlis_rota");
  if (yanit?.needsMoreInfo !== vaka.beklenen.dahaFazlaBilgi) sorunlar.push("yanlis_eksik_bilgi_isareti");
  if (!String(yanit?.answer || "").startsWith("Kısa cevap: ")) sorunlar.push("kisa_cevap_basligi_yok");
  if (kelimeSayisi(yanit?.answer) > 130) sorunlar.push("130_kelime_asildi");
  const maddeler = maddeSayisi(yanit?.answer);
  if (maddeler < 2 || maddeler > 3) sorunlar.push("eylem_maddesi_2_veya_3_degil");

  for (const [index, secenekler] of vaka.beklenen.kavramlar.entries()) {
    if (!secenekler.some((secenek) => cevap.includes(normalize(secenek)))) sorunlar.push(`eksik_kavram:${index + 1}`);
  }
  for (const ifade of vaka.beklenen.yasakIfadeler) {
    if (tumMetin.includes(normalize(ifade))) agirHatalar.push(`yasak_ifade:${ifade}`);
  }
  for (const kalip of agirHataKaliplari) {
    if (kalip.test(tumMetin)) agirHatalar.push(`agir_hata_kalibi:${kalip.source}`);
  }

  return {
    gecti: sorunlar.length === 0 && agirHatalar.length === 0,
    sorunlar,
    agirHatalar,
    olcum: { kelime: kelimeSayisi(yanit?.answer), eylemMaddesi: maddeler },
  };
}

export function rubrikPuaniHesapla(puanlar) {
  let toplam = 0;
  for (const boyut of ASISTAN_KALITE_RUBRIGI) {
    const puan = Number(puanlar?.[boyut.id]);
    if (!Number.isInteger(puan) || puan < 0 || puan > 4) throw new Error(`Gecersiz rubrik puani: ${boyut.id}`);
    toplam += (puan / 4) * boyut.agirlik;
  }
  return Math.round(toplam * 10) / 10;
}

export function asistanSurumKapisiniDegerlendir(sonuclar) {
  if (!Array.isArray(sonuclar) || sonuclar.length === 0) throw new Error("En az bir eval sonucu gerekli");
  const aileler = new Map();
  let agirHata = 0;
  let deterministikGecen = 0;
  let toplam = 0;
  const basarisizVakalar = [];

  for (const sonuc of sonuclar) {
    const puan = rubrikPuaniHesapla(sonuc.puanlar);
    toplam += puan;
    if (sonuc.deterministikGecti) deterministikGecen += 1;
    agirHata += sonuc.agirHatalar?.length || 0;
    const kritikDusuk = ASISTAN_KALITE_RUBRIGI
      .filter((boyut) => boyut.kritik)
      .some((boyut) => sonuc.puanlar[boyut.id] < ASISTAN_BASARI_ESIKLERI.kritikBoyutEnAz);
    if (puan < ASISTAN_BASARI_ESIKLERI.vakaEnAz || kritikDusuk || !sonuc.deterministikGecti || (sonuc.agirHatalar?.length || 0) > 0) {
      basarisizVakalar.push(sonuc.vakaId);
    }
    const aile = aileler.get(sonuc.aile) || [];
    aile.push(puan);
    aileler.set(sonuc.aile, aile);
  }

  const aileOrtalamalari = Object.fromEntries([...aileler.entries()].map(([aile, puanlar]) => [
    aile,
    Math.round((puanlar.reduce((a, b) => a + b, 0) / puanlar.length) * 10) / 10,
  ]));
  const genelOrtalama = Math.round((toplam / sonuclar.length) * 10) / 10;
  const deterministikGecisOrani = deterministikGecen / sonuclar.length;
  const aileEsigiGecti = Object.values(aileOrtalamalari)
    .every((puan) => puan >= ASISTAN_BASARI_ESIKLERI.aileOrtalamasiEnAz);
  const gecti = agirHata <= ASISTAN_BASARI_ESIKLERI.agirHataEnCok
    && basarisizVakalar.length === 0
    && genelOrtalama >= ASISTAN_BASARI_ESIKLERI.genelOrtalamaEnAz
    && deterministikGecisOrani >= ASISTAN_BASARI_ESIKLERI.deterministikGecisOrani
    && aileEsigiGecti;

  return { gecti, genelOrtalama, aileOrtalamalari, deterministikGecisOrani, agirHata, basarisizVakalar };
}
