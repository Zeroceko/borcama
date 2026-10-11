import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { huniOzeti, ilgilenilecekler, kullanicilariFiltrele, oran, sonEtkinlikler } from "./crm/crmVeri.js";

const SIMDI = Date.parse("2026-10-11T12:00:00Z");
const gunOnce = (g) => new Date(SIMDI - g * 86400000).toISOString();

const kullanicilar = [
  { id: "a", email: "a@x.com", created_at: gunOnce(2), email_confirmed_at: gunOnce(2), has_data: false, last_sign_in_at: gunOnce(1) },
  { id: "b", email: "b@x.com", created_at: gunOnce(3), email_confirmed_at: null, has_data: false },
  { id: "c", email: "c@x.com", created_at: gunOnce(40), email_confirmed_at: gunOnce(40), has_data: true, trial_active: true, trial_days_remaining: 2, last_sign_in_at: gunOnce(20) },
  { id: "d", email: "d@x.com", created_at: gunOnce(60), email_confirmed_at: gunOnce(60), has_data: true, pro_active: true, last_sign_in_at: gunOnce(3) },
];

test("segmentler doğru kullanıcıları seçer ve yeniden eskiye sıralar", () => {
  assert.deepEqual(kullanicilariFiltrele(kullanicilar, { segment: "yeni", simdi: SIMDI }).map((u) => u.id), ["a", "b"]);
  assert.deepEqual(kullanicilariFiltrele(kullanicilar, { segment: "verisiz", simdi: SIMDI }).map((u) => u.id), ["a", "b"]);
  assert.deepEqual(kullanicilariFiltrele(kullanicilar, { segment: "aktif", simdi: SIMDI }).map((u) => u.id), ["a", "d"]);
  assert.deepEqual(kullanicilariFiltrele(kullanicilar, { segment: "dogrulanmamis", simdi: SIMDI }).map((u) => u.id), ["b"]);
  assert.deepEqual(kullanicilariFiltrele(kullanicilar, { segment: "pro", simdi: SIMDI }).map((u) => u.id), ["d"]);
  assert.deepEqual(kullanicilariFiltrele(kullanicilar, { arama: "C@X", simdi: SIMDI }).map((u) => u.id), ["c"]);
});

test("ilgilenilecekler: veri girmeyen doğrulanmış yeni, doğrulanmamış, biten deneme, geri bildirim, davet", () => {
  const sonuc = ilgilenilecekler({
    users: kullanicilar,
    feedback: [{ id: "f", created_at: gunOnce(1), message: "x" }, { id: "eski", created_at: gunOnce(30), message: "y" }],
    referrals: { items: [{ id: "r", status: "review" }, { id: "r2", status: "rewarded" }] },
  }, { simdi: SIMDI });
  assert.deepEqual(sonuc.verisizYeni.kayitlar.map((u) => u.id), ["a"]);
  assert.deepEqual(sonuc.dogrulanmamis.kayitlar.map((u) => u.id), ["b"]);
  assert.deepEqual(sonuc.denemesiBiten.kayitlar.map((u) => u.id), ["c"]);
  assert.equal(sonuc.geriBildirim.toplam, 1);
  assert.equal(sonuc.davetIncelemesi.toplam, 1);
});

test("huni son 7 günü önceki 7 günle karşılaştırır", () => {
  const gunluk = Array.from({ length: 14 }, (_, i) => ({ day: `2026-10-${String(i + 1).padStart(2, "0")}`, visitors: i < 7 ? 1 : 2, register_views: 1, accounts_created: i >= 7 ? 1 : 0, accounts_verified: 0 }));
  const { bu, onceki } = huniOzeti(gunluk, 7);
  assert.equal(bu.ziyaret, 14);
  assert.equal(onceki.ziyaret, 7);
  assert.equal(bu.hesap, 7);
  assert.equal(oran(3, 0), null);
  assert.equal(oran(1, 3), 33.3);
});

test("son etkinlikler yalnız son 24 saati gösterir", () => {
  const akis = sonEtkinlikler([{ id: 1, created_at: gunOnce(0.5) }, { id: 2, created_at: gunOnce(2) }], { simdi: SIMDI });
  assert.deepEqual(akis.map((a) => a.id), [1]);
});

test("CRM alanı yeni kabuğa yönlenir; Vercel yeni yolları yalnız CRM alanında sunar", async () => {
  const [main, vercel] = await Promise.all([
    readFile(new URL("./main.jsx", import.meta.url), "utf8"),
    readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  ]);
  assert.match(main, /crmAlani && \["\/backoffice", "\/kullanicilar", "\/buyume", "\/iletisim"\]\.includes\(yol\)/);
  assert.match(main, /function KimlikliCrm/);
  assert.match(main, /yonetimYetkisiVar\(session\)/);
  const rewrites = JSON.parse(vercel).rewrites;
  for (const yol of ["/kullanicilar", "/buyume", "/iletisim"]) {
    const kural = rewrites.find((r) => r.source === yol);
    assert.equal(kural?.has?.[0]?.value, "crm.borcama.com");
  }
});
