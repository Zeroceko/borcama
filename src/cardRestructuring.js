const number = (value) => Math.max(Number(value) || 0, 0);

export function cardRestructuredAmount(card = {}) {
  return (Array.isArray(card.yapilandirmaKayitlari) ? card.yapilandirmaKayitlari : [])
    .reduce((total, item) => total + number(item?.tutar), 0);
}

export function cardOutstandingBeforeRestructuring(card = {}) {
  const newModel = card.yeniDonemEkstreBorcu !== undefined
    || card.toplamEkstreBorcu !== undefined
    || card.oncekiDonemBorcu !== undefined
    || card.yapilanOdeme !== undefined;
  if (!newModel) {
    const statement = number(card.donemIciToplam) || number(card.borc);
    return statement + number(card.donemIciEklenen);
  }
  const carried = number(card.oncekiAydanKalan);
  const current = card.yeniDonemEkstreBorcu !== undefined
    ? number(card.yeniDonemEkstreBorcu)
    : Math.max(number(card.toplamEkstreBorcu) || number(card.oncekiDonemBorcu) - carried, 0);
  const statement = number(card.belgedenToplamEkstreBorcu)
    || (card.yeniDonemEkstreBorcu !== undefined
      ? current + carried
      : number(card.toplamEkstreBorcu) || number(card.oncekiDonemBorcu));
  return Math.max(statement - Math.min(number(card.yapilanOdeme), statement), 0);
}

export function cardRestructurableBalance(card = {}) {
  return Math.max(cardOutstandingBeforeRestructuring(card) - cardRestructuredAmount(card), 0);
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
}

export function applyCardRestructuring(data = {}, input = {}) {
  const cardId = String(input.cardId || "");
  const card = (data.cards || []).find((item) => item.id === cardId);
  const amount = number(input.amount);
  const installment = number(input.installment);
  const installmentCount = Math.floor(number(input.installmentCount));
  const totalRepaymentInput = input.totalRepayment === "" || input.totalRepayment == null ? null : number(input.totalRepayment);
  if (!card) return { error: "CARD_NOT_FOUND" };
  if (amount <= 0 || amount - cardRestructurableBalance(card) > 0.01) return { error: "INVALID_AMOUNT" };
  if (installment <= 0 || installmentCount < 1 || installmentCount > 120) return { error: "INVALID_INSTALLMENT" };
  if (!validDate(input.firstPaymentDate)) return { error: "INVALID_FIRST_PAYMENT_DATE" };
  const impliedTotal = installment * installmentCount;
  const totalRepayment = totalRepaymentInput == null ? impliedTotal : totalRepaymentInput;
  if (totalRepayment < amount || totalRepayment + 0.01 < installment) return { error: "INVALID_TOTAL_REPAYMENT" };

  const restructuringId = String(input.restructuringId || `yapilandirma-${Date.now()}`);
  const loanId = String(input.loanId || `kredi-yapilandirma-${Date.now()}`);
  const monthlyInterest = input.monthlyInterest === "" || input.monthlyInterest == null ? null : number(input.monthlyInterest);
  const kkdfRate = input.kkdfRate === "" || input.kkdfRate == null ? null : number(input.kkdfRate);
  const bsmvRate = input.bsmvRate === "" || input.bsmvRate == null ? null : number(input.bsmvRate);
  const metadata = {
    kaynak: "card_restructuring",
    kaynakKartId: card.id,
    yapilandirmaId: restructuringId,
    yapilandirilanTutar: amount,
    toplamGeriOdeme: totalRepayment,
    ilkOdemeTarihi: input.firstPaymentDate,
    bankaPlaniEsas: true,
    ...(monthlyInterest == null ? {} : { aylikNominalFaiz: monthlyInterest }),
    ...(kkdfRate == null ? {} : { kkdfOrani: kkdfRate }),
    ...(bsmvRate == null ? {} : { bsmvOrani: bsmvRate }),
  };
  const updatedCard = {
    ...card,
    yapilandirmaKayitlari: [
      ...(Array.isArray(card.yapilandirmaKayitlari) ? card.yapilandirmaKayitlari : []),
      { id: restructuringId, tutar: amount, krediId: loanId, olusturulmaTarihi: input.createdAt || new Date().toISOString(), ...metadata },
    ],
  };
  const firstPayment = new Date(`${input.firstPaymentDate}T12:00:00`);
  const loan = {
    id: loanId,
    banka: String(card.banka || "Banka"),
    ad: "Kredi kartı yapılandırması",
    kalanBorc: totalRepayment,
    taksit: installment,
    kalanTaksit: installmentCount,
    odemeGunu: firstPayment.getDate(),
    ilkOdemeTarihi: input.firstPaymentDate,
    ...metadata,
  };
  return {
    data: {
      ...data,
      cards: (data.cards || []).map((item) => item.id === cardId ? updatedCard : item),
      loans: [...(data.loans || []), loan],
    },
    cardBefore: card,
    loan,
  };
}
