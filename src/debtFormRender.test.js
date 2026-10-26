import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
const fields = source.match(/const ALAN_TANIMLARI = (\{[\s\S]*?\n  \});/)[1];

test("borç alanları form kapalıyken de güvenle oluşturulur", () => {
  for (const form of [null, undefined, { veri: {} }, { veri: { id: "existing" } }]) {
    const definitions = vm.runInNewContext(`(${fields})`, { form, f: {}, formSimge: { simge: "₺" }, t: (anahtar) => anahtar, kartFaizAlani: () => [], varsayilanFaizIpucu: () => undefined, bolgeProfili: () => null });
    const date = definitions.loans.find(field => field.k === "ilkOdemeTarihi");
    // Hızlı kredi: yeni kredide ilk taksit tarihi isteğe bağlı ("Daha fazla bilgi"), düzenlemede de zorunlu değil.
    assert.ok(!date.z);
    if (!form?.veri?.id) {
      assert.equal(date.ek, true);
      const zorunlu = definitions.loans.filter((field) => field.z).map((field) => field.k);
      assert.equal(zorunlu.join(","), "banka,taksit,kalanTaksit,odemeGunu");
    }
  }
});

test("borç formunda tutar etiketlerinin simgesi formdaki kaydın biriminden gelir", () => {
  const ceviri = (anahtar, d) => `${anahtar}(${d?.simge ?? "ORTAK"})`;
  for (const simge of ["£", "₺"]) {
    const definitions = vm.runInNewContext(`(${fields})`, { form: { veri: {} }, f: {}, formSimge: { simge }, t: ceviri, kartFaizAlani: () => [], varsayilanFaizIpucu: () => undefined, bolgeProfili: () => null });
    const limit = definitions.cards.find((field) => field.k === "limit");
    assert.equal(limit.e, `borclar.alan.kartLimiti(${simge})`);
    const taksit = definitions.loans.find((field) => field.k === "taksit");
    assert.equal(taksit.e, `borclar.alan.aylikTaksit(${simge})`);
  }
  assert.match(source, /const formSimge = \{ simge: paraBirimiSimgesi\(kayitParaBirimi\(f\?\.paraBirimi \? f : form\?\.veri\)\) \};/);
});
