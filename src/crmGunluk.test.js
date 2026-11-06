import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { gunDetayi, gunKaydir, gunlukSeri, gunYorumu, kaynakAdi, oncekiOrtalama, trGunu, trSaati } from "./crm/gunlukAnaliz.js";

// 6 Kasım 2026 15:00 Türkiye saati.
const SIMDI = Date.parse("2026-11-06T12:00:00Z");
const oturum = (t, giris, kaynak = "", olaylar = []) => ({ t, giris, kaynak, kanal: kaynak === "google" ? "organic" : "", olaylar: giris ? ["landing_visit", ...olaylar] : olaylar });

test("gün ve saat Türkiye saatine göre", () => {
  assert.equal(trGunu("2026-11-05T21:30:00Z"), "2026-11-06");
  assert.equal(trSaati("2026-11-05T21:30:00Z"), 0);
  assert.equal(trSaati("2026-11-06T12:00:00Z"), 15);
  assert.equal(gunKaydir("2026-11-01", -1), "2026-10-31");
  assert.equal(trGunu("bozuk"), null);
});

test("kaynak adları sadeleşir ve gruplanır", () => {
  assert.equal(kaynakAdi(""), "direct");
  assert.equal(kaynakAdi("www.Google.com"), "google.com");
  assert.equal(kaynakAdi("ig"), "instagram");
  assert.equal(kaynakAdi("m.facebook.com"), "facebook");
  assert.equal(kaynakAdi("borcama.com"), "site içi");
});

test("günlük seri: ziyaret, kaynak grubu, kayıt ekranı ve hesap güne düşer", () => {
  const oturumlar = [
    oturum("2026-11-06T08:00:00Z", "/finansal-sozluk/tasfiye", "google"),
    oturum("2026-11-06T09:00:00Z", "/", "", ["landing_scroll_half", "landing_cta_click", "register_view"]),
    oturum("2026-11-06T10:00:00Z", "/", "ig"),
    // Girişsiz oturum: yalnız kayıt ekranı (uygulamadan doğrudan).
    oturum("2026-11-06T10:30:00Z", "", "", ["register_view"]),
    // Türkiye saatiyle dün.
    oturum("2026-11-05T20:59:00Z", "/", "bing"),
    // 30 günden eski: seride yok.
    oturum("2026-09-01T10:00:00Z", "/", "google"),
  ];
  const kullanicilar = [
    { created_at: "2026-11-06T09:05:00Z", email_confirmed_at: "2026-11-06T09:06:00Z" },
    { created_at: "2026-11-06T11:00:00Z", email_confirmed_at: null },
  ];
  const seri = gunlukSeri(oturumlar, kullanicilar, { simdi: SIMDI });
  assert.equal(seri.length, 30);
  assert.equal(seri[0].gun, "2026-11-06");
  assert.equal(seri.at(-1).gun, "2026-10-08");
  assert.deepEqual(
    { ...seri[0] },
    { gun: "2026-11-06", ziyaret: 3, arama: 1, direct: 1, diger: 1, kayitEkrani: 2, yari: 1, cta: 1, urune: 0, appStore: 0, hesap: 2, dogrulanan: 1 },
  );
  assert.equal(seri[1].ziyaret, 1);
  assert.equal(seri[1].arama, 1);
  assert.equal(seri.reduce((t, s) => t + s.ziyaret, 0), 4);
});

test("önceki 7 gün ortalaması; yeterli geçmiş yoksa null", () => {
  const seri = Array.from({ length: 10 }, (_, i) => ({ gun: gunKaydir("2026-11-06", -i), ziyaret: i === 0 ? 20 : 10 }));
  assert.equal(oncekiOrtalama(seri, "2026-11-06", "ziyaret"), 10);
  assert.equal(oncekiOrtalama(seri, "2026-11-03", "ziyaret"), null);
  assert.equal(oncekiOrtalama(seri, "1999-01-01", "ziyaret"), null);
});

test("gün detayı: saatler, kaynaklar ve giriş sayfaları sıralı", () => {
  const oturumlar = [
    oturum("2026-11-06T08:00:00Z", "/finansal-sozluk/tasfiye", "google"),
    oturum("2026-11-06T08:20:00Z", "/finansal-sozluk/tasfiye", "google", ["register_view"]),
    oturum("2026-11-06T13:00:00Z", "/araclar/borc-kapatma-hesaplayici", "", ["debt_payoff_product_click"]),
    oturum("2026-11-06T13:10:00Z", "", "", ["register_view"]),
    oturum("2026-11-05T13:00:00Z", "/", "google"),
  ];
  const d = gunDetayi(oturumlar, "2026-11-06");
  assert.equal(d.saatler[11], 2);
  assert.equal(d.saatler[16], 1);
  assert.equal(d.saatler.reduce((a, b) => a + b, 0), 3);
  assert.deepEqual(d.kaynaklar.map((k) => [k.ad, k.ziyaret, k.kayitEkrani]), [["google", 2, 1], ["direct", 1, 0]]);
  assert.deepEqual(d.sayfalar.map((s) => [s.ad, s.ziyaret, s.urune]), [["/finansal-sozluk/tasfiye", 2, 0], ["/araclar/borc-kapatma-hesaplayici", 1, 1]]);
  assert.deepEqual(d.yerler, []);
});

test("içerikten ürüne geçiş yeri gün detayında sayılır", () => {
  const oturumlar = [
    { ...oturum("2026-11-06T08:00:00Z", "/finansal-sozluk/asgari-odeme", "google", ["content_product_click", "register_view"]), yer: "sozluk_hesap" },
    { ...oturum("2026-11-06T09:00:00Z", "/finansal-sozluk/faiz", "google", ["content_product_click"]), yer: "sozluk_hesap" },
    { ...oturum("2026-11-06T10:00:00Z", "/finansal-sozluk/tasfiye", "", ["content_product_click"]), yer: "tasfiye_birikim" },
  ];
  assert.deepEqual(gunDetayi(oturumlar, "2026-11-06").yerler.map((y) => [y.ad, y.ziyaret, y.kayitEkrani]), [["sozluk_hesap", 2, 1], ["tasfiye_birikim", 1, 0]]);
});

test("gün yorumu ortalamayla karşılaştırır, baskın kaynağı ve sayfayı söyler", () => {
  const seri = Array.from({ length: 10 }, (_, i) => ({ gun: gunKaydir("2026-11-06", -i), ziyaret: i === 0 ? 8 : 4, kayitEkrani: 0, hesap: 0, dogrulanan: 0 }));
  const detay = { kaynaklar: [{ ad: "google", ziyaret: 6 }], sayfalar: [{ ad: "/finansal-sozluk/tasfiye", ziyaret: 5 }] };
  assert.deepEqual(gunYorumu(seri, "2026-11-06", detay), [
    "8 ziyaret, önceki 7 günün ortalamasının (4) %100 üstünde.",
    "Ziyaretin çoğu google kaynağından (6/8).",
    "En çok girilen sayfa: /finansal-sozluk/tasfiye (5).",
    "Kayıt ekranına geçen olmadı.",
  ]);
  const bos = [{ gun: "2026-11-06", ziyaret: 0, kayitEkrani: 0, hesap: 0 }];
  assert.deepEqual(gunYorumu(bos, "2026-11-06", { kaynaklar: [], sayfalar: [] }), ["Bu gün siteye giriş yok."]);
});

test("Backoffice oturum özetinde kimlik yok; Günlük menüde ve CRM yolunda", async () => {
  const [edge, crm, main] = await Promise.all([
    readFile(new URL("../supabase/functions/backoffice/index.ts", import.meta.url), "utf8"),
    readFile(new URL("./crm/CrmApp.jsx", import.meta.url), "utf8"),
    readFile(new URL("./main.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(edge, /const oturumlar = \[\.\.\.ozet\.values\(\)\]\.map\(\(o\) => \(\{ t: o\.t, giris: o\.giris, kaynak: o\.kaynak, kanal: o\.kanal, yer: o\.yer, olaylar: \[\.\.\.o\.olaylar\] \}\)\);/);
  assert.match(crm, /\["gunluk", "Günlük", CalendarDays\]/);
  assert.match(main, /"\/gunluk": "gunluk"/);
});
