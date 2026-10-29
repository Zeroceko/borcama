import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { hesapZatenVardi, HESAP_VARDI_ESIGI_MS } from "./authKod.js";
import { oturumGecisi } from "./oturumOlaylari.js";
import { izinBandiYeri } from "./kabukDurumu.js";
import postcss from "postcss";

const oku = (yol) => readFile(new URL(yol, import.meta.url), "utf8");

test("B14: yan etkiler yalnız önceden oturum yokken gelen oturumda", () => {
  const a = { user: { id: "u1" }, access_token: "t1" };
  assert.deepEqual(oturumGecisi(undefined, a, null), { guncelle: true, yanEtki: true, girisKaydi: false });
  assert.deepEqual(oturumGecisi(null, a, "SIGNED_IN"), { guncelle: true, yanEtki: true, girisKaydi: true });
  // Sekmeye dönüş: aynı kullanıcı ve token ile SIGNED_IN → hiçbir şey.
  assert.deepEqual(oturumGecisi(a, { ...a }, "SIGNED_IN"), { guncelle: false, yanEtki: false, girisKaydi: false });
  // Token yenilemesi: yalnız oturum güncellenir.
  assert.deepEqual(oturumGecisi(a, { ...a, access_token: "t2" }, "TOKEN_REFRESHED"), { guncelle: true, yanEtki: false, girisKaydi: false });
  assert.deepEqual(oturumGecisi(a, null, "SIGNED_OUT"), { guncelle: true, yanEtki: false, girisKaydi: false });
});

test("B14: giriş kaydı anahtarı token süresine bağlı değil", async () => {
  const kayit = await oku("./activityLog.js");
  assert.match(kayit, /`borcama:login-log:\$\{session\.user\.id\}`/);
  assert.doesNotMatch(kayit, /login-log:[^`]*expires_at/);
});

test("B12: 10 dakikadan eski hesap 'vardı' sayılır", () => {
  const simdi = Date.parse("2026-10-28T12:00:00Z");
  assert.equal(hesapZatenVardi({ created_at: "2026-09-02T10:00:00Z" }, simdi), true);
  assert.equal(hesapZatenVardi({ created_at: new Date(simdi - HESAP_VARDI_ESIGI_MS + 1000).toISOString() }, simdi), false);
  assert.equal(hesapZatenVardi(null, simdi), false);
});

test("B2: izin bandı hesap ekranlarında ve kurulumda yok, uygulamada üstte", () => {
  for (const yol of ["/register", "/login", "/auth-callback", "/reset-password"])
    assert.equal(izinBandiYeri({ yol, kurulum: false, uygulama: false }), "yok", yol);
  assert.equal(izinBandiYeri({ yol: "/summary", kurulum: true, uygulama: true }), "yok");
  assert.equal(izinBandiYeri({ yol: "/summary", kurulum: false, uygulama: true }), "ust");
  assert.equal(izinBandiYeri({ yol: "/", kurulum: false, uygulama: false }), "alt");
});

test("B10: hızlı menünün dört maddesi farklı akış açar", async () => {
  const app = await oku("./App.jsx");
  const menu = app.slice(app.indexOf('<div className="bt-quick-menu"'), app.indexOf("</div>", app.indexOf('<div className="bt-quick-menu"')));
  const maddeler = menu.split('role="menuitem"').slice(1).map((m) => m.slice(0, m.indexOf("}}>")));
  assert.equal(maddeler.length, 4);
  assert.match(maddeler[0], /setForm\(\{ liste: "expenses"/);
  assert.match(maddeler[1], /setOdemeFormuIstegi/);
  assert.match(maddeler[2], /setEkstreYuklemeIstegi/);
  assert.match(maddeler[3], /setBorcTuruSecimiAcik\(true\)/);
  assert.equal(new Set(maddeler).size, 4);
  assert.match(app, /bt-borc-turu-secim/);
});

test("B1/B3/B4: onay kutusu stili ezilmiyor, web giriş öncesi açık, kaydırma çubuğu yeri sabit", async () => {
  const [css, kabuk, auth] = await Promise.all([oku("./onboardingAkis.css"), oku("./kabuk.css"), oku("./Auth.jsx")]);
  assert.match(css, /\.oa-onay button:not\(\.oa-kutu\)/);
  assert.doesNotMatch(css, /\.oa-onay button \{/);
  assert.match(css, /\.oa-ipucu \{/);
  assert.match(auth, /className="oa-ipucu"/);
  assert.match(kabuk, /scrollbar-gutter: stable/);
});

test("CSS dosyaları ayrıştırılabilir", async () => {
  for (const dosya of ["./onboardingAkis.css", "./siteTema.css", "./kabuk.css"]) {
    const icerik = await oku(dosya);
    assert.doesNotThrow(() => postcss.parse(icerik), dosya);
  }
});

test("kod gönderimi: kayıtta önce var olan hesap, girişte hesap yoksa onaylı yeni hesap", async () => {
  const auth = await oku("./Auth.jsx");
  const kod = auth.slice(auth.indexOf("async function kodGonder"), auth.indexOf("function oturumKalicilginiYaz"));
  // İlk istek yalnız onay verilmiş girişte hesap açar; kayıtta hesap yoksa
  // ikinci istek yeni Turnstile jetonuyla hesap açar.
  // Jeton yoksa düğme beklemez; kodGonder jetonu bekleyip ilk isteği onunla atar.
  assert.match(kod, /let jeton = captchaToken;/);
  assert.match(kod, /jeton = await yeniCaptchaJetonu\(90000\);/);
  assert.match(kod, /let \{ error \} = await kodIste\(girisHesapYok, jeton\);/);
  assert.match(kod, /kayitModu && hesapYokHatasi\(error\)[\s\S]+yeniCaptchaJetonu\(\)[\s\S]+kodIste\(true, jeton\)/);
  assert.match(kod, /setGirisHesapYok\(true\)/);
  assert.match(kod, /yeniHesapIzni && \(!sozlesmeKabul \|\| !aydinlatmaOkundu\)/);
  for (const anahtar of ["hesapVar", "yeniHesap", "girisYeniHesap"]) assert.match(kod + auth, new RegExp(`"${anahtar}"`));
  for (const dil of ["tr", "en", "de", "es", "fr", "it"]) {
    const sozluk = (await import(`./locales/${dil}.js`)).default;
    for (const k of ["auth.kod.baglam.hesapVar", "auth.kod.baglam.yeniHesap", "auth.kod.baglam.girisYeniHesap", "auth.giris.hesapYokBaslik", "auth.giris.hesapYokAciklama"])
      assert.ok(sozluk[k], `${dil} ${k}`);
  }
});

test("Turnstile: onToken/onStatus kimliği sabit (widget sıfırlama döngüsü olmaz)", async () => {
  const auth = await oku("./Auth.jsx");
  // TurnstileWidget effect'i bu prop'lara bağlı; her çizimde yeni fonksiyon
  // widget'ı sürekli sıfırlar, jeton gelmez, "Kod gönder" pasif kalır (1.74.0).
  assert.match(auth, /onToken=\{captchaJetonuGeldi\}/);
  assert.match(auth, /onStatus=\{setCaptchaDurumu\}/);
  assert.match(auth, /const captchaJetonuGeldi = useCallback\(/);
});

test("iOS: Gmail'den kopyalanan kod uygulamaya dönünce dolar", async () => {
  const auth = await readFile(new URL("./Auth.jsx", import.meta.url), "utf8");
  const kopru = await readFile(new URL("./nativeSekmeCubugu.js", import.meta.url), "utf8");
  const swift = await readFile(new URL("../ios/App/App/NativeTabBar.swift", import.meta.url), "utf8");
  assert.match(auth, /if \(!kodModu\) return undefined;\s*return panodanKoduDinle\(/);
  assert.match(kopru, /tip: "kodBekle", acik: true/);
  assert.match(kopru, /tip: "kodBekle", acik: false/);
  assert.match(swift, /case "kodBekle":/);
  assert.match(swift, /didBecomeActiveNotification/);
  // Kod ekranı açılmadan önce panoda olan içerik okunmaz.
  assert.match(swift, /pano\.changeCount != sayac/);
  assert.match(swift, /webOlayi\("borcamaPanodanKod"/);
});
