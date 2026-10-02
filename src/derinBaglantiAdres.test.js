import test from "node:test";
import assert from "node:assert/strict";
import { derinBaglantiAyristir, uygulamaBaglantisiMi, NATIVE_DONUS_ADRESI } from "./derinBaglantiAdres.js";

test("adres parcasindaki oturum anahtarlari okunur", () => {
  const veri = derinBaglantiAyristir(
    `${NATIVE_DONUS_ADRESI}?next=%2Fwelcome#access_token=abc&refresh_token=def&type=signup`,
  );
  assert.equal(veri.erisimAnahtari, "abc");
  assert.equal(veri.yenilemeAnahtari, "def");
  assert.equal(veri.hedef, "/welcome");
});

test("sorgudaki dogrulama kodu okunur", () => {
  const veri = derinBaglantiAyristir(`${NATIVE_DONUS_ADRESI}?code=xyz&type=recovery`);
  assert.equal(veri.kod, "xyz");
  assert.equal(veri.hedef, "/reset-password");
});

test("kayit dogrulamasi dogrudan uygulamaya goturur", () => {
  const veri = derinBaglantiAyristir(
    `${NATIVE_DONUS_ADRESI}#access_token=a&refresh_token=b&type=signup`,
  );
  assert.equal(veri.hedef, "/summary");
});

test("hedef yoksa ozet ekranina donulur", () => {
  const veri = derinBaglantiAyristir(`${NATIVE_DONUS_ADRESI}#access_token=abc&refresh_token=def`);
  assert.equal(veri.hedef, "/summary");
});

test("uygulama disina yonlendiren hedef kabul edilmez", () => {
  const veri = derinBaglantiAyristir(
    `${NATIVE_DONUS_ADRESI}?next=https%3A%2F%2Fbaska-site.example#access_token=a&refresh_token=b`,
  );
  assert.equal(veri.hedef, "/summary");
  const protokolsuz = derinBaglantiAyristir(`${NATIVE_DONUS_ADRESI}?next=%2F%2Fbaska-site.example`);
  assert.equal(protokolsuz.hedef, "/summary");
});

test("hata donen baglanti isaretlenir", () => {
  const veri = derinBaglantiAyristir(
    `${NATIVE_DONUS_ADRESI}#error=access_denied&error_description=Email%20link%20is%20invalid`,
  );
  assert.equal(veri.hata, "Email link is invalid");
});

test("yalniz uygulamanin kendi semasi kabul edilir", () => {
  assert.equal(uygulamaBaglantisiMi(`${NATIVE_DONUS_ADRESI}?next=%2Fwelcome`), true);
  assert.equal(uygulamaBaglantisiMi("https://borcama.com/welcome"), false);
  assert.equal(uygulamaBaglantisiMi(null), false);
});

test("gecersiz adres cokme uretmez", () => {
  assert.equal(derinBaglantiAyristir("bu bir adres degil"), null);
});

test("universal link uygulamanin baglantisi sayilir", () => {
  assert.equal(uygulamaBaglantisiMi("https://borcama.com/auth-callback?token_hash=abc&type=signup"), true);
  assert.equal(uygulamaBaglantisiMi("https://www.borcama.com/auth-callback?token_hash=abc"), true);
  assert.equal(uygulamaBaglantisiMi("https://borcama.com/summary"), false);
  assert.equal(uygulamaBaglantisiMi("https://baska-site.example/auth-callback"), false);
});

test("universal linkten dogrulama anahtari ve hedef okunur", () => {
  const veri = derinBaglantiAyristir("https://borcama.com/auth-callback?token_hash=abc123&type=recovery");
  assert.equal(veri.dogrulamaAnahtari, "abc123");
  assert.equal(veri.tur, "recovery");
  assert.equal(veri.hedef, "/reset-password");
});
