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
