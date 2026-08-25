function normalize(value) {
  return String(value || "")
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function textMatches(left, right) {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  return a === b || (Math.min(a.length, b.length) >= 4 && (a.includes(b) || b.includes(a)));
}

export function savedCardLast4(card) {
  const history = [...(card?.ekstreGecmisi || [])].reverse();
  const value =
    card?.kartSon4 ||
    card?.cardLast4 ||
    card?.ekstreBelgeOzeti?.kartSon4 ||
    history.find((entry) => entry?.ekstreBelgeOzeti?.kartSon4)?.ekstreBelgeOzeti
      ?.kartSon4 ||
    "";
  return String(value).replace(/\D/g, "").slice(-4);
}

export function matchStatementToCard(cards = [], statement = {}) {
  const bank = normalize(statement.bank);
  const brand = statement.cardBrand;
  const last4 = String(statement.cardLast4 || "").replace(/\D/g, "").slice(-4);

  const candidates = cards
    .map((card) => {
      const bankMatches = Boolean(bank) && normalize(card.banka) === bank;
      const cardLast4 = savedCardLast4(card);
      const last4Matches = Boolean(last4 && cardLast4 && last4 === cardLast4);
      const brandMatches = textMatches(card.ad, brand) || textMatches(card.ekstreBelgeOzeti?.kart, brand);

      // Banka veya daha önce öğrenilmiş son dört hane açıkça çelişiyorsa
      // sessizce başka karta kayıt yapmayız.
      if (bank && !bankMatches) return null;
      if (last4 && cardLast4 && !last4Matches) return null;

      return {
        card,
        bankMatches,
        brandMatches,
        last4Matches,
        score: (last4Matches ? 100 : 0) + (bankMatches ? 40 : 0) + (brandMatches ? 25 : 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) return null;
  const best = candidates[0];
  const sameScoreCount = candidates.filter((candidate) => candidate.score === best.score).length;
  const bankCandidateCount = candidates.filter((candidate) => candidate.bankMatches).length;
  const safe =
    sameScoreCount === 1 &&
    (best.last4Matches ||
      (best.bankMatches && best.brandMatches) ||
      (best.bankMatches && bankCandidateCount === 1));
  if (!safe) return null;

  return {
    card: best.card,
    reason: best.last4Matches
      ? "last4"
      : best.brandMatches
        ? "bank-brand"
        : "bank",
  };
}
