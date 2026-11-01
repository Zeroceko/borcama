// Web giris/kayit ekrani: saf kurallar (girisKurallari.js) ve Auth.jsx /
// girisKabuk.css kaynak sozlesmeleri (erisilebilirlik, hareket, guvenlik).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { KOD_TEKRAR_SN, PAROLA_EN_AZ, PAROLA_SEVIYELERI, botMu, epostaGecerli, hataAlani, modYolu, parolaGucu } from "./girisKurallari.js";

const oku = (yol) => readFileSync(new URL(yol, import.meta.url), "utf8");
const auth = oku("./Auth.jsx");
const css = oku("./girisKabuk.css");
const config = oku("../supabase/config.toml");

test("e-posta biçimi", () => {
  for (const e of ["a@b.co", " ad.soyad@ornek.com.tr "]) assert.equal(epostaGecerli(e), true, e);
  for (const e of ["", "ad@ornek", "ad ornek@x.com", "@ornek.com", null]) assert.equal(epostaGecerli(e), false, String(e));
});

test("parola gücü: kısa zayıf, çeşitlilik ve uzunlukla artar, 4'te durur", () => {
  assert.equal(parolaGucu(""), 0);
  assert.equal(parolaGucu("Ab1!"), 1);
  assert.equal(parolaGucu("kalemkutu"), 1);
  assert.equal(parolaGucu("kalemkutu1"), 2);
  assert.equal(parolaGucu("Kalemkutu1"), 3);
  assert.equal(parolaGucu("Kalem-kutu-2026"), 4);
  assert.equal(parolaGucu("ŞEKERşeker1"), 3);
  assert.deepEqual(PAROLA_SEVIYELERI, ["", "zayif", "idareEder", "iyi", "guclu"]);
  // Sınır Supabase'in en kısa parola ayarıyla aynı.
  assert.match(config, new RegExp(`minimum_password_length = ${PAROLA_EN_AZ}\\b`));
});

test("bot tuzağı yalnız dolu alanda tetiklenir", () => {
  assert.equal(botMu(""), false);
  assert.equal(botMu("   "), false);
  assert.equal(botMu(undefined), false);
  assert.equal(botMu("https://spam.example"), true);
});

test("hatalar ilgili alana düşer, diğerleri genel kutuya", () => {
  assert.equal(hataAlani({ code: "invalid_credentials" }), "parola");
  assert.equal(hataAlani({ code: "weak_password" }), "parola");
  assert.equal(hataAlani({ code: "email_not_confirmed" }), "eposta");
  assert.equal(hataAlani({ code: "otp_expired" }), "kod");
  assert.equal(hataAlani({ status: 429, code: "over_request_rate_limit" }), null);
  assert.equal(hataAlani({ code: "network_error" }), null);
  assert.equal(hataAlani(null), null);
});

test("sekme adresi değiştirir, sorgu korunur", () => {
  assert.equal(modYolu(true, "?plan=yearly"), "/register?plan=yearly");
  assert.equal(modYolu(false, ""), "/login");
  assert.match(auth, /window\.history\.replaceState\(window\.history\.state, "", modYolu\(kayit, window\.location\.search\)\)/);
});

test("kod: 6 hane, tek alan, tek kullanımlık kod önerisi; tekrar sayacı Supabase sınırını aşmaz", () => {
  assert.match(config, /otp_length = 6/);
  assert.equal(KOD_TEKRAR_SN, 60);
  const kodAlani = auth.slice(auth.indexOf("function KodAlani"), auth.indexOf("function GirisSahnesi"));
  assert.match(kodAlani, /inputMode="numeric"/);
  assert.match(kodAlani, /autoComplete="one-time-code"/);
  assert.match(kodAlani, /aria-invalid=\{hata \? true : undefined\}/);
  assert.match(auth, /type: kodTuru,/);
  assert.match(auth, /supabase\.auth\.resend\(\{\s*type: "signup"/);
});

test("parolalı kayıt: onaylar ve Turnstile jetonu zorunlu, bot isteği atılmaz", () => {
  const kayit = auth.slice(auth.indexOf("async function parolaylaKayit"), auth.indexOf("async function koduTekrarGonder"));
  assert.match(kayit, /!sozlesmeKabul \|\| !aydinlatmaOkundu/);
  assert.match(kayit, /if \(botMu\(tuzak\)[^)]*\)[^\n]*return kodEkraninaGec\("signup"\)/);
  assert.match(kayit, /jeton = await jetonuHazirla\(\);[\s\S]+supabase\.auth\.signUp\(/);
  assert.match(kayit, /captchaToken: jeton \|\| undefined/);
  assert.match(kayit, /data: kayitVerisi\("email_password"\)/);
  // Kodla girişte ve parolalı girişte de tuzak denetlenir.
  const kodGonder = auth.slice(auth.indexOf("async function kodGonder"), auth.indexOf("async function parolaylaKayit"));
  assert.match(kodGonder, /if \(botMu\(tuzak\)\) return kodEkraninaGec\("email"\);/);
  const giris = auth.slice(auth.indexOf("async function parolaylaGiris"), auth.indexOf("async function sifirlamaLinkiGonder"));
  assert.ok(giris.indexOf("botMu(tuzak)") < giris.indexOf("signInWithPassword"));
});

test("tuzak alanı gizli: ekran dışı, sekmeyle odaklanmaz, ekran okuyucuya kapalı", () => {
  assert.match(auth, /<div className="gk-tuzak" aria-hidden="true">/);
  assert.match(auth, /name="website" tabIndex=\{-1\} autoComplete="off"/);
  assert.match(css, /\.gk-tuzak \{\s*position: absolute;\s*left: -10000px;/);
});

test("sekmeler: tablist/tab, aria-selected, panel bağlı, ok tuşları", () => {
  const sekmeler = auth.slice(auth.indexOf("function ModSekmeleri"), auth.indexOf("function ParolaGucu"));
  assert.match(sekmeler, /role="tablist"/);
  assert.match(sekmeler, /role="tab"/);
  assert.match(sekmeler, /aria-selected=\{secili\}/);
  assert.match(sekmeler, /aria-controls="gk-panel"/);
  assert.match(sekmeler, /ArrowLeft[\s\S]+ArrowRight/);
  assert.match(auth, /role="tabpanel" id="gk-panel"/);
  // Gösterge 320 ms yaylı geçişle kayar.
  assert.match(css, /--gk-yay: cubic-bezier\(0\.34, 1\.56, 0\.64, 1\)/);
  assert.match(css, /transition: transform 320ms var\(--gk-yay\)/);
});

test("alan altı hatalar aria-invalid ve aria-describedby ile bağlı", () => {
  assert.match(auth, /\{ "aria-invalid": true, "aria-describedby": id \}/);
  assert.match(auth, /alanAltHata\("eposta", "auth-email-hata"\)/);
  assert.match(auth, /className="gk-hata-kutu" role="alert"/);
});

test("sahne yalnız dekor; düzen 760 px altında üst üste, hareket azaltmada animasyon yok", () => {
  assert.match(auth, /<div className="gk-sahne" aria-hidden="true">/);
  assert.match(css, /\.gk-sahne \{[^}]*flex: 1 1 380px;/);
  assert.match(css, /\.gk-form \{[^}]*flex: 1 1 380px;/);
  assert.match(css, /@media \(max-width: 759px\) \{\s*\.gk-sahne \{[^}]*height: 260px;/);
  assert.match(css, /animation: gk-suzul 6s ease-in-out infinite/);
  assert.match(css, /translateY\(-14px\)[\s\S]+translateY\(14px\)/);
  assert.match(css, /rotate\(-4deg\)/);
  assert.match(css, /font: 400 clamp\(34px, 4vw, 56px\) \/ 0\.98 var\(--oa-baslik-yazi\);[\s\S]+text-wrap: balance;/);
  const azalt = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(azalt, /\.gk-kart, \.gk-panel \{ animation: none; \}/);
  assert.match(azalt, /\.gk-gosterge[^{]*\{ transition: none; \}/);
});

test("iOS uygulamasında eski giriş ekranı aynen kalır", () => {
  assert.match(auth, /if \(!nativeMi\) \{\s*return \(\s*<div className=\{`oa oa-auth gk/);
  assert.match(auth, /\{nativeMi \? \(\s*<KodKutulari/);
  // Uygulamada parola ve referans kodu yok (App Store kuralları).
  assert.match(auth, /\} else if \(!nativeMi\) \{\s*\/\/ Web: sekmeli giris\/kayit/);
});
