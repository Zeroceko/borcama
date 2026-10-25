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

test("Türkçe ayrıştırma açık dil koduyla da aynı kalır", () => {
  assert.equal(paraGirdisiniCoz("1.234,56", "tr"), "1234.56");
  assert.equal(paraGirdisiniFormatla("1234.56", "tr"), "1.234,56");
});

test("İngilizce girişte virgül binlik, nokta ondalık ayırıcıdır", () => {
  assert.equal(paraGirdisiniCoz("1,234.56", "en"), "1234.56");
  assert.equal(paraGirdisiniCoz("4,000,000", "en"), "4000000");
  assert.equal(paraGirdisiniCoz("1,234.", "en"), "1234.");
  assert.equal(paraGirdisiniCoz(".5", "en"), "0.5");
  assert.equal(paraGirdisiniCoz("$ 12a,345.678x", "en"), "12345.67");
  assert.equal(paraGirdisiniCoz("", "en"), "");
  assert.equal(paraGirdisiniCoz(".", "en"), "");
});

test("İngilizce gösterim virgülle gruplar, noktayla kuruş ayırır", () => {
  assert.equal(paraGirdisiniFormatla("4000000", "en"), "4,000,000");
  assert.equal(paraGirdisiniFormatla(52110.52, "en"), "52,110.52");
  assert.equal(paraGirdisiniFormatla("1234.", "en"), "1,234.");
});

test("her iki dilde biçimle-çöz gidiş dönüşü değeri korur", () => {
  for (const dilKodu of ["tr", "en"]) {
    for (const ham of ["0", "7", "1234", "1234.5", "1234.56", "9876543.21", "1234."]) {
      assert.equal(paraGirdisiniCoz(paraGirdisiniFormatla(ham, dilKodu), dilKodu), ham, `${dilKodu}: ${ham}`);
    }
  }
});

test("kullanıcı para birimi seçilmemişse TRY ve Türkçe biçim kullanılır", async () => {
  const { kullaniciParaBirimi, kullaniciParaFormatla } = await import("./currencyInput.js");
  assert.equal(kullaniciParaBirimi(), "TRY");
  assert.equal(kullaniciParaFormatla(1234567.8), turkLirasiFormatla(1234567.8));
});

test("kullanıcı para birimi localStorage'dan okunur, geçersiz değer TRY'ye düşer", async () => {
  const { kullaniciParaBirimi, kullaniciParaFormatla } = await import("./currencyInput.js");
  const depo = new Map();
  const onceki = globalThis.localStorage;
  globalThis.localStorage = { getItem: (k) => depo.get(k) ?? null, setItem: (k, v) => depo.set(k, v) };
  try {
    depo.set("borcama_para_birimi", "USD");
    assert.equal(kullaniciParaBirimi(), "USD");
    assert.equal(kullaniciParaFormatla(1234.56), "$1.234,56");
    depo.set("borcama_para_birimi", "dolar");
    assert.equal(kullaniciParaBirimi(), "TRY");
  } finally {
    globalThis.localStorage = onceki;
  }
});

test("para biçimi locale seçeneğiyle İngilizce gösterilebilir, TL biçimi sabit kalır", () => {
  assert.equal(paraBiriminiFormatla(1234.56, "USD", { locale: "en-US" }), "$1,234.56");
  assert.equal(turkLirasiFormatla(1234.56, { locale: "en-US" }), "₺1,234.56");
  assert.equal(turkLirasiFormatla(1234.56), "₺1.234,56");
});
