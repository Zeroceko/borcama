import test from "node:test";
import assert from "node:assert/strict";
import {
  _sifirla,
  gelenAdresiAl,
  gelenDosyaAdi,
  gelenEkstreAboneOl,
  gelenEkstreIslendi,
  gelenPdfAdresiMi,
} from "./gelenEkstre.js";

const ADRES = "file:///var/mobile/Containers/Data/Application/ABC/Documents/Inbox/Ekim%20Ekstresi.pdf";

test("gelen PDF adresi: yalniz Inbox altindaki .pdf dosyasi", () => {
  assert.equal(gelenPdfAdresiMi(ADRES), true);
  assert.equal(gelenPdfAdresiMi(ADRES.replace(".pdf", ".PDF")), true);
  assert.equal(gelenPdfAdresiMi("file:///x/Documents/Ekstre.pdf"), false);
  assert.equal(gelenPdfAdresiMi("https://borcama.com/auth-callback#a=b"), false);
  assert.equal(gelenPdfAdresiMi("borcama://auth-callback"), false);
  assert.equal(gelenPdfAdresiMi(undefined), false);
  assert.equal(gelenDosyaAdi(ADRES), "Ekim Ekstresi.pdf");
});

test("gelen ekstre: abone bekleyen adresi alir, islenen adres tekrar gelmez", () => {
  _sifirla();
  globalThis.sessionStorage = (() => {
    const d = new Map();
    return { getItem: (k) => d.get(k) ?? null, setItem: (k, v) => d.set(k, String(v)) };
  })();
  assert.equal(gelenAdresiAl(ADRES), true);
  const alinan = [];
  const birak = gelenEkstreAboneOl((a) => alinan.push(a));
  assert.deepEqual(alinan, [ADRES]);
  assert.equal(gelenAdresiAl(ADRES), false, "ayni bekleyen adres ikinci kez verilmez");
  gelenEkstreIslendi(ADRES);
  assert.equal(gelenAdresiAl(ADRES), false, "islenen adres (getLaunchUrl tekrari) yok sayilir");
  const ikinci = ADRES.replace(".pdf", "-1.pdf");
  assert.equal(gelenAdresiAl(ikinci), true);
  assert.deepEqual(alinan, [ADRES, ikinci]);
  birak();
  delete globalThis.sessionStorage;
});

test("gelen ekstre: soguk acilistaki baslangic adresi bir kez kuyruga girer", () => {
  _sifirla();
  globalThis.sessionStorage = (() => {
    const d = new Map();
    return { getItem: (k) => d.get(k) ?? null, setItem: (k, v) => d.set(k, String(v)) };
  })();
  const baslangic = ADRES.replace(".pdf", "-soguk.pdf");
  // appUrlOpen kacti, getLaunchUrl adresi verdi:
  assert.equal(gelenAdresiAl(baslangic), true);
  gelenEkstreIslendi(baslangic);
  // webview yeniden yuklenince getLaunchUrl ayni adresi tekrar verir:
  _sifirla();
  assert.equal(gelenAdresiAl(baslangic), false);
  delete globalThis.sessionStorage;
});
