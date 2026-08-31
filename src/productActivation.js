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
      baslik: "Borç veya ekstre ekle",
      aciklama: "Toplam borcun ve ödeme tarihlerin oluşsun.",
      hedef: "borclar",
      tamam: borcVerisiVar(veri),
    },
    {
      id: "income",
      baslik: "Aylık gelirini yaz",
      aciklama: "Ödeme gücünü doğru hesaplayabilelim.",
      hedef: "gelir",
      tamam: (veri.incomes || []).some((gelir) => Number(gelir?.tutar) > 0),
    },
    {
      id: "activity",
      baslik: "İlk hareketini kaydet",
      aciklama: "Bir ödeme veya harcama planını kişiselleştirir.",
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
      etiket: "Aylık denge",
      tutar: null,
      aciklama: "Gelir bilgisi eklenince hesaplanır.",
    };
  }
  if (!(Number(expenseCount) > 0)) {
    return {
      etiket: "Aylık denge için veri eksik",
      tutar: null,
      aciklama: "En az bir harcama ekleyince kalan tutarı gösterebiliriz.",
    };
  }
  return {
    etiket: "Ödemeler ve kayıtlı harcamalardan sonra",
    tutar: Number(income) - Number(mandatoryPayments) - Number(expenses),
    aciklama: "Yalnızca kaydettiğin bu ayki hareketlere göre.",
  };
}
