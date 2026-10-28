import test from "node:test";
import assert from "node:assert/strict";
import {
  DIL_ADLARI,
  belgeDiliniAyarla,
  cevir,
  cevirOgeler,
  digerDil,
  dil,
  dilBelirle,
  dilBelleginiSifirla,
  webUygulamaYoluMu,
  diliDegistirVeYenile,
  locale,
  t,
} from "./i18n.js";
import tr from "./locales/tr.js";
import en from "./locales/en.js";

test("web: Türkçe kalan sayfalarda (landing, SEO, CRM) ve botlarda dil daima Türkçe", () => {
  for (const yol of ["/", "/araclar/kredi-karti", "/rehber", "/finansal-sozluk/faiz", "/classic", "/landing-v2", "/backoffice", "/ceo", ""]) {
    assert.equal(dilBelirle({ native: false, kayitli: "en", tarayiciDili: "en-US", yol }), "tr", yol);
  }
  assert.equal(dilBelirle({ native: false, kayitli: "en", tarayiciDili: "en-US", yol: "/summary", crm: true }), "tr");
  assert.equal(dilBelirle({ native: false, tarayiciDili: "en-US", yol: "/faq", bot: true }), "tr");
  // Node'da konum yok: Türkçe.
  assert.equal(dil(), "tr");
  assert.equal(locale(), "tr-TR");
});

test("web: uygulama içi yollarda kayıtlı seçim → tarayıcı dili → Türkçe", () => {
  assert.equal(dilBelirle({ native: false, tarayiciDili: "tr-TR", yol: "/login" }), "tr");
  assert.equal(dilBelirle({ native: false, tarayiciDili: "en-US", yol: "/login" }), "en");
  assert.equal(dilBelirle({ native: false, tarayiciDili: "de-DE", yol: "/settings/" }), "de");
  assert.equal(dilBelirle({ native: false, tarayiciDilleri: ["ru-RU", "fr-FR", "en"], yol: "/summary" }), "fr");
  assert.equal(dilBelirle({ native: false, tarayiciDilleri: ["ru-RU", "pt-BR"], yol: "/summary" }), "tr");
  assert.equal(dilBelirle({ native: false, kayitli: "it", tarayiciDili: "tr-TR", yol: "/privacy" }), "it");
  assert.equal(dilBelirle({ native: false, kayitli: "xx", tarayiciDili: "es-ES", yol: "/register" }), "es");
  // "/" yalnız oturum varken uygulamadır.
  assert.equal(dilBelirle({ native: false, tarayiciDili: "en-US", yol: "/", oturumVar: true }), "en");
  assert.equal(webUygulamaYoluMu("/terms"), true);
  assert.equal(webUygulamaYoluMu("/araclar"), false);
  assert.equal(webUygulamaYoluMu("/"), false);
});

test("native kararı yol, bot ve CRM bilgisinden etkilenmez", () => {
  assert.equal(dilBelirle({ native: true, tarayiciDili: "de-DE", yol: "/", bot: true }), "de");
  assert.equal(dilBelirle({ native: true, kayitli: "en", tarayiciDili: "tr-TR", yol: "/araclar" }), "en");
});

test("native'de kayıtlı seçim cihaz dilinden önce gelir", () => {
  assert.equal(dilBelirle({ native: true, kayitli: "tr", tarayiciDili: "en-GB" }), "tr");
  assert.equal(dilBelirle({ native: true, kayitli: "en", tarayiciDili: "tr-TR" }), "en");
});

test("native'de kayıt yoksa cihaz diline bakar; desteklenmeyen dil İngilizce", () => {
  assert.equal(dilBelirle({ native: true, tarayiciDili: "tr-TR" }), "tr");
  assert.equal(dilBelirle({ native: true, tarayiciDili: "TR" }), "tr");
  assert.equal(dilBelirle({ native: true, tarayiciDili: "de-DE" }), "de");
  assert.equal(dilBelirle({ native: true, tarayiciDili: "fr-CA" }), "fr");
  assert.equal(dilBelirle({ native: true, tarayiciDili: "pt-BR" }), "en");
  assert.equal(dilBelirle({ native: true, kayitli: "it", tarayiciDili: "" }), "it");
  assert.equal(dilBelirle({ native: true, kayitli: "xx", tarayiciDili: "" }), "en");
});

test("yüklenmemiş/eksik yeni dil Türkçeye değil İngilizceye düşer", () => {
  assert.equal(cevir("it", "__yalnizEn__"), "__yalnizEn__");
  assert.equal(cevir("fr", "dil.degistir"), cevir("en", "dil.degistir"));
  assert.notEqual(cevir("fr", "dil.degistir"), cevir("tr", "dil.degistir"));
});

test("locale dil koduna karşılık gelir", () => {
  assert.equal(locale("tr"), "tr-TR");
  assert.equal(locale("en"), "en-US");
  assert.equal(locale("xx"), "tr-TR");
});

test("eksik anahtar Türkçeye, o da yoksa anahtarın kendisine düşer", () => {
  assert.equal(cevir("en", "__yok__"), "__yok__");
  const ilk = Object.keys(tr)[0];
  if (ilk) assert.equal(cevir("tr", ilk), tr[ilk]);
});

test("değişkenler yerine konur, tanımsız olanlar korunur", () => {
  assert.equal(cevir("tr", "Merhaba {ad}, {yok}", { ad: "Özer" }), "Merhaba Özer, {yok}");
  assert.equal(t("{n} borç", { n: 3 }), "3 borç");
});

test("İngilizce sözlükte Türkçede olmayan anahtar ya da değişken yok", () => {
  // İngilizce yalnız native'de görünür; web'e özgü değişkenleri (ör. "tarayıcı")
  // kullanmayabilir ama Türkçede olmayan bir değişken isteyemez.
  const degiskenler = (m) => [...String(m).matchAll(/\{(\w+)\}/g)].map((x) => x[1]);
  for (const [anahtar, metin] of Object.entries(en)) {
    assert.ok(anahtar in tr, `tr.js'te eksik: ${anahtar}`);
    assert.equal(typeof metin, "string", `metin değil: ${anahtar}`);
    assert.ok(metin.trim(), `boş çeviri: ${anahtar}`);
    for (const ad of degiskenler(metin)) {
      // {simge} her çeviride kendiliğinden sağlanan ortak değişkendir.
      if (ad === "simge") continue;
      assert.ok(degiskenler(tr[anahtar]).includes(ad), `${anahtar}: {${ad}} Türkçede yok`);
    }
  }
});

test("öğeli çeviri yer tutucuyu verilen değerle (öğe olabilir) değiştirir", () => {
  const oge = { tip: "b" };
  assert.deepEqual(cevirOgeler("tr", "{e} adresine yolladık.", { e: oge }), [oge, " adresine yolladık."]);
  assert.deepEqual(cevirOgeler("tr", "Önce {a}, sonra {yok}.", { a: 1 }), ["Önce ", 1, ", sonra ", "{yok}", "."]);
});

test("Türkçe anahtarların tamamının İngilizce karşılığı var", () => {
  for (const anahtar of Object.keys(tr)) {
    assert.ok(anahtar in en, `en.js'te eksik: ${anahtar}`);
  }
});

test("kaynakta t()/tOgeler()/Ceviri ile kullanılan her anahtar iki sözlükte de var", async () => {
  const { readFile, readdir } = await import("node:fs/promises");
  const dosyalar = (await readdir(new URL("./", import.meta.url)))
    .filter((d) => /\.(jsx?|mjs)$/.test(d) && !d.includes(".test."));
  let toplam = 0;
  for (const dosya of dosyalar) {
    const kaynak = await readFile(new URL(`./${dosya}`, import.meta.url), "utf8");
    const anahtarlar = [
      ...kaynak.matchAll(/\bt(?:Ogeler)?\(\s*"([\w.-]+\.[\w.-]+)"/g),
      ...kaynak.matchAll(/anahtar=\{?"([\w.-]+\.[\w.-]+)"/g),
    ].map((m) => m[1]);
    toplam += anahtarlar.length;
    for (const anahtar of anahtarlar) {
      assert.ok(anahtar in tr, `${dosya}: tr sözlüğünde yok: ${anahtar}`);
      assert.ok(anahtar in en, `${dosya}: en sözlüğünde yok: ${anahtar}`);
    }
  }
  assert.ok(toplam > 100);
});

test("dil düğmesi karşı dili kendi adıyla gösterir", () => {
  assert.equal(digerDil("tr"), "en");
  assert.equal(digerDil("en"), "tr");
  assert.equal(DIL_ADLARI[digerDil("tr")], "English");
  assert.equal(DIL_ADLARI[digerDil("en")], "Türkçe");
});

test("web'de dil değiştirme seçimi kaydeder ve sayfayı yeniler (native ile aynı)", () => {
  const yazilan = [];
  let yenilendi = false;
  const oncekiDepo = globalThis.localStorage;
  const oncekiKonum = Object.getOwnPropertyDescriptor(globalThis, "location");
  globalThis.localStorage = { getItem: () => null, setItem: (k, v) => yazilan.push([k, v]), key: () => null, length: 0 };
  Object.defineProperty(globalThis, "location", { value: { pathname: "/settings", hostname: "borcama.com", reload: () => { yenilendi = true; } }, configurable: true });
  try {
    dilBelleginiSifirla();
    diliDegistirVeYenile("de");
    assert.deepEqual(yazilan, [["borcama_dil", "de"]]);
    assert.equal(yenilendi, true);
    assert.equal(dil(), "de");
  } finally {
    globalThis.localStorage = oncekiDepo;
    if (oncekiKonum) Object.defineProperty(globalThis, "location", oncekiKonum);
    else delete globalThis.location;
    dilBelleginiSifirla();
  }
});

test("açılışta <html lang> seçili dile eşitlenir", () => {
  const onceki = globalThis.document;
  globalThis.document = { documentElement: { lang: "" } };
  try {
    belgeDiliniAyarla();
    assert.equal(globalThis.document.documentElement.lang, "tr");
  } finally {
    globalThis.document = onceki;
  }
});

test("dil düğmesi, dil ve para birimi ayarı native ve web'de çizilir, açılış lang'i ayarlar", async () => {
  const { readFile } = await import("node:fs/promises");
  const oku = (d) => readFile(new URL(`./${d}`, import.meta.url), "utf8");
  for (const dosya of ["DilDugmesi.jsx", "DilAyari.jsx", "ParaBirimiAyari.jsx"]) {
    assert.doesNotMatch(await oku(dosya), /nativeMi/, dosya);
  }
  // Onboarding yalnız native; oradaki seçici native'e özgü kalır.
  assert.match(await oku("ParaBirimiSecici.jsx"), /if \(!nativeMi\) return null;/);
  // Kurulum akisinda dil ilk adim (DESTEKLENEN_DILLER listesi); giris/kayit kabugunda kisa dil cipi.
  assert.match(await oku("Onboarding.jsx"), /DESTEKLENEN_DILLER\.map/);
  assert.match(await oku("Auth.jsx"), /<DilDugmesi className="oa-cip kucuk oa-ust-sag" kisa \/>/);
  assert.match(await oku("App.jsx"), /<DilAyari \/>\s*<ParaBirimiAyari \/>/);
  // Para birimi kurulum akisinin ulke adiminda secilir (gizli <select>).
  assert.match(await oku("Onboarding.jsx"), /DESTEKLENEN_PARA_BIRIMLERI\.map/);
  assert.match(await oku("main.jsx"), /^belgeDiliniAyarla\(\);$/m);
});

test("tDeger veriyi değiştirmeden yalnız gösterimi çevirir, bilinmeyeni aynen döndürür", async () => {
  const { tDeger } = await import("./i18n.js");
  assert.equal(tDeger("Kredi kartı"), "Kredi kartı");
  assert.equal(tDeger("Bilinmeyen değer"), "Bilinmeyen değer");
  assert.equal(tDeger(""), "");
  assert.equal(tDeger(undefined), undefined);
});

test("bölüm sözlüklerinde aynı anahtar farklı Türkçe metinle tanımlanmamış", async () => {
  const { readdir } = await import("node:fs/promises");
  const dosyalar = (await readdir(new URL("./locales/bolumler/", import.meta.url))).filter((d) => d.endsWith(".js"));
  const gorulen = new Map();
  const gorulenEn = new Map();
  for (const dosya of dosyalar) {
    const bolum = await import(`./locales/bolumler/${dosya}`);
    for (const [anahtar, metin] of Object.entries(bolum.tr)) {
      if (gorulen.has(anahtar)) {
        assert.equal(metin, gorulen.get(anahtar).metin, `${anahtar}: ${dosya} ile ${gorulen.get(anahtar).dosya} çakışıyor`);
      } else gorulen.set(anahtar, { metin, dosya });
    }
    for (const [anahtar, metin] of Object.entries(bolum.en)) {
      assert.ok(anahtar in bolum.tr, `${dosya}: en'de olup tr'de olmayan anahtar ${anahtar}`);
      const onceki = gorulenEn.get(anahtar);
      if (onceki) assert.equal(metin, onceki.metin, `${anahtar}: İngilizcesi ${dosya} ile ${onceki.dosya} arasında farklı`);
      else gorulenEn.set(anahtar, { metin, dosya });
    }
  }
});
