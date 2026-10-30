import test from "node:test";
import assert from "node:assert/strict";
import { matchStatementToCard, savedCardLast4 } from "./statementCardMatcher.js";

const cards = [
  { id: "bonus", banka: "Garanti BBVA", ad: "Bonus", kartSon4: "1234" },
  { id: "miles", banka: "Garanti BBVA", ad: "Miles&Smiles", kartSon4: "9876" },
  { id: "world", banka: "Yapı Kredi", ad: "Worldcard" },
];

test("aynı bankadaki kartı son dört haneyle ayırır", () => {
  const match = matchStatementToCard(cards, {
    bank: "Garanti BBVA",
    cardBrand: "Bonus",
    cardLast4: "1234",
  });
  assert.equal(match?.card.id, "bonus");
  assert.equal(match?.reason, "last4");
});

test("tek banka ve marka eşleşmesini otomatik seçer", () => {
  const match = matchStatementToCard(cards, {
    bank: "Yapı Kredi",
    cardBrand: "World",
  });
  assert.equal(match?.card.id, "world");
  assert.equal(match?.reason, "bank-brand");
});

test("aynı bankada belirsiz iki kart varsa otomatik seçmez", () => {
  const match = matchStatementToCard(
    cards.map(({ kartSon4, ...card }) => card),
    { bank: "Garanti BBVA", cardBrand: "Kredi kartı" },
  );
  assert.equal(match, null);
});

test("geçmiş ekstrede öğrenilen son dört haneyi kullanır", () => {
  assert.equal(
    savedCardLast4({
      ekstreGecmisi: [{ ekstreBelgeOzeti: { kartSon4: "4321" } }],
    }),
    "4321",
  );
});

const ayniBanka = [
  { id: "a", banka: "VakıfBank", ad: "Kredi kartı", limit: 100000, kesimGunu: 23 },
  { id: "b", banka: "VakıfBank", ad: "Kredi kartı", limit: 25000, kesimGunu: 8 },
];

test("aynı bankada iki kart: limit ve kesim günü doğru kartı seçer", () => {
  const match = matchStatementToCard(ayniBanka, {
    bank: "VakıfBank",
    creditLimit: 100000,
    statementDate: "2026-10-23",
  });
  assert.equal(match?.card.id, "a");
  assert.equal(match?.reason, "bank-details");
});

test("kesim günü tatil kayması (±2 gün) ve ay sonu geçişini tolere eder", () => {
  const match = matchStatementToCard(ayniBanka, {
    bank: "VakıfBank",
    cardBrand: "Kredi kartı",
    statementDate: "2026-11-10",
  });
  assert.equal(match?.card.id, "b");
  const aySonu = matchStatementToCard(
    [{ id: "x", banka: "QNB", kesimGunu: 31 }, { id: "y", banka: "QNB", kesimGunu: 15 }],
    { bank: "QNB", statementDate: "2026-12-01" },
  );
  assert.equal(aySonu?.card.id, "x");
});

test("limit ve kesim günü iki kartta da tutarsa otomatik seçmez", () => {
  const match = matchStatementToCard(
    ayniBanka.map((kart) => ({ ...kart, limit: 50000, kesimGunu: 15 })),
    { bank: "VakıfBank", creditLimit: 50000, statementDate: "2026-10-15" },
  );
  assert.equal(match, null);
});

test("limit farklı olsa da son dört hane eşleşmesi kazanır, kart elenmez", () => {
  const match = matchStatementToCard(
    [{ id: "z", banka: "Enpara", kartSon4: "4321", limit: 30000 }],
    { bank: "Enpara", cardLast4: "4321", creditLimit: 45000 },
  );
  assert.equal(match?.card.id, "z");
  assert.equal(match?.reason, "last4");
});
