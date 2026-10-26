import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

// Uygulama ici web sayfalari (giris, kayit, SSS, yasal) gercek bilesenlerle
// sunucu tarafinda cizilir ve cok dilli web oncesi ciktilarla (testVerisi/,
// 4d1e499'dan uretildi) karsilastirilir:
// - web + Turkce: birebir ayni (yalniz yeni dil dugmesi haric),
// - native (iOS, @capacitor/core taklidiyle) + tr/en: birebir ayni,
// - web + Ingilizce/Almanca: ilgili dilde.

class Depo {
  constructor() { this.m = new Map(); }
  get length() { return this.m.size; }
  key(i) { return [...this.m.keys()][i] ?? null; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

const kok = fileURLToPath(new URL("..", import.meta.url));
const oncekiDepo = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
const oncekiPencere = Object.getOwnPropertyDescriptor(globalThis, "window");
const oncekiKonum = Object.getOwnPropertyDescriptor(globalThis, "location");
Object.defineProperty(globalThis, "localStorage", { value: new Depo(), configurable: true, writable: true });
Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true, writable: true });
Object.defineProperty(globalThis, "location", {
  value: { search: "", pathname: "/login", hostname: "localhost", hash: "", origin: "http://localhost" },
  configurable: true,
  writable: true,
});

async function sunucu(native) {
  return createServer({
    root: kok,
    configFile: false,
    resolve: native ? { alias: { "@capacitor/core": `${kok}src/testVerisi/capacitorNative.js` } } : {},
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
    logLevel: "error",
    optimizeDeps: { noDiscovery: true },
  });
}

const oncekiUyari = console.warn;
console.warn = () => {};
const webSunucu = await sunucu(false);
const nativeSunucu = await sunucu(true);
const web = await webSunucu.ssrLoadModule("/src/testVerisi/webSayfalar.jsx");
const native = await nativeSunucu.ssrLoadModule("/src/testVerisi/webSayfalar.jsx");
console.warn = oncekiUyari;

after(async () => {
  await webSunucu.close();
  await nativeSunucu.close();
  for (const [ad, onceki] of [["localStorage", oncekiDepo], ["window", oncekiPencere], ["location", oncekiKonum]]) {
    if (onceki) Object.defineProperty(globalThis, ad, onceki);
    else delete globalThis[ad];
  }
});

const stilsiz = (html) => html.replace(/<style>[\s\S]*?<\/style>/g, "");
const dilDugmesiz = (html) => html.replace(/<label class="dil-dugmesi[^"]*"[\s\S]*?<\/label>/g, "");
const beklenen = (ad) => readFileSync(new URL(`./testVerisi/${ad}.html`, import.meta.url), "utf8");
const metin = (html) => stilsiz(html).replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");

test("web + Türkçe: uygulama içi sayfalar çok dilli öncesiyle birebir aynı", () => {
  for (const ad of web.SAYFA_ADLARI) {
    const html = stilsiz(web.sayfaCiz(ad, "tr"));
    assert.equal(dilDugmesiz(html), beklenen(`web-tr-${ad}`), ad);
  }
});

test("web giriş/kayıt ekranında dil düğmesi var, seçili dil Türkçe", () => {
  for (const ad of ["login", "register"]) {
    const html = web.sayfaCiz(ad, "tr");
    assert.match(html, /<label class="dil-dugmesi auth-dil" lang="tr">/, ad);
    assert.match(html, /<option value="en" lang="en">English<\/option>/, ad);
  }
});

test("native (iOS) + tr/en: çıktı değişmedi", () => {
  for (const dil of ["tr", "en"]) {
    for (const ad of native.SAYFA_ADLARI) {
      assert.equal(stilsiz(native.sayfaCiz(ad, dil)), beklenen(`native-${dil}-${ad}`), `${dil}:${ad}`);
    }
  }
});

test("web + İngilizce: uygulama içi sayfalar İngilizce, yasal metinler Paddle'lı web sürümü", () => {
  const giris = metin(web.sayfaCiz("login", "en"));
  assert.match(giris, /Back to home/);
  assert.doesNotMatch(giris, /Ana sayfaya dön|Hesabına giriş yap/);
  const kayit = metin(web.sayfaCiz("register", "en"));
  assert.doesNotMatch(kayit, /Ücretsiz|hesap oluştur/i);
  const sss = metin(web.sayfaCiz("faq", "en"));
  assert.match(sss, /Back to home/);
  assert.match(sss, /Paddle's secure customer portal/);
  assert.doesNotMatch(sss, /Sıkça|Ana sayfaya dön/);
  const sartlar = metin(web.sayfaCiz("terms", "en"));
  assert.match(sartlar, /Terms of Use/);
  assert.match(sartlar, /Merchant of Record/);
  assert.match(sartlar, /only to customers in Türkiye/);
  const iade = metin(web.sayfaCiz("refund-policy", "en"));
  assert.match(iade, /Refunds for web purchases \(Paddle\)/);
  const gizlilik = metin(web.sayfaCiz("privacy", "en"));
  assert.match(gizlilik, /Privacy Policy/);
  assert.match(gizlilik, /Approximate country \(web\)/);
  for (const ad of web.SAYFA_ADLARI) {
    assert.doesNotMatch(metin(web.sayfaCiz(ad, "en")), /Kullanıcı Sözleşmesi|KVKK Aydınlatma/, ad);
  }
});

test("native İngilizce yasal metinler web'e özgü Paddle bölümlerini almaz", () => {
  for (const ad of ["terms", "privacy", "refund-policy"]) {
    assert.doesNotMatch(metin(native.sayfaCiz(ad, "en")), /Paddle/, ad);
  }
});

test("web + Almanca: sözlük yüklenince giriş ekranı Almanca", async () => {
  await web.dilYukle("de");
  const giris = metin(web.sayfaCiz("login", "de"));
  assert.match(giris, /Zurück zur Startseite/);
  assert.doesNotMatch(giris, /Ana sayfaya dön|Back to home/);
});
