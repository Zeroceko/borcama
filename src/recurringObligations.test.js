import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buAyDuzenliBorcToplami,
  duzenliBorcOdemeleri,
} from "./recurringObligations.js";

describe("düzenli borç ödemeleri", () => {
  const tarih = new Date(2026, 8, 7);

  it("aktif kredi ve yapılandırmaları listeler, bitenleri dışlar", () => {
    const krediler = [
      { id: "k1", banka: "QNB", ad: "İhtiyaç", kalanBorc: 50000, taksit: 10000, kalanTaksit: 5 },
      { id: "k2", banka: "Halkbank", ad: "Kart yapılandırması", kalanBorc: 12000, taksit: 2500, kalanTaksit: 5, kaynak: "card_restructuring" },
      { id: "k3", banka: "Biten", kalanBorc: 0, taksit: 900, kalanTaksit: 0 },
    ];

    assert.equal(duzenliBorcOdemeleri(krediler, tarih).length, 2);
    assert.equal(buAyDuzenliBorcToplami(krediler, tarih), 12500);
  });

  it("gelecek ay başlayan krediyi gösterir fakat bu ayın toplamına katmaz", () => {
    const krediler = [
      { id: "k1", banka: "QNB", kalanBorc: 50000, taksit: 10000, kalanTaksit: 5, ilkOdemeTarihi: "2026-10-08" },
    ];

    assert.equal(duzenliBorcOdemeleri(krediler, tarih)[0].buAyOdenecek, false);
    assert.equal(buAyDuzenliBorcToplami(krediler, tarih), 0);
  });
});
