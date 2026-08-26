import assert from "node:assert/strict";
import test from "node:test";

import { textContentToText } from "./statementImport.js";
import { parseStatementText } from "./statementParser.js";

test("PDF metin katmani VakifBank ozet alanlarini OCR olmadan korur", () => {
  const text = textContentToText({
    items: [
      { str: "VakıfBank World", hasEOL: true },
      { str: "Dönem Borcunuz" },
      { str: ":" },
      { str: "110,637.17 TL", hasEOL: true },
      { str: "Asgari Ödeme Tutarı" },
      { str: ":" },
      { str: "44,255.00 TL", hasEOL: true },
      { str: "Son Ödeme Tarihi" },
      { str: ":" },
      { str: "04.09.2026", hasEOL: true },
      { str: "Hesap Kesim Tarihi" },
      { str: ":" },
      { str: "25.08.2026", hasEOL: true },
      { str: "Limitiniz" },
      { str: ":" },
      { str: "149,000.00 TL", hasEOL: true },
      { str: "Kart No" },
      { str: ":" },
      { str: "4938********8049", hasEOL: true },
      { str: "Önceki Hesap Bakiyesi" },
      { str: "76,359.55", hasEOL: true },
      { str: "Dönem İçi İşlemler" },
      { str: "62,446.66", hasEOL: true },
      { str: "Toplam Faiz ve Ücretler" },
      { str: "2,374.96", hasEOL: true },
      { str: "Ödemeler" },
      { str: "+30,544.00", hasEOL: true },
    ],
  });
  const result = parseStatementText(text, { sourceType: "pdf", pagesRead: 2 });

  assert.equal(result.statementDate, "2026-08-25");
  assert.equal(result.dueDate, "2026-09-04");
  assert.equal(result.statementTotal, 110637.17);
  assert.equal(result.minimumPayment, 44255);
  assert.equal(result.creditLimit, 149000);
  assert.equal(result.cardLast4, "8049");
  assert.equal(result.previousBalance, 76359.55);
  assert.equal(result.periodPayments, 30544);
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.blockingErrors, []);
});
