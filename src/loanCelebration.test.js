import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  KREDI_KAPANISI_GECMIS,
  krediKapanisiOncedenKutlandiMi,
  krediKapanisKutlamasiniIsaretle,
  kutlanacakKapaliKredi,
} from "./loanCompletion.js";

const oku = (yol) => readFile(new URL(yol, import.meta.url), "utf8");

test("kutlaması işaretlenmiş kredi yeni bir tarayıcıda tekrar kutlanmaz", () => {
  const krediler = [
    { id: "a", kapanisKutlandi: "2026-10-01T09:00:00.000Z" },
    { id: "b", kapanisKutlandi: KREDI_KAPANISI_GECMIS },
  ];
  assert.equal(kutlanacakKapaliKredi(krediler), null);
  assert.equal(kutlanacakKapaliKredi([...krediler, { id: "c" }])?.id, "c");
  assert.equal(kutlanacakKapaliKredi([{ id: "c" }], new Set(["c"])), null);
});

test("özellikten önce kapanan krediler sessizce geçmiş olarak işaretlenir", () => {
  assert.equal(krediKapanisiOncedenKutlandiMi({ id: "a", kapatildiTarihi: "2026-09-30" }), true);
  assert.equal(krediKapanisiOncedenKutlandiMi({ id: "d", kalanBorc: 0 }), true);
  assert.equal(krediKapanisiOncedenKutlandiMi({ id: "b" }, true), true);
  assert.equal(krediKapanisiOncedenKutlandiMi({ id: "c" }, false), false);
});

test("işaret yalnız ilgili krediye yazılır", () => {
  const sonuc = krediKapanisKutlamasiniIsaretle([{ id: "a" }, { id: "b", banka: "X" }], "b", "2026-10-10T10:00:00.000Z");
  assert.deepEqual(sonuc, [{ id: "a" }, { id: "b", banka: "X", kapanisKutlandi: "2026-10-10T10:00:00.000Z" }]);
});

test("kutlama bilgisi tarayıcı yerine kullanıcı verisine yazılır; ödemeyle kapanan kredi de işaretlenir", async () => {
  const app = await oku("./App.jsx");
  assert.doesNotMatch(app, /localStorage\.setItem\(`?["']?borcama:kredi-kutlamasi/);
  assert.match(app, /kapatildiTarihi: kapanisTarihi, kapanisKutlandi: new Date\(\)\.toISOString\(\)/);
  assert.match(app, /krediKapanisKutlamasiniIsaretle\(/);
});

test("tebrik e-postası kredi başına bir kez, yalnız yeni kapanışlar için ve tutarsız gönderilir", async () => {
  const [edge, sablon, migration] = await Promise.all([
    oku("../supabase/functions/lifecycle-emails/index.ts"),
    oku("../supabase/functions/_shared/borcama-email.ts"),
    oku("../supabase/migrations/20261010180000_loan_closed_email.sql"),
  ]);
  assert.match(migration, /'loan-closed'/);
  assert.match(edge, /kampanya\(admin, "loan-closed"\)\.catch\(\(\) => null\)/);
  assert.match(edge, /deliveryKey: `loan:\$\{krediId\}`/);
  assert.match(edge, /KREDI_KAPANIS_EPOSTA_BASLANGICI = Date\.parse\("2026-10-10T00:00:00Z"\)/);
  assert.match(edge, /kapanisKutlandi/);
  const fonksiyon = sablon.slice(sablon.indexOf("export function krediKapandiHtml"), sablon.indexOf("export function referansOduluHtml"));
  assert.match(fonksiyon, /krediKapandiHtml\(url: string\)/);
  assert.doesNotMatch(fonksiyon, /\$\{(?!buton\(url|ozellikSatiri\()/);
});
