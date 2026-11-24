import test from "node:test";
import assert from "node:assert/strict";
import {
  borcTrendi,
  enAcilOdeme,
  gorunumOku,
  gorunumYaz,
  harcamaOzeti,
  kartOdemeDurumu,
  kartSenaryolari,
  odemeKovasi,
  odemeleriGrupla,
  taksitNumarasi,
} from "./yeniGorunum.js";

test("görünüm seçimi varsayılan klasik, depolama hatasında da klasik", () => {
  const depo = new Map();
  const sahte = { getItem: (k) => depo.get(k) ?? null, setItem: (k, v) => depo.set(k, v) };
  assert.equal(gorunumOku(sahte), "klasik");
  gorunumYaz("yeni", sahte);
  assert.equal(gorunumOku(sahte), "yeni");
  gorunumYaz("bozuk", sahte);
  assert.equal(gorunumOku(sahte), "klasik");
  const patlayan = { getItem: () => { throw new Error("kapalı"); }, setItem: () => { throw new Error("kapalı"); } };
  assert.equal(gorunumOku(patlayan), "klasik");
  assert.doesNotThrow(() => gorunumYaz("yeni", patlayan));
});

test("ödeme kovaları: gecikti, bugün, yarın, bu hafta, sonraki 30 gün", () => {
  assert.equal(odemeKovasi(-3), "gecikti");
  assert.equal(odemeKovasi(0), "bugun");
  assert.equal(odemeKovasi(1), "yarin");
  assert.equal(odemeKovasi(7), "buHafta");
  assert.equal(odemeKovasi(8), "sonraki");
  assert.equal(odemeKovasi(31), null);
  const gruplar = odemeleriGrupla([
    { id: "a", gun: 4, tutar: 700 },
    { id: "b", gun: -4, tutar: 2600 },
    { id: "c", gun: 1, tutar: 12400, odendi: true },
    { id: "d", gun: 2, tutar: 300 },
    { id: "e", gun: 45, tutar: 1 },
  ]);
  assert.deepEqual(gruplar.map((g) => g.kova), ["gecikti", "yarin", "buHafta"]);
  assert.equal(gruplar[1].acikToplam, 0);
  assert.deepEqual(gruplar[2].odemeler.map((o) => o.id), ["d", "a"]);
  assert.equal(gruplar[2].acikToplam, 1000);
});

test("en acil ödeme: gecikmiş önce, ödenmiş ve gelecek ay atlanır", () => {
  const odemeler = [
    { id: "a", gun: 1, tutar: 100 },
    { id: "b", gun: -2, tutar: 50, odendi: true },
    { id: "c", gun: -1, tutar: 80 },
    { id: "d", gun: -5, tutar: 10, gelecek: true },
  ];
  assert.equal(enAcilOdeme(odemeler).id, "c");
  assert.equal(enAcilOdeme([]), null);
});

test("kart senaryoları: tamamı faizsiz, minimum kalan üzerinden aylık faiz, hiç ödemezsen gecikme faizi", () => {
  const s = kartSenaryolari({ borc: 46000, minimum: 9200, akdi: 3.58, gecikme: 3.88, vergiOrani: 0.3 });
  assert.equal(s.tamami.faiz, 0);
  assert.equal(s.minimum.kalan, 36800);
  assert.equal(s.minimum.faiz, 1712.67);
  assert.equal(s.hic.faiz, 2320.24);
  const yabanci = kartSenaryolari({ borc: 1000, minimum: 50, akdi: 2, gecikme: 2, vergiOrani: 0 });
  assert.equal(yabanci.minimum.faiz, 19);
  assert.equal(kartSenaryolari({ borc: 100, minimum: 500, akdi: 3 }).minimum.kalan, 0);
});

test("kart ödeme durumu", () => {
  assert.equal(kartOdemeDurumu({ kalanToplam: 0 }), "tamami");
  assert.equal(kartOdemeDurumu({ kalanToplam: 36800, minimumKalan: 0, yapilanOdeme: 9200 }), "minimum");
  assert.equal(kartOdemeDurumu({ kalanToplam: 40000, minimumKalan: 3200, yapilanOdeme: 6000 }), "kismi");
  assert.equal(kartOdemeDurumu({ kalanToplam: 46000, minimumKalan: 9200, yapilanOdeme: 0 }), "odenmedi");
});

test("taksit numarası", () => {
  assert.deepEqual(taksitNumarasi({ toplamTaksit: 24, kalanTaksit: 17 }), { no: 8, toplam: 24, odenen: 7 });
  assert.deepEqual(taksitNumarasi({ toplamTaksit: 24, kalanTaksit: 16, buAyOdendi: true }), { no: 8, toplam: 24, odenen: 8 });
  assert.equal(taksitNumarasi({ toplamTaksit: 0, kalanTaksit: 3 }), null);
  assert.equal(taksitNumarasi({ toplamTaksit: 12, kalanTaksit: 20 }), null);
});

test("borç trendi: sıralı son 6 ay, iki aydan azsa boş", () => {
  assert.deepEqual(borcTrendi({ "2026-10": 5 }), []);
  const t = borcTrendi({ "2026-11": 3, "2026-01": 9, x: 1, "2026-05": 7, "2026-06": 6, "2026-07": 5, "2026-08": 4, "2026-09": 3.5 });
  assert.deepEqual(t.map((n) => n.ay), ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-11"]);
});

test("harcama özeti kategori ve kart filtresi", () => {
  const kalemler = [
    { kategori: "Market", tutar: 100, kartId: "a" },
    { kategori: "Market", tutar: 50, kartId: "b" },
    { kategori: "Akaryakıt", tutar: 120, kartId: "a" },
    { kategori: "", tutar: 10, kartId: null },
  ];
  const hepsi = harcamaOzeti(kalemler);
  assert.equal(hepsi.toplam, 280);
  assert.deepEqual(hepsi.kategoriler.map((k) => k.kategori), ["Market", "Akaryakıt", "Diğer"]);
  assert.deepEqual(harcamaOzeti(kalemler, "a").kategoriler, [{ kategori: "Akaryakıt", tutar: 120 }, { kategori: "Market", tutar: 100 }]);
});
