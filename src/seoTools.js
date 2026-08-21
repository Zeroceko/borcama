const SAYI_UST_SINIR = 1_000_000_000;

function pozitifSayi(deger, varsayilan = 0) {
  const sayi = Number(deger);
  if (!Number.isFinite(sayi)) return varsayilan;
  return Math.min(Math.max(sayi, 0), SAYI_UST_SINIR);
}

export function krediKartiAsgariOrani(kartLimiti) {
  return pozitifSayi(kartLimiti) <= 50_000 ? 0.2 : 0.4;
}

export function krediKartiAsgariOdemeHesapla({ donemBorcu, kartLimiti }) {
  const borc = pozitifSayi(donemBorcu);
  const oran = krediKartiAsgariOrani(kartLimiti);
  return {
    oran,
    tahminiAsgari: Math.min(borc, borc * oran),
    odemeSonrasiKalan: Math.max(0, borc - borc * oran),
  };
}

export function borcKapatmaHesapla({ borc, aylikFaiz, aylikOdeme, azamiAy = 600 }) {
  const anaPara = pozitifSayi(borc);
  const faiz = pozitifSayi(aylikFaiz) / 100;
  const odeme = pozitifSayi(aylikOdeme);
  if (!anaPara || !odeme) {
    return { tamamlandi: false, neden: "eksik", ay: 0, toplamFaiz: 0, toplamOdeme: 0, takvim: [] };
  }
  if (odeme <= anaPara * faiz) {
    return { tamamlandi: false, neden: "yetersiz-odeme", ay: 0, toplamFaiz: 0, toplamOdeme: 0, takvim: [] };
  }

  let kalan = anaPara;
  let toplamFaiz = 0;
  let toplamOdeme = 0;
  const takvim = [];
  for (let ay = 1; ay <= azamiAy && kalan > 0.005; ay += 1) {
    const ayFaizi = kalan * faiz;
    const buAyOdeme = Math.min(kalan + ayFaizi, odeme);
    kalan = Math.max(0, kalan + ayFaizi - buAyOdeme);
    toplamFaiz += ayFaizi;
    toplamOdeme += buAyOdeme;
    if (ay <= 24 || kalan === 0) takvim.push({ ay, odeme: buAyOdeme, faiz: ayFaizi, kalan });
    if (kalan === 0) {
      return { tamamlandi: true, ay, toplamFaiz, toplamOdeme, takvim };
    }
  }
  return { tamamlandi: false, neden: "cok-uzun", ay: azamiAy, toplamFaiz, toplamOdeme, takvim };
}

export function borcPlaniHesapla({ borclar, aylikButce, strateji = "faiz" }) {
  const kalemler = (borclar || [])
    .map((borc, index) => ({
      id: borc.id || String(index),
      ad: String(borc.ad || `Borç ${index + 1}`),
      kalan: pozitifSayi(borc.kalan),
      faiz: pozitifSayi(borc.faiz) / 100,
      asgari: pozitifSayi(borc.asgari),
    }))
    .filter((borc) => borc.kalan > 0);
  const butce = pozitifSayi(aylikButce);
  const gerekliAsgari = kalemler.reduce((toplam, borc) => toplam + Math.min(borc.kalan, borc.asgari), 0);
  if (!kalemler.length || !butce) return { tamamlandi: false, neden: "eksik", ay: 0, toplamFaiz: 0, takvim: [] };
  if (butce + 0.01 < gerekliAsgari) {
    return { tamamlandi: false, neden: "butce-asgariden-dusuk", gerekliAsgari, ay: 0, toplamFaiz: 0, takvim: [] };
  }

  let toplamFaiz = 0;
  const takvim = [];
  for (let ay = 1; ay <= 600; ay += 1) {
    let kullanilabilir = butce;
    let ayFaizi = 0;
    kalemler.forEach((borc) => {
      if (borc.kalan <= 0) return;
      const faizTutari = borc.kalan * borc.faiz;
      borc.kalan += faizTutari;
      ayFaizi += faizTutari;
    });
    toplamFaiz += ayFaizi;

    kalemler.forEach((borc) => {
      if (borc.kalan <= 0 || kullanilabilir <= 0) return;
      const odeme = Math.min(borc.kalan, borc.asgari, kullanilabilir);
      borc.kalan -= odeme;
      kullanilabilir -= odeme;
    });

    const sirali = kalemler
      .filter((borc) => borc.kalan > 0)
      .sort((a, b) => (strateji === "kar" ? a.kalan - b.kalan : b.faiz - a.faiz));
    for (const borc of sirali) {
      if (kullanilabilir <= 0) break;
      const odeme = Math.min(borc.kalan, kullanilabilir);
      borc.kalan -= odeme;
      kullanilabilir -= odeme;
    }

    const kalanToplam = kalemler.reduce((toplam, borc) => toplam + Math.max(0, borc.kalan), 0);
    if (ay <= 24 || kalanToplam <= 0.005) takvim.push({ ay, faiz: ayFaizi, kalan: kalanToplam });
    if (kalanToplam <= 0.005) {
      return { tamamlandi: true, ay, toplamFaiz, takvim, gerekliAsgari };
    }
  }
  return { tamamlandi: false, neden: "cok-uzun", ay: 600, toplamFaiz, takvim, gerekliAsgari };
}

export function mevduatFaiziHesapla({ anaPara, yillikFaiz, vadeGunu, stopaj = 0 }) {
  const tutar = pozitifSayi(anaPara);
  const oran = pozitifSayi(yillikFaiz) / 100;
  const gun = Math.min(Math.floor(pozitifSayi(vadeGunu)), 3_650);
  const stopajOrani = Math.min(pozitifSayi(stopaj), 100) / 100;
  if (!tutar || !oran || !gun) {
    return { hesaplandi: false, brutFaiz: 0, stopajTutari: 0, netFaiz: 0, vadeSonuTutar: tutar };
  }
  const brutFaiz = tutar * oran * gun / 365;
  const stopajTutari = brutFaiz * stopajOrani;
  const netFaiz = brutFaiz - stopajTutari;
  return { hesaplandi: true, brutFaiz, stopajTutari, netFaiz, vadeSonuTutar: tutar + netFaiz };
}

export function krediOdemePlaniHesapla({ krediTutari, aylikFaiz, vadeAy }) {
  const anaPara = pozitifSayi(krediTutari);
  const oran = pozitifSayi(aylikFaiz) / 100;
  const vade = Math.min(Math.floor(pozitifSayi(vadeAy)), 600);
  if (!anaPara || !vade) {
    return { hesaplandi: false, aylikTaksit: 0, toplamFaiz: 0, toplamOdeme: 0, takvim: [] };
  }
  const aylikTaksit = oran === 0
    ? anaPara / vade
    : anaPara * oran * ((1 + oran) ** vade) / (((1 + oran) ** vade) - 1);
  let kalan = anaPara;
  let toplamFaiz = 0;
  let toplamOdeme = 0;
  const takvim = [];
  for (let ay = 1; ay <= vade; ay += 1) {
    const faiz = kalan * oran;
    const odeme = ay === vade ? kalan + faiz : Math.min(kalan + faiz, aylikTaksit);
    const anaParaOdemesi = Math.max(0, odeme - faiz);
    kalan = Math.max(0, kalan - anaParaOdemesi);
    toplamFaiz += faiz;
    toplamOdeme += odeme;
    takvim.push({ ay, odeme, faiz, anaPara: anaParaOdemesi, kalan });
  }
  return { hesaplandi: true, aylikTaksit, toplamFaiz, toplamOdeme, takvim };
}
