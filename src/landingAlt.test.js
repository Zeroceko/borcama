import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { APP_STORE_URL, appStoreBaglantisi } from "./appStore.js";
import { webdeKoyuMu } from "./siteTema.js";

const oku = (yol) => readFile(new URL(yol, import.meta.url), "utf8");

test("v3 landing ana mesajı, fiyatları ve güven cümlelerini korur", async () => {
  const landing = await oku("./LandingAlt.jsx");
  assert.match(landing, /Paran nereye gidiyor\? <mark>Borcunu gör, kontrolü al\.<\/mark>/);
  assert.match(landing, /iPhone'da ve tarayıcıda, aynı hesap\. Banka şifresi yok\./);
  assert.match(landing, /İlk 30 gün Pro hediye\. Kart gerekmez\./);
  assert.match(landing, /İlk 30 gün Pro özellikleri hediye\. Kart gerekmez; süre bitince Ücretsiz planın devam eder\./);
  assert.match(landing, /<strong>₺99<\/strong>/);
  assert.match(landing, /<strong>₺999<\/strong>/);
  assert.match(landing, /kendiliğinden ücretlendirme yapılmaz/);
  assert.match(landing, /Mevduat getirini hesapladın/);
  assert.match(landing, /redirect=%2Fassets/);
});

test("hero ve kapanışta App Store ve web kaydı eşit ağırlıkta", async () => {
  const landing = await oku("./LandingAlt.jsx");
  assert.match(landing, /<MagazaCta ct="landing-hero" \/>/);
  assert.match(landing, /<a className="dugme" href=\{heroCtaHref\}><Monitor [^>]*\/> Şimdi başla<\/a>/);
  assert.match(landing, /appStoreBaglantisi\("landing-son"\)/);
  assert.match(landing, /<a className="dugme beyaz" href="\/register\?plan=free">Şimdi başla<\/a>/);
  assert.match(landing, /APP_STORE_ROZET/);
  // Üst çubukta yalnız iki eylem; bölüm bağlantısı ve App Store yok.
  const ust = landing.slice(landing.indexOf('<header className="ust">'), landing.indexOf("</header>"));
  assert.equal((ust.match(/<a /g) || []).length, 3);
  assert.match(ust, /Giriş yap/);
  assert.match(ust, /Ücretsiz başla/);
  assert.doesNotMatch(ust, /appStore|nasil-calisir/);
});

test("cebinde bölümü mağaza metnindeki altı özelliği anlatır; eyebrow ve rozet yok", async () => {
  const landing = await oku("./LandingAlt.jsx");
  for (const ozellik of ["Hesap açmadan başla", "Banka şifresi yok", "Ekstreni cihazında okut", "Ödeme hatırlatması", "Face ID / Touch ID", "Dilin, para birimin"])
    assert.match(landing, new RegExp(`baslik: "${ozellik.replace(/[/]/g, "\\/")}"`));
  assert.doesNotMatch(landing, /Sparkles|Star\b|eyebrow|price-badge|kanit/);
  assert.doesNotMatch(landing, /Sınırsız ekstre|Finans asistanı/);
  assert.doesNotMatch(landing, /\p{Extended_Pictographic}/u);
});

test("Pro maddeleri ödeme sayfasındaki gerçek kapsamla aynı", async () => {
  const [landing, pro] = await Promise.all([oku("./LandingAlt.jsx"), oku("./locales/bolumler/pro.js")]);
  assert.match(pro, /Faiz ve ödeme önceliği analizleri/);
  assert.match(pro, /Aylık yük ve faiz senaryolarını karşılaştırma/);
  assert.match(pro, /Tüm kişiselleştirilmiş öneri ve sinyaller/);
  assert.match(landing, /PRO_MADDELERI = \["Faiz ve ödeme önceliği analizi", "Aylık yük ve faiz senaryoları", "Tüm kişisel öneri ve sinyaller"\]/);
});

test("uygulama görselleri gerçek ekran görüntüsü; çizilmiş ekran bileşeni yok", async () => {
  const landing = await oku("./LandingAlt.jsx");
  for (const ad of ["web-ozet", "iphone-bugun", "iphone-plan"]) assert.match(landing, new RegExp(`ad="${ad}"`));
  assert.match(landing, /`\/ekranlar\/\$\{ad\}`/);
  assert.match(landing, /fetchpriority=/);
  assert.doesNotMatch(landing, /UygulamaEkrani|UygulamaPenceresi|DashboardPreview|StatementPreview/);
});

test("site teması: token dışında literal hex yok, Google Fonts yok, koyu tema yok", async () => {
  const css = await oku("./siteTema.css");
  const tokenler = css.match(/:root\s*\{[\s\S]*?\}/)[0];
  assert.doesNotMatch(css.replace(tokenler, ""), /#[0-9a-f]{3,8}\b/i);
  assert.doesNotMatch(css, /@import|fonts\.googleapis|prefers-color-scheme|data-theme/);
  assert.doesNotMatch(css, /rotate\(/);
  // Kurallar .site altında: uygulama ekranlarına sızmaz.
  for (const kural of css.replace(tokenler, "").replace(/@font-face\{[^}]*\}/g, "").match(/^[^@\s/}][^{]*\{/gm))
    assert.match(kural, /(^|,\s*)(\.site|html:has\(\.site\))/, kural);
  const landing = await oku("./LandingAlt.jsx");
  assert.doesNotMatch(landing, /#[0-9a-f]{6}\b|prefers-color-scheme|matchMedia|koyu-anahtar|Koyu mod|-koyu/i);
});

test("web'de giriş öncesi ekranlar açık temada; iOS cihaz temasını izler", async () => {
  assert.equal(webdeKoyuMu({ native: false, sistemKoyu: true }), false);
  assert.equal(webdeKoyuMu({ native: true, sistemKoyu: true }), true);
  assert.equal(webdeKoyuMu({ native: true, sistemKoyu: false }), false);
  const [auth, onboarding] = await Promise.all([oku("./Auth.jsx"), oku("./Onboarding.jsx")]);
  assert.equal((auth.match(/const koyu = webdeKoyuMu\(\{ native: nativeMi, sistemKoyu: useSistemKoyu\(\) \}\);/g) || []).length, 2);
  assert.match(onboarding, /!native && adim === "dil"\n    \? webdeKoyuMu/);
});

test("App Store bağlantısı kampanya parametresi taşır", () => {
  const adres = new URL(appStoreBaglantisi("landing-hero"));
  assert.equal(`${adres.origin}${adres.pathname}`, APP_STORE_URL);
  assert.equal(adres.searchParams.get("ct"), "landing-hero");
  assert.equal(adres.searchParams.get("mt"), "8");
});
