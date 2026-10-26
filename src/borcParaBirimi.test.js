import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  borcListesiniAnaBirimeCevir,
  kurBekleyenKayitlar,
  kurCarpani,
  kurTablosuOlustur,
  kurTablosunuAyarla,
  kurTablosunuSifirla,
  tutarCevir,
} from "./dovizKuru.js";
import { kayitParaBirimi } from "./currencyInput.js";
import {
  belgeOkumaAcik,
  bolgeAsgariOdemesi,
  bolgeProfili,
  ekHesapFaizOrani,
  kartFaizOranlari,
  tryKaydiVar,
  vergiFonOrani,
} from "./bolgeKurallari.js";
import { yasalAsgariUygulanir } from "./creditCardMinimum.js";
import { asistanBaglamiOlustur } from "./assistantContext.js";
import { belgeKaydiParaBirimi } from "./statementImport.js";

// TCMB: 1 GBP = 55 TRY, 1 USD = 41 TRY, 1 EUR = 48 TRY; ECB: 1 EUR = 160 JPY.
const FIYATLAR = { usdTry: 41, eurTry: 48, gbpTry: 55, chfTry: 51, fx: { tarih: "2026-10-27", eur: { EUR: 1, JPY: 160, TRY: 47.9 } } };
const tablo = kurTablosuOlustur(FIYATLAR, "2026-10-27T09:00:00.000Z");

test("kur tablosu TCMB ve ECB kurlarından kurulur, TCMB öncelikli", () => {
  assert.equal(tablo.tryKarsiligi.GBP, 55);
  assert.equal(tablo.tryKarsiligi.EUR, 48);
  assert.ok(Math.abs(tablo.tryKarsiligi.JPY - 48 / 160) < 1e-9);
  assert.equal(tablo.tarih, "2026-10-27T09:00:00.000Z");
  assert.equal(kurTablosuOlustur({}, null), null);
});

test("kur çevirisi: aynı birimde çarpan daima 1, kur yoksa null", () => {
  assert.equal(kurCarpani("TRY", "TRY", null), 1);
  assert.equal(kurCarpani("GBP", "GBP", null), 1);
  assert.equal(tutarCevir(5500, "TRY", "GBP", tablo), 100);
  assert.equal(tutarCevir(100, "GBP", "TRY", tablo), 5500);
  assert.equal(kurCarpani("NZD", "GBP", tablo), null);
  assert.equal(tutarCevir(100, "GBP", "TRY", null), null);
});

test("son bilinen kur korunur: eksik yanıt önceki birimleri silmez", () => {
  kurTablosunuSifirla(null);
  kurTablosunuAyarla(tablo);
  const sonraki = kurTablosunuAyarla(kurTablosuOlustur({ gbpTry: 56 }, "2026-10-28"));
  assert.equal(sonraki.tryKarsiligi.GBP, 56);
  assert.ok(sonraki.tryKarsiligi.JPY > 0);
  kurTablosunuSifirla(null);
});

test("eski kayıt (paraBirimi yok) ana birimde kalır", () => {
  assert.equal(kayitParaBirimi({}, "TRY"), "TRY");
  assert.equal(kayitParaBirimi({ paraBirimi: undefined }, "GBP"), "GBP");
  assert.equal(kayitParaBirimi({ paraBirimi: "XYZ" }, "GBP"), "GBP");
  assert.equal(kayitParaBirimi({ paraBirimi: "TRY" }, "GBP"), "TRY");
  const kartlar = [{ id: "a", toplamEkstreBorcu: 1000 }];
  const sonuc = borcListesiniAnaBirimeCevir(kartlar, "cards", { anaBirim: "TRY", kayitBirimi: (k) => kayitParaBirimi(k, "TRY"), tablo: null });
  assert.equal(sonuc[0], kartlar[0]);
});

test("kurallar borç bazında: İngiltere'deki kullanıcının GBP kartı İngiltere, TL kartı Türkiye kuralı", () => {
  const ana = "GBP";
  const gbpKart = {};
  const tlKart = { paraBirimi: "TRY" };
  const gbpBirim = kayitParaBirimi(gbpKart, ana);
  const tlBirim = kayitParaBirimi(tlKart, ana);
  const ingiltere = kartFaizOranlari(2000, "", gbpBirim, bolgeProfili(gbpBirim, "GB"));
  assert.equal(ingiltere.varsayilan, true);
  assert.ok(Math.abs(ingiltere.akdi - 24 / 12) < 1e-3);
  assert.equal(yasalAsgariUygulanir(gbpBirim), false);
  assert.equal(bolgeAsgariOdemesi(2000, ingiltere.akdi, bolgeProfili(gbpBirim, "GB")), 2000 * 0.01 + 2000 * ingiltere.akdi / 100);
  assert.equal(vergiFonOrani(gbpBirim), 0);

  const turkiye = kartFaizOranlari(50000, "", tlBirim, bolgeProfili(tlBirim, "GB"));
  assert.deepEqual(turkiye, { akdi: 3.75, gecikme: 4.05, referans: true, varsayilan: false, bilinmiyor: false });
  assert.equal(yasalAsgariUygulanir(tlBirim), true);
  assert.equal(vergiFonOrani(tlBirim), 0.3);
  assert.equal(ekHesapFaizOrani("", tlBirim).oran, 4.25);
  // GB cihazında EUR borç euro bölgesi ortalamasına düşer.
  assert.equal(bolgeProfili("EUR", "GB").kod, "EURO");
});

test("Türk bankası belge okuma: ana birim TRY ya da en az bir TRY borcu varsa açık", () => {
  assert.equal(belgeOkumaAcik("TRY", []), true);
  assert.equal(belgeOkumaAcik("GBP", []), false);
  assert.equal(belgeOkumaAcik("GBP", [{ banka: "Barclays" }]), false);
  assert.equal(belgeOkumaAcik("GBP", [{ banka: "Barclays" }, { banka: "Akbank", paraBirimi: "TRY" }]), true);
  assert.equal(tryKaydiVar([{}], "TRY"), true);
  assert.deepEqual(belgeKaydiParaBirimi("TRY"), {});
  assert.deepEqual(belgeKaydiParaBirimi("GBP"), { paraBirimi: "TRY" });
});

test("karma (GBP + TRY): TRY borç kurla ana birime çevrilir, kuru olmayan ayrıca sayılır", () => {
  const secenek = { anaBirim: "GBP", kayitBirimi: (k) => kayitParaBirimi(k, "GBP"), tablo };
  const kartlar = [
    { id: "gbp", toplamEkstreBorcu: 1000, yapilanOdeme: 0 },
    { id: "tl", paraBirimi: "TRY", toplamEkstreBorcu: 55000, yapilanOdeme: 5500, ekstreGecmisi: [{ toplamEkstreBorcu: 11000 }] },
    { id: "nzd", paraBirimi: "NZD", toplamEkstreBorcu: 300 },
  ];
  const cevrilmis = borcListesiniAnaBirimeCevir(kartlar, "cards", secenek);
  assert.equal(cevrilmis.length, 2);
  assert.equal(cevrilmis[0].toplamEkstreBorcu, 1000);
  assert.equal(cevrilmis[1].toplamEkstreBorcu, 1000);
  assert.equal(cevrilmis[1].yapilanOdeme, 100);
  assert.equal(cevrilmis[1].ekstreGecmisi[0].toplamEkstreBorcu, 200);
  assert.equal(cevrilmis[1].paraBirimi, "TRY");
  assert.deepEqual(kurBekleyenKayitlar([kartlar], secenek).map((k) => k.id), ["nzd"]);
});

test("asistan bağlamı: tek birimde birebir aynı, karma birimde kalem birimi ve ana birim toplamı", () => {
  const veri = {
    cards: [{ id: "k1", banka: "Akbank", toplamEkstreBorcu: 55000, faiz: 3 }],
    loans: [{ id: "l1", banka: "Barclays", kalanBorc: 2000, taksit: 200, kalanTaksit: 10, faiz: 1 }],
    overdrafts: [], others: [], incomes: [], expenses: [], assets: [],
  };
  const kalemler = [{ id: "kart-k1", tur: "kart", bakiye: 55000, faiz: 3 }];
  const tarih = new Date(2026, 9, 27);
  const tekBirim = asistanBaglamiOlustur({ veri, kalemler, tarih });
  const tekBirimBilgili = asistanBaglamiOlustur({
    veri, kalemler, tarih,
    paraBirimleri: { anaBirim: "TRY", kayitBirimi: (k) => kayitParaBirimi(k, "TRY"), cevir: (t) => t },
  });
  assert.deepEqual(tekBirimBilgili, tekBirim);

  const karmaVeri = { ...veri, cards: [{ ...veri.cards[0], paraBirimi: "TRY" }] };
  const karma = asistanBaglamiOlustur({
    veri: karmaVeri,
    kalemler: [{ id: "kart-k1", tur: "kart", bakiye: 1000, faiz: 3, paraBirimi: "TRY" }],
    tarih,
    turkiyeKurallari: false,
    paraBirimleri: {
      anaBirim: "GBP",
      kayitBirimi: (k) => kayitParaBirimi(k, "GBP"),
      cevir: (tutar, birim) => tutarCevir(tutar, birim, "GBP", tablo),
    },
  });
  assert.equal(karma.kartlar[0].paraBirimi, "TRY");
  assert.equal(karma.kartlar[0].kalanBorc, 55000);
  assert.equal(karma.krediler[0].paraBirimi, "GBP");
  assert.equal(karma.ozet.toplamBorc, 1000);
  // 55.000 TL x %3 = 1.650 TL = 30 GBP; KKDF/BSMV yalnız TL kartta.
  assert.equal(karma.faizMaliyetOzeti.kartAylikFaizVergiHaricTahmin, 30);
  assert.equal(karma.faizMaliyetOzeti.kartVeEkHesapAylikFaizVergiDahilTahmin, 39);
  assert.equal(karma.paraBirimleri.anaBirim, "GBP");
  assert.deepEqual(karma.paraBirimleri.kullanilanBirimler.sort(), ["GBP", "TRY"]);
  assert.equal(karma.paraBirimleri.kurBekleyenKayitSayisi, 0);
});

test("App: kalemler ana birime çevrilir, kuru olmayan kayıt toplama sessizce 0 diye girmez", () => {
  const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /function kalemiAnaBirimeCevir\(kalem, kayit, tablo\) \{\n  const birim = yabanciBirim\(kayit\);\n  if \(!birim\) return kalem;/);
  assert.match(app, /if \(kur === null\) return null;/);
  assert.match(app, /t\("paraBirimi\.kur\.bekliyor", \{ n: durum\.bekleyen \}\)/);
});
