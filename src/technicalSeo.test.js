import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const oku = (yol) => readFile(new URL(yol, import.meta.url), "utf8");

test("ana sayfa paylaşım etiketleri ve JavaScript'siz okunabilir metin taşır", async () => {
  const html = await oku("../index.html");
  const gizle = await oku("../public/statik-gizle.js");
  for (const etiket of ["og:title", "og:description", "og:url", "og:type", "og:image", "twitter:card"])
    assert.match(html, new RegExp(`property="${etiket}"|name="${etiket}"`));
  assert.match(html, /https:\/\/borcama\.com\/og\/borcama-og\.png/);
  assert.match(html, /<div id="root"><main class="landing-static">[\s\S]*<\/main><\/div><!--\/root-->/);
  assert.match(html, /Borcunu gör, kontrolü al\./);
  // uygulama ekranlarında, oturum açıkken ve iOS kabuğunda statik metin gizlenir
  assert.match(gizle, /location\.pathname !== "\/" \|\| location\.hostname\.indexOf\("crm\."\) === 0 \|\| oturumVar \|\| window\.Capacitor/);
  // CSP satır içi betiği engeller; gizleme betiği ayrı dosyadan yüklenir
  assert.match(html, /<script src="\/statik-gizle\.js"><\/script>/);
  assert.doesNotMatch(html, /<script>\s*\/\/ Statik landing/);
});

test("ön oluşturulan SEO sayfaları kökü değiştirir, og etiketlerini tekrarlamaz ve ana sayfa şemasını taşımaz", async () => {
  const betik = await oku("../scripts/prerender-seo.mjs");
  assert.match(betik, /<div id="root">\[\\s\\S\]\*\?<\\\/div><!--\\\/root-->/);
  assert.match(betik, /og:\(title\|description\|url\|type\)/);
  assert.match(betik, /"WebApplication","name":"Borcama"/);
});
