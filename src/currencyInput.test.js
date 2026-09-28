import test from "node:test";
import assert from "node:assert/strict";
import {
  paraBiriminiFormatla,
  paraGirdisiniCoz,
  paraGirdisiniFormatla,
  turkLirasiFormatla,
} from "./currencyInput.js";

test("ham para tutarını Türkçe binlik ayırıcıyla gösterir", () => {
  assert.equal(paraGirdisiniFormatla("4000000"), "4.000.000");
  assert.equal(paraGirdisiniFormatla(52110.52), "52.110,52");
});

test("formatlı para girişini hesaplamalarda kullanılacak temiz değere çevirir", () => {
  assert.equal(paraGirdisiniCoz("4.000.000"), "4000000");
  assert.equal(paraGirdisiniCoz("52.110,52"), "52110.52");
});

test("kullanıcı virgülü yazdığı anda kuruş girişini korur", () => {
  assert.equal(paraGirdisiniCoz("1.234,"), "1234.");
  assert.equal(paraGirdisiniFormatla("1234."), "1.234,");
});

test("para alanına yazılan harf ve para simgelerini veriye taşımaz", () => {
  assert.equal(paraGirdisiniCoz("₺ 12a.345,6x"), "12345.6");
});

test("dinamik para çıktıları ortak Türkçe para biçimini kullanır", () => {
  assert.equal(turkLirasiFormatla(1234567.8), "₺1.234.567,80");
  assert.equal(paraBiriminiFormatla(1234.56, "USD"), "$1.234,56");
});
