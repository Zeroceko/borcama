# Uygulama ana ekranları v3 · Claude Code direktifi (PR-3)

Tarih: 28 Ekim 2026 · Hazırlayan: Claude (CEO sohbeti) · Hedef: `Zeroceko/borcama` · Sürüm: 1.74.0 (minor; onboarding v3 1.73.0'dan sonra, site v3 1.75.0 bundan sonra)
Görsel hedef: `docs/web-v3-prototip.html` içindeki üç telefon ekranı (Bugün, Borçlar, Borç Planı) ve masaüstü pencere maketi. Bunlar sitede **gösterilmeyecek**; uygulamanın kendisi bu görünüme gelecek, site de uygulamanın gerçek görüntüsünü çekecek.
Kardeş dokümanlar: `docs/onboarding-v3-direktifi.md` (token'lar §2.1, tipografi §2.2, ikonlar §2.4), `docs/web-v3-direktifi.md` (site; görüntüleri bu PR'dan sonra yeniden çeker).

> Tek cümle: **Uygulama, kurulum akışıyla aynı yüzeye geçer.** Veri, hesaplar, ekranlar arası akış, Pro mantığı, ölçüm aynen; `App.jsx` içindeki stil bloğu (satır ~422–839) onboarding token'larına taşınır, kartlar kenarlıksız ve dolgu kontrastlı olur, imza (lime + coral blok gölge) yalnız hero tutarı, birincil düğme ve seçili sekmede kalır, sekme çubuğu 5 öğeli olur (ortada +).

---

## 0. Onaylı kararlar (Özer, 28 Ekim 2026)

| # | Karar |
|---|---|
| U1 | **Kapsam = görünüm.** `App.jsx` `CSS` sabiti (satır 422–839) ve ona bağlı sınıf kullanımı; `Ozet`, `Borclar`, borç planı, `Varliklar`, hareketler, ayarlar ekranlarının **yüzeyi**. Hesap, veri modeli, akış, Pro kapıları, analitik, Supabase, RevenueCat/Paddle, ekstre ayrıştırma, asistan **değişmez**. |
| U2 | **Web ve iOS tek PR.** iOS uygulaması aynı React kodunu Capacitor'da çalıştırır; bu PR birleşince web anında, iOS bir sonraki App Store build'inde (1.74.0, build +1) aynı görünüme geçer. Swift tarafı yalnız sekme çubuğu için (U4). |
| U3 | **Yüzen "+" kalkar, "+" sekme çubuğunun ortasına girer.** Web HTML çubuğu (`bt-nav-ana`): Bugün · Borçlar · [+] · Hareketler · Varlıklar; "+" çubuk içinde 44px daire, açıkta ink zemin + lime artı, koyuda krem zemin + ink artı; taşma ve gölge yok; dokununca mevcut hızlı ekle sayfası (`kabuk.hizli.*`; Ekstre yükle, Yeni borç + **Ödeme işaretle, Harcama** eklenir). |
| U4 | **iOS gerçek `UITabBar` 5 öğe** (`NativeTabBar.swift`): orta öğe `UITabBarItem` değil, çubuğun üstüne eklenen özel `UIButton` (44px daire, aynı renkler), `nativeSekmeCubugu.js` köprüsüne `"ekle"` olayı; web `borcamaSekmeSecildi{anahtar:"ekle"}` alınca hızlı ekle sayfasını açar. Swift değişikliği bu PR'da ama ayrı commit; Özer TestFlight'ta görür. |
| U5 | **Tema token'ları ortak.** `ACIK_TEMA`/`KOYU_TEMA` değerleri korunur ama uygulama `onboardingAkis.css`'teki `.oa` token adlarının `.bt-app` eşdeğerlerini (`--bg`, `--panel`, `--panel2`, `--text`, `--dim`, `--faint`, `--summary-*`) kullanmaya devam eder; yeni eklenen: `--line`/`--line-soft` **kullanımdan kalkar** (kenarlık yok), `--yuzey-3` (`#e6e1d2` / `#2e3324`) ve `--ekle-ikon` eklenir. "system" teması onboarding PR'ından gelir. |
| U6 | **Emoji yok, yıldız yok.** İkonlar lucide (mevcut import listesi); `Sparkles` yalnız asistan/Pro rozetinde **kalabilir** (ürün özelliği; Özer kararı: kalsın mı? — varsayılan: Pro rozetinde kalır, başka yerde kullanılmaz). |
| U7 | **Yazı tipleri aynı:** Archivo Black başlık ve hero tutar, Space Grotesk gövde, JetBrains Mono etiket/tarih/tutar. Google Fonts `@import` `App.jsx`'ten **kalkar**; paketteki woff2 `@font-face` kullanılır (LandingAlt'taki tanım `siteTema.css`/ortak dosyaya). |

---

## 1. Değişen yüzey (ekran ekran)

Hedef görünüm: prototipteki telefon ekranları. Bilgi düzeni mevcut ekranla aynı; sadece kabuk ve kartlar değişir.

### 1.1 Kabuk (`bt-app`, `bt-header`, `bt-nav-ana`)
- Üst: logo (mevcut `clamp(150px,22vw,220px)` → 132px mobil / 160px masaüstü), sağda mono tarih (`.bt-date`, kalır), "Borcama'ya sor" ve "Pro'ya geç" pilleri (mevcut `bt-pill` → kenarlıksız `--panel2` zemin, 36px, 13px 700; Pro pili lime + ink, blok gölge yok).
- Ana sekmeler: web/masaüstünde üst pill satırı (mevcut düzen; seçili lime + ink, pasif `--panel2`, kenarlık ve `inset` gölge yok); mobil web'de alt çubuk `bt-nav-ana` (U3): `--panel` %90 + blur, 18px köşe, 5 sütun `1fr 1fr 56px 1fr 1fr`, ikon 18px + 10.5px etiket, seçili lime pill, ortada `.bt-ekle` dairesi.
- Yüzen "+" (`bt-fab` ya da eşdeğeri) kaldırılır.

### 1.2 Bugün (`Ozet`)
- Hero kartı `.bt-hero`: `--summary-bg` zemin (açıkta mint, koyuda ink), 22px köşe, **kenarlık yok**; etiket mono "MAAŞA KADAR KALAN" / mevcut etiket mantığı; tutar Archivo `clamp(30px,7.5vw,52px)` + `--summary-shadow` (korunur); alt satır "Maaşa **19 gün** var. Ödemeler planda." mevcut metin anahtarlarıyla; üç dilimli serit (coral ödemeler, `--faint` yaşam, lime kalan) `oa-serit` ile aynı.
- "Sıradaki ödeme" satırı: `--panel`, 14px köşe, banka logosu (`BANK_LOGOS`) ya da `BANKA_KOD` rozeti, lime iç halka (`box-shadow: 0 0 0 2px lime inset`), sağda coral tutar rozeti.
- Borç satırları `.bt-card`: `--panel`, 14px köşe, kenarlık yok, gölge yok; banka logosu + ad + alt satır (`--dim`) + mono tutar.
- "Bu ay" bölümü (harcama) aynı satır stili.
- Bugün ekranındaki uyarı paneli, ilk kullanım rehberi, aktivasyon görevleri (`ilk-kullanim-sprinti.md`) **aynen**; yalnız kart yüzeyi.

### 1.3 Borçlar (`Borclar`)
- Üst pill satırı (Kartlar / Krediler / Ek hesap / Borç planı) `.bt-pill` yeni stil.
- Özet kartı: `--panel`, mono etiket, Archivo tutar (+ özet gölgesi), alt satır.
- Kart/kredi satırları, ekstre işlemleri kutusu, "Ekstre ekle" düğmesi: kenarlıksız yüzeyler; birincil düğme lime + coral blok gölge (`.oa-dugme` ile aynı), ikincil `--panel2` pill.
- İki sütunlu küçük hücreler (Asgari / Tahmini faiz): `--panel2`, 10px köşe, mono tutar.

### 1.4 Borç planı
- Sıra listesi: 1 lime daire (sonrakiler `--panel2`), ad + alt satır, mono tutar.
- "Tahmini aylık faiz yükü" bandı: `--text` zemin + `--bg` metin (ters), Archivo cümle, lime pill düğme.
- Pro kapısı metinleri ve mantığı aynı.

### 1.5 Hareketler, Varlıklar, Ayarlar
- Aynı kurallar: kenarlık yok, `--panel`/`--panel2` katmanları, mono etiketler, lime seçili durum, birincil düğme imzalı. Form girdileri onboarding `.oa-alan` ile aynı görünüm (yüzey, mono etiket, odakta lime iç halka). Ayarlar'daki tema seçici üç seçenekli (onboarding PR'ından).

### 1.6 Masaüstü
- Uygulama ≥1024px'te mevcut tek kolon düzenini korur; kartlar `max-width` ile ortalanır (mevcut). Üst pill sekmeleri görünür, alt çubuk yok. Bu görünüm sitenin "web" görselidir.

---

## 2. Teknik

- `App.jsx` `CSS` sabiti → `src/uygulama.css` dosyasına taşınır (import), içinde `@font-face` ve token'lar; `temaRenkleri` inline değişkenleri aynen kalır (ek: `--yuzey-3`, `--ekle-ikon`).
- `.bt-*` sınıf adları korunur; yalnız kurallar değişir. `border`, `box-shadow` (imza dışında), `transform: rotate(...)` kullanımı sıfırlanır.
- Sekme çubuğu: `bt-nav-ana` bileşenine 5. öğe; `hizliEkleAc()` mevcut sayfayı açar; `nativeSekmeCubugu.js > sekmeCubuguHazirla` `basliklar`a `"+"` yerine `ekle: true` bayrağı gönderir; `NativeTabBar.swift` bayrağı bilmeyen eski build'ler 4 öğeyle çalışmaya devam eder.
- Testler: `src/*.test.js` yeşil; `loanEntryForm.test.js`, `debtFormRender.test.js` gibi render testleri sınıf adlarına bağlıysa güncellenir.
- Ekran görüntüsü üretimi (site için; script PR-W1 ile geliyor, `main`'de yoksa bu PR'da yazılır; bu PR birleşince `npm run ekranlar` yeniden çalıştırılır ve `public/ekranlar/` güncellenir): `scripts/ekran-goruntuleri.mjs` — Supabase env'siz `vite` (demo modu: `demoVerisiOlustur` sentetik veri, `demoModu = DEV && !supabaseHazir`) + Playwright: `/summary` 1280×800 (`public/ekranlar/web-ozet.png`), 390×844 Bugün / Borçlar / Borç planı (`public/ekranlar/iphone-bugun.png`, `iphone-borclar.png`, `iphone-plan.png`), açık ve koyu (`-koyu` eki), 2x DPR, webp + png. Sentetik veri olduğu için gerçek kullanıcı verisi yok (CLAUDE.md yasakları korunur).

---

## 3. Kabul ölçütleri

- [ ] 390×844 Bugün / Borçlar / Borç planı açık ve koyu: prototipteki üç ekranla bilgi düzeni ve yüzey eşleşiyor (kenarlık yok, blok gölge yalnız hero tutarı ve birincil düğmede, seçili lime, mono etiket, banka logolu satırlar, 5 öğeli çubuk, yüzen + yok).
- [ ] 1280×800 masaüstü: üst pill sekmeleri, ortalı kolon, aynı yüzey.
- [ ] Hesaplanan hiçbir tutar, tarih ya da metin değişmedi (demo veriyle önce/sonra ekran metni `diff`i: yalnız stil).
- [ ] Hızlı ekle sayfası ortadaki +'dan açılıyor; Ödeme işaretle ve Harcama seçenekleri mevcut akışlara gidiyor.
- [ ] iOS: `NativeTabBar.swift` 5 öğe, orta düğme hızlı ekle'yi açıyor; eski web build ile 4 öğe geriye uyumlu (TestFlight).
- [ ] `npm run ekranlar` (`scripts/ekran-goruntuleri.mjs`) v3 yüzeyle yeniden çalıştırıldı, `public/ekranlar/` 8 dosya güncellendi; görüntülerde gerçek kullanıcı verisi yok.
- [ ] **Otomatik kontrast denetimi geçti.** `scripts/kontrast-denetimi.mjs` (Playwright; her metin düğümü için hesaplanan ön/arka plan rengi, WCAG oranı; normal metin ≥ 4.5, büyük metin ≥ 3; pasif düğmeler dahil; `background-clip: text` ögeleri hariç tutulur) iki temada ve her ekranda/sayfada **0 bulgu** verir; çıktı PR açıklamasında. İlk PR'da script eklenir, sonrakiler kullanır.
- [ ] Emoji ve literal hex yok (token tanımları hariç); Google Fonts `@import` yok; Lighthouse mobil performans mevcut değerin altına düşmedi.
- [ ] `docs/departman-devirleri.md`, `CHANGELOG.md` (web + iOS maddeleri), `docs/mailing-yenilik-havuzu.md`; App Store sürüm notu taslağı `docs/ios-app-store-gonderim.md`'ye.

---

## 4. Claude Code'a yapıştırılacak görev metni

```
Görev: Uygulamanın ana ekranlarını (App.jsx stil bloğu + bt-* yüzeyleri + sekme çubuğu) kurulum akışıyla aynı v3 yüzeyine taşı; web ve iOS aynı kodu kullandığı için tek PR.

Önce oku: docs/uygulama-v3-direktifi.md (tamamı), docs/onboarding-v3-direktifi.md §2 (token, tipografi, ikon), docs/web-v3-prototip.html içindeki üç telefon ekranı ve masaüstü pencere maketi (Playwright ile aç, 1280'de ve ekran bölümlerini yakınlaştırarak görüntü al; hedef görünüm bu). AGENTS.md, CLAUDE.md, CHANGELOG.md.

Özer onayı: U1–U7 onaylı. Bu görev iOS'a yalnız NativeTabBar.swift ve nativeSekmeCubugu.js köprüsü için dokunur (U4), ayrı commit.

Kurallar:
- Dal: origin/main'den claude/uygulama-v3-yuzey. Onboarding v3 PR'ı birleşmişse onun token'larını kullan; birleşmemişse aynı değerleri src/uygulama.css'e yaz ve PR açıklamasına not düş.
- Yalnız görünüm: hesap, veri, akış, Pro kapıları, analitik, Supabase/RevenueCat/Paddle, ekstre ayrıştırma, asistan değişmez. Demo veriyle önce/sonra ekran metni diff'i yalnız stil farkı göstermeli.
- App.jsx CSS sabitini src/uygulama.css'e taşı; bt-* sınıf adlarını koru; border, imza dışı box-shadow ve rotate kullanımını sıfırla; imza (lime + coral blok gölge) yalnız hero tutarı, birincil düğme ve Pro pili.
- Sekme çubuğu 5 öğe, ortada + (U3); yüzen + kaldır; iOS UITabBar 5. öğe (U4) ayrı commit, eski web build ile geriye uyumlu.
- Emoji yok; yıldız/Sparkles yalnız Pro rozetinde; ikonlar lucide; banka logoları bankLogos.js. Google Fonts @import kalkar, paketteki woff2.
- scripts/ekran-goruntuleri.mjs main'de varsa (PR-W1) yeniden çalıştır, yoksa §2'ye göre yaz; public/ekranlar/ 8 görüntü v3 yüzeyle güncellensin.
- Her ekranı bitirince 390x844 ve 1280x800'de iki temada görüntü al, prototiple karşılaştır, düzelt. Sıra: uygulama.css + kabuk + sekme çubuğu → Bugün → Borçlar → Borç planı → Hareketler → Varlıklar → Ayarlar → ekran görüntüsü scripti.
- Bitince: npm ci, npm run release:check, npm test, npm run build; iOS build notu (npm run ios:version). CHANGELOG (web + iOS), mailing-yenilik-havuzu, departman-devirleri. Sürüm 1.74.0.
- scripts/kontrast-denetimi.mjs'i iki temada tüm ekranlarda 0 bulguyla geç (§3).
- §3 kabul ölçütlerini işaretlemeden PR açma. PR'da iki temada mobil 3 ekran + masaüstü görüntüleri, TestFlight notu, risk ve ölçüm planı.
- Kararsız kaldığın yerde direktif > prototip > mevcut kod; ürün kararı gerekirse bana sor, varsayma.
```
