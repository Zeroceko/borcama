import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
const start = source.indexOf('loans: [');
const end = source.indexOf('    od: [', start);
const fields = source.slice(start, end);

test("manuel kredi formu başlangıç tutarı ve plan alanlarını doğru sırada ister", () => {
  const labels = [
    "Banka",
    "Kredi adı",
    "Kredi tutarı (₺)",
    "Aylık faiz oranı (%)",
    "Toplam taksit sayısı",
    "Aylık taksit tutarı (₺)",
    "Ödenen taksit sayısı",
    "Kalan taksit sayısı",
    "Ödeme günü",
    "İlk taksit tarihi",
  ];
  let previous = -1;
  labels.forEach((label) => {
    const position = fields.indexOf(label);
    assert.ok(position > previous, `${label} alanı eksik veya yanlış sırada`);
    previous = position;
  });
});

test("kalan taksit ve ödeme günü çelişkiyi önlemek için otomatikleşir", () => {
  assert.match(source, /krediIlerlemesi\?\.gecerli && a\.k === "kalanTaksit"/);
  assert.match(source, /a\.k === "odemeGunu" && !!f\.ilkOdemeTarihi/);
  assert.match(source, /a\.k === "ilkOdemeTarihi"[\s\S]{0,140}odemeGunu:/);
});
