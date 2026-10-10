import assert from "node:assert/strict";
import { test } from "node:test";
import { ayniSekmeTiklamasiMi, olayiKaydedipGit, otomasyonTarayicisiMi, sayfaYarisiGorulduMu } from "./funnelNavigation.js";

const baglanti = (attrs = {}) => ({ getAttribute: (ad) => ({ href: "/register?plan=free", ...attrs })[ad] ?? null });
const olay = (ek = {}) => {
  const o = { button: 0, defaultPrevented: false, onlendi: false, ...ek };
  o.preventDefault = () => { o.onlendi = true; o.defaultPrevented = true; };
  return o;
};

test("otomasyon ve bot tarayıcıları ziyaretçi sayılmaz", () => {
  assert.equal(otomasyonTarayicisiMi({ webdriver: true, userAgent: "Mozilla/5.0 Chrome/129" }), true);
  assert.equal(otomasyonTarayicisiMi({ userAgent: "Mozilla/5.0 HeadlessChrome/129.0" }), true);
  assert.equal(otomasyonTarayicisiMi({ userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1)" }), true);
  assert.equal(otomasyonTarayicisiMi({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Safari/604.1" }), false);
  assert.equal(otomasyonTarayicisiMi(null), false);
});

test("yeni sekme ve değiştirici tuşlu tıklamalar tarayıcıya bırakılır", () => {
  assert.equal(ayniSekmeTiklamasiMi(olay(), baglanti()), true);
  assert.equal(ayniSekmeTiklamasiMi(olay({ metaKey: true }), baglanti()), false);
  assert.equal(ayniSekmeTiklamasiMi(olay({ button: 1 }), baglanti()), false);
  assert.equal(ayniSekmeTiklamasiMi(olay(), baglanti({ target: "_blank" })), false);
});

test("olay yazılınca yönlendirir; yazım gecikirse süre dolunca yine yönlendirir", async () => {
  const gidilen = [];
  const o = olay();
  olayiKaydedipGit(o, baglanti(), () => Promise.resolve(true), { git: (h) => gidilen.push(h) });
  assert.equal(o.onlendi, true);
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(gidilen, ["/register?plan=free"]);

  const yavas = [];
  olayiKaydedipGit(olay(), baglanti(), () => new Promise(() => {}), { beklemeMs: 5, git: (h) => yavas.push(h) });
  await new Promise((r) => setTimeout(r, 20));
  assert.deepEqual(yavas, ["/register?plan=free"]);
});

test("yeni sekme tıklamasında olay kaydedilir ama sayfa engellenmez", () => {
  let kaydedildi = false;
  const o = olay({ ctrlKey: true });
  assert.equal(olayiKaydedipGit(o, baglanti(), () => { kaydedildi = true; }), false);
  assert.equal(kaydedildi, true);
  assert.equal(o.onlendi, false);
});

test("sayfanın yarısı görülünce kaydırma eşiği geçilir", () => {
  assert.equal(sayfaYarisiGorulduMu({ scrollY: 0, innerHeight: 800, scrollHeight: 4000 }), false);
  assert.equal(sayfaYarisiGorulduMu({ scrollY: 1300, innerHeight: 800, scrollHeight: 4000 }), true);
  assert.equal(sayfaYarisiGorulduMu({}), false);
});
