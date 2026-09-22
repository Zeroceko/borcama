import test from "node:test";
import assert from "node:assert/strict";
import { detectLoanBank, parseLoanPlanText } from "./loanPlanParser.js";

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
