import test from "node:test";
import assert from "node:assert/strict";
import { detectLoanBank, parseLoanMoney, parseLoanPlanText } from "./loanPlanParser.js";

test("VakıfBank planını kişisel veri olmadan kredi kaydına dönüştürür", () => {
  const text = `
Türkiye Vakıflar Bankası T.A.O.
TÜKETİCİ KREDİSİ GERİ ÖDEME PLANI
Kredi Tutarı 100.000,00-TL Ürün Adı Konut Kredisi
Kredi Vadesi 4 Akdi Faiz Oranı 3,09%
Taksit No Taksit Tutarı Taksit Tarihi Tahsil Tarihi Taksit Anapara Taksit Faiz KKDF Tutarı BSMV Tutarı Hayat Sigortası Kalan Anapara
1 28.000,00 TL 11.07.2026 10.07.2026 22.000,00 TL 6.000,00 TL 0,00 TL 0,00 TL 0,00 TL 78.000,00 TL
2 28.000,00 TL 11.08.2026 11.08.2026 23.000,00 TL 5.000,00 TL 0,00 TL 0,00 TL 0,00 TL 55.000,00 TL
3 28.000,00 TL 11.09.2026 11.09.2026 25.000,00 TL 3.000,00 TL 0,00 TL 0,00 TL 0,00 TL 30.000,00 TL
4 31.000,00 TL 11.10.2026 30.000,00 TL 1.000,00 TL 0,00 TL 0,00 TL 0,00 TL 0,00 TL
`;
  const result = parseLoanPlanText(text, { today: new Date("2026-09-22T12:00:00+03:00") });
  assert.equal(result.bank, "VakıfBank");
  assert.equal(result.productName, "Konut kredisi");
  assert.equal(result.originalPrincipal, 100000);
  assert.equal(result.remainingPrincipal, 30000);
  assert.equal(result.remainingInstallments, 1);
  assert.equal(result.installment, 31000);
  assert.equal(result.monthlyInterestRate, 3.09);
  assert.equal(result.firstPaymentDate, "2026-10-11");
  assert.equal(result.nextInstallmentNumber, 4);
  assert.equal(result.remainingPaymentTotal, 31000);
  assert.equal(result.remainingFinancingCost, 1000);
  assert.equal(result.schedule[0].principal, 22000);
  assert.equal(result.schedule[0].interest, 6000);
  assert.deepEqual(result.blockingErrors, []);
});

test("QNB planında vergi kolonlarını atlayıp anapara ve taksiti okur", () => {
  const text = `
QNB
BİREYSEL KREDİ ÖDEME PLANI
KREDİ TUTARI 80.000,00 TL
KREDİ TİPİ TÜKETİCİ KREDİSİ
FAİZ ORANI % 2,99
VADE 3
SIRA TARİH FAİZLİ BAKİYE GÜN ÖDENECEK TAKSİT DEVRE FAİZİ ALINACAK FAİZ KKDF BSMV BİRİKEN FAİZ DÜŞÜLECEK ANAPARA KALAN ANAPARA
0 03/07/2026 80,000.00 0 0.00 0.00 0.00 0.00 0.00 0,00 0.00 80,000.00
1 03/08/2026 54,000.00 31 29,000.00 2,000.00 2,000.00 300.00 300.00 0,00 26,000.00 54,000.00
2 03/09/2026 27,000.00 31 29,000.00 1,500.00 1,500.00 225.00 225.00 0,00 27,000.00 27,000.00
3 03/10/2026 0.00 30 28,000.00 1,000.00 1,000.00 150.00 150.00 0,00 27,000.00 0.00
Ticaret unvanı: QNB Bank A.Ş.
`;
  const result = parseLoanPlanText(text, { today: new Date("2026-09-22T12:00:00+03:00") });
  assert.equal(result.bank, "QNB");
  assert.equal(result.productName, "Tüketici kredisi");
  assert.equal(result.remainingPrincipal, 27000);
  assert.equal(result.remainingInstallments, 1);
  assert.equal(result.installment, 28000);
  assert.equal(result.monthlyInterestRate, 2.99);
  assert.equal(result.nextInstallmentNumber, 3);
  assert.equal(result.remainingPaymentTotal, 28000);
  assert.equal(result.remainingFinancingCost, 1000);
  assert.deepEqual(result.blockingErrors, []);
});

test("QNB başlık kolonları karışsa da yüzde işaretli faizi vadeden ayırır", () => {
  const text = `QNB BİREYSEL KREDİ ÖDEME PLANI
  FAİZ ORANI 12 80.000,00 TL % 2,99 % 15,00
  VADE 12
  1 03/10/2026 0.00 30 8,468.35 243.73 243.73 36.56 36.56 0,00 8,151.50 0.00
  Ticaret unvanı: QNB Bank A.Ş.`;
  const result = parseLoanPlanText(text, { today: new Date("2026-09-22T12:00:00+03:00") });
  assert.equal(result.monthlyInterestRate, 2.99);
});

test("diğer bankaları kurum adından tanır", () => {
  assert.equal(detectLoanBank("T.C. Ziraat Bankası A.Ş. bireysel kredi ödeme planı"), "Ziraat Bankası");
  assert.equal(detectLoanBank("Türkiye İş Bankası A.Ş. geri ödeme tablosu"), "İş Bankası");
  assert.equal(detectLoanBank("Yapı ve Kredi Bankası A.Ş."), "Yapı Kredi");
});

test("VakıfBank tarih önce gelen taksitli ek hesap planını okur", () => {
  const text = `
Türkiye Vakıflar Bankası T.A.O.
TAKSİTLİ EK HESAP GERİ ÖDEME PLANI
Kredi Tutarı 190.000,00-TL Kredi Vadesi 3 Akdi Faiz Oranı 2,99 %
1 20.08.2026 70.000,00 60.000,00 7.692,31 1.153,85 1.153,84 130.000,00
2 20.09.2026 70.000,00 63.000,00 5.384,62 807,69 807,69 67.000,00
3 20.10.2026 70.000,00 67.000,00 2.307,70 346,15 346,15 0,00
`;
  const result = parseLoanPlanText(text, { today: new Date("2026-09-30T12:00:00+03:00") });
  assert.equal(result.bank, "VakıfBank");
  assert.equal(result.productName, "Taksitli Ek Hesap");
  assert.equal(result.schedule.length, 3);
  assert.equal(result.remainingPrincipal, 67000);
  assert.equal(result.remainingInstallments, 1);
  assert.equal(result.installment, 70000);
  assert.deepEqual(result.blockingErrors, []);
});

test("Yapı Kredi planda anaparayı taksit, faiz ve vergilerden çıkarır", () => {
  const text = `
Krediler Ödeme Planı
Yapı ve Kredi Bankası A.Ş.
Taksit No Taksit Vadesi Taksit Tutarı Faiz KKDF BSMV Kalan Anapara Ödeme Tarihi
1 17/08/2026 68,361.13 TL 47,900 TL 7,185 TL 7,185 TL 243,908.87 TL 18/08/2026
2 17/09/2026 21,658.63 TL 11,683.23 TL 1,752.48 TL 1,752.48 TL 237,438.43 TL 18/09/2026
3 17/10/2026 21,658.49 TL 976.63 TL 146.49 TL 146.49 TL 0 TL
`;
  const result = parseLoanPlanText(text, { today: new Date("2026-09-30T12:00:00+03:00") });
  assert.equal(result.bank, "Yapı Kredi");
  assert.equal(result.originalPrincipal, 250000);
  assert.equal(result.term, 3);
  assert.equal(result.remainingPrincipal, 237438.43);
  assert.equal(result.remainingInstallments, 1);
  assert.equal(result.monthlyInterestRate, 4.79);
  assert.equal(result.interestRateSource, "schedule");
  assert.equal(result.schedule[0].principal, 6091.13);
  assert.deepEqual(result.blockingErrors, []);
});

test("Fibabanka kalan anapara kolonunu taksit tutarından ayırır", () => {
  const text = `
İHTİYAÇ KREDİSİ ÖDEME PLANI Fibabanka A.Ş.
Kredi Tutarı 125,000.00 TL Taksit Sayısı 3 Aylık Faiz Oranı %3,1400
1 19.08.2026 46.686,12 83.416,38 41.583,62 3.925,00 588,75 588,75
2 19.09.2026 46.686,12 40.768,11 42.648,27 3.075,27 481,29 481,29
3 19.10.2026 42.686,12 0,00 40.768,11 1.475,39 221,31 221,31
`;
  const result = parseLoanPlanText(text, { today: new Date("2026-09-30T12:00:00+03:00") });
  assert.equal(result.bank, "Fibabanka");
  assert.equal(result.originalPrincipal, 125000);
  assert.equal(result.monthlyInterestRate, 3.14);
  assert.equal(result.remainingPrincipal, 40768.11);
  assert.equal(result.installment, 42686.12);
  assert.equal(result.schedule[0].principal, 41583.62);
  assert.deepEqual(result.blockingErrors, []);
});

test("Enpara kalan anapara ve taksit kolonlarını doğru sırada okur", () => {
  const text = `
İhtiyaç Kredisi Ödeme Planı Enpara Bank A.Ş.
Kredi tutarı :250.000,00 TL Taksit sayısı :3 Aylık faiz oranı :%3,69
1 20/08/2026 170.000,00 TL 90.000,00 TL 80.000,00 TL 7.692,31 TL 1.153,85 TL 1.153,84 TL
2 20/09/2026 85.000,00 TL 90.000,00 TL 85.000,00 TL 3.846,16 TL 576,92 TL 576,92 TL
3 20/10/2026 0,00 TL 90.000,00 TL 85.000,00 TL 3.846,16 TL 576,92 TL 576,92 TL
`;
  const result = parseLoanPlanText(text, { today: new Date("2026-09-30T12:00:00+03:00") });
  assert.equal(result.bank, "Enpara");
  assert.equal(result.monthlyInterestRate, 3.69);
  assert.equal(result.remainingPrincipal, 85000);
  assert.equal(result.remainingInstallments, 1);
  assert.equal(result.installment, 90000);
  assert.deepEqual(result.blockingErrors, []);
});

test("tek ondalıklı uluslararası para değeri binlik sanılmaz", () => {
  assert.equal(parseLoanMoney("189219.8 TL"), 189219.8);
  assert.equal(parseLoanMoney("190.000 TL"), 190000);
});

test("taksit satırı bulunmayan belgede ayrıştırıcı hata fırlatmadan kontrol ister", () => {
  const result = parseLoanPlanText("Yapı ve Kredi Bankası A.Ş. ödeme planı", { today: new Date("2026-09-30T12:00:00+03:00") });
  assert.equal(result.schedule.length, 0);
  assert.ok(result.blockingErrors.length > 0);
});
