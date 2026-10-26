import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { kayitliProSatisDurumu, proSatisDurumuBelirle, proSatistaDegil } from "./proSatis.js";

const paket = { formattedPrice: "₺99,99" };

test("ürün gelirse Pro satışta sayılır, mevcut akış sürer", () => {
  assert.equal(proSatisDurumuBelirle({ paketler: { monthly: paket, annual: null, storefront: "TUR" } }), "var");
  assert.equal(proSatisDurumuBelirle({ paketler: { monthly: null, annual: paket, storefront: null } }), "var");
});

test("Türkiye dışı mağazada ürün gelse bile Pro satışta değil (sandbox ülke kısıtını uygulamıyor)", () => {
  assert.equal(proSatisDurumuBelirle({ paketler: { monthly: paket, annual: paket, storefront: "USA" } }), "yok");
  assert.equal(proSatisDurumuBelirle({ paketler: { monthly: paket, annual: null, storefront: "DEU" } }), "yok");
  assert.equal(proSatisDurumuBelirle({ paketler: { monthly: paket, annual: paket, storefront: "TUR" } }), "var");
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

test("web'de ülke bilinmiyorsa Pro satışta sayılır (bugünkü davranış)", () => {
  assert.equal(kayitliProSatisDurumu(), "var");
  assert.equal(proSatistaDegil(), false);
});

test("Pro yüzeyleri satış yokken gizlenir, özellikler açılır", () => {
  const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  // Native ve web aynı satır: native'de mağaza ülkesi, web'de IP ülkesi.
  assert.match(app, /const proSatistaDegil = proSatisDurumu === "yok" && !ucretliPro;/);
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

test("web: aynı karar fonksiyonu IP ülkesiyle çalışır; yalnız Türkiye dışı ülke satışı kapatır", async () => {
  const { webProSatisDurumu } = await import("./proSatis.js");
  assert.equal(proSatisDurumuBelirle({ ulke: "TR" }), "var");
  assert.equal(proSatisDurumuBelirle({ ulke: "DE" }), "yok");
  assert.equal(webProSatisDurumu("TR"), "var");
  assert.equal(webProSatisDurumu("tr"), "var");
  assert.equal(webProSatisDurumu("US"), "yok");
  assert.equal(webProSatisDurumu("GB"), "yok");
  // Ülke alınamadı / geçersiz: bugünkü davranış (Pro satışta).
  assert.equal(webProSatisDurumu(null), "var");
  assert.equal(webProSatisDurumu(""), "var");
  assert.equal(webProSatisDurumu("XYZ"), "var");
});

test("web: kayıtlı IP ülkesi Pro satış kararını besler", async () => {
  const { ulkeBelleginiSifirla, ULKE_ANAHTARI } = await import("./ulke.js");
  const depo = new Map();
  const onceki = globalThis.localStorage;
  globalThis.localStorage = { getItem: (k) => depo.get(k) ?? null, setItem: (k, v) => depo.set(k, v), key: () => null, length: 0 };
  try {
    depo.set(ULKE_ANAHTARI, JSON.stringify({ kod: "DE", zaman: Date.now() }));
    ulkeBelleginiSifirla();
    assert.equal(kayitliProSatisDurumu(), "yok");
    assert.equal(proSatistaDegil(), true);
    depo.set(ULKE_ANAHTARI, JSON.stringify({ kod: "TR", zaman: Date.now() }));
    ulkeBelleginiSifirla();
    assert.equal(kayitliProSatisDurumu(), "var");
    assert.equal(proSatistaDegil(), false);
    depo.set(ULKE_ANAHTARI, "bozuk");
    ulkeBelleginiSifirla();
    assert.equal(kayitliProSatisDurumu(), "var");
  } finally {
    globalThis.localStorage = onceki;
    ulkeBelleginiSifirla();
  }
});

test("web: /api/ulke istemcisi hatada ve geçersiz yanıtta bilinen değeri korur", async () => {
  const { ulkeyiGuncelle, bilinenUlke, ulkeBelleginiSifirla, ulkeTazeMi, ULKE_ANAHTARI } = await import("./ulke.js");
  const depo = new Map();
  const onceki = globalThis.localStorage;
  globalThis.localStorage = { getItem: (k) => depo.get(k) ?? null, setItem: (k, v) => depo.set(k, v), key: () => null, length: 0 };
  const yanit = (govde, ok = true) => async () => ({ ok, json: async () => govde });
  try {
    ulkeBelleginiSifirla();
    assert.equal(await ulkeyiGuncelle({ getir: yanit({ ulke: "de" }) }), "DE");
    assert.equal(bilinenUlke(), "DE");
    assert.equal(ulkeTazeMi(), true);
    assert.equal(JSON.parse(depo.get(ULKE_ANAHTARI)).kod, "DE");
    assert.equal(await ulkeyiGuncelle({ getir: yanit({ ulke: null }) }), null);
    assert.equal(await ulkeyiGuncelle({ getir: yanit({}, false) }), null);
    assert.equal(await ulkeyiGuncelle({ getir: async () => { throw new Error("ağ"); } }), null);
    assert.equal(bilinenUlke(), "DE");
    assert.equal(ulkeTazeMi(Date.now() + 13 * 60 * 60 * 1000), false);
  } finally {
    globalThis.localStorage = onceki;
    ulkeBelleginiSifirla();
  }
});
