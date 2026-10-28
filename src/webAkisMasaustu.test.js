// Web akış PR-3 (docs/web-akis-direktifi.md §3 PR-3): büyük ekran kabuğu
// (A2, A4, B11, B15, B16). Görsel ve tarayıcı davranışı scripts/akis-denetimi.mjs
// ve scripts/kontrast-denetimi.mjs ile; burada kaynak sözleşmeleri ve
// bileşenlerin erişilebilirlik işaretleri.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import postcss from "postcss";
import { transformWithOxc } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as web from "./locales/bolumler/web.js";

const oku = (yol) => readFileSync(new URL(yol, import.meta.url), "utf8");
const app = oku("./App.jsx");
const onboarding = oku("./Onboarding.jsx");
const auth = oku("./Auth.jsx");
const main = oku("./main.jsx");
const css = oku("./masaustuKabuk.css");

// MasaustuKabuk.jsx'i node'da çizmek için derler (CSS içe aktarması atlanır).
const klasor = mkdtempSync(join(tmpdir(), "borcama-kabuk-"));
async function kabukModulu() {
  const { code } = await transformWithOxc(oku("./MasaustuKabuk.jsx"), "MasaustuKabuk.jsx", { jsx: { runtime: "automatic" } });
  const yeni = code
    .replace(/^import\s+"[^"]+\.css";?\s*$/m, "")
    .replace(/from\s+"([^"]+)"/g, (_, yol) => (yol.startsWith("./") ? `from "${new URL(yol, import.meta.url).href}"` : `from "${import.meta.resolve(yol)}"`));
  const hedef = join(klasor, "MasaustuKabuk.mjs");
  writeFileSync(hedef, yeni);
  return import(pathToFileURL(hedef).href);
}

test("Kabuk CSS'i ayrıştırılır; renkler yalnız token tanımında", () => {
  const kok = postcss.parse(css);
  const literal = [];
  kok.walkDecls((d) => {
    if (d.prop.startsWith("--")) return;
    if (/#[0-9a-f]{3,8}\b/i.test(d.value)) literal.push(`${d.parent.selector} { ${d.prop}: ${d.value} }`);
  });
  assert.deepEqual(literal, []);
});

test("A4: ≥1024 web'de yüzen düğmeler gizli; kurallar .mk-web ile sınırlı (iOS ve dar ekran aynı)", () => {
  const kok = postcss.parse(css);
  const masaustu = kok.nodes.find((n) => n.type === "atrule" && n.params.includes("min-width: 1024px"));
  assert.ok(masaustu, "1024 kuralı yok");
  const gizli = [];
  masaustu.walkRules((r) => {
    // Uygulama kuralları .mk-web köküne, önizleme kuralı yalnız web kurulumunda çizilen .mk-onizleme'ye bağlı.
    if (r.selector.includes(".bt-")) assert.match(r.selector, /\.bt-app\.mk-web|\.bt-hazir-bant|\.bt-app\.bt-hazir-acilis|^\.mk-onizleme /, r.selector);
    if (/bt-quick-add|bt-feedback-trigger/.test(r.selector) && r.toString().includes("display: none")) gizli.push(r.selector);
  });
  assert.ok(gizli.some((s) => s.includes(".bt-quick-add")) && gizli.some((s) => s.includes(".bt-feedback-trigger")));
  // .mk-web yalnız web'de: uygulama kökü ve .oa yüzeyleri nativeMi değilken alır.
  assert.match(app, /className=\{"bt-app" \+ \(nativeMi \? "" : " mk-web"\)/);
  assert.match(oku("./MasaustuKabuk.jsx"), /if \(nativeMi \|\| typeof window === "undefined"/);
});

test("A4: \"+ Ekle\" menüsü sırasıyla Harcama, Ödeme, Ekstre, Borç; her biri kendi akışını açar", () => {
  const bas = app.indexOf('sinif="mk-ekle-kap"');
  const menu = app.slice(bas, app.indexOf("/>", app.indexOf("maddeler={[", bas)));
  const sira = [...menu.matchAll(/anahtar: "(\w+)".*?masaustuEkle\("(\w+)"/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(sira, [["harcama", "harcama"], ["odeme", "odeme"], ["ekstre", "ekstre"], ["borc", "borc"]]);
  const ekle = app.slice(app.indexOf("function masaustuEkle("), app.indexOf("// Kurulum akisi tam ekran"));
  assert.match(ekle, /setForm\(\{ liste: "expenses", veri: \{\} \}\)/);
  assert.match(ekle, /setOdemeFormuIstegi/);
  assert.match(ekle, /setEkstreYuklemeIstegi/);
  assert.match(ekle, /setBorcTuruSecimiAcik\(true\)/);
  assert.match(ekle, /panelTetikleyicisiniAyarla\(tetikleyici\)/);
  // Başka sekmedeyken liste çizilmez; yalnız panel (sayfa yerinde kalır).
  for (const bilesen of ["Harcamalar", "Odemeler", "Borclar"]) assert.match(app, new RegExp(`<${bilesen} \\{\\.\\.\\.\\w+\\} yalnizPanel />`), bilesen);
});

test("A4/B11: ekleme ve düzenleme formları masaüstünde sağ panelde; satır içi yalnız dar ekranda", () => {
  for (const bilesen of ["Harcamalar", "Gelirler", "Varliklar", "Borclar"]) {
    const bas = app.indexOf(`function ${bilesen}(`);
    const govde = app.slice(bas, app.indexOf("\nfunction ", bas + 10));
    assert.match(govde, /const masaustu = useMasaustu\(\);/, bilesen);
    assert.match(govde, /const satirIci = acik && !masaustu;/, bilesen);
    assert.match(govde, /<SagPanel|<FormYeri/, bilesen);
  }
  assert.match(app, /function FormYeri\(\{ panel, baslik, aciklama, onKapat, hedef, children \}\)/);
  // Ödeme, ekstre ve borç türü seçicileri de panelde.
  assert.match(app, /<SagPanel baslik=\{t\("kabuk\.borcTuru\.baslik"\)\}/);
  assert.match(app, /<SagPanel baslik=\{t\("borclar\.yontem\.baslik"\)\}/);
  assert.match(app, /<SagPanel baslik=\{kartOdemePenceresi\.ad\}/);
});

test("SagPanel: diyalog, başlık bağlantısı, kapat düğmesi; menü düğmesi menü açar", async () => {
  const { SagPanel, AcilirMenu } = await kabukModulu();
  const panel = renderToStaticMarkup(React.createElement(SagPanel, { baslik: "Yeni harcama", onKapat() {} }, React.createElement("input", { className: "bt-input" })));
  assert.match(panel, /class="sag-panel" role="dialog" aria-modal="true" aria-labelledby="([^"]+)"/);
  const id = panel.match(/aria-labelledby="([^"]+)"/)[1];
  assert.ok(panel.includes(`id="${id}" class="sag-panel-baslik">Yeni harcama</h2>`));
  assert.match(panel, /class="sag-panel-kapat" aria-label="[^"]+"/);
  assert.equal(renderToStaticMarkup(React.createElement(SagPanel, { acik: false, baslik: "x" })), "");
  const menu = renderToStaticMarkup(React.createElement(AcilirMenu, { etiket: "Ekle", dugmeIcerigi: "Ekle", maddeler: [{ ad: "Harcama" }] }));
  assert.match(menu, /aria-haspopup="menu" aria-expanded="false"/);
  assert.doesNotMatch(menu, /role="menu"/);
  // Esc, odak tuzağı, ilk alana odak ve odağın düğmeye dönmesi.
  const kaynak = oku("./MasaustuKabuk.jsx");
  for (const parca of ['olay.key === "Escape"', 'olay.key !== "Tab"', "ilk?.focus({ preventScroll: true })", "donus.focus({ preventScroll: true })", 'document.body.style.overflow = "hidden"'])
    assert.ok(kaynak.includes(parca), parca);
});

test("A2: kayıt/kod iki sütun (560 + 440), kurulum önizlemeli, üst çubuk ortak", () => {
  assert.match(css, /\.oa \.mk-izgara\.mk-auth \{\s*grid-template-columns: minmax\(0, 560px\) minmax\(0, 440px\);/);
  assert.match(css, /\.mk-ust-ic \{[^}]*width: min\(1120px, calc\(100% - 64px\)\);[^}]*height: 72px;/);
  assert.match(auth, /<NeOlacak kayit=\{kayitModu\} \/>/);
  assert.match(onboarding, /onboardingSonucunuUygula\(veri, sonuc, \{/);
  assert.match(onboarding, /onizleme\(taslakVeri, \{ koyu, adim \}\)/);
  assert.match(app, /function KurulumOnizleme\(/);
  assert.match(app, /const h = useBugunHesaplari\(veri, kurTablosu, fiyatlar\);/);
  // Hazırsın: masaüstünde uygulama + lime bant; dar ekranda lime perde aynen.
  assert.match(onboarding, /onHazir\(\{ ilkOdeme:/);
  assert.match(onboarding, /<div className="oa-hazir">/);
  assert.match(app, /className="bt-hazir-bant" role="status"/);
});

test("B15/B16: hoş geldin ve yükleniyor web'de .oa yüzeyinde; glif yok, iOS aynı", () => {
  const webWelcome = main.slice(main.indexOf("function WebWelcome()"), main.indexOf("function EskiWelcome()"));
  assert.doesNotMatch(webWelcome, /✦|border:|boxShadow/);
  assert.match(webWelcome, /className=\{`oa oa-hosgeldin/);
  assert.match(main, /return nativeMi \? <EskiWelcome \/> : <WebWelcome \/>;/);
  const yukleniyor = main.slice(main.indexOf("function Yukleniyor()"), main.indexOf("function YapilandirmaEksik()"));
  assert.match(yukleniyor, /if \(nativeMi\)/);
  assert.match(yukleniyor, /className=\{`oa oa-yukleniyor/);
});

test("Yeni metinler 6 dilde, dolu, ünlemsiz; yer tutucular aynı", () => {
  const anahtarlar = Object.keys(web.tr).filter((k) => /^web\.(kabuk|panel|kurulum)\./.test(k));
  assert.ok(anahtarlar.length >= 30, String(anahtarlar.length));
  for (const dil of ["tr", "en", "de", "fr", "es", "it"]) {
    for (const k of anahtarlar) {
      const metin = web[dil][k];
      assert.equal(typeof metin, "string", `${dil}:${k}`);
      assert.ok(metin.trim() && !metin.includes("!"), `${dil}:${k}`);
      assert.deepEqual(metin.match(/\{\w+\}/g) || [], web.tr[k].match(/\{\w+\}/g) || [], `${dil}:${k}`);
    }
  }
  assert.equal(web.tr["web.kabuk.ekle"], "Ekle");
  assert.deepEqual(["harcama", "odeme", "ekstre", "borc"].map((k) => web.tr[`web.kabuk.ekle.${k}`]), ["Harcama", "Ödeme", "Ekstre", "Borç"]);
});
