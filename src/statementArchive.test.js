import test from "node:test";
import assert from "node:assert/strict";
import { listUploadedStatements, moveUploadedStatement, removeUploadedStatement } from "./statementArchive.js";

const meta = { kaynak: "pdf", yuklenmeTarihi: "2026-08-20T10:00:00Z" };
const data = {
  cards: [
    { id: "world", banka: "VakıfBank", ad: "Worldcard", ekstreAyi: "2026-08", toplamEkstreBorcu: 20000, ekstreBelgeOzeti: meta,
      ekstreGecmisi: [{ ekstreAyi: "2026-07", toplamEkstreBorcu: 15000, ekstreBelgeOzeti: meta }] },
    { id: "click", banka: "VakıfBank", ad: "Click", ekstreAyi: "2026-07", toplamEkstreBorcu: 7000, ekstreGecmisi: [] },
  ],
  cardPaymentHistory: { "kart-world-ekstre-2026-08": [{ id: "p1", tutar: 1000 }] },
  paid: { "kart-world-ekstre-2026-08": true },
};

test("uploaded current and historical statements are listed", () => {
  assert.deepEqual(listUploadedStatements(data.cards).map((row) => row.period), ["2026-08", "2026-07"]);
});

test("removing upload metadata preserves financial statement", () => {
  const result = removeUploadedStatement(data, { cardId: "world", period: "2026-08" });
  assert.equal(result.data.cards[0].toplamEkstreBorcu, 20000);
  assert.equal(result.data.cards[0].ekstreBelgeOzeti, undefined);
});

test("removing current financial statement promotes latest history", () => {
  const result = removeUploadedStatement(data, { cardId: "world", period: "2026-08", removeFinancialRecord: true });
  assert.equal(result.data.cards[0].ekstreAyi, "2026-07");
  assert.equal(result.data.cards[0].toplamEkstreBorcu, 15000);
  assert.equal(result.data.cardPaymentHistory["kart-world-ekstre-2026-08"], undefined);
});

test("statement moves to correct card with payment state", () => {
  const result = moveUploadedStatement(data, { cardId: "world", period: "2026-08", targetCardId: "click" });
  assert.equal(result.error, null);
  assert.equal(result.data.cards.find((c) => c.id === "world").ekstreAyi, "2026-07");
  assert.equal(result.data.cards.find((c) => c.id === "click").ekstreAyi, "2026-08");
  assert.equal(result.data.cardPaymentHistory["kart-click-ekstre-2026-08"][0].id, "p1");
  assert.equal(result.data.paid["kart-click-ekstre-2026-08"], true);
});
