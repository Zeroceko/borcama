import assert from "node:assert/strict";
import { test } from "node:test";
import { odemeHatirlaticilariniOlustur } from "./odemeHatirlatmalari.js";

test("kart ve kredi odemelerini ayni gun icin tek gizli bildirime gruplar", () => {
  const sonuc = odemeHatirlaticilariniOlustur({
    cards: [{ id: "kart-1", sonOdemeTarihi: "2026-10-05" }],
    loans: [{ id: "kredi-1", kalanBorc: 1000, kalanTaksit: 2, odemeGunu: 5 }],
    paid: {},
  }, new Date(2026, 8, 29, 12));
  assert.equal(sonuc.length, 1);
  assert.equal(sonuc[0].schedule.at.getTime(), new Date(2026, 9, 4, 9).getTime());
  assert.equal(sonuc[0].body, "Yarın için kayıtlı ödemen var. Ayrıntıları Borcama'da kontrol et.");
  assert.doesNotMatch(sonuc[0].body, /1000|kart|kredi-1/i);
});

test("odenmis kredi sonraki aya planlanir ve kapanmis borc bildirilmez", () => {
  const sonuc = odemeHatirlaticilariniOlustur({
    cards: [],
    loans: [
      { id: "aktif", kalanBorc: 1000, kalanTaksit: 2, odemeGunu: 5 },
      { id: "kapali", kalanBorc: 0, kalanTaksit: 0, odemeGunu: 5 },
    ],
    paid: { "kredi-aktif-2026-10": true },
  }, new Date(2026, 8, 29, 12));
  assert.equal(sonuc.length, 1);
  assert.equal(sonuc[0].extra.dueDate, "2026-11-05");
});

test("odendi isaretli kart icin bildirim planlanmaz", () => {
  const sonuc = odemeHatirlaticilariniOlustur({
    cards: [{ id: "kart-1", ekstreAyi: "2026-09", sonOdemeTarihi: "2026-10-05" }],
    loans: [],
    paid: { "kart-kart-1-ekstre-2026-09": true },
  }, new Date(2026, 8, 29, 12));
  assert.deepEqual(sonuc, []);
});
