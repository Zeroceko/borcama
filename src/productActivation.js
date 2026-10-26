import { t } from "./i18n.js";

const sayisalDegerVar = (kayit, alanlar) =>
  alanlar.some((alan) => Number(kayit?.[alan]) > 0);

const borcVerisiVar = (veri = {}) =>
  (veri.cards || []).some((kart) =>
    sayisalDegerVar(kart, [
      "toplamEkstreBorcu",
      "oncekiDonemBorcu",
      "donemHarcamasi",
      "borc",
      "asgari",
    ]),
  ) ||
  (veri.loans || []).some((kredi) =>
    sayisalDegerVar(kredi, ["kalanBorc", "taksit", "tutar"]),
  ) ||
  (veri.overdrafts || []).some((hesap) =>
    sayisalDegerVar(hesap, ["kullanilan", "borc", "tutar"]),
  ) ||
  (veri.others || []).some((borc) =>
    sayisalDegerVar(borc, ["kalanBorc", "borc", "tutar"]),
  );

const odemeKaydiVar = (veri = {}) => {
  const kartOdemesi = Object.values(veri.cardPaymentHistory || {}).some(
    (gecmis) => Array.isArray(gecmis) && gecmis.some((odeme) => Number(odeme?.tutar) > 0),
  );
  const krediOdemesi = Object.values(veri.loanPaymentHistory || {}).some(
    (ay) => Object.values(ay || {}).some((odeme) => Number(odeme?.tutar) > 0),
  );
  const odendiIsareti = Object.values(veri.paid || {}).some(Boolean);
  return kartOdemesi || krediOdemesi || odendiIsareti;
};

export function getActivationState(veri = {}) {
  const gorevler = [
    {
      id: "debt",
      baslik: t("ozet.aktivasyon.borcBaslik"),
      aciklama: t("ozet.aktivasyon.borcAciklama"),
      hedef: "borclar",
      tamam: borcVerisiVar(veri),
    },
    {
      id: "income",
      baslik: t("ozet.aktivasyon.gelirBaslik"),
      aciklama: t("ozet.aktivasyon.gelirAciklama"),
      hedef: "gelir",
      tamam: (veri.incomes || []).some((gelir) => Number(gelir?.tutar) > 0),
    },
    {
      id: "activity",
      baslik: t("ozet.aktivasyon.hareketBaslik"),
      aciklama: t("ozet.aktivasyon.hareketAciklama"),
      hedef: odemeKaydiVar(veri) ? "harcamalar" : "odemeler",
      tamam: odemeKaydiVar(veri) || (veri.expenses || []).length > 0,
    },
  ];
  const tamamlanan = gorevler.filter((gorev) => gorev.tamam).length;
  return {
    gorevler,
    tamamlanan,
    toplam: gorevler.length,
    tamam: tamamlanan === gorevler.length,
    siradaki: gorevler.find((gorev) => !gorev.tamam) || null,
  };
}

export function getMonthlyBalancePresentation({
  income = 0,
  mandatoryPayments = 0,
  expenses = 0,
  expenseCount = 0,
} = {}) {
  if (!(Number(income) > 0)) {
    return {
      etiket: t("ozet.denge.etiket"),
      tutar: null,
      aciklama: t("ozet.denge.gelirYok"),
    };
  }
  if (!(Number(expenseCount) > 0)) {
    return {
      etiket: t("ozet.denge.veriEksikEtiket"),
      tutar: null,
      aciklama: t("ozet.denge.veriEksikAciklama"),
    };
  }
  return {
    etiket: t("ozet.denge.farkEtiket"),
    tutar: Number(income) - Number(mandatoryPayments) - Number(expenses),
    aciklama: t("ozet.denge.farkAciklama"),
  };
}
