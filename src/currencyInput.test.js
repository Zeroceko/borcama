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

test("web'de kayıtlı seçim kullanılır ve Ayarlar'dan değiştirilebilir (native ile aynı)", async () => {
  const { kullaniciParaBirimi, paraBirimiAyarla } = await import("./currencyInput.js");
  const depo = new Map();
  const onceki = globalThis.localStorage;
  globalThis.localStorage = { getItem: (k) => depo.get(k) ?? null, setItem: (k, v) => depo.set(k, v), key: () => null, length: 0 };
  try {
    depo.set("borcama_para_birimi", "USD");
    assert.equal(kullaniciParaBirimi(), "USD");
    assert.equal(paraBirimiAyarla("EUR"), "EUR");
    assert.equal(depo.get("borcama_para_birimi"), "EUR");
    assert.equal(kullaniciParaBirimi(), "EUR");
  } finally {
    globalThis.localStorage = onceki;
  }
});

test("web'de mevcut hesap TRY'de kalır, yeni hesap ve Türkçe dışı dilde IP ülkesi kullanılır", async () => {
  const { paraBirimiBelirle, webYeniHesapMi, WEB_BOLGESEL_PARA_BIRIMI_BASLANGICI } = await import("./currencyInput.js");
  // Türkçe arayüz (tarayıcı dili tr): her koşulda TRY — eski web davranışı.
  assert.equal(paraBirimiBelirle({ native: false, dilKodu: "tr", ulke: "DE", yerelAyar: "de-DE" }), "TRY");
  // Mevcut hesap: dil ne olursa olsun TRY.
  assert.equal(paraBirimiBelirle({ native: false, dilKodu: "en", ulke: "US", mevcutKurulum: true }), "TRY");
  // Yeni hesap: IP ülkesi tarayıcı bölgesinden önce gelir.
  assert.equal(paraBirimiBelirle({ native: false, dilKodu: "en", ulke: "DE", yerelAyar: "en-US" }), "EUR");
  assert.equal(paraBirimiBelirle({ native: false, dilKodu: "en", ulke: "TR", yerelAyar: "en-US" }), "TRY");
  assert.equal(paraBirimiBelirle({ native: false, dilKodu: "en", ulke: null, yerelAyar: "en-GB" }), "GBP");
  assert.equal(paraBirimiBelirle({ native: false, dilKodu: "en", ulke: "BR", yerelAyar: "en-US" }), "USD");
  // Native IP ülkesine bakmaz; cihaz bölgesi esastır.
  assert.equal(paraBirimiBelirle({ native: true, dilKodu: "en", ulke: "DE", yerelAyar: "en-US" }), "USD");
  // Hesap açılış tarihi sınırı.
  assert.equal(webYeniHesapMi("2026-01-01T00:00:00Z"), false);
  assert.equal(webYeniHesapMi(WEB_BOLGESEL_PARA_BIRIMI_BASLANGICI), true);
  assert.equal(webYeniHesapMi(null), false);
  assert.equal(webYeniHesapMi("geçersiz"), false);
});

test("web'de oturumlu eski hesap TRY'ye kaydedilir, oturumsuz ekranda karar kaydedilmez", async () => {
  const { kullaniciParaBirimi } = await import("./currencyInput.js");
  const { dilBelleginiSifirla } = await import("./i18n.js");
  const depo = new Map();
  const oncekiDepo = globalThis.localStorage;
  const oncekiKonum = Object.getOwnPropertyDescriptor(globalThis, "location");
  const oncekiGezgin = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  globalThis.localStorage = {
    getItem: (k) => depo.get(k) ?? null,
    setItem: (k, v) => depo.set(k, String(v)),
    key: (i) => [...depo.keys()][i] ?? null,
    get length() { return depo.size; },
  };
  Object.defineProperty(globalThis, "location", { value: { pathname: "/summary", hostname: "borcama.com" }, configurable: true });
  Object.defineProperty(globalThis, "navigator", { value: { language: "en-US", languages: ["en-US"], userAgent: "" }, configurable: true });
  try {
    dilBelleginiSifirla();
    // Oturum yok (giriş öncesi): yeni ziyaretçi için bölgesel birim gösterilir ama kaydedilmez.
    assert.equal(kullaniciParaBirimi(), "USD");
    assert.equal(depo.has("borcama_para_birimi"), false);
    // Eski hesapla oturum: TRY kaydedilir.
    depo.set("sb-proje-auth-token", JSON.stringify({ user: { created_at: "2026-03-01T10:00:00Z" } }));
    assert.equal(kullaniciParaBirimi(), "TRY");
    assert.equal(depo.get("borcama_para_birimi"), "TRY");
    // Yeni hesap: bölgesel birim kaydedilir.
    depo.delete("borcama_para_birimi");
    depo.set("sb-proje-auth-token", JSON.stringify({ user: { created_at: "2027-01-01T10:00:00Z" } }));
    assert.equal(kullaniciParaBirimi(), "USD");
    assert.equal(depo.get("borcama_para_birimi"), "USD");
  } finally {
    globalThis.localStorage = oncekiDepo;
    if (oncekiKonum) Object.defineProperty(globalThis, "location", oncekiKonum);
    else delete globalThis.location;
    if (oncekiGezgin) Object.defineProperty(globalThis, "navigator", oncekiGezgin);
    dilBelleginiSifirla();
  }
});

test("native'de varsayılan birim cihaz bölgesinden gelir, desteklenmeyen bölge USD olur", async () => {
  const { bolgedenParaBirimi, bolgeKodu } = await import("./currencyInput.js");
  assert.equal(bolgeKodu("en-US"), "US");
  assert.equal(bolgeKodu("tr_TR"), "TR");
  assert.equal(bolgeKodu("zh-Hant-TW"), "TW");
  assert.equal(bolgeKodu("de-u-ca-gregory"), "");
  assert.equal(bolgedenParaBirimi("tr-TR"), "TRY");
  assert.equal(bolgedenParaBirimi("en-TR"), "TRY");
  assert.equal(bolgedenParaBirimi("en-US"), "USD");
  assert.equal(bolgedenParaBirimi("en-GB"), "GBP");
  assert.equal(bolgedenParaBirimi("de-DE"), "EUR");
  assert.equal(bolgedenParaBirimi("fr-FR"), "EUR");
  assert.equal(bolgedenParaBirimi("es-ES"), "EUR");
  assert.equal(bolgedenParaBirimi("en-CA"), "CAD");
  assert.equal(bolgedenParaBirimi("en-AU"), "AUD");
  assert.equal(bolgedenParaBirimi("de-CH"), "CHF");
  assert.equal(bolgedenParaBirimi("ja-JP"), "JPY");
  assert.equal(bolgedenParaBirimi("pt-BR"), "USD");
  assert.equal(bolgedenParaBirimi("en"), "USD");
  assert.equal(bolgedenParaBirimi("tr"), "TRY");
  assert.equal(bolgedenParaBirimi(""), "USD");
});

test("para birimi kararı: kayıtlı seçim önce, mevcut kurulum ve Türkçe TRY'de kalır", async () => {
  const { paraBirimiBelirle } = await import("./currencyInput.js");
  assert.equal(paraBirimiBelirle({ native: false, kayitli: "USD", dilKodu: "en", yerelAyar: "en-US" }), "USD");
  assert.equal(paraBirimiBelirle({ native: false, dilKodu: "tr", yerelAyar: "en-US" }), "TRY");
  assert.equal(paraBirimiBelirle({ native: true, kayitli: "EUR", dilKodu: "en", yerelAyar: "en-US" }), "EUR");
  assert.equal(paraBirimiBelirle({ native: true, kayitli: "XYZ", dilKodu: "en", yerelAyar: "en-GB" }), "GBP");
  assert.equal(paraBirimiBelirle({ native: true, dilKodu: "en", yerelAyar: "en-US" }), "USD");
  assert.equal(paraBirimiBelirle({ native: true, dilKodu: "en", yerelAyar: "en-US", mevcutKurulum: true }), "TRY");
  assert.equal(paraBirimiBelirle({ native: true, dilKodu: "tr", yerelAyar: "tr-DE" }), "TRY");
});

test("seçilen birim biçime ve {simge} içeren etiketlere yansır", async () => {
  const { paraBirimiSimgesi } = await import("./currencyInput.js");
  const { cevir, t } = await import("./i18n.js");
  assert.equal(paraBiriminiFormatla(1234.5, "USD", { locale: "en-US" }), "$1,234.50");
  assert.equal(paraBiriminiFormatla(1234.5, "EUR", { locale: "en-US" }), "€1,234.50");
  assert.equal(paraBiriminiFormatla(1234.5, "JPY", { locale: "en-US" }), "¥1,235");
  assert.equal(paraBirimiSimgesi("USD", "en-US"), "$");
  assert.equal(paraBirimiSimgesi("TRY", "tr-TR"), "₺");
  // Web'de {simge} ₺ ile dolar; açık verilen değer önceliklidir.
  assert.equal(cevir("tr", "borclar.alan.kartLimiti"), "Toplam kart limiti (₺)");
  assert.equal(cevir("en", "borclar.alan.kartLimiti", { simge: "$" }), "Total credit limit ($)");
  assert.equal(t("borclar.alan.kartLimiti"), "Toplam kart limiti (₺)");
});

test("para biçimi locale seçeneğiyle İngilizce gösterilebilir, TL biçimi sabit kalır", () => {
  assert.equal(paraBiriminiFormatla(1234.56, "USD", { locale: "en-US" }), "$1,234.56");
  assert.equal(turkLirasiFormatla(1234.56, { locale: "en-US" }), "₺1,234.56");
  assert.equal(turkLirasiFormatla(1234.56), "₺1.234,56");
});

test("BDDK asgari oranı yalnız TRY'de uygulanır", async () => {
  const { yasalAsgariUygulanir } = await import("./creditCardMinimum.js");
  assert.equal(yasalAsgariUygulanir("TRY"), true);
  assert.equal(yasalAsgariUygulanir("USD"), false);
  assert.equal(yasalAsgariUygulanir("EUR"), false);
  assert.equal(yasalAsgariUygulanir(), true);
});

test("para birimi adı seçili dilde verilir", async () => {
  const { paraBirimiAdi, DESTEKLENEN_PARA_BIRIMLERI } = await import("./currencyInput.js");
  assert.equal(paraBirimiAdi("USD", "en-US"), "US Dollar");
  assert.match(paraBirimiAdi("TRY", "tr-TR"), /Türk Lirası/i);
  assert.ok(DESTEKLENEN_PARA_BIRIMLERI.includes("TRY") && DESTEKLENEN_PARA_BIRIMLERI.includes("USD"));
});
