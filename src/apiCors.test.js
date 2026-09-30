import test from "node:test";
import assert from "node:assert/strict";
import { corsUygula, IZINLI_KAYNAKLAR } from "../api/_cors.js";

function sahteYanit() {
  const basliklar = {};
  return {
    basliklar,
    durum: null,
    bitti: false,
    setHeader(ad, deger) {
      basliklar[ad] = deger;
    },
    status(kod) {
      this.durum = kod;
      return this;
    },
    end() {
      this.bitti = true;
    },
  };
}

test("native kabugun kaynagi izinli listede", () => {
  assert.ok(IZINLI_KAYNAKLAR.has("capacitor://borcama.com"));
});

test("izinli kaynak icin CORS basligi doner ve istek devam eder", () => {
  const res = sahteYanit();
  const devamEtmeli = corsUygula({ method: "GET", headers: { origin: "capacitor://borcama.com" } }, res);
  assert.equal(devamEtmeli, false);
  assert.equal(res.basliklar["Access-Control-Allow-Origin"], "capacitor://borcama.com");
  assert.equal(res.basliklar.Vary, "Origin");
});

test("izinsiz kaynak icin CORS basligi eklenmez", () => {
  const res = sahteYanit();
  corsUygula({ method: "GET", headers: { origin: "https://baska-site.example" } }, res);
  assert.equal(res.basliklar["Access-Control-Allow-Origin"], undefined);
  assert.equal(res.basliklar.Vary, "Origin");
});

test("tarayicidan gelen ayni kaynakli istek origin basligi olmadan calisir", () => {
  const res = sahteYanit();
  const devamEtmeli = corsUygula({ method: "GET", headers: {} }, res);
  assert.equal(devamEtmeli, false);
  assert.equal(res.basliklar["Access-Control-Allow-Origin"], undefined);
});

test("preflight istegi 204 ile yanitlanir ve islem durur", () => {
  const res = sahteYanit();
  const durdurmali = corsUygula({ method: "OPTIONS", headers: { origin: "capacitor://borcama.com" } }, res);
  assert.equal(durdurmali, true);
  assert.equal(res.durum, 204);
  assert.ok(res.bitti);
});
