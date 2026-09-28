const degerVar = (value) => value !== "" && value !== null && value !== undefined;

const pozitifSayi = (value) => Math.max(Number(value) || 0, 0);

const tamSayi = (value) => Math.floor(pozitifSayi(value));

const paraYuvarla = (value) => Math.round((pozitifSayi(value) + Number.EPSILON) * 100) / 100;

export function krediTaksitIlerlemesi(kredi = {}) {
  const toplamVar = degerVar(kredi.toplamTaksit);
  const odenenVar = degerVar(kredi.odenenTaksit);
  const girisYapildi = toplamVar || odenenVar;

  if (!girisYapildi) {
    return { girisYapildi: false, gecerli: false, hata: "" };
  }
  if (!toplamVar || !odenenVar) {
    return {
      girisYapildi: true,
      gecerli: false,
      hata: "Toplam ve ödenen taksit sayısını birlikte gir.",
    };
  }

  const toplamTaksit = tamSayi(kredi.toplamTaksit);
  const odenenTaksit = tamSayi(kredi.odenenTaksit);
  if (toplamTaksit < 1) {
    return {
      girisYapildi: true,
      gecerli: false,
      hata: "Toplam taksit sayısı en az 1 olmalı.",
    };
  }
  if (odenenTaksit > toplamTaksit) {
    return {
      girisYapildi: true,
      gecerli: false,
      hata: "Ödenen taksit sayısı toplam taksit sayısından büyük olamaz.",
    };
  }

  const kalanTaksit = toplamTaksit - odenenTaksit;
  const aylikTaksit = pozitifSayi(kredi.taksit);
  return {
    girisYapildi: true,
    gecerli: true,
    hata: "",
    toplamTaksit,
    odenenTaksit,
    kalanTaksit,
    kalanToplamOdeme: paraYuvarla(aylikTaksit * kalanTaksit),
  };
}

export function krediKaydiniHazirla(kredi = {}) {
  const ilerleme = krediTaksitIlerlemesi(kredi);
  if (ilerleme.girisYapildi && !ilerleme.gecerli) {
    return { tamam: false, hata: ilerleme.hata, kredi: null };
  }

  if (ilerleme.gecerli) {
    if (pozitifSayi(kredi.taksit) <= 0) {
      return { tamam: false, hata: "Bankanın aylık taksit tutarını gir.", kredi: null };
    }
    if (ilerleme.kalanTaksit < 1) {
      return {
        tamam: false,
        hata: "Tüm taksitleri ödenmiş kredi aktif borç olarak eklenemez.",
        kredi: null,
      };
    }
    return {
      tamam: true,
      hata: "",
      kredi: {
        ...kredi,
        toplamTaksit: ilerleme.toplamTaksit,
        odenenTaksit: ilerleme.odenenTaksit,
        kalanTaksit: ilerleme.kalanTaksit,
        kalanBorc: ilerleme.kalanToplamOdeme,
      },
    };
  }

  if (tamSayi(kredi.kalanTaksit) < 1) {
    return { tamam: false, hata: "Kalan taksit sayısını gir.", kredi: null };
  }
  if (pozitifSayi(kredi.kalanBorc) <= 0) {
    return { tamam: false, hata: "Kalan toplam ödeme tutarını gir.", kredi: null };
  }
  return { tamam: true, hata: "", kredi: { ...kredi } };
}
