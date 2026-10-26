import { t } from "./i18n.js";

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
      hata: t("borclar.krediGiris.birlikteGir"),
    };
  }

  const toplamTaksit = tamSayi(kredi.toplamTaksit);
  const odenenTaksit = tamSayi(kredi.odenenTaksit);
  if (toplamTaksit < 1) {
    return {
      girisYapildi: true,
      gecerli: false,
      hata: t("borclar.krediGiris.toplamEnAz1"),
    };
  }
  if (odenenTaksit > toplamTaksit) {
    return {
      girisYapildi: true,
      gecerli: false,
      hata: t("borclar.krediGiris.odenenBuyuk"),
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
      return { tamam: false, hata: t("borclar.krediGiris.taksitGir"), kredi: null };
    }
    if (ilerleme.kalanTaksit < 1) {
      return {
        tamam: false,
        hata: t("borclar.krediGiris.tumuOdenmis"),
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
    return { tamam: false, hata: t("borclar.krediGiris.kalanTaksitGir"), kredi: null };
  }
  if (pozitifSayi(kredi.kalanBorc) <= 0) {
    return { tamam: false, hata: t("borclar.krediGiris.kalanToplamGir"), kredi: null };
  }
  return { tamam: true, hata: "", kredi: { ...kredi } };
}
