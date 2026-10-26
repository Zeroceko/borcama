import test from "node:test";
import assert from "node:assert/strict";
import {
  bankaSecenekleri,
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
  assert.deepEqual(kartFaizOranlari(10000, 2, "TRY"), { akdi: 3.25, gecikme: 3.55, referans: true, bilinmiyor: false });
  assert.equal(kartFaizOranlari(50000, "", "TRY").akdi, 3.75);
  assert.equal(kartFaizOranlari(200000, "", "TRY").gecikme, 4.55);
});

test("TRY dışında kart için yalnız girilen oran kullanılır; yoksa faiz varsayılmaz", () => {
  assert.deepEqual(kartFaizOranlari(200000, "1.75", "USD"), { akdi: 1.75, gecikme: 1.75, referans: false, bilinmiyor: false });
  assert.deepEqual(kartFaizOranlari(200000, "", "EUR"), { akdi: 0, gecikme: 0, referans: false, bilinmiyor: true });
  assert.equal(vergiFonOrani("USD"), 0);
});

test("ek hesap: TRY'de %4,25 referans, TRY dışında varsayım yok", () => {
  assert.deepEqual(ekHesapFaizOrani("", "TRY"), { oran: 4.25, tahmini: true, bilinmiyor: false });
  assert.deepEqual(ekHesapFaizOrani("3", "TRY"), { oran: 3, tahmini: false, bilinmiyor: false });
  assert.deepEqual(ekHesapFaizOrani("", "GBP"), { oran: 0, tahmini: false, bilinmiyor: true });
  assert.deepEqual(ekHesapFaizOrani("1.5", "GBP"), { oran: 1.5, tahmini: false, bilinmiyor: false });
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
