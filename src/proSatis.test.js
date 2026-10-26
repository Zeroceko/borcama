import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { kayitliProSatisDurumu, proSatisDurumuBelirle, proSatistaDegil } from "./proSatis.js";

const paket = { formattedPrice: "₺99,99" };

test("ürün gelirse Pro satışta sayılır, mevcut akış sürer", () => {
  assert.equal(proSatisDurumuBelirle({ paketler: { monthly: paket, annual: null, storefront: "TUR" } }), "var");
  assert.equal(proSatisDurumuBelirle({ paketler: { monthly: null, annual: paket, storefront: "USA" } }), "var");
});

test("teklif boşsa veya ürün mağazadan alınamazsa Pro satışta değil", () => {
  assert.equal(proSatisDurumuBelirle({ paketler: { monthly: null, annual: null, storefront: "USA" } }), "yok");
  assert.equal(proSatisDurumuBelirle({ hata: { code: "23", storefront: "DEU" } }), "yok");
  assert.equal(proSatisDurumuBelirle({ hata: { code: 5 } }), "yok");
  assert.equal(proSatisDurumuBelirle({ hata: { bosTeklif: true, storefront: "GBR" } }), "yok");
});

test("ağ hatası ve hesap yokluğu kararı değiştirmez", () => {
  assert.equal(proSatisDurumuBelirle({ hata: { code: "10" } }), null);
  assert.equal(proSatisDurumuBelirle({ hata: new Error("offline") }), null);
  assert.equal(proSatisDurumuBelirle({ paketler: { unavailable: true } }), null);
  assert.equal(proSatisDurumuBelirle(), null);
});

test("Türkiye mağazasında boş teklif Pro'yu ücretsiz açmaz", () => {
  assert.equal(proSatisDurumuBelirle({ paketler: { monthly: null, annual: null, storefront: "TUR" } }), null);
  assert.equal(proSatisDurumuBelirle({ hata: { code: "23", storefront: "TUR" } }), null);
});

test("web'de Pro her zaman satışta sayılır", () => {
  assert.equal(kayitliProSatisDurumu(), "var");
  assert.equal(proSatistaDegil(), false);
});

test("Pro yüzeyleri satış yokken gizlenir, özellikler açılır", () => {
  const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /const proSatistaDegil = nativeMi && proSatisDurumu === "yok" && !ucretliPro;/);
  assert.match(app, /: reklamsiz\.proAktif \|\| proSatistaDegil;/);
  assert.match(app, /reklamsiz\.kontrolEdildi && !etkinPro && !proSatisBekleniyor &&/);
  assert.match(app, /acik=\{proPenceresiAcik && !proSatistaDegil\}/);
  assert.match(app, /\{proSatisYok \? null : misafir \? \(/);
  assert.match(app, /proAc=\{proSatistaDegil \? undefined :/);
  const checkout = readFileSync(new URL("./ProCheckout.jsx", import.meta.url), "utf8");
  assert.match(checkout, /if \(proSatistaDegil\(\)\) \{\s*window\.location\.replace\("\/summary"\);/);
});

test("misafirde Pro satış durumu anonim RevenueCat ile sorgulanır, hesap açınca logIn ile birleşir", () => {
  const rc = readFileSync(new URL("./revenuecat.js", import.meta.url), "utf8");
  assert.match(rc, /if \(!isConfigured\) await Purchases\.configure\(\{ apiKey \}\);/);
  assert.match(rc, /if \(bekleyenAnonim\) await bekleyenAnonim\.catch\(\(\) => \{\}\);/);
  assert.match(rc, /else if \(configuredUserId !== userId\) await Purchases\.logIn\(\{ appUserID: userId \}\);/);
  assert.match(rc, /export async function revenueCatNativeTeklifleri\(\)/);
  const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /if \(nativeMi && revenueCatHazir\) \{\s*try \{\s*proSatisKarariniUygula\(\{ paketler: await revenueCatNativeTeklifleri\(\) \}\);/);
});
