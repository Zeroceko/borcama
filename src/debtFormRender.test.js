import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
const fields = source.match(/const ALAN_TANIMLARI = (\{[\s\S]*?\n  \});/)[1];

test("borç alanları form kapalıyken de güvenle oluşturulur", () => {
  for (const form of [null, undefined, { veri: {} }, { veri: { id: "existing" } }]) {
    const definitions = vm.runInNewContext(`(${fields})`, { form, f: {} });
    const date = definitions.loans.find(field => field.k === "ilkOdemeTarihi");
    assert.equal(date.z, !form?.veri?.id);
  }
});
