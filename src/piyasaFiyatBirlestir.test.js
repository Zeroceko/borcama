import test from "node:test";
import assert from "node:assert/strict";
import { kodBazliFiyatlariBirlestir, piyasaFiyatlariniBirlestir } from "./piyasaFiyatBirlestir.js";

test("tam yanitta gelen veri oldugu gibi kullanilir", () => {
  const sonuc = piyasaFiyatlariniBirlestir(
    { usdTry: 40, goldGramTry: 5000 },
    { usdTry: 49 },
    false,
  );
  assert.deepEqual(sonuc, { usdTry: 49 });
});

test("kismi yanitta eksik alan son basarili degerden tamamlanir", () => {
  const sonuc = piyasaFiyatlariniBirlestir(
    { usdTry: 40, goldGramTry: 5000 },
    { usdTry: 49 },
    true,
  );
  assert.equal(sonuc.usdTry, 49);
  assert.equal(sonuc.goldGramTry, 5000);
});

test("kismi yanitta kripto fiyatlari coin bazinda birlesir", () => {
  const sonuc = piyasaFiyatlariniBirlestir(
    { crypto: { bitcoin: 4000000, ethereum: 130000 }, cryptoUsd: { bitcoin: 83000 } },
    { crypto: { bitcoin: 4103154 } },
    true,
  );
  assert.equal(sonuc.crypto.bitcoin, 4103154);
  assert.equal(sonuc.crypto.ethereum, 130000);
  assert.equal(sonuc.cryptoUsd.bitcoin, 83000);
});

test("fiyati alinamayan fon kodu son bilinen fiyatini korur", () => {
  const sonuc = kodBazliFiyatlariBirlestir(
    { YAY: { code: "YAY", price: 1.2 }, TI2: { code: "TI2", price: 3.4 } },
    { YAY: { code: "YAY", price: 1.25 } },
  );
  assert.equal(sonuc.YAY.price, 1.25);
  assert.equal(sonuc.TI2.price, 3.4);
});

test("istek hic yapilmadiysa onceki fiyatlar aynen kalir", () => {
  const onceki = { THYAO: { code: "THYAO", price: 300 } };
  assert.deepEqual(kodBazliFiyatlariBirlestir(onceki, undefined), onceki);
});
