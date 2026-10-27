import assert from "node:assert/strict";
import test from "node:test";
import { aktiviteOlaylariniCikar, onboardingOlayVerisi } from "./activityEvents.js";

test("yeni harcama, kart ve ekstreyi tutarsız finansal ayrıntı olmadan kaydeder", () => {
  const eski = { cards: [], expenses: [] };
  const yeni = {
    cards: [{ id: "c1", banka: "Akbank", ad: "Axess", ekstreAyi: "2026-08", ekstreBelgeOzeti: { kaynak: "pdf" } }],
    expenses: [{ id: "e1", kategori: "Market", tutar: 1234, aciklama: "özel açıklama" }],
  };
  const olaylar = aktiviteOlaylariniCikar(eski, yeni);
  assert.deepEqual(olaylar.map((x) => x.event_type), ["card_added", "expense_added", "statement_added"]);
  assert.equal(olaylar.at(-1).source, "file_upload");
  assert.equal(JSON.stringify(olaylar).includes("1234"), false);
  assert.equal(JSON.stringify(olaylar).includes("özel açıklama"), false);
});

test("mevcut kartın yeni ekstresini ve ödemesini bir kez algılar", () => {
  const kart = { id: "c1", banka: "Garanti BBVA", ad: "Bonus", ekstreAyi: "2026-07" };
  const eski = { cards: [kart], cardPaymentHistory: {} };
  const yeni = {
    cards: [{ ...kart, ekstreAyi: "2026-08", ekstreGecmisi: [{ ekstreAyi: "2026-07" }] }],
    cardPaymentHistory: { "kart-c1-ekstre-2026-08": [{ id: "p1", tutar: 5000 }] },
  };
  const olaylar = aktiviteOlaylariniCikar(eski, yeni);
  assert.deepEqual(olaylar.map((x) => x.event_type), ["statement_added", "payment_added"]);
  assert.equal(aktiviteOlaylariniCikar(yeni, yeni).length, 0);
});

test("kurulum akışı ölçümü yalnız izinli alanları yazar; tutar ve isim gitmez", () => {
  const veri = onboardingOlayVerisi({ adim: "gelir", sure_ms: 4210.6, gelir: 70000, ad: "Özer", banka: "Akbank", borc_sayisi: "2", gelir_var: 1 });
  assert.deepEqual(veri, { adim: "gelir", sure_ms: 4211, borc_sayisi: 2, gelir_var: true });
  assert.deepEqual(onboardingOlayVerisi({ sure_ms: "abc" }), {});
});
