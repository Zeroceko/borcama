import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { transformWithOxc } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { tr as yasalTr, en as yasalEn } from "./locales/bolumler/yasal.js";

const TASLAK_NOTU =
  "// TASLAK — hukuk kontrolü bekliyor (Legal review pending). Yayından önce avukat onayı gerekir.";

// Legal.jsx ve LegalEn.jsx'i JSX'ten derleyip node'da içe aktarır; göreli
// .js içe aktarmaları src'deki asıl dosyalara, paketler bu testin
// çözümlemesine yönlendirilir.
const geciciKlasor = mkdtempSync(join(tmpdir(), "borcama-legal-"));
async function derle(ad) {
  const kaynak = readFileSync(new URL(`./${ad}`, import.meta.url), "utf8");
  const { code } = await transformWithOxc(kaynak, ad, { jsx: { runtime: "automatic" } });
  const yeniKod = code.replace(/from\s+"([^"]+)"/g, (_, yol) => {
    if (yol.endsWith(".jsx")) return `from "${pathToFileURL(join(geciciKlasor, yol.replace(/^\.\//, "") + ".mjs")).href}"`;
    if (yol.startsWith("./")) return `from "${new URL(yol, import.meta.url).href}"`;
    return `from "${import.meta.resolve(yol)}"`;
  });
  const hedef = join(geciciKlasor, `${ad}.mjs`);
  writeFileSync(hedef, yeniKod);
  return hedef;
}
await derle("LegalEn.jsx");
const legal = await import(pathToFileURL(await derle("Legal.jsx")).href);
const legalEn = await import(pathToFileURL(join(geciciKlasor, "LegalEn.jsx.mjs")).href);

const ciz = (Bilesen, props = {}) => renderToStaticMarkup(React.createElement(Bilesen, props));

test("İngilizce taslaklar hukuk kontrolü notu taşır", () => {
  const kaynak = readFileSync(new URL("./LegalEn.jsx", import.meta.url), "utf8");
  assert.ok(kaynak.startsWith(TASLAK_NOTU));
  // Her taslak bileşeninin üstünde not var.
  for (const ad of ["TermsOfUseEn", "PrivacyPolicyEn", "RefundPolicyEn"]) {
    assert.ok(kaynak.includes(`${TASLAK_NOTU}\nexport function ${ad}(`), ad);
  }
});

test("İngilizce gizlilik politikası GDPR bölümlerini içerir", () => {
  const html = ciz(legalEn.PrivacyPolicyEn);
  for (const parca of [
    "General Data Protection Regulation",
    "Art. 6",
    "zero@borcama.com",
    "Supabase",
    "Sentry",
    "RevenueCat",
    "Apple",
    "Delete my account",
    "data portability",
    "supervisory authority",
    "Standard Contractual Clauses",
    "does not load Google Analytics, Google Ads",
    "We do not sell",
    "Children",
    "Özer Öcek (sole proprietor), Istanbul, Türkiye",
  ]) {
    assert.ok(html.includes(parca), `eksik: ${parca}`);
  }
});

test("İngilizce kullanım şartları Apple aboneliğini ve sınırları anlatır", () => {
  const html = ciz(legalEn.TermsOfUseEn);
  for (const parca of [
    "Apple is the seller",
    "renews automatically",
    "Apple Account → Subscriptions",
    "Licensed Application End User License Agreement",
    "not a bank",
    "Turkish banks",
  ]) {
    assert.ok(html.includes(parca), `eksik: ${parca}`);
  }
});

test("İngilizce iade politikası iadeyi Apple'a yönlendirir", () => {
  const html = ciz(legalEn.RefundPolicyEn);
  assert.ok(html.includes("https://reportaproblem.apple.com"));
  assert.ok(html.includes("Borcama cannot issue refunds for App Store purchases"));
});

test("İngilizce yalnız native ve dil Türkçe değilken seçilir", () => {
  const kaynak = readFileSync(new URL("./Legal.jsx", import.meta.url), "utf8");
  assert.match(kaynak, /const ingilizceMi = \(\) => nativeMi && dil\(\) !== "tr";/);
  for (const [ad, bilesen] of [
    ["KullaniciSozlesmesi", "TermsOfUseEn"],
    ["IadePolitikasi", "RefundPolicyEn"],
    ["GizlilikMetni", "PrivacyPolicyEn"],
  ]) {
    assert.match(
      kaynak,
      new RegExp(`export function ${ad}\\(\\{ embedded = false \\}\\) \\{\\n  if \\(ingilizceMi\\(\\)\\) \\{[\\s\\S]{0,160}embedded=\\{embedded\\}>\\n        <${bilesen} />`),
    );
  }
});

test("web/Türkçe çıktıda yasal metinler Türkçe kalır", () => {
  const tr = [
    [legal.KullaniciSozlesmesi, ["Kullanıcı Sözleşmesi", "Yürürlük tarihi: 9 Ağustos 2026 · Sürüm 1.1", "Borcama bir banka, ödeme kuruluşu", "Paddle"]],
    [legal.GizlilikMetni, ["Gizlilik ve KVKK Aydınlatma Metni", "Yürürlük tarihi: 13 Temmuz 2026 · Sürüm 1.0", "6698 sayılı Kişisel Verilerin Korunması Kanunu", "KVKK’nın 11. maddesi"]],
    [legal.IadePolitikasi, ["İptal ve İade Politikası", "Yürürlük tarihi: 9 Ağustos 2026 · Sürüm 1.0", "Paddle", "reportaproblem.apple.com"]],
  ];
  for (const [Bilesen, parcalar] of tr) {
    const html = ciz(Bilesen, { embedded: true });
    for (const parca of parcalar) assert.ok(html.includes(parca), `eksik: ${parca}`);
    for (const ingilizce of ["Privacy Policy", "Terms of Use", "General Data Protection", "Effective date"]) {
      assert.ok(!html.includes(ingilizce), `Türkçe çıktıda İngilizce: ${ingilizce}`);
    }
  }
});

test("Web sayfasında üst ve alt bağlantılar eski metni korur", () => {
  globalThis.window = { location: { search: "" }, history: { back() {} } };
  try {
    const html = ciz(legal.GizlilikMetni);
    for (const parca of ["Ana sayfaya dön", ">Kullanıcı Sözleşmesi<", ">Gizlilik ve KVKK<", ">İade Politikası<"]) {
      assert.ok(html.includes(parca), `eksik: ${parca}`);
    }
  } finally {
    delete globalThis.window;
  }
});

test("yasal sözlük tr değerleri eski metinle aynı, en dolu", () => {
  assert.deepEqual(yasalTr, {
    "yasal.geri": "Geri",
    "yasal.yururluk": "Yürürlük tarihi: {tarih} · Sürüm {surum}",
    "yasal.link.sozlesme": "Kullanıcı Sözleşmesi",
    "yasal.link.gizlilik": "Gizlilik ve KVKK",
    "yasal.link.iade": "İade Politikası",
  });
  assert.deepEqual(Object.keys(yasalEn).sort(), Object.keys(yasalTr).sort());
});

test("İngilizce yasal metinlerde doldurulmamış yer tutucu kalmaz", async () => {
  const kaynak = readFileSync(new URL("./LegalEn.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(kaynak, /\[(LEGAL ENTITY|COMPANY ADDRESS|DPO|RETENTION|EFFECTIVE DATE|MINIMUM AGE)/);
});
