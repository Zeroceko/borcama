import test from "node:test";
import assert from "node:assert/strict";
import { davetKayitYolu, davetKodunuYoldanOku, referansKodunuTemizle } from "./referralCode.js";

test("referans kodu güvenli ve tek biçime dönüştürülür", () => {
  assert.equal(referansKodunuTemizle(" brcm-7k4m 2q "), "BRCM7K4M2Q");
  assert.equal(referansKodunuTemizle("<script>BRCM1234"), "SCRIPTBRCM1234");
});

test("davet kodu bağlantı yolundan veya sorgudan okunur", () => {
  assert.equal(davetKodunuYoldanOku("/davet/BRCM-7K4M2Q", ""), "BRCM7K4M2Q");
  assert.equal(davetKodunuYoldanOku("/register", "?ref=brcm-abc234"), "BRCMABC234");
});

test("davet bağlantısı kayıt ekranına güvenli kod taşır", () => {
  assert.equal(davetKayitYolu("brcm-7k4m2q"), "/register?ref=BRCM7K4M2Q");
  assert.equal(davetKayitYolu(""), "/register");
});
