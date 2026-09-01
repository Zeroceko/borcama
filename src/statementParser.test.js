import assert from "node:assert/strict";
import test from "node:test";

import { parseStatementText } from "./statementParser.js";

function assertAmounts(text, expected) {
  const result = parseStatementText(text);
  for (const [key, value] of Object.entries(expected))
    assert.equal(result[key], value, `${result.bank || "Bilinmeyen banka"}: ${key}`);
}

test("Halkbank ozet tablosunu ortak borc modeline donusturur", () => {
  assertAmounts(
    `Halkbank Paraf
Hesap Kesim Tarihi 22/07/2026
Son Odeme Tarihi 03/08/2026
Hesap Bakiyesi
Asgari Odeme Tutari
110,453.74 TL
44,181.50 TL
Toplam Kredi Limiti
150,000.00 TL
Bir Onceki Donem
Ekstre Borcu
Donem Ici Borc Tutari
Toplam Faiz, Ucret, Vergiler
Donemsel Alacak Kayitlari
Hesap Bakiyesi
125,321.33 TL
31,741.46 TL
3,686.15 TL
50,295.20 TL
110,453.74 TL`,
    {
      statementTotal: 110453.74,
      minimumPayment: 44181.5,
      creditLimit: 150000,
      previousBalance: 125321.33,
      periodPayments: 50295.2,
      carriedBalance: 75026.13,
      currentPeriodDebt: 35427.61,
    },
  );
});

test("TEB nokta ve virgul para yazimini dogru yorumlar", () => {
  assertAmounts(
    `TEB SHE KREDI KART EKSTRE OZETI
Kart Limiti TL.175.000,-
Hesap Kesim Tarihi 14/06/2026
Son Odeme Tarihi 24/06/2026
Minimum Odeme Tutari :TLA.706,-
Onceki Donemden Devir Edilen Tutar TL.13.644,39
15/05/2026 Levent Carsisi Subesi ODEME TESEKKUR EDERIZ -TL.5.500,-
GENEL TOPLAM TL11.763,39`,
    {
      statementTotal: 11763.39,
      minimumPayment: 4706,
      creditLimit: 175000,
      previousBalance: 13644.39,
      periodPayments: 5500,
      carriedBalance: 8144.39,
      currentPeriodDebt: 3619,
    },
  );
});

test("Garanti odemis onceki bakiyeyi devreden borc saymaz", () => {
  assertAmounts(
    `Garanti BBVA Bonus
Kart Limiti 49.999,00 TL
Hesap Kesim Tarihi 24 Temmuz 2026
Son Odeme Tarihi 03 Agustos 2026
Donem Borcunuz 10.933,54 TL
Min. Odeme Tutari 2.187,00 TL
ONCEKI DONEMDEN DEVIR EDILEN TUTAR 17.747,08
01 Temmuz 2026 ODEMENIZ ICIN TESEKKUR EDERIZ 7.099,004
02 Temmuz 2026 ODEMENIZ ICIN TESEKKUR EDERIZ 10.648,08+`,
    {
      statementTotal: 10933.54,
      minimumPayment: 2187,
      previousBalance: 17747.08,
      periodPayments: 17747.08,
      carriedBalance: 0,
      currentPeriodDebt: 10933.54,
    },
  );
});

test("Akbank iki odeme satirini birlikte hesaplar", () => {
  assertAmounts(
    `Akbank Axess
Donem Borcu 89,69257 TL
Son Odeme Tarihi 05/08/2026
En Az Odeme Tutari 3587702 TL
Hesap Kesim Tarihi 26/07/2026
Kart Limiti 300,00000 TL
Onceki Donem Hesap Ozeti Bakiyesi 63,53558
03/07/2026 INTERNET Sb-Odemeniz icin Tesekkurler 40,00000()
10/07/2026 INTERNET Sb-Gdemeniz icin Tesekkurler 23,53558(-)`,
    {
      statementTotal: 89692.57,
      minimumPayment: 35877.02,
      previousBalance: 63535.58,
      periodPayments: 63535.58,
      carriedBalance: 0,
      currentPeriodDebt: 89692.57,
    },
  );
});

test("VakifBank ozet denklemindeki devreden borcu korur", () => {
  assertAmounts(
    `VakifBank World
Donem Borcunuz 76,359.55 TL
Asgari Odeme Tutari 30,544.00 TL
Son Odeme Tarihi 04.08.2026
Hesap Kesim Tarihi 25.07.2026
Kart Limiti 149,000.00 TL
Onceki Hesap Bakiyesi 122,428.15
Donem Ici Islemler 682.03
Toplam Faiz ve Ucretler 2,221.37
Odemeler +48,972.00`,
    {
      statementTotal: 76359.55,
      previousBalance: 122428.15,
      periodPayments: 48972,
      carriedBalance: 73456.15,
      currentPeriodDebt: 2903.4,
    },
  );
});

test("Enpara ozet denklemindeki alanlari ortak modele aktarir", () => {
  assertAmounts(
    `Enpara Kredi Karti Ekstresi
Ekstre tarihi 21/07/2026
Ekstre borcu 34.977,66 TL
Minimum odeme tutari 6.996,00 TL
Son odeme tarihi 31/07/2026
Kart limiti 49.950,00 TL
Bir onceki ekstre borcu Odemeler Harcamalar ve yansiyan taksitler Nakit avans Arti bakiye transferi Faiz, vergiler, ucretler ve diger Ekstre borcu
30.622,90 TL - 6.125,00 TL + 9.285,48 TL + 0,00 TL + 1.194,28 TL = 34.977,66 TL`,
    {
      statementTotal: 34977.66,
      previousBalance: 30622.9,
      periodPayments: 6125,
      carriedBalance: 24497.9,
      currentPeriodDebt: 10479.76,
    },
  );
});

test("Enpara islem aciklamasindaki Bonus kelimesini Garanti sanmaz", () => {
  const result = parseStatementText(`Kredi Kartı Ekstresi
Ekstre tarihi 23/08/2026
Ekstre borcu 10.797,05 TL
Minimum ödeme tutarı 2.160,00 TL
Son ödeme tarihi 02/09/2026
Kart numarası 5269 11** **** 9619
Kart limiti 50.000,00 TL
Bir önceki ekstre borcu Ödemeler Harcamalar ve yansıyan taksitler Nakit avans / Artı bakiye transferi Faiz, vergiler, ücretler ve diğer Ekstre borcu
13.666,66 TL 13.666,66 TL 10.549,96 TL 0,00 TL 247,09 TL 10.797,05 TL
22/08/2026 BONUSPARKORMAN 1.600,00 TL
Bir sonraki ekstrenizin tarihi 23/09/2026, son ödeme tarihi ise 05/10/2026'dır.
Enpara Bank A.Ş.`);

  assert.equal(result.bank, "Enpara");
  assert.equal(result.cardBrand, "Enpara");
  assert.equal(result.cardLast4, "9619");
  assert.equal(result.statementTotal, 10797.05);
  assert.equal(result.minimumPayment, 2160);
  assert.equal(result.creditLimit, 50000);
  assert.equal(result.previousBalance, 13666.66);
  assert.equal(result.periodPayments, 13666.66);
  assert.equal(result.currentPurchases, 10549.96);
  assert.equal(result.fees, 247.09);
  assert.equal(result.carriedBalance, 0);
  assert.equal(result.currentPeriodDebt, 10797.05);
  assert.equal(result.nextStatementDate, "2026-09-23");
  assert.deepEqual(result.blockingErrors, []);
});

test("banka taniminda sonraki sayfalari ve islem satirlarini kullanmaz", () => {
  const result = parseStatementText(`Kredi Kartı Ekstresi
Ekstre tarihi 23/08/2026
Ekstre borcu 1.000,00 TL
Minimum ödeme tutarı 200,00 TL
Son ödeme tarihi 02/09/2026
İşlem tarihi Açıklama Tutar
22/08/2026 BONUS MARKET 1.000,00 TL
--- SAYFA ---
Garanti BBVA Bonus kampanya koşulları`);

  assert.equal(result.bank, "");
  assert.equal(result.cardBrand, "");
  assert.ok(result.warnings.includes("Banka otomatik tanınamadı."));
});

test("Enpara ozet denklemi tutmuyorsa kaydi engeller", () => {
  const result = parseStatementText(`Enpara Bank A.Ş. Kredi Kartı Ekstresi
Ekstre tarihi 23/08/2026
Ekstre borcu 10.797,05 TL
Minimum ödeme tutarı 2.160,00 TL
Son ödeme tarihi 02/09/2026
Bir önceki ekstre borcu Ödemeler Harcamalar ve yansıyan taksitler Nakit avans / Artı bakiye transferi Faiz, vergiler, ücretler ve diğer Ekstre borcu
13.666,66 TL 1.000,00 TL 10.549,96 TL 0,00 TL 247,09 TL 10.797,05 TL`);

  assert.equal(result.bank, "Enpara");
  assert.ok(result.blockingErrors.some((error) => error.includes("birbiriyle uyuşmuyor")));
});
