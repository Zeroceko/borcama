import test from "node:test";
import assert from "node:assert/strict";
import {
  _sifirla,
  gelenAdresiAl,
  gelenDosyaAdi,
  gelenEkstreAboneOl,
  gelenEkstreIslendi,
  gelenEkstreKanaliniKur,
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

test("gelen ekstre: soğuk açılışta başlangıç adresi kuyruğa alınır, işlenmiş adres alınmaz", async () => {
  _sifirla();
  globalThis.sessionStorage = (() => {
    const d = new Map();
    return { getItem: (k) => d.get(k) ?? null, setItem: (k, v) => d.set(k, String(v)) };
  })();
  const sahteApp = (adres) => ({ addListener() {}, getLaunchUrl: async () => (adres ? { url: adres } : undefined) });
  const gelen = [];
  const birak = gelenEkstreAboneOl((adres) => gelen.push(adres));
  const soguk = ADRES.replace("Ekim%20Ekstresi", "Soguk");
  await gelenEkstreKanaliniKur(sahteApp(soguk));
  assert.deepEqual(gelen, [soguk]);
  gelenEkstreIslendi(soguk);
  await gelenEkstreKanaliniKur(sahteApp(soguk));
  assert.deepEqual(gelen, [soguk]);
  await gelenEkstreKanaliniKur(sahteApp(null));
  assert.deepEqual(gelen, [soguk]);
  birak();
  _sifirla();
  delete globalThis.sessionStorage;
});
