import test from "node:test";
import assert from "node:assert/strict";
import {
  _sifirla,
  gelenAdresiAl,
  gelenDosyaAdi,
  gelenEkstreAboneOl,
  gelenDosyaAdresAdaylari,
  gelenEkstreIslendi,
  gelenPdfAdresiMi,
} from "./gelenEkstre.js";

const ADRES = "file:///var/mobile/Containers/Data/Application/ABC/Documents/Inbox/Ekim%20Ekstresi.pdf";

test("gelen PDF adresi: yalniz gelen kutularindaki .pdf dosyasi", () => {
  assert.equal(gelenPdfAdresiMi(ADRES), true);
  assert.equal(gelenPdfAdresiMi(ADRES.replace(".pdf", ".PDF")), true);
  // Onizleme (Preview) dosyayi tmp/<paket>-Inbox altina koyuyor.
  assert.equal(gelenPdfAdresiMi("file:///var/mobile/Containers/Data/Application/ABC/tmp/com.borcama.app-Inbox/Ekstre.pdf"), true);
  assert.equal(gelenPdfAdresiMi("file:///x/Documents/Ekstre.pdf"), false);
  assert.equal(gelenPdfAdresiMi("file:///x/tmp/Ekstre.pdf"), false);
  assert.equal(gelenPdfAdresiMi("file:///x/Library/Inbox/Ekstre.pdf"), false);
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

test("gelen dosya adres adaylari: Turkce, bosluk ve parantezli ad yeniden kodlanir", () => {
  const kodlu = "file:///var/x/Documents/Inbox/23%20Ekim%202026%20(G%C3%BCncel%20Ekstrem).pdf";
  const adaylar = gelenDosyaAdresAdaylari(kodlu);
  assert.equal(adaylar[0], kodlu);
  assert.ok(adaylar.every((a) => a.startsWith("file:///var/x/Documents/Inbox/")));
  const ham = "file:///var/x/Documents/Inbox/23 Ekim (Güncel).pdf";
  assert.deepEqual(gelenDosyaAdresAdaylari(ham), [ham, "file:///var/x/Documents/Inbox/23%20Ekim%20(G%C3%BCncel).pdf"]);
});
