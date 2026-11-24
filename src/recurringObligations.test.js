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
    // Kart yapılandırması taksiti kart ekstresinde geldiği için ayrıca sayılmaz.
    assert.equal(buAyDuzenliBorcToplami(krediler, tarih), 10000);
  });

  it("gelecek ay başlayan krediyi gösterir fakat bu ayın toplamına katmaz", () => {
    const krediler = [
      { id: "k1", banka: "QNB", kalanBorc: 50000, taksit: 10000, kalanTaksit: 5, ilkOdemeTarihi: "2026-10-08" },
    ];

    assert.equal(duzenliBorcOdemeleri(krediler, tarih)[0].buAyOdenecek, false);
    assert.equal(buAyDuzenliBorcToplami(krediler, tarih), 0);
  });
});

it("kart ekstresine eklenen yapılandırma taksiti aylık yüke ayrıca eklenmez", async () => {
  const { kartEkstresiyleOdenir } = await import("./loanSchedule.js");
  const tarih = new Date(2026, 10, 24);
  const yapilandirma = { id: "y", kaynak: "card_restructuring", kalanBorc: 12000, taksit: 1000, kalanTaksit: 12, ilkOdemeTarihi: "2026-10-05" };
  const ayri = { ...yapilandirma, id: "a", kartEkstresineEklenir: false };
  const kredi = { id: "k", kalanBorc: 5000, taksit: 500, kalanTaksit: 10 };
  assert.equal(kartEkstresiyleOdenir(yapilandirma), true);
  assert.equal(kartEkstresiyleOdenir(ayri), false);
  assert.equal(kartEkstresiyleOdenir(kredi), false);
  const liste = duzenliBorcOdemeleri([yapilandirma, kredi], tarih);
  assert.equal(liste.find((o) => o.id === "y").kartEkstresinde, true);
  assert.equal(buAyDuzenliBorcToplami([yapilandirma, kredi], tarih), 500);
  assert.equal(buAyDuzenliBorcToplami([ayri, kredi], tarih), 1500);
});
