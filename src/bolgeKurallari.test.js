import test from "node:test";
import assert from "node:assert/strict";
import {
  bankaSecenekleri,
  bolgeAsgariOdemesi,
  bolgeProfili,
  esikTutar,
  ornekTutar,
  profilUlkeAdi,
  belgeOkumaAcik,
  ekHesapFaizOrani,
  kartFaizOranlari,
  turkiyeKurallariGecerli,
  vergiFonOrani,
} from "./bolgeKurallari.js";
import { calculateRevolvingDebtScenario } from "./financialScenario.js";
import { asistanBaglamiOlustur } from "./assistantContext.js";
import { calculateRestructuringInstallment } from "./cardRestructuring.js";

test("web (varsayılan TRY) Türkiye kurallarını uygular", () => {
  assert.equal(turkiyeKurallariGecerli(), true);
  assert.equal(vergiFonOrani(), 0.3);
  assert.equal(belgeOkumaAcik(), true);
});

test("TRY'de kart oranı TCMB azami diliminden gelir, girilen oran değiştirmez", () => {
  assert.deepEqual(kartFaizOranlari(10000, 2, "TRY"), { akdi: 3.25, gecikme: 3.55, referans: true, varsayilan: false, bilinmiyor: false });
  assert.equal(kartFaizOranlari(50000, "", "TRY").akdi, 3.75);
  assert.equal(kartFaizOranlari(200000, "", "TRY").gecikme, 4.55);
});

test("TRY dışında girilen oran geçerli, girilmemişse ülke ortalaması (yıllık / 12) kullanılır", () => {
  assert.deepEqual(kartFaizOranlari(200000, "1.75", "USD"), { akdi: 1.75, gecikme: 1.75, referans: false, varsayilan: false, bilinmiyor: false });
  const abd = kartFaizOranlari(5000, "", "USD", bolgeProfili("USD", "US"));
  assert.equal(abd.varsayilan, true);
  assert.ok(Math.abs(abd.akdi - 22 / 12) < 0.001);
  assert.ok(Math.abs(kartFaizOranlari(5000, "", "EUR", bolgeProfili("EUR", "DE")).akdi - 17 / 12) < 0.001);
  assert.ok(Math.abs(kartFaizOranlari(5000, "", "JPY", bolgeProfili("JPY", "JP")).akdi - 20 / 12) < 0.001);
  assert.equal(vergiFonOrani("USD"), 0);
});

test("ek hesap: TRY'de %4,25 referans, TRY dışında ülke ortalaması; ABD'de ücretle işler", () => {
  assert.deepEqual(ekHesapFaizOrani("", "TRY"), { oran: 4.25, tahmini: true, varsayilan: false, ucretle: false });
  assert.deepEqual(ekHesapFaizOrani("3", "TRY"), { oran: 3, tahmini: false, varsayilan: false, ucretle: false });
  assert.deepEqual(ekHesapFaizOrani("1.5", "GBP"), { oran: 1.5, tahmini: false, varsayilan: false, ucretle: false });
  assert.ok(Math.abs(ekHesapFaizOrani("", "GBP", bolgeProfili("GBP", "GB")).oran - 39.9 / 12) < 0.001);
  assert.ok(Math.abs(ekHesapFaizOrani("", "EUR", bolgeProfili("EUR", "DE")).oran - 11.5 / 12) < 0.001);
  assert.deepEqual(ekHesapFaizOrani("", "USD", bolgeProfili("USD", "US")), { oran: 0, tahmini: false, varsayilan: true, ucretle: true });
});

test("profil: cihaz bölgesi para birimiyle uyuşursa o ülke, yoksa para biriminden", () => {
  assert.equal(bolgeProfili("TRY", "TR"), null);
  assert.equal(bolgeProfili("EUR", "DE").kod, "DE");
  assert.deepEqual([bolgeProfili("EUR", "NL").kod, bolgeProfili("EUR", "NL").ulke], ["EURO", "NL"]);
  assert.deepEqual([bolgeProfili("EUR", "US").kod, bolgeProfili("EUR", "US").ulke], ["EURO", "EU"]);
  assert.equal(bolgeProfili("USD", "DE").kod, "US");
  assert.equal(bolgeProfili("GBP", "").kod, "GB");
  assert.deepEqual([bolgeProfili("SEK", "SE").kod, bolgeProfili("SEK", "SE").ulke], ["VARSAYILAN", null]);
  assert.equal(profilUlkeAdi(bolgeProfili("USD", "US"), "en-US"), "United States");
  assert.equal(profilUlkeAdi(bolgeProfili("SEK", "SE"), "en-US"), null);
});

test("asgari ödeme ülke kuralına göre tahmin edilir", () => {
  const abd = bolgeProfili("USD", "US");
  assert.equal(bolgeAsgariOdemesi(1000, 2, abd), 30); // %1 + faiz %2 = 30 > 25
  assert.equal(bolgeAsgariOdemesi(500, 2, abd), 25); // taban
  assert.equal(bolgeAsgariOdemesi(10, 2, abd), 10); // borcu aşmaz
  assert.equal(bolgeAsgariOdemesi(10000, 1.4, bolgeProfili("EUR", "DE")), 300);
  assert.equal(bolgeAsgariOdemesi(500, 1.4, bolgeProfili("EUR", "ES")), 30);
  assert.equal(bolgeAsgariOdemesi(1000, 1.4, bolgeProfili("EUR", "FR")), 30);
  assert.equal(bolgeAsgariOdemesi(0, 1, abd), 0);
});

test("örnek tutar ve eşikler para birimine göre ölçeklenir, TRY aynen kalır", () => {
  assert.equal(ornekTutar(284750, "TRY"), 284750);
  assert.equal(ornekTutar(284750, "USD"), 14000);
  assert.equal(ornekTutar(10000, "EUR"), 500);
  assert.equal(ornekTutar(19300, "GBP"), 970);
  assert.equal(ornekTutar(10000, "JPY"), 75000);
  assert.equal(esikTutar(1000, "TRY"), 1000);
  assert.equal(esikTutar(1000, "USD"), 50);
});

test("belge okuma yalnız TRY'de açık", () => {
  assert.equal(belgeOkumaAcik("TRY"), true);
  assert.equal(belgeOkumaAcik("USD"), false);
});

test("banka listesi TRY dışında Türk bankalarını göstermez, kayıtlı ve eklenen bankaları tutar", () => {
  const turkBankalari = ["Akbank", "Garanti BBVA"];
  assert.deepEqual(bankaSecenekleri({ turkBankalari, ozelBankalar: ["Chase"], birim: "TRY" }), ["Akbank", "Garanti BBVA", "Chase"]);
  assert.deepEqual(
    bankaSecenekleri({ turkBankalari, ozelBankalar: ["Chase"], kayitliBankalar: ["Akbank", " ", "Chase", "Barclays"], birim: "USD" }),
    ["Chase", "Akbank", "Barclays"],
  );
  assert.deepEqual(bankaSecenekleri({ turkBankalari, birim: "EUR" }), []);
});

test("plan motoru vergi-fon oranı 0 verilince yalnız girilen faizi işletir", () => {
  const ortak = { income: 50000, expenses: [], cards: [], loans: [], currentDate: new Date(2026, 9, 1), livingBudgetOverride: 20000 };
  const borc = { bakiye: 100000, faiz: 3, minimumOdeme: 10000, minimumOran: 0.1 };
  const tr = calculateRevolvingDebtScenario({ ...ortak, debts: [{ ...borc, vergiFonOrani: 0.3 }] });
  const yurtdisi = calculateRevolvingDebtScenario({ ...ortak, debts: [{ ...borc, vergiFonOrani: 0 }] });
  assert.equal(tr.status, "ok");
  assert.equal(yurtdisi.status, "ok");
  assert.ok(yurtdisi.totalInterest < tr.totalInterest);
  // İlk ay faizi: vergisiz 100.000 × %3, vergiyle × 1,3.
  assert.ok(Math.abs(yurtdisi.totalInterest / tr.totalInterest - 1 / 1.3) < 0.05);
});

test("yapılandırma taksiti KKDF/BSMV boşken vergi eklemez", () => {
  const vergisiz = calculateRestructuringInstallment({ amount: 12000, installmentCount: 12, monthlyInterest: 2, kkdfRate: "", bsmvRate: "" });
  const vergili = calculateRestructuringInstallment({ amount: 12000, installmentCount: 12, monthlyInterest: 2, kkdfRate: 15, bsmvRate: 15 });
  assert.ok(vergisiz < vergili);
});

test("asistan bağlamı TRY dışında TCMB kaynağı ve vergi çarpanı eklemez", () => {
  const veri = {
    cards: [{ id: "k1", banka: "Chase", yeniDonemEkstreBorcu: 10000, toplamEkstreBorcu: 10000, yapilanOdeme: 0, ekstreAyi: "2026-10" }],
    overdrafts: [{ id: "o1", banka: "Chase", kullanilan: 2000, yapilanOdeme: 0 }],
    loans: [], incomes: [], expenses: [], assets: [],
  };
  const kalemler = [
    { id: "kart-k1", tur: "kart", bakiye: 10000, faiz: 0, faizTutari: 0, faizTahmini: false },
    { id: "ek-o1", tur: "ek", bakiye: 2000, faiz: 0, faizTutari: 0, faizTahmini: false },
  ];
  const tarih = new Date(2026, 9, 15);
  const yurtdisi = asistanBaglamiOlustur({ veri, gelir: 0, zorunluOdeme: 0, harcama: 0, planAcigi: 0, kalemler, tarih, turkiyeKurallari: false });
  assert.equal(yurtdisi.faizMaliyetOzeti.vergiToplamYuzde, 0);
  assert.ok(!JSON.stringify(yurtdisi).includes("TCMB"));
  const turkiye = asistanBaglamiOlustur({
    veri, gelir: 0, zorunluOdeme: 0, harcama: 0, planAcigi: 0, tarih,
    kalemler: [{ ...kalemler[0], faiz: 3.25, faizTutari: 325, faizTahmini: true }, { ...kalemler[1], faiz: 4.25, faizTutari: 85, faizTahmini: true }],
  });
  assert.equal(turkiye.faizMaliyetOzeti.vergiToplamYuzde, 30);
  assert.ok(JSON.stringify(turkiye).includes("TCMB azami oranı"));
});

test("ekstre ve kredi planı okuma girişleri TRY dışında açılmaz", async () => {
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /\{baslangicSecimiAcik && belgeOkumaAcik\(\) && \(/);
  assert.match(app, /if \(baslangicSecimiAcik && !belgeOkumaAcik\(\)\) manuelEkstreAkisiniAc\(\);/);
  assert.match(app, /if \(belgeOkumaAcik\(\)\) setKrediEklemeSecimiAcik\(true\);\s*else setForm\(\{ liste: "loans", veri: \{\} \}\);/);
});
