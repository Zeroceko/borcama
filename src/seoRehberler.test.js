import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { FINANSAL_SOZLUK, finansalSozlukTerimi } from "./financialGlossary.js";
import { REHBER_KAYNAKLARI, REHBERLER, guncellemeTarihiMetni, rehberBul } from "./seoRehberler.js";

const oku = (yol) => readFile(new URL(yol, import.meta.url), "utf8");
const KART_BORCU_REHBERLERI = ["kredi-karti-faiz-oranlari-2026", "kredi-karti-borcu-yapilandirma", "kredi-karti-borcu-odenmezse-ne-olur"];
const ARAC_SLUGLARI = ["borc-kapatma-hesaplayici", "kredi-karti-asgari-odeme-hesaplayici", "borc-odeme-plani", "aylik-odeme-takvimi"];

test("rehber slugları benzersiz ve bağlantıları çalışan sayfalara gider", () => {
  const sluglar = REHBERLER.map((rehber) => rehber.slug);
  assert.equal(new Set(sluglar).size, sluglar.length);
  for (const rehber of REHBERLER) {
    assert.match(rehber.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, rehber.slug);
    for (const slug of rehber.ilgiliRehberler || []) assert.ok(rehberBul(slug), `${rehber.slug} -> ${slug}`);
    for (const slug of rehber.terimler || []) assert.ok(finansalSozlukTerimi(slug), `${rehber.slug} -> ${slug}`);
    for (const slug of rehber.araclar || []) assert.ok(ARAC_SLUGLARI.includes(slug), `${rehber.slug} -> ${slug}`);
  }
  for (const terim of FINANSAL_SOZLUK)
    for (const slug of terim.rehberler || []) assert.ok(rehberBul(slug), `${terim.slug} -> ${slug}`);
});

test("kredi kartı borcu rehberleri tarihli, SSS'li ve resmî kaynaklı", () => {
  for (const slug of KART_BORCU_REHBERLERI) {
    const rehber = rehberBul(slug);
    assert.equal(rehber.guncellendi, "2026-11-03", slug);
    assert.ok(rehber.h1 && rehber.sss.length >= 3, slug);
    assert.ok(rehber.description.length <= 200, slug);
    const kaynaklar = REHBER_KAYNAKLARI[slug];
    assert.ok(kaynaklar.length >= 3, slug);
    assert.ok(kaynaklar.every(([adres]) => /^https:\/\/www\.(tcmb\.gov\.tr|bddk\.org\.tr|mevzuat\.gov\.tr|turkiye\.gov\.tr)\//.test(adres)), slug);
  }
  assert.equal(guncellemeTarihiMetni("2026-11-03"), "3 Kasım 2026");
});

test("faiz rehberi TCMB Kasım 2026 tablosundaki oranları taşır", () => {
  const metin = JSON.stringify(rehberBul("kredi-karti-faiz-oranlari-2026"));
  for (const oran of ["3,25", "3,55", "3,75", "4,05", "4,25", "4,55", "2,98", "3,28"]) assert.ok(metin.includes(`yüzde ${oran}`), oran);
  assert.match(metin, /30\.000 TL/);
  assert.match(metin, /180\.000 TL/);
  assert.match(JSON.stringify(rehberBul("kredi-karti-borcu-yapilandirma")), /yüzde 3,11/);
});

test("tasfiye sayfası borçlu okuru kart borcu rehberlerine ve hesaplayıcıya yönlendirir", () => {
  const tasfiye = finansalSozlukTerimi("tasfiye");
  assert.equal(tasfiye.borcKoprusu.baslik, "Kredi kartı veya kredi borcun mu var?");
  assert.deepEqual([...tasfiye.rehberler].sort(), [...KART_BORCU_REHBERLERI].sort());
  assert.ok(tasfiye.borcKoprusu.araclar.includes("borc-kapatma-hesaplayici"));
  assert.ok(tasfiye.ekBolumler.some(([baslik, metin]) => /3 Kasım 2026/.test(baslik) && /7596 sayılı/.test(metin)));
  assert.ok(tasfiye.kaynaklar.some(([, adres]) => adres.includes("basin-duyurusu_27102026")));
});

test("rehberler sitemap'te ve prerender aynı veri kaynağını kullanır", async () => {
  const [sitemap, prerender, sayfalar] = await Promise.all([oku("../public/sitemap.xml"), oku("../scripts/prerender-seo.mjs"), oku("./SeoPages.jsx")]);
  for (const rehber of REHBERLER) assert.match(sitemap, new RegExp(`<loc>https://borcama\\.com/rehber/${rehber.slug}</loc>`), rehber.slug);
  assert.match(prerender, /from "\.\.\/src\/seoRehberler\.js"/);
  assert.match(prerender, /faq: rehber\.sss/);
  assert.match(sayfalar, /from "\.\/seoRehberler\.js"/);
  assert.match(sayfalar, /Son güncelleme: <time/);
});
