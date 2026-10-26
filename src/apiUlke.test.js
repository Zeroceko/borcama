import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import handler, { ulkeBasligindanKod } from "../api/ulke.js";

function sahteYanit() {
  return {
    basliklar: {},
    durum: null,
    govde: undefined,
    setHeader(ad, deger) {
      this.basliklar[ad] = deger;
    },
    status(kod) {
      this.durum = kod;
      return this;
    },
    json(govde) {
      this.govde = govde;
      return this;
    },
  };
}

test("api/ulke Vercel ülke başlığını iki harfli kod olarak döner, önbelleğe alınmaz", () => {
  const res = sahteYanit();
  handler({ method: "GET", headers: { "x-vercel-ip-country": "de" } }, res);
  assert.equal(res.durum, 200);
  assert.deepEqual(res.govde, { ulke: "DE" });
  assert.match(res.basliklar["Cache-Control"], /private/);
  assert.match(res.basliklar["Cache-Control"], /no-store/);
});

test("api/ulke başlık yoksa veya geçersizse null döner; IP veya başka veri yansıtmaz", () => {
  for (const deger of [undefined, "", "XX", "T1", "TUR", "1A", "<script>"]) {
    const res = sahteYanit();
    handler({ method: "GET", headers: { "x-vercel-ip-country": deger, "x-forwarded-for": "1.2.3.4" } }, res);
    assert.deepEqual(res.govde, { ulke: null }, String(deger));
  }
  assert.equal(ulkeBasligindanKod(["TR"]), "TR");
});

test("api/ulke yalnız GET/HEAD kabul eder", () => {
  const res = sahteYanit();
  handler({ method: "POST", headers: { "x-vercel-ip-country": "TR" } }, res);
  assert.equal(res.durum, 405);
  assert.equal(res.basliklar.Allow, "GET, HEAD");
});

test("api/ulke kişisel veri saklamaz ve loglamaz", () => {
  const kaynak = readFileSync(new URL("../api/ulke.js", import.meta.url), "utf8");
  assert.doesNotMatch(kaynak, /console\.|supabase|fetch\(|x-forwarded-for|x-real-ip/i);
});
