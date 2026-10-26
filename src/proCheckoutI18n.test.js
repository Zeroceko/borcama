import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cevir, cevirOgeler } from "./i18n.js";
import { tr, en } from "./locales/bolumler/pro.js";

const kaynak = readFileSync(new URL("./ProCheckout.jsx", import.meta.url), "utf8");

test("Pro satın alma ekranı Türkçe metinleri değişmeden sözlükten gelir", () => {
  assert.equal(cevir("tr", "pro.planAdi.aylik"), "Borcama Pro Aylık · 1 ay");
  assert.equal(cevir("tr", "pro.planAdi.yillik"), "Borcama Pro Yıllık · 1 yıl");
  assert.equal(cevir("tr", "pro.yenileme"), "Abonelik seçtiğin dönemde otomatik yenilenir.");
  assert.equal(cevir("tr", "pro.geriYukle"), "Satın alımları geri yükle");
  const yasal = cevirOgeler("tr", "pro.yasal.cumle", { sozlesme: "A", gizlilik: "B", iade: "C" }).join("");
  assert.equal(yasal, "Devam ederek A, B ve C'nı kabul edersin.");
  for (const anahtar of Object.keys(tr)) {
    assert.ok(en[anahtar], `en eksik: ${anahtar}`);
    if (anahtar !== "pro.yasal.cumle") assert.ok(kaynak.includes(`t("${anahtar}")`), `kullanılmıyor: ${anahtar}`);
  }
});

test("İngilizce Pro kartı App Store 3.1.2 öğelerini içerir", () => {
  assert.equal(en["pro.planAdi.aylik"], "Borcama Pro Monthly · 1 month");
  assert.equal(en["pro.planAdi.yillik"], "Borcama Pro Annual · 1 year");
  assert.match(en["pro.yenileme"], /renews automatically/);
  assert.equal(en["pro.geriYukle"], "Restore purchases");
  assert.equal(en["pro.yasal.sozlesme"], "Terms of Use");
  assert.equal(en["pro.yasal.gizlilik"], "Privacy Policy");
  assert.equal(en["pro.yasal.iade"], "Refund Policy");
  for (const yol of ['href="/terms"', 'href="/privacy"', 'href="/refund-policy"']) assert.ok(kaynak.includes(yol));
  // Fiyat mağazadan biçimlenmiş gelir; native'de geri yükleme ve web ana sayfa koşulları korunur.
  assert.match(kaynak, /const fiyat = secili\?\.formattedPrice;/);
  assert.match(kaynak, /\{nativeMi && \(\s*<button[\s\S]*?t\("pro\.geriYukle"\)/);
  assert.match(kaynak, /\{!nativeMi && \(\s*<a className="pc-back"/);
});
