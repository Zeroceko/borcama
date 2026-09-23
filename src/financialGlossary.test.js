import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { FINANSAL_SOZLUK, finansalSozlukTerimi } from "./financialGlossary.js";

test("finansal sözlük slugları kalıcı, ASCII ve benzersizdir", () => {
  const slugs = FINANSAL_SOZLUK.map((terim) => terim.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, slug);
});

test("her sözlük terimi özgün açıklama, örnek ve çalışan ilgili terimler içerir", () => {
  assert.ok(FINANSAL_SOZLUK.length >= 100);
  for (const terim of FINANSAL_SOZLUK) {
    assert.ok(terim.definition.length >= 55, `${terim.slug}: definition`);
    assert.ok(terim.detail.length >= 140, `${terim.slug}: detail`);
    assert.ok(terim.example.length >= 70, `${terim.slug}: example`);
    assert.ok(terim.borcama.length >= 70, `${terim.slug}: borcama`);
    assert.ok(terim.related.length >= 3, `${terim.slug}: related`);
    for (const related of terim.related) assert.ok(finansalSozlukTerimi(related), `${terim.slug} -> ${related}`);
  }
});

test("sözlük Türkçe A-Z dizini ve kategori filtresi sunar", async () => {
  const page = await readFile(new URL("./SeoPages.jsx", import.meta.url), "utf8");
  assert.match(page, /ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ/);
  assert.match(page, /seo-glossary-alphabet/);
  assert.match(page, /setKategori/);
});

test("sözlük tek veri kaynağından prerender ve sitemap üretimine bağlanır", async () => {
  const prerender = await readFile(new URL("../scripts/prerender-seo.mjs", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  assert.match(prerender, /FINANSAL_SOZLUK/);
  assert.match(prerender, /DefinedTerm/);
  assert.match(sitemap, /FINANSAL_SOZLUK_URLS/);
});
