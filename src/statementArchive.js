const STATEMENT_FIELDS = [
  "ekstreAyi", "yeniDonemEkstreBorcu", "toplamEkstreBorcu",
  "oncekiDonemBorcu", "oncekiAydanKalan", "yapilanOdeme", "asgari",
  "belgedenToplamEkstreBorcu", "ekstreBelgeOzeti", "hesapKesimTarihi",
  "sonOdemeTarihi", "kesimGunu", "sonOdemeGunu", "arsivlenmeTarihi",
];

const hasStatement = (record) =>
  !!record?.ekstreAyi &&
  (record.toplamEkstreBorcu !== undefined ||
    record.oncekiDonemBorcu !== undefined ||
    record.yeniDonemEkstreBorcu !== undefined || record.ekstreBelgeOzeti);

function statementFromCard(card) {
  return Object.fromEntries(STATEMENT_FIELDS
    .filter((field) => card[field] !== undefined)
    .map((field) => [field, card[field]]));
}

function clearCurrentStatement(card) {
  const clean = { ...card };
  STATEMENT_FIELDS.forEach((field) => delete clean[field]);
  return clean;
}

const paymentKey = (cardId, period) => `kart-${cardId}-ekstre-${period}`;

function findStatement(card, period) {
  if (card?.ekstreAyi === period && hasStatement(card))
    return { location: "current", statement: statementFromCard(card) };
  const index = (card?.ekstreGecmisi || []).findIndex((s) => s.ekstreAyi === period);
  return index >= 0
    ? { location: "history", index, statement: card.ekstreGecmisi[index] }
    : null;
}

function removeStatementFromCard(card, period) {
  const found = findStatement(card, period);
  if (!found) return card;
  if (found.location === "history") return {
    ...card,
    ekstreGecmisi: (card.ekstreGecmisi || []).filter((s) => s.ekstreAyi !== period),
  };
  const history = [...(card.ekstreGecmisi || [])]
    .filter((s) => s.ekstreAyi !== period)
    .sort((a, b) => String(a.ekstreAyi).localeCompare(String(b.ekstreAyi)));
  const promoted = history.pop();
  const clean = clearCurrentStatement(card);
  return promoted
    ? { ...clean, ...promoted, ekstreGecmisi: history }
    : { ...clean, ekstreGecmisi: [] };
}

function stripUploadMetadata(card, period) {
  if (card.ekstreAyi === period) {
    const next = { ...card };
    delete next.ekstreBelgeOzeti;
    return next;
  }
  return {
    ...card,
    ekstreGecmisi: (card.ekstreGecmisi || []).map((statement) => {
      if (statement.ekstreAyi !== period) return statement;
      const next = { ...statement };
      delete next.ekstreBelgeOzeti;
      return next;
    }),
  };
}

function deletePaymentState(data, cardId, period) {
  const key = paymentKey(cardId, period);
  const cardPaymentHistory = { ...(data.cardPaymentHistory || {}) };
  const paid = { ...(data.paid || {}) };
  delete cardPaymentHistory[key];
  delete paid[key];
  return { ...data, cardPaymentHistory, paid };
}

export function listUploadedStatements(cards = []) {
  return cards.flatMap((card) => {
    const records = [];
    if (hasStatement(card) && card.ekstreBelgeOzeti) records.push({
      cardId: card.id, cardBank: card.banka, cardName: card.ad,
      cardLast4: card.kartSon4 || card.ekstreBelgeOzeti?.kartSon4 || "",
      period: card.ekstreAyi, location: "current", statement: statementFromCard(card),
    });
    (card.ekstreGecmisi || []).forEach((statement) => {
      if (!statement.ekstreBelgeOzeti) return;
      if (statement.ekstreAyi === card.ekstreAyi) return;
      records.push({
        cardId: card.id, cardBank: card.banka, cardName: card.ad,
        cardLast4: card.kartSon4 || statement.ekstreBelgeOzeti?.kartSon4 || "",
        period: statement.ekstreAyi, location: "history", statement,
      });
    });
    return records;
  }).sort((a, b) => String(b.period).localeCompare(String(a.period)));
}

export function removeUploadedStatement(data, { cardId, period, removeFinancialRecord = false }) {
  const source = (data.cards || []).find((card) => card.id === cardId);
  if (!source || !findStatement(source, period)) return { data, error: "STATEMENT_NOT_FOUND" };
  const cards = (data.cards || []).map((card) => card.id !== cardId ? card
    : removeFinancialRecord ? removeStatementFromCard(card, period)
      : stripUploadMetadata(card, period));
  const next = { ...data, cards };
  return { data: removeFinancialRecord ? deletePaymentState(next, cardId, period) : next, error: null };
}

export function moveUploadedStatement(data, { cardId, period, targetCardId }) {
  if (cardId === targetCardId) return { data, error: null };
  const source = (data.cards || []).find((card) => card.id === cardId);
  const target = (data.cards || []).find((card) => card.id === targetCardId);
  const found = source ? findStatement(source, period) : null;
  if (!source || !target || !found) return { data, error: "STATEMENT_NOT_FOUND" };
  if (findStatement(target, period)) return { data, error: "TARGET_PERIOD_EXISTS" };

  const moved = { ...found.statement };
  const sourceRemoved = removeStatementFromCard(source, period);
  let targetUpdated;
  if (!hasStatement(target) || String(period) > String(target.ekstreAyi || "")) {
    const targetHistory = [...(target.ekstreGecmisi || [])];
    if (hasStatement(target)) targetHistory.push(statementFromCard(target));
    targetUpdated = {
      ...clearCurrentStatement(target), ...moved,
      ekstreGecmisi: targetHistory.filter((s, i, all) => all.findIndex((x) => x.ekstreAyi === s.ekstreAyi) === i),
    };
  } else targetUpdated = {
    ...target,
    ekstreGecmisi: [...(target.ekstreGecmisi || []), moved]
      .sort((a, b) => String(a.ekstreAyi).localeCompare(String(b.ekstreAyi))),
  };

  const oldKey = paymentKey(cardId, period);
  const newKey = paymentKey(targetCardId, period);
  const oldPayments = data.cardPaymentHistory?.[oldKey] || [];
  const newPayments = data.cardPaymentHistory?.[newKey] || [];
  const cardPaymentHistory = { ...(data.cardPaymentHistory || {}) };
  delete cardPaymentHistory[oldKey];
  if (oldPayments.length || newPayments.length) cardPaymentHistory[newKey] =
    [...newPayments, ...oldPayments].filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i);
  const paid = { ...(data.paid || {}) };
  const wasPaid = !!paid[oldKey];
  delete paid[oldKey];
  if (wasPaid) paid[newKey] = true;

  return {
    data: {
      ...data,
      cards: (data.cards || []).map((card) => card.id === cardId ? sourceRemoved : card.id === targetCardId ? targetUpdated : card),
      cardPaymentHistory, paid,
    },
    error: null,
  };
}
