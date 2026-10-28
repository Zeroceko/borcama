# borcama.com v3 · Claude Code direktifi (web sitesi)

Tarih: 28 Ekim 2026 · Hazırlayan: Claude (CEO sohbeti) · Hedef: `Zeroceko/borcama` · Sürüm: 1.75.0 (minor; onboarding v3 1.73.0 ve uygulama v3 1.74.0'dan **sonra**)
Görsel referans: `docs/web-v3-prototip.html` (masaüstü + mobil; sayfa düzeni ve stil hedefi). **Prototipteki telefon ekranları ve pencere maketi siteye kopyalanmaz**; sitede yalnız uygulamanın gerçek ekran görüntüleri kullanılır (W5). Kardeş dokümanlar: `docs/onboarding-v3-direktifi.md` (token'lar, imza), `docs/uygulama-v3-direktifi.md` (PR-3; birleşince görüntüler yeniden çekilir).

> Tek cümle: **Site iki ürünü birlikte tanıtır: iPhone uygulaması ve web.** Ana mesaj, fiyatlar, güven cümleleri, SEO çıktısı aynen kalır; iki CTA eşit ağırlıkta (App Store + Şimdi başla); görünüm uygulamanın v3 yüzeyine geçer: kenarlıksız yüzeyler, iki tema, imza (lime + coral blok gölge) yalnız CTA, büyük tutar, Pro kartı ve kapanış bandında; `Sparkles`/yıldız ikonu yok.

---

## 0. Onaylı kararlar (Özer, 28 Ekim 2026)

| # | Karar |
|---|---|
| W1 | **Yeni landing deney değil, yeni varsayılan.** `docs/aktif-deneyler.md`: aktif deney yok; kol başına 200 ziyaret eşiği mevcut trafikte aylar sürer. v3 landing `LandingAlt.jsx`'in yerine geçer (control). `landingExperiment.js` ve `LANDING_DENEYI_AKTIF = false` dokunulmaz. Eski sürüm `/classic` gibi ayrı yolda **tutulmaz** (bakım yükü); git geçmişi yeter. |
| W2 | **İki ürün, eşit ağırlık.** H1 aynı ("Paran nereye gidiyor? Borcunu gör, kontrolü al."), üstünde etiket yok (W11). Hero ve kapanışta **iki CTA yan yana**: ink `.magaza-cta` "App Store'dan İndir" (`APP_STORE_URL`) ve lime `.dugme` "Şimdi başla" (`/register?plan=free`). Üst çubukta yalnız "Giriş yap" + lime "Ücretsiz başla". Lead: "… iPhone'da ve tarayıcıda, aynı hesap. Banka şifresi yok." Kanıt çipi yok (W11). Fiyatlar, güven cümleleri, "İlk 30 gün Pro hediye" aynı. Ölçüm: web kaydı + App Store tıklaması (§6). |
| W3 | **Koyu yeşil (#062d20) siteden çıkar.** Uygulama paletine geçilir: ink, krem, lime, coral, mint (`docs/onboarding-v3-direktifi.md §2.1`). Koyu tema = uygulamanın `KOYU_TEMA`'sı. |
| W4 | **Landing varsayılan açık; koyu mod yalnız alt bilgideki anahtarla.** `prefers-color-scheme` **izlenmez**; `:root[data-theme="dark"]` token'ları yalnız alt bilgideki "Koyu mod" anahtarıyla (`.anahtar`, `role="switch"`) açılır, tercih `localStorage` `borcama:site-koyu` (try/catch; okunamazsa açık). Üst çubukta anahtar yok. Giriş yapmış kullanıcı uygulamada `ayarlar.tema`'sını görür (değişiklik yok). |
| W5 | **Sitede yalnız gerçek ekran görüntüsü; uydurma ekran yok.** Görseller `scripts/ekran-goruntuleri.mjs` çıktısıdır (**script bu PR'da yazılır**; PR-3 aynı scripti yeniden çalıştırır): `public/ekranlar/web-ozet(-koyu).png|webp` (1280×800 masaüstü Bugün), `iphone-bugun`, `iphone-borclar`, `iphone-plan` (390×844). Sentetik demo veriyle çekilir; gerçek kullanıcı verisi yok. Hero: masaüstü görüntüsü CSS tarayıcı çerçevesi (`.pencere`: üst şerit + adres `borcama.com/summary`) içinde, sağ altına binen iPhone görüntüsü CSS telefon çerçevesi (`.tel`: 9px çerçeve, 40px köşe, dinamik ada) içinde; çerçeve CSS, içerik gerçek `<img>` (`width/height` yazılı, `fetchpriority="high"`). "Nasıl çalışır" yanında `iphone-plan`. Koyu temada `-koyu` görüntüler `<picture>` ile. **Sıra:** bu PR önce başlayabilir; görüntüler bugünkü uygulamadan (gerçek) çekilir, PR-3 (`docs/uygulama-v3-direktifi.md`) birleşince `node scripts/ekran-goruntuleri.mjs` tek komutla yeniden üretilir ve ayrı bir küçük PR ile güncellenir. Siteye uygulamanın olmayan bir hali çizilmez. `UygulamaEkrani.jsx`/`UygulamaPenceresi.jsx` bileşenleri **yapılmaz**; "Web'de de" bölümü yok (kaldırıldı); masaüstü görseli yalnız hero'da. |
| W6 | **SEO değişmez; ölçüme tek ekleme.** Birincil CTA App Store olduğundan `landingMeasurement.js`'e `a[href*="apps.apple.com"]` tıklamaları için `landing_appstore_click` olayı eklenir (mevcut `landing_cta_click` kayıt bağlantıları için aynen kalır). App Store Connect'te kaynak ölçümü için hero/kapanış bağlantılarına `?pt=…&ct=landing-hero|landing-son&mt=8` kampanya parametresi (`appStore.js`'e `appStoreBaglantisi(ct)` yardımcı). `docs/aktif-deneyler.md`'ye "ana metrik: kayıt + App Store tıklaması" notu. `scripts/prerender-seo.mjs`, `index.html` statik landing bloğu (`.landing-static`), meta/OG, `landingMeasurement.js` olayları (`landing_visit → register_view → …`), `funnelKaynakBilgisi`, `?from=mevduat` bağlamı, `APP_STORE_URL` rozeti aynen. |
| W7 | **SEO sayfalarının kabuğu da geçer** (`SeoPages.jsx > Layout`, `Hero`, `Breadcrumb`, `ToolLayout`): üst çubuk, alt bilgi, tipografi, kart/girdi yüzeyleri. Hesaplayıcıların mantığı, form alanları ve içerik metinleri değişmez. Legal sayfalar (`Legal.jsx`, `Faq.jsx`) yalnız kabuk + tipografi. |
| W8 | **Emoji yok; ikonlar lucide-react.** App Store için iki biçim: üst çubuk/hero/kapanışta ink pill `.magaza-cta` (Apple glifi + "App Store'dan / İndir"), Ücretsiz kartında lime `.dugme`; resmi `APP_STORE_ROZET` görseli alt bilgide ve "Web'de de" bölümünün altında kalır (Apple rozet kullanım kuralı). Banka logoları `bankLogos.js`. |
| W10 | **Uygulama sekme çubuğu 5 öğe, ortada "+".** Bugün · Borçlar · [+] · Hareketler · Varlıklar. "+" çubuğun **içinde** oturan 40px daire: açık temada mürekkep zemin + lime "+", koyu temada krem zemin + mürekkep "+" (`--ekle-ikon` token'ı); taşma, gölge, etiket yok; lucide `Plus` 2.8 kalınlık. Lime aktif sekmeyle renk yarışmaz. Dokununca mevcut hızlı ekle sayfası (`kabuk.hizli.*`: Ekstre yükle / Yeni borç; buna Ödeme işaretle ve Harcama eklenir). Ekrandaki yüzen "+" düğmesi kalkar; içerik alanı geri kazanılır. Site maketleri bu düzeni gösterir; uygulamada hayata geçmesi: web HTML sekme çubuğu (`App.jsx > bt-nav-ana`) PR-3'te, iOS `NativeTabBar.swift` (UITabBar 5. öğe, merkez özel görünüm) ve `nativeSekmeCubugu.js` köprüsü (`basliklar` 5 öğe, `"ekle"` anahtarı) iOS PR'ında. |
| W11 | **Eyebrow yok, kanıt çipi yok.** Bölüm üstü mono etiketler ("CEBİNDE", "NASIL ÇALIŞIR", "HER AY", "GÜVEN") ve hero'daki mono satır kaldırıldı; bölümler doğrudan H2 ile başlar. Hero'daki kanıt çipleri ("Süresiz ücretsiz" vb.) kaldırıldı; güven cümleleri "Banka şifresi yok." kartında. Fiyat kartlarında rozet yok; "30 günden sonra seçim sende" Pro açıklamasının ilk cümlesi. Mono etiket yalnız uygulama görüntülerinin içinde (ürün arayüzü) ve ekstre kartı hücrelerinde kalır. |
| W9 | **Uygulama tanıtımı mağaza metniyle aynı.** "Cebinde" bölümündeki 6 özellik `docs/app-store-metinleri-global.md` ve `docs/ios-app-store-gonderim.md`'den: hesap açmadan başla, banka şifresi yok, ekstreni cihazında okut (TR bankaları), ödeme hatırlatması (kilit ekranında tutar görünmez), Face ID / Touch ID, dil + para birimi. Olmayan özellik yazılmaz. |

---

## 1. Siteyi neyin "Borcama" yaptığı (prototipte uygulanmış)

1. **Tek token seti.** `onboardingAkis.css`'teki `.oa` token'ları siteye `:root` düzeyinde taşınır (`--zemin`, `--yuzey`, `--yuzey-2/3`, `--metin`, `--metin-2/3`, `--ozet*`, `--ters*`, `--lime`, `--coral`, `--mint`, `--ekle-ikon`: açıkta lime, koyuda ink). Prototipteki `:root` bloğu kaynaktır.
2. **Archivo Black başlıklar, tek renk.** H1 `clamp(40px, 5.2vw, 62px)` `line-height 1.12` (mobil 1.14), H2 `clamp(30px, 4.2vw, 48px)` `line-height 1.06`, `letter-spacing -.015em`. Vurgu `mark` ile: lime zemin **gradient bantla** (`linear-gradient(transparent 7%, lime 7%, lime 93%, transparent 93%)`) ki satır yüksekliğini aşıp üstteki satırın altına binmesin; ink metin, `padding 0 .12em`, `box-decoration-break: clone`; `text-shadow`/`-webkit-text-stroke` yok. Kabul: iki satıra sarılan başlıkta vurgu bandı önceki satırın harflerine değmez (1280 ve 390'da görsel kontrol).
3. **Mono etiketler** (JetBrains Mono 11px, `.08em`, büyük harf, `--metin-2`) yalnız veri etiketi olarak: ekstre hücre etiketleri, uygulama görüntüleri içinde. Bölüm üstü eyebrow ve fiyat rozeti **yok** (W11). Mono tutarlar: liste ve hücre tutarları.
4. **Kenarlıksız yüzeyler.** Kart = `--yuzey`, 22–26px köşe, gölge yok. Döndürme, çerçeve, "pencere noktaları" süsleri gider.
5. **İmza yalnız dört yerde:** CTA (lime + `0 4px 0 coral`), büyük tutarlar (`--ozet-golge`: açıkta lime+coral, koyuda coral), Pro kartı (`--ters` zemin + `8px 8px 0 coral`), kapanış bandı (lime perde, coral gölgeli başlık, ink CTA). Yıldız/`Sparkles` ikonu hiçbir yerde yok.
6. **Gerçek içerik.** Uygulama görselleri gerçek ekran görüntüsü (W5); sitede çizilmiş uygulama ekranı yok.
7. **Sakin uzman ton.** Kısa cümle, ünlem yok, "Hemen Başla!" yok.

---

## 2. Yapı ve ekranlar

### 2.1 Üst çubuk `.ust`
Yapışkan, zemin %88 + blur. Logo 140px (açık/koyu varyant). Menü yalnız iki eylem: "Giriş yap" (altı çizili) ve lime `.dugme` "Ücretsiz başla" (`/register?plan=free`). Bölüm bağlantısı (Nasıl çalışır, Fiyatlar) yok. Üst çubukta App Store düğmesi ve "Web'de kullan" bağlantısı **yok**; App Store yalnız hero, Ücretsiz kartı ve kapanışta. Tema anahtarı yok. ≤900px: logo + lime CTA.

### 2.2 Hero `.hero`
İki sütun (.95fr / 1.05fr), ≤900px tek sütun. Sol: H1 + lime `mark`; lead (W2); eylemler: `.magaza-cta` + lime `.dugme` "Şimdi başla" (lucide `Monitor`). Eyebrow ve kanıt çipi yok (W11). `?from=mevduat` bağlam kutusu `.cip` stilinde korunur. Sağ: `.sahne` (W5: pencere + telefon; `padding: 0 70px 60px 0`, telefon `position:absolute; right:0; bottom:0`). Pencere `.pencere` (CSS çerçeve) içinde `web-ozet.png`; telefon `.tel` (CSS çerçeve, 250px, `scale(.84)`) içinde `iphone-bugun.png`. ≤900px: pencere gizli, `.tel-kirp` içinde kırpılmış telefon (380px, altta zemine solma).

### 2.3 Cebinde (uygulama özellikleri)
H2 "Her gün yanında, her ay üç cevap.", açıklama "Hesap açmadan başlarsın, banka şifresi hiç sormaz, ekstreni cihazında okur." 3×2 `.ozellik` kartı (44px ikon rozeti, H3, açıklama): Hesap açmadan başla (`UserX`), Banka şifresi yok (`ShieldCheck`), Ekstreni cihazında okut (`ReceiptText`), Ödeme hatırlatması (`Bell`), Face ID / Touch ID (`ScanFace`), Dilin, para birimin (`Globe`). Metinler §4.

### 2.4 Nasıl çalışır `#nasil-calisir`
H2 "Ekle, öde, kalanı gör." + "İlk kurulum iki dakika. Sonraki aylarda yalnız yeni ekstreni ve ödemeni ekle." İkili (1.1fr / .9fr): solda 3 `.adim` alt alta (`WalletCards`, `ReceiptText`, `Check`; mono 01/02/03); sağda `.tel.tek` 250px içinde `iphone-plan.png`.

### 2.5 Her ay üç cevap
Mevcut 3 `.cevap` kartı (`CalendarCheck`, `Target`, `Coins`; Archivo büyük değer + `--ozet-golge`).

### 2.6 Güven + fiyat `#fiyatlar`
`.guven` kartı (etiket yok): "Banka şifresi yok." + 3 satır (`ShieldCheck`, `FileUp`, `Lock` "Kilit ekranında tutar görünmez"). "Ücretsiz başla." başlığı + iki kart (rozet yok): Ücretsiz (CTA lime "App Store'dan indir") ve Pro (`--ters` + coral gölge; açıklama "30 günden sonra seçim sende. … iOS'ta App Store aboneliği, kendiliğinden ücretlendirme yapılmaz."; CTA yok). Fiyatlar sabitlerden.

### 2.7 Kapanış `.son-kutu`
Lime perde (ikon yok); H2 "Borcunu plana çevir." (coral gölge); "İki dakika sürer. Hesap açmadan, banka şifresi vermeden."; ink `.dugme` "App Store'dan indir" + beyaz `.dugme.beyaz` "Şimdi başla" (`/register?plan=free`) (`background:#fff; color: ink` **açıkça**, iki temada; lime perde içindeki düğme renkleri tema token'ından değil sabit). Altında resmi `APP_STORE_ROZET`.

### 2.8 Alt bilgi `.alt`
Mevcut 9 bağlantı; alt satır: not "Kişisel borç, harcama ve varlık takip aracı. Kredi vermez, aracılık etmez." · ortada **"Koyu mod" anahtarı** (`.anahtar` 44×26, açıkken lime ray + ink topuz; `role="switch"`, `aria-checked`) · "Finansal tavsiye değildir."

### 2.9 SEO sayfaları kabuğu (`SeoPages.jsx`, `SeoPages.css`)
`Layout`: aynı `.ust` ve `.alt`. `Hero`: `--ozet` zemin kartı yerine düz zemin + mono breadcrumb + H1 Archivo + lead `--metin-2`. `ToolLayout`: girdi alanları onboarding `.oa-alan` ile aynı (yüzey, mono etiket, 18px girdi, odakta lime iç halka); sonuç kartı `--ozet` zemin + Archivo büyük tutar + `--ozet-golge`; tablolar `--yuzey` satırlar, mono rakam; "Ürün köprüsü" kutuları `.cevap` stili; SSS akordeonu kenarlıksız. Araç kartları (`AracCard`) `.adim` stili. Legal/FAQ: `Layout` + ölçekli tipografi (`max-width 68ch`, 16.5px/1.65).

---

## 3. Duyarlılık ve performans

**Boşluk ölçeği (tek kural, ölçülür):** her üst düzey bölüm (`hero`, `.bolum`, `.son`, `.alt`) `padding: 36px 0` (mobil `24px 0`); başka hiçbir bölüme özel üst/alt boşluk yok. Böylece ardışık iki bölümün görünür içeriği arasındaki boşluk masaüstünde **72px**, mobilde **48px**; `.ust` ile hero arası ~53px. Bölüm içi: `.bolum-bas` altı 22px, başlık-açıklama 10px, kart ızgaraları `gap 12px`, fiyat başlığı üstü 40px. Yan yana kolonlar `align-items: start`. Kabul: `scripts/bolum-araliklari.mjs` (örnek `docs/bolum-araliklari-ornek.cjs`) 1280 ve 390'da ardışık bölümlerin görünür içerik aralığını ölçer; tüm değerler 72 ± 2 (mobil 48 ± 2) olmalı; çıktı PR'a eklenir.

- Kırılımlar: ≤900px tek sütun, menü sade; ≤650px gutter 16px, H1 `clamp(40px, 11vw, 52px)`.
- Yatay taşma yok; `min-width: 0` tüm grid çocuklarında; maket `max-width: 100%`.
- Fontlar `public/fonts` woff2 (mevcut `@font-face`, `font-display: swap`); Google Fonts `@import` **kalkar** (LandingAlt'ta zaten yerel; `Landing.jsx` siliniyor).
- Görseller: logo `<picture>` avif+png (mevcut `LandingLogo`); uygulama görüntüleri `public/ekranlar/*.webp` (+png yedek; masaüstü ≤120KB, telefon ≤80KB), `width/height` yazılı, hero `fetchpriority="high"`, diğerleri `loading="lazy"`; koyu tema `<picture media>` ile `-koyu`. LCP ≤ 2.5 s (hero görüntüsü).
- Lighthouse mobil: Performans ≥ 90, Erişilebilirlik ≥ 95, SEO 100 (mevcut seviyeyi düşürmez; PR'da önce/sonra).
- `prefers-reduced-motion`: `scroll-behavior: auto`, geçiş yok.

---

## 4. Metin (tr; en/de/es/fr/it site dil desteği varsa mevcut mekanizmayla)

Değişmeyen: H1, CTA'lar, fiyatlar, güven cümleleri, alt bilgi, yasal metinler.
Değişen/yeni (hepsi prototipte):
- Lead: "Kart, kredi ve ek hesap borçlarını tek yerde yaz. Hangi borcun önce biteceğini ve maaşından ne kalacağını söyler. Banka bağlantısı istemez."
- Kanıt çipi 3: "Ekstre cihazında işlenir".
- Adım açıklamaları: "Kart, kredi, ek hesap ve kişiye borç. Üç alan yeter; faiz, limit sorulmaz." / "Dosyayı yükle ya da elle gir. Satırlar yerini bulur; ham dosya sunucuya gitmez." / "Kalan borcun ve maaştan kalan güncellensin. Plan her maaşta yenilenir."
- Üç cevap açıklamaları: "Bu ayki tutar ve tarihler; yaklaşan ödeme en üstte." / "En küçük bakiyeden ya da en yüksek faizden; sırayı sen seç." / "Gelir eksi ödemeler eksi yaşam. Her maaşta yenilenir."
- Hero mono etiket: "İPHONE UYGULAMASI · ÜCRETSİZ"; lead: "Kart, kredi ve ek hesap borçlarını yaz; hangi borcun önce biteceğini ve maaşından ne kalacağını gör. Hesap açmadan başla, banka şifresi verme.".
- Cebinde: H2 "Her gün yanında, her ay üç cevap." / "Hesap açmadan başlarsın, banka şifresi hiç sormaz, ekstreni cihazında okur." Kartlar: "Hesap açmadan başla — Her özelliği hemen kullan. Hesap yalnız cihazlar arası eşitleme ve yedek için gerekir." · "Banka şifresi yok — Borcama banka şifreni hiç sormaz. Önemli olanı sen yazarsın, kendi para biriminde." · "Ekstreni cihazında okut — Kart ekstresini yükle; satırlar cihazında ayrışır. Ham dosya sunucuya gitmez." · "Ödeme hatırlatması — İstersen ödemeden bir gün önce. Kilit ekranında tutar ve banka adı görünmez." · "Face ID / Touch ID — Finansın cihazının biyometrisinin arkasında kalır." · "Dilin, para birimin — Türkçe, English, Deutsch, Français, Español, Italiano. TRY, USD, EUR, GBP ve daha fazlası."
- Kapanış: H2 "Borcunu plana çevir." / "İki dakika sürer. Hesap açmadan, banka şifresi vermeden."
- Güven 3. satır: "Kilit ekranında tutar görünmez". Pro açıklaması: "... iOS'ta App Store aboneliği; kendiliğinden ücretlendirme yapılmaz."
- Pro maddeleri: "Borç kapatma sırası ve senaryolar / Sınırsız ekstre / Finans asistanı" — **`proSatis.js`'teki gerçek Pro kapsamıyla doğrula; uymayan madde yazılmaz.**
- `index.html` `.landing-static` (JS kapalı/prerender metni) yeni lead ile güncellenir; `og:description` aynı kalır.

---

## 5. Fazlar

**PR-W1 `claude/web-v3-landing`** (PR-3'ü beklemez; onboarding PR'ına da bağlı değil)
1. `src/siteTema.css` (yeni): token'lar + ortak `.ust`, `.alt`, `.dugme`, `.cip`, `.mono`, tipografi. `LandingAlt.jsx` ve `SeoPages.jsx` bunu import eder; inline `CSS` sabitleri silinir.
2. `scripts/ekran-goruntuleri.mjs` yazılır (uygulama direktifi §2'deki tanım: Supabase env'siz `vite` demo modu + Playwright; `/summary` 1280×800 `web-ozet(-koyu)`, 390×844 `iphone-bugun`, `iphone-borclar`, `iphone-plan`; 2x DPR; png + webp; sentetik veri) ve `public/ekranlar/` 8 görüntü üretilip PR'a eklenir; CSS çerçeveler (`.pencere`, `.tel`, `.tel-kirp`) `siteTema.css`'te. `npm run ekranlar` kısayolu.
3. `LandingAlt.jsx` → §2 yapısı. `Landing.jsx` (`/classic`), `LandingStory.jsx` (`/landing-v2`), `LandingGrowth.jsx` ve `main.jsx`'teki yolları **kaldır** (W1); `landingAlt.test.js`, `landingGrowth.test.js` güncellenir/silinir; `landingExperiment.js` dokunulmaz.
4. Tema: varsayılan açık; `siteTema.js` alt bilgideki anahtarla `data-theme="dark"` yazar/siler, `localStorage` `borcama:site-koyu` (try/catch). `prefers-color-scheme` dinlenmez.
5. `index.html` statik blok metni; `prerender-seo.mjs` çıktısı değişmez (doğrula: `npm run build` sonrası `dist/` içindeki bir araç sayfası ve `/` HTML'inde başlık/meta aynı).
6. CHANGELOG Unreleased; `docs/mailing-yenilik-havuzu.md`; `docs/departman-devirleri.md`; `docs/aktif-deneyler.md`'ye not: "v1.74.0: landing v3 varsayılan oldu; deney açılmadı (trafik eşiği)".

**PR-W2 `claude/web-v3-seo-kabuk`** (W1 canlıya çıkıp Lighthouse/SEO doğrulanınca): `SeoPages.jsx` `Layout/Hero/ToolLayout/AracCard`, `Legal.jsx`, `LegalEn.jsx`, `Faq.jsx` kabuk + tipografi. Hesaplayıcı mantığı, `useSeo`, schema, breadcrumb, prerender listeleri değişmez; `apiUlke`, `seoIndexing` dokunulmaz.

---

## 6. Kabul ölçütleri

- [ ] Masaüstü (1280) ve mobil (390) tam sayfa, açık ve koyu: prototiple eşleşiyor (kenarlık/döndürme/koyu yeşil yok; imza dört yerde).
- [ ] H1, fiyatlar, güven cümleleri, alt bilgi bağlantıları ve `?from=mevduat` bağlamı aynı; hero ve kapanışta iki eşit CTA (App Store + `/register?plan=free`).
- [ ] Sayfa sistem teması koyu olsa da açık açılıyor; alt bilgideki anahtar koyuya alıyor ve yenilemede hatırlıyor; anahtar klavyeyle erişilebilir.
- [ ] `landing_visit`, `register_view`, `landing_cta_click` ve edinim olayları aynı adla tetikleniyor; yeni `landing_appstore_click` App Store bağlantılarında kaydediliyor; App Store bağlantılarında kampanya parametresi var.
- [ ] `npm run build` sonrası prerender çıktıları (araçlar, rehber, sözlük, `/`) başlık/meta/schema olarak önceki build ile aynı (`diff` ile; yalnız gövde HTML değişir).
- [ ] Lighthouse mobil: Performans ≥ 90, Erişilebilirlik ≥ 95, SEO 100; önceki değerlerin altına düşmez.
- [ ] **Otomatik kontrast denetimi geçti.** `scripts/kontrast-denetimi.mjs` (Playwright; her metin düğümü için hesaplanan ön/arka plan rengi, WCAG oranı; normal metin ≥ 4.5, büyük metin ≥ 3; pasif düğmeler dahil; `background-clip: text` ögeleri hariç tutulur) iki temada ve her ekranda/sayfada **0 bulgu** verir; çıktı PR açıklamasında. Koyu mod anahtarı açıkken de çalıştırılır; özellikle lime/krem/beyaz zemin üstündeki düğme metinleri (kapanış bandı) ve alt bilgi notları.
- [ ] Üst çubukta yalnız "Giriş yap" + "Ücretsiz başla"; `bolum-araliklari` ölçümü: 1280'de tüm aralıklar 72 ± 2, 390'da 48 ± 2.
- [ ] Yatay taşma yok (390px); klavye ile tüm bağlantı ve düğmeler erişilebilir, odak halkası görünür.
- [ ] Kodda emoji ve literal hex yok (token tanımları hariç); Google Fonts `@import` yok.
- [ ] Sitedeki her uygulama görseli `public/ekranlar/`'dan gerçek görüntü (script bu PR'da; `npm run ekranlar` 8 dosya üretiyor); sitede çizilmiş uygulama ekranı yok; görüntüler uygulamanın bugünkü haliyle birebir (göz kontrolü: canlı `/summary` ile yan yana); ≤900px'te pencere gizli, telefon kırpılmış ve ortalı; yatay taşma yok.
- [ ] "Cebinde" kartlarındaki 6 özellik mağaza metinleriyle birebir; olmayan özellik yok.
- [ ] Sayfada bölüm üstü eyebrow, hero kanıt çipi ve fiyat rozeti yok; mono etiket yalnız ekstre kartı ve uygulama görüntüleri içinde.
- [ ] Eski landing yolları (`/classic`, `/landing-v2`, `/landing-preview`) kaldırıldı; `main.jsx` testleri yeşil.
- [ ] Vercel önizlemesinde iki temada masaüstü + mobil tam sayfa görüntüleri PR'da; `docs/aktif-deneyler.md` notu eklendi.

---

## 7. Dokunulmayacaklar

`landingExperiment.js`, `landingMeasurement.js` (yalnız `landing_appstore_click` eklenir), `funnelAnalytics.js`, `acquisition.js`, `googleAds.js`; `prerender-seo.mjs` listeleri ve `useSeo`; `appStore.js`; fiyat sabitleri; hesaplayıcı mantığı (`SeoPages.jsx` fonksiyonları, `financialGlossary.js`); yasal metin içerikleri; `Auth.jsx` (onboarding v3 görevinde); uygulama (`App.jsx`) görünümü.

---

## 8. Claude Code'a yapıştırılacak görev metni

```
Görev: borcama.com ana sayfasını (LandingAlt.jsx) v3'e taşı: iPhone uygulaması ve web eşit ağırlıkta, görseller uygulamanın gerçek ekran görüntüleri, varsayılan açık tema.

Önce oku, sonra başla:
1. docs/web-v3-direktifi.md — tamamı; bu görevin spesifikasyonu (W1–W11 kararları Özer onaylı).
2. docs/onboarding-v3-direktifi.md §2 (token'lar, tipografi, ikon eşlemesi) — site aynı sistemi kullanır.
3. docs/web-v3-prototip.html — görsel hedef. Playwright ile aç (fontlar ve logolar gömülü), 1280 ve 390 genişlikte, açık ve koyu (alt bilgideki anahtar) tam sayfa görüntü al; sayfa düzeni, boşluk ve stil hedefi bu. Prototipteki telefon/pencere içindeki uygulama ekranları siteye KOPYALANMAZ; onların yerine gerçek görüntü gelir.
4. docs/uygulama-v3-direktifi.md §2 — scripts/ekran-goruntuleri.mjs tanımı (scripti bu PR'da sen yazıyorsun).
5. AGENTS.md, CLAUDE.md, CHANGELOG.md, docs/aktif-deneyler.md.

Kurallar:
- Dal: origin/main'den claude/web-v3-landing. Kapsam yalnız §5 PR-W1; SEO kabuğu (PR-W2) ayrı dal. Onboarding ve PR-3 görevlerine bağlı değil; paralel çalışır.
- Yapı §2: üst çubuk (logo + "Giriş yap" + lime "Ücretsiz başla"; başka bağlantı yok) → hero → cebinde → nasıl çalışır → üç cevap → güven + fiyat → kapanış → alt bilgi. "Web'de de" bölümü yok. Eyebrow, hero çipi, fiyat rozeti yok.
- Hero ve kapanışta iki eşit CTA: ink "App Store'dan indir" (APP_STORE_URL + kampanya parametresi, appStoreBaglantisi(ct)) ve lime "Şimdi başla" (/register?plan=free; kapanışta beyaz düğme, metin ink). H1, fiyatlar, güven cümleleri, alt bilgi bağlantıları ve ?from=mevduat bağlamı aynen kalır. "Cebinde" 6 özelliği mağaza metinlerinden; olmayan özellik yazma. Metinler §4.
- Görseller: scripts/ekran-goruntuleri.mjs'i yaz (Supabase env'siz vite demo modu + Playwright; public/ekranlar/ 8 dosya: web-ozet, iphone-bugun, iphone-borclar, iphone-plan × açık/koyu; png + webp; sentetik veri). Hero: web-ozet CSS tarayıcı çerçevesinde (.pencere), sağ altında iphone-bugun CSS telefon çerçevesinde (.tel); "Nasıl çalışır" yanında iphone-plan; ≤900px'te pencere gizli, telefon kırpılmış (.tel-kirp) ve ortalı. UygulamaEkrani/UygulamaPenceresi gibi çizilmiş ekran bileşeni YAPMA.
- Renkler yalnız onboarding direktifi §2.1 token'larından; token tanımları dışında literal hex yok. Yüzeylerde kenarlık, döndürme, gölge yok; imza (lime + coral blok gölge) yalnız CTA, büyük tutar, Pro kartı ve kapanış bandında.
- Emoji yok; Sparkles/yıldız ikonu yok; ikonlar lucide-react; banka logoları bankLogos.js; App Store rozeti APP_STORE_ROZET. Google Fonts @import yok (public/fonts).
- Tema: varsayılan açık; prefers-color-scheme dinlenmez; koyu yalnız alt bilgideki anahtarla (data-theme="dark", localStorage borcama:site-koyu, try/catch).
- Boşluk: her bölüm padding 36px 0 (mobil 24px 0); başka dikey margin yok. scripts/bolum-araliklari.mjs (docs/bolum-araliklari-ornek.cjs örneği) ile ölç: 1280'de tüm aralıklar 72±2, 390'da 48±2.
- Kontrast: scripts/kontrast-denetimi.mjs (docs/kontrast-denetimi-ornek.cjs örneği) iki temada 0 bulgu; özellikle kapanış bandındaki beyaz düğme metni ve alt bilgi notları. Renk kararını göz kararıyla değil bu çıktıyla kapat.
- landingExperiment.js, prerender-seo.mjs, useSeo, fiyat sabitlerine dokunma. landingMeasurement.js'e yalnız landing_appstore_click ekle. Pro maddelerini proSatis.js'teki gerçek kapsamla doğrula.
- Eski landing dosyalarını ve yollarını kaldır (Landing.jsx, LandingStory.jsx, LandingGrowth.jsx, /classic, /landing-v2, /landing-preview); ilgili testleri güncelle.
- Her bölümü bitirince Playwright ile 1280 ve 390'da iki temada görüntü al, prototiple yan yana karşılaştır, fark varsa düzelt. Sıra: siteTema.css + üst/alt → ekran görüntüsü scripti → hero → cebinde → nasıl çalışır → üç cevap → güven + fiyat → kapanış → index.html statik blok.
- Bitince: npm ci, npm run release:check, npm test, npm run build; build sonrası dist/ prerender çıktılarını önceki build ile diff'le (başlık/meta/schema aynı olmalı). Lighthouse mobil önce/sonra. CHANGELOG Unreleased, mailing-yenilik-havuzu, departman-devirleri, aktif-deneyler notu. Sürüm 1.74.0.
- Direktif §6 kabul ölçütlerini tek tek doğrulayıp PR açıklamasında işaretle; işaretlenmemiş madde varken PR açma. PR'da iki temada masaüstü + mobil tam sayfa görüntüleri, aralık ve kontrast çıktıları, Lighthouse önce/sonra, Vercel önizleme adresi, risk ve ölçüm planı.
- Kararsız kaldığın yerde direktif > prototip > mevcut kod; direktifte olmayan ürün kararı gerekirse bana sor, varsayma.
```
