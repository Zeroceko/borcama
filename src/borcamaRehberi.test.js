import assert from "node:assert/strict";
import { test } from "node:test";
import { rehberDurumu, rehberiErtele, rehberiMezunEt, rehberOnerisiniKapat } from "./borcamaRehberi.js";

const SIMDI = new Date(2026, 9, 11, 12, 0, 0);
const kurulmus = (ek = {}) => ({
  cards: [{ id: "k1", banka: "QNB", ad: "Bonus", toplamEkstreBorcu: 12500, ekstreAyi: "2026-10", kesimGunu: 5 }],
  loans: [], overdrafts: [], others: [],
  incomes: [{ id: "g", tutar: 50000 }],
  expenses: [{ id: "h", tutar: 100 }],
  ayarlar: {},
  ...ek,
});

test("kurulum bitmeden rehber kurulum adımını gösterir", () => {
  const d = rehberDurumu({ cards: [], incomes: [], expenses: [] }, { simdi: SIMDI });
  assert.equal(d.asama, "kurulum");
  assert.equal(d.oneri.adim, "1/3");
});

test("kurulumdan sonra: önce tek borç tamamlaması, sonra sabit gider", () => {
  let veri = kurulmus();
  assert.equal(rehberDurumu(veri, { simdi: SIMDI }).oneri.id, "baska-borc");
  veri.ayarlar.rehber = rehberOnerisiniKapat({}, "baska-borc");
  assert.equal(rehberDurumu(veri, { simdi: SIMDI }).oneri.id, "sabit-gider");
});

test("ödeme günü gelmiş ve işaretlenmemiş ödeme tamamlamadan önce gelir; ertelenince sıradakine geçer", () => {
  const veri = kurulmus();
  const yaklasan = [{ id: "kart-k1", anahtar: "kart-k1", ad: "QNB · Bonus", tarih: new Date(2026, 9, 9), odendi: false }];
  const d = rehberDurumu(veri, { simdi: SIMDI, yaklasan });
  assert.equal(d.oneri.tur, "odeme");
  assert.match(d.oneri.aciklama, /2 gün önce geçti/);
  veri.ayarlar.rehber = rehberiErtele({}, d.oneri.id, SIMDI);
  assert.equal(rehberDurumu(veri, { simdi: SIMDI, yaklasan }).oneri.id, "baska-borc");
  assert.equal(rehberDurumu(veri, { simdi: new Date(2026, 9, 15), yaklasan }).oneri.tur, "odeme");
  assert.equal(rehberDurumu(veri, { simdi: SIMDI, yaklasan: [{ ...yaklasan[0], odendi: true }] }).oneri.id, "baska-borc");
});

test("yeni ay ve kesim günü geçince yeni ekstre istenir", () => {
  const veri = kurulmus({ cards: [{ id: "k1", banka: "QNB", toplamEkstreBorcu: 1, ekstreAyi: "2026-09", kesimGunu: 5 }] });
  assert.equal(rehberDurumu(veri, { simdi: SIMDI }).oneri.tur, "ekstre");
  assert.equal(rehberDurumu(veri, { simdi: new Date(2026, 9, 3) }).oneri.tur, "tamamla");
});

test("tamamlama bitti ve iki ayda kullanıldıysa mezuniyet; mezun olunca rehber susar", () => {
  const veri = kurulmus({
    cards: [{ id: "k1", banka: "QNB", toplamEkstreBorcu: 1, ekstreAyi: "2026-10", ekstreGecmisi: [{ ekstreAyi: "2026-09" }] }],
    loans: [{ id: "l1" }],
    expenses: [{ id: "s", tekrar: "Her ay", tutar: 1 }],
  });
  const d = rehberDurumu(veri, { simdi: SIMDI });
  assert.equal(d.asama, "mezuniyet");
  veri.ayarlar.rehber = rehberiMezunEt({}, SIMDI);
  assert.equal(rehberDurumu(veri, { simdi: SIMDI }).oneri, null);
});

test("tek ay kullanımında mezuniyet yok", () => {
  const veri = kurulmus({ loans: [{ id: "l1" }], expenses: [{ id: "s", tekrar: "Her ay" }] });
  assert.equal(rehberDurumu(veri, { simdi: SIMDI }).asama, "bekle");
});

test("bitirme mesajını rehber söyler; kullanıcının düğmesi 'Başka borcum yok'", () => {
  const veri = kurulmus();
  assert.equal(rehberDurumu(veri, { simdi: SIMDI }).oneri.kapatEtiketi, "Başka borcum yok");
  const mezun = kurulmus({ cards: [{ id: "k1", toplamEkstreBorcu: 1, ekstreAyi: "2026-10", ekstreGecmisi: [{ ekstreAyi: "2026-09" }] }], loans: [{ id: "l" }], expenses: [{ tekrar: "Her ay" }] });
  assert.equal(rehberDurumu(mezun, { simdi: SIMDI }).oneri.baslik, "Hepsi bu kadar! Artık hazırsın.");
});
