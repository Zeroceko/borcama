# Web (büyük ekran) — kayıttan kullanıma kesintisiz akış

> Kapsam: **borcama.com, masaüstü tarayıcı, ≥1024 px genişlik.** Landing → kayıt/giriş → e-posta kodu → kurulum (onboarding) → ilk "Bugün" ekranı → ilk kullanım (sekmeler, borç/harcama ekleme). Mobil web ve iOS bu görevin dışında; yalnız **bozulmadığı** doğrulanır (390 px görüntü).
> Kaynak: 28 Ekim 2026 denetimi. Canlı borcama.com (Chrome, Özer'in Borcama profili, `zero+1@borcama.com`) ve `main` (`ecec779`, v1.73.0) demo modunda Playwright ile 1440×900, 1024×768 ve 390×844. Her bulgunun yanında ölçüm ya da kod satırı var.
> Kardeş dokümanlar: `docs/onboarding-v3-direktifi.md` (token'lar, `.oa-*` bileşenleri), `docs/uygulama-v3-direktifi.md` (PR-3, uygulama yüzeyi), `docs/web-v3-direktifi.md` (landing).

---

## 0. Onaylı kararlar (Özer, 28 Ekim 2026)

| # | Karar |
|---|---|
| A1 | **Webde kurulumdan önce koyu tema yok.** Landing, `/register`, `/login`, kod ekranı, `/auth-callback`, `/reset-password` ve kurulumun "Açık mı, koyu mu?" adımına kadarki ekranlar her zaman **açık**; `prefers-color-scheme` dinlenmez. Tema kurulumun 2. adımında seçilir ve o andan itibaren kurulumun geri kalanı ve uygulama seçilen temayla ilerler. |
| A2 | Büyük ekranda kayıt ve kurulum **telefon sütunu gibi görünmez**: uygulamanın masaüstü kabuğuyla aynı üst çubuk, aynı genişlik ızgarası; sağda kullanıcının girdikçe oluşan canlı "Bugün" önizlemesi (§3). Kurulum biter bitmez önizleme gerçek "Bugün" ekranına dönüşür; tam sayfa yenileme ve "Yükleniyor" ekranı yok. |
| A3 | Kurulumun verdiği sayılar ile uygulamanın ilk ekranı **aynı** olur (aynı yaşam bütçesi varsayımı, aynı ödeme tutarı). "Plan'da değişir" vaadi gerçek bir alanla karşılanır. |
| A4 | Büyük ekranda sağ altta yüzen düğme yok: "Hızlı işlem" üst çubuğa "+ Ekle" düğmesi, "Görüş bildir" üst çubuktaki hesap menüsüne taşınır. Ekleme formları satır içinde değil, sağdan açılan panelde açılır. |

CLAUDE.md'ye göre giriş akışı ve ana akış değişikliği Özer onayı ister; yukarıdakiler onaylıdır, PR açıklamasına "onaylı (A1–A4)" yazılır.

---

## 1. Bulgular (önem sırasıyla, kanıtlı)

| # | Önem | Bulgu | Kanıt / kök neden |
|---|---|---|---|
| B1 | Kritik | **Sözleşme onay kutuları görünmüyor** (açık ve koyu, tüm genişlikler). Kullanıcı kutuları göremiyor; "Kod gönder" e-posta geçerli olsa da pasif kalıyor ve neden pasif olduğu yazmıyor. | `onboardingAkis.css:1299` `.oa-onay button { border:0; background:none; text-decoration:underline }` (özgüllük 0,1,1) `.oa-kutu`'yu (0,1,0) eziyor. Ölçüm: `.oa-kutu` `border: 0px none`, `background: transparent` (canlı + yerel, iki tema). Seçili halde koyuda `--oa-ink` zemin koyu panelde kayboluyor. |
| B2 | Kritik | **Ölçüm izni bandı kurulumun ana düğmesini örtüyor.** Landing'de bandı yanıtlamayan kullanıcı kurulumda "Devam et"e basamıyor (Playwright: tıklama `aside.gac` tarafından engellendi). | 1440×900 ve 390×844'te 1. adımda bant `.oa-dugme`'nin üstünde. `main.jsx` bandı `!nativeMi && !crmAlanindaMi` ise her rotada çiziyor; kurulumda masaüstü CTA alta sabit değil, içerik altında. |
| B3 | Yüksek | **Landing açık, kayıt ekranı koyu** (sistem koyuysa). Tek tıkta başka bir siteye geçilmiş gibi. | `Auth.jsx:542`, `:1032` `useSistemKoyu()` → `.oa-koyu`. Landing sabit açık (W4). Canlı: `/register?plan=free` `oa oa-auth oa-koyu`. |
| B4 | Yüksek | **Sekme değiştirince sayfa yana kayıyor.** Kısa sekmede (Hareketler) kaydırma çubuğu kayboluyor, tüm düzen 7 px sağa kayıyor, uzun sekmeye dönünce geri geliyor. | Canlı Chrome (kaydırma çubuğu 15 px): başlık x: Bugün 441 → Hareketler 448 → Varlıklar 441. `docH` 907 vs 1675. `html`'de `scrollbar-gutter` yok. |
| B5 | Yüksek | **Kurulumun planı ile uygulamanın ilk ekranı çelişiyor.** Kurulum: "Her maaşta ödemelere ₺6.200 · yaşam gideri için %45 varsayıldı; Plan'da değişir". Uygulama: "Aylık plan: Veri eksik — en az bir harcama ekleyince…", Pro kartı "Kart ve KMH'ye ilk ay ₺25.800". | Kurulum `yasamVarsayilan(gelir)` (%45) ile hesaplıyor ama veriye yazmıyor; `financialScenario.js` yalnız `expenses` ya da `livingBudgetOverride` biliyor, App bir override geçmiyor; kaydedilen bir yaşam bütçesi alanı yok, yani "Plan'da değişir" karşılıksız. |
| B6 | Yüksek | **Kurulum ortasında sayfa yenilenince her şey sıfırlanıyor** (5. adım → 1. adım, cevaplar kayıp). | `KurulumAkisi` `adim` ve `durum` yalnız `useState`. Playwright: "ADIM 5/10" → reload → "ADIM 1/10". |
| B7 | Yüksek | **Tarayıcının geri tuşu kurulumdan çıkarıyor** (önceki adıma değil, landing'e). Oturumlu kullanıcı landing'den `/summary`'ye dönünce kurulum yine 1. adımdan başlıyor. | Adımlar `history`'ye yazılmıyor; URL tüm akış boyunca `/summary`. |
| B8 | Orta | **Kurulum bitince tam sayfa yenileme**: "Hazırsın" → beyaz/krem "Yükleniyor…" → uygulama. Kesintisiz değil. | `Onboarding.jsx:793` `bitir() { window.location.assign("/summary") }`. |
| B9 | Orta | **Büyük ekranda kayıt ve kurulum telefon sütunu**: boş krem zeminin ortasında 520 px sütun, üst çubuk/logo yok; "Hazırsın" 560×810 telefon biçimli lime kart. Uygulamaya geçince bambaşka bir kabuk (logo, sekme pill'leri, 1024 px ızgara). | 1440 görüntüleri (kurulum 11 ekran + ilk Bugün). |
| B10 | Orta | **"Hızlı işlem" menüsü vaadini tutmuyor**: "Yeni borç ekle" ve "Ekstre ekle" ikisi de yalnız Borçlar › Kartlar sekmesine götürüyor, form/yükleyici açılmıyor; "Ödeme gir" yalnız listeye gidiyor. Yalnız "Harcama ekle" formu açıyor. | `App.jsx` ~3895–3926: son iki maddenin `onClick`'i birebir aynı (`setBorcKategori("cards"); setSekme("borclar"); setForm(null)`). |
| B11 | Orta | **Masaüstünde mobil desenler**: sağ altta yüzen "Hızlı işlem" ve "Görüş bildir" içerik sütununun dışında, kartların üstüne biniyor; hızlı menü ekran köşesinde açılıyor; "Kart ekle" formu satır içinde açılıp düzeni itiyor (sağdaki "Ekstre işlemleri" kartı kayboluyor, sayfa zıplıyor). | `.bt-quick-add{position:fixed;right:clamp(14px,3vw,28px)…}`; canlı ekran görüntüleri. |
| B12 | Orta | **Var olan e-postayla "kayıt" sessizce eski hesaba giriş yapıyor**, kurulum atlanıyor, kullanıcıya hiçbir şey söylenmiyor. | Canlı: `zero+1@borcama.com` 2 Eylül'de parolayla açılmış; kayıt ekranından kodla girişte doğrudan dolu "Bugün". |
| B13 | Orta | **Kurulumdan hemen sonra ikinci bir rehber** ("Adım 3/3 İlk hareketini kaydet") eski yüzeyle geliyor; kullanıcı yeni bitirdiği kurulumun devamı olduğunu anlamıyor. | `App.jsx:5740` `.bt-aktivasyon`, `getActivationState`. |
| B14 | Düşük | Sekmeye her geri dönüşte auth kütüphanesi `SIGNED_IN` yayıyor; `useSession` her seferinde yan etkileri yeniden çalıştırıyor, saatlik token yenilemesiyle giriş kaydı (`activity_logs` "login") tekrar yazılıyor. Görsel zıplama yapmıyor ama giriş sayıları şişiyor. | `@supabase/auth-js` 2.110.2 `_recoverAndRefresh` → `_notifyAllSubscribers('SIGNED_IN')`; `Auth.jsx:217–220`; `activityLog.js:95` anahtar `expires_at`'e bağlı. |
| B15 | Düşük | Pro satın alma sonrası `/welcome` eski yüzeyde: 3 px kenarlık, blok gölge, "✦" glifi. | `main.jsx` `KimlikliWelcome`. |
| B16 | Düşük | "Yükleniyor" ekranları düz metin (`main.jsx` `Yukleniyor`), tema dışı. | — |

---

## 2. Hedef akış (≥1024 px)

1. **Landing** (açık) → "Şimdi başla" / "Ücretsiz başla".
2. **Kayıt** (`/register`, açık): uygulama kabuğunun üst çubuğu (logo solda, "Giriş yap" sağda) + ortada 560 px form; sağda aynı ızgarada sakin bir "ne olacak" paneli (3 madde: e-postana kod gelir · 2 dakikalık kurulum · banka şifresi yok). Onay kutuları görünür; "Kod gönder" pasifken altında neden pasif olduğu yazar ("Devam etmek için iki onayı işaretle").
3. **Kod** (aynı kabuk) → doğrulanınca aynı sayfada kuruluma geçilir; tam sayfa yenileme yok.
   - E-posta zaten kayıtlıysa (kullanıcının `created_at`'i 10 dakikadan eski): "Bu e-postayla hesabın vardı; giriş yaptın." bilgisi gösterilir, kayıtlı veri varsa doğrudan "Bugün", yoksa kurulum.
4. **Kurulum** (`/kurulum/<adim>`): solda adım (560 px), sağda **canlı Bugün önizlemesi**. Gelir girildikçe gelir satırı, borç eklendikçe "Borç toplamın" ve sıra, plan adımında "Her maaşta ödemelere" kartı belirir. Önizleme uygulamanın gerçek bileşenleriyle (özet kartı, sıra kartı) sahte değil gerçek `veri` taslağından çizilir.
   - 2. adımda tema seçilince kabuk ve önizleme o anda döner.
   - Yenileme adımı ve cevapları korur; geri tuşu bir önceki adıma gider.
5. **Hazırsın**: telefon kartı değil; sağdaki önizleme tam genişliğe açılır (300 ms, `prefers-reduced-motion`'da anında), üstünde kısa lime bant "Plan kuruldu. İlk ödeme 12 Kas." ve "Bugün'e geç" düğmesi. Tıklanınca URL `/summary`, uygulama zaten çizili.
6. **Bugün**: kurulumla aynı sayılar. "Aylık plan" yaşam bütçesi varsayımıyla tahmini değeri gösterir ("≈ +₺X · tahmini"), Plan ekranında yaşam bütçesi düzenlenebilir. Kurulumun devamı olan ilk görev kartı ("Son adım: ilk harcamanı ekle") aynı v3 yüzeyde.
7. **İlk kullanım**: üst çubukta "+ Ekle" menüsü (Harcama · Ödeme · Ekstre · Borç), her madde ilgili formu **sağ panelde** açar; sekme geçişinde hiçbir şey yana kaymaz.

---

## 3. İş paketleri

### PR-1 `claude/web-akis-hatalar` — hata düzeltmeleri (küçük, hemen)

1. **B1 onay kutusu:** `.oa-onay button` kuralı yalnız bağlantı düğmelerine daralır (`.oa-onay .oa-onay-baglanti` sınıfı; `Auth.jsx` sözleşme/aydınlatma düğmelerine eklenir) ya da `.oa-onay .oa-kutu` ile kutu stili yeniden yazılır. Seçili: açıkta `--oa-ink` zemin + lime tik, koyuda `--oa-secili-zemin` (krem) + ink tik. Pasif CTA'nın altına `.oa-ipucu` "Devam etmek için iki onayı işaretle." (`auth.ipucu.onaylar`, 6 dil); yalnız e-posta geçerli ve onaylar eksikken.
2. **B3/A1 tema:** `Auth.jsx` (`GirisEkrani`, parola yenileme), `DogrulamaEkrani.jsx` ve kurulumun `dil` adımı web'de (`!nativeMi`) her zaman açık: `useSistemKoyu()` yerine `nativeMi ? useSistemKoyu() : false`. Kurulumun `gorunum` adımından sonra `temaKoyuMu(durum.tema, sistemKoyu)` kalır. iOS davranışı değişmez.
3. **B2 izin bandı:** `/register`, `/login`, kod ekranı ve kurulum açıkken bant **çizilmez**; tercih yapılmamışsa uygulama kabuğunda (≥1024 px) üst çubuğun altında tek satırlık bant olarak çıkar ve içeriği iter (`position: sticky`, üstte), hiçbir düğmeyi örtmez. Landing'deki davranış aynı.
4. **B4 kayma:** `html { scrollbar-gutter: stable; }` (uygulama, landing, kurulum). Ek olarak sekme değişiminde `window.scrollTo({ top: 0 })` mevcut davranışı korunur.
5. **B10 hızlı menü:** "Yeni borç ekle" → borç türü seçiciyi açar (mevcut `setBaslangicSecimiAcik(true)` akışı); "Ekstre ekle" → ekstre yükleme akışı (`ekstreYuklemeIstegi` tetiklenir); "Ödeme gir" → bekleyen ödemeler listesi + ilk bekleyenin ödeme formu açık. Dört maddenin her biri farklı ve vaat ettiği formu açar; test eklenir.
6. **B12 var olan e-posta:** kodla doğrulamadan sonra `kayitModu && user.created_at < now − 10 dk` ise `.oa-bilgi` "Bu e-postayla hesabın vardı; giriş yaptın." (`auth.kayit.hesapVardi`), 4 sn sonra yönlendirme ya da "Devam et".
7. **B14 oturum olayları:** `useSession` yan etkileri (`googleAdsYeniKullaniciDonusumu`, `proDenemesiniVeBaslangicMailiniTetikle`, `girisAktivitesiKaydet`) yalnız **önceki oturum yokken** gelen `SIGNED_IN`'de çalışır; `TOKEN_REFRESHED` ve sekmeye dönüşteki `SIGNED_IN` yalnız `setSession` yapar, `user.id` ve `access_token` aynıysa onu da yapmaz. `girisAktivitesiKaydet` anahtarı `user.id` + tarayıcı oturumu (`sessionStorage`) olur, `expires_at` değil.

### PR-2 `claude/web-akis-sureklilik` — kurulum ↔ uygulama sürekliliği

1. **B6/B7 adım kalıcılığı:** web'de kurulum `/kurulum/<adim>` rotasında çalışır (`main.jsx` uygulama yollarına eklenir; native değişmez). Her `adimaGec` → `history.pushState({ adim }, "", "/kurulum/" + hedef)`; `popstate` → `setAdim`. `durum` + `adim` her değişimde `sessionStorage["borcama:kurulum-taslak:<userId>"]`'a yazılır, açılışta okunur (geçersizse silinir). 1. adımda geri tuşu kurulumdan çıkmaz (karşılama yok; `history.replaceState` ile ilk girdi `/kurulum/dil`). Kurulum tamamlanınca taslak silinir.
2. **B8 yenilemesiz geçiş:** web'de `bitir()` sayfa yenilemez. Seçilen dil (`dilAyarla` + sözlük zaten yüklü), tema (`ayarlar.tema`), para birimi ve bölge uygulama state'ine yazılır. `KurulumAkisi` `onBitti(veri)` çağırır, App `setKurulumAcik(false)`, `history.replaceState({}, "", "/summary")`. iOS'ta mevcut yeniden yükleme kalır (native sekme çubuğu için).
3. **B5/A3 tek plan:** kurulum veriye `ayarlar.yasamButcesi = { tutar: yasamVarsayilan(gelir), kaynak: "varsayim" }` yazar. `financialScenario` çağrılarında (Bugün, Plan, Pro kartı) `expenses` boşsa ya da kullanıcı bütçe girdiyse `livingBudgetOverride = ayarlar.yasamButcesi.tutar`. "Aylık plan" kutusu bu durumda "≈ +₺X" + alt satır "Yaşam gideri tahmini · Plan'dan değiştir". Plan ekranına "Aylık yaşam bütçesi" alanı (`TutarAlani`, kaydedince `kaynak: "kullanici"`). Kabul: aynı veride kurulumun "Her maaşta ödemelere" tutarı = Bugün'deki aylık plan ödemesi = Plan ekranı = Pro kartı "ilk ay" (birim testi + e2e).
4. **B13 devam görevi:** kurulumu bitiren kullanıcıda `.bt-aktivasyon` tek kart olarak "Son adım: ilk harcamanı ya da ödemeni ekle" (v3 yüzey: kenarlıksız, `--oa-yuzey`, lime CTA), "Adım 3/3" sayacı yok. Kurulum yapılmamış eski hesaplarda mevcut 3 adım kalır.

### PR-3 `claude/web-akis-masaustu-kabuk` — büyük ekran kabuğu (A2, A4)

1. **Ortak kabuk** `src/MasaustuKabuk.jsx` (yalnız `min-width: 1024px`): üst çubuk 72 px (logo, sağda bağlama göre: kayıtta "Giriş yap", kurulumda "Adım 4/10" + "Çıkış", uygulamada "+ Ekle", "Ayarlar", hesap menüsü), içerik 1120 px ızgara, 32 px kenar. Kayıt, kod, kurulum ve uygulama aynı kabuğu kullanır; landing kendi üst çubuğunda kalır ama logo konumu ve yüksekliği aynı.
2. **Kayıt/kod (≥1024):** iki sütun 560 + 440 px, 64 px aralık. Sol form; sağ "ne olacak" paneli (§2.2). Geri dairesi yerine üst çubuk logosu landing'e döner.
3. **Kurulum (≥1024):** iki sütun 560 + kalan. Sol adım (mevcut `.oa-*` bileşenleri; CTA içerik altında); sağ `KurulumOnizleme` (sticky, üstten 96 px): uygulamanın özet kartı + borç sırası bileşenleri, kurulum `durum`'undan `onboardingSonucunuUygula(BOS_VERI, durum)` ile çizilen taslak veri; boş alanlar iskelet çizgi (gri değil, `--oa-yuzey-2`). "Hazırsın" önizlemenin tam genişliğe açılmasıdır (§2.5); 560×810 lime kart masaüstünde kaldırılır.
4. **Uygulama (≥1024), A4:** `.bt-quick-add` ve `.bt-feedback-trigger` gizlenir; üst çubuğa "+ Ekle" (lime, menü: Harcama · Ödeme · Ekstre · Borç) ve hesap menüsüne "Görüş bildir". Tüm ekleme/düzenleme formları (`form` state'i) `SagPanel` içinde açılır: 440 px, sağdan kayar, arka plan `rgba(20,22,15,.24)`, Esc ve dış tıklama kapatır, odak tuzağı, açılınca ilk alana odak; kapanınca odak tetikleyen düğmeye döner. Liste düzeni form açılınca değişmez (B11).
5. **Uygulama yüzeyi:** PR-3 uygulama v3 direktifi (`docs/uygulama-v3-direktifi.md`) ayrı ilerliyor; bu PR yalnız kabuk, panel ve üst çubuğu yapar, kart yüzeylerine dokunmaz.
6. **B15/B16:** `/welcome` ve `Yukleniyor` aynı kabuk ve `.oa-*` yüzeyiyle (glif yok, kenarlık/blok gölge yok).
7. <1024 px'te mevcut düzen aynen kalır.

---

## 4. Kabul ölçütleri

Otomatik — `scripts/akis-denetimi.mjs` (yeni; demo modu `?yeni=1`, Playwright, 1440×900 ve 1024×768, açık ve koyu `colorScheme`, **klasik kaydırma çubuğu** için sayfaya `::-webkit-scrollbar{width:15px}` enjekte edilir). Çıkış kodu 0 değilse PR açılmaz; çıktı PR açıklamasına konur.

- [ ] `/register-preview`, `/login-preview`: `colorScheme: dark` iken kök `.oa-koyu` **değil**; `.oa-kutu` `border-top-width ≥ 1px` ve arka planı zeminden farklı; iki onay işaretlenmeden "Kod gönder" pasif ve `.oa-ipucu` görünür.
- [ ] Kurulum her adımda: `aside.gac` yok ya da `.oa-dugme` ile kesişmiyor; `.oa-dugme` görünür alanda ve tıklanabilir (`elementFromPoint` = düğme).
- [ ] 5. adımda `reload` → yine 5. adım, önceki cevaplar seçili. `goBack` → 4. adım. 1. adımda `goBack` → kurulumdan çıkmıyor.
- [ ] Kurulum sonu: `window.__isaret` (başta konan) "Bugün'e geç" sonrası hâlâ var (yenileme yok); URL `/summary`; arada "Yükleniyor" metni görünmedi.
- [ ] Gelir 32.000, Akbank kart 6.200, gün 12 ile: kurulum plan kartı tutarı = Bugün aylık plan ödemesi = Plan ekranı = Pro kartı ilk ay (aynı sayı, metinden okunur); "Veri eksik" görünmüyor.
- [ ] Sekme turu (Bugün → Borçlar → Hareketler → Varlıklar → Ayarlar → Bugün): `.bt-header` x konumu her adımda aynı (±0 px).
- [ ] ≥1024: `.bt-quick-add` ve `.bt-feedback-trigger` görünmüyor; "+ Ekle" menüsünün 4 maddesi sırasıyla harcama formu, ödeme formu, ekstre yükleyici, borç türü seçiciyi `SagPanel` içinde açıyor; panel açılınca liste kartlarının konumu değişmiyor.
- [ ] Kontrast: `scripts/kontrast-denetimi.mjs` kayıt, kod, 10 kurulum adımı, Hazırsın, Bugün; iki tema; 0 bulgu.
- [ ] 390×844'te kayıt → kurulum → Bugün akışı yürüyor, yatay taşma yok (mobil kapsam dışı, yalnız regresyon).

Elle (Vercel önizlemesi, gerçek Supabase):

- [ ] Yeni bir adresle (ör. `zero+3@borcama.com`) kayıt → kod → kurulum → Bugün; sistem koyu temadayken landing ve kayıt açık; kurulumda "Koyu" seçilince geri kalan koyu.
- [ ] Var olan adresle (`zero+1@borcama.com`) "kayıt" → "hesabın vardı" bilgisi.
- [ ] Chrome'da başka sekmeye geçip 70 dk sonra dönünce (token yenilemesi) ekran zıplamıyor; `activity_logs`'a yeni "login" yazılmıyor.
- [ ] iOS (TestFlight değil, `npx cap run ios` simülatör) kurulum ve giriş davranışı değişmedi.

---

## 5. Dokunulmayacaklar

Supabase auth akışı (OTP, Apple, Turnstile), referans kodu, pro niyeti, `onboardingAdimlari.js` hesapları (yalnız `yasamButcesi` yazımı eklenir), iOS native kurulum (`NativeOnboarding.swift`, `onboardingKoprusu.js`), landing içeriği, analitik olay adları (`onboarding_*`, `auth_kod_*`), mobil (<1024 px) düzen.

---

## 6. Sıra

PR-1 (hemen; CTO yayına alabilir, A1 onaylı) → PR-2 (Özer onaylı ana akış) → PR-3 (Özer onaylı; uygulama v3 PR'ıyla çakışırsa önce o birleşir, bu PR kabuğu üstüne kurar).

---

## 7. Claude Code'a yapıştırılacak görev metni

```
Görev: borcama.com'da büyük ekran (≥1024 px) web kullanıcısının kayıttan uygulamayı kullanmaya kadar kesintisiz akışı. Mobil web ve iOS kapsam dışı (yalnız regresyon kontrolü).

Önce oku: docs/web-akis-direktifi.md (tamamı; bulgular kanıtlı, kararlar A1–A4 Özer onaylı), docs/onboarding-v3-direktifi.md §2–§3 (token ve .oa-* bileşenleri), AGENTS.md, CLAUDE.md, CHANGELOG.md.

Üç PR, bu sırayla, her biri origin/main'den ayrı dal:
1. claude/web-akis-hatalar — direktif §3 PR-1 (B1 onay kutusu + pasif CTA ipucu, B3 webde kurulum öncesi her zaman açık tema, B2 izin bandı kayıt/kurulumda yok ve hiçbir düğmeyi örtmez, B4 scrollbar-gutter, B10 hızlı menü maddeleri vaat ettiği formu açar, B12 var olan e-posta bilgisi, B14 oturum olayı yan etkileri yalnız gerçek girişte).
2. claude/web-akis-sureklilik — §3 PR-2 (/kurulum/<adim> rotası + history + sessionStorage taslak; web'de bitirişte sayfa yenileme yok; ayarlar.yasamButcesi ile kurulum, Bugün, Plan ve Pro kartında tek sayı + Plan'da düzenlenebilir yaşam bütçesi; kurulum sonrası tek devam kartı).
3. claude/web-akis-masaustu-kabuk — §3 PR-3 (MasaustuKabuk; kayıt/kod iki sütun; kurulumda sağda canlı Bugün önizlemesi ve Hazırsın'ın önizlemeden açılması; uygulamada yüzen düğmeler yerine üst çubukta "+ Ekle" ve hesap menüsü; tüm formlar SagPanel'de).

Kurallar:
- Önce scripts/akis-denetimi.mjs'i yaz (direktif §4 otomatik maddeleri) ve main üzerinde çalıştır: bugünkü hataları yakaladığını gör (kırmızı). Her PR kendi maddelerini yeşile çevirir; PR açıklamasına önce/sonra çıktısı.
- Renk/yazı yalnız onboarding direktifi §2.1 token'ları; literal hex yok; emoji ve yıldız ikonu yok.
- Native (iOS) davranışı değişmez: her değişiklik !nativeMi ya da min-width: 1024px ile sınırlı; iOS yolu için mevcut testler yeşil kalır.
- Supabase auth akışına, Turnstile'a, referans ve pro niyeti mantığına dokunma; analitik olay adları aynı kalır.
- Yeni metinler 6 dilde (tr, en, de, es, fr, it); ton düz, kısa, ünlemsiz.
- Her PR'da: npm ci, npm run release:check, npm test, npm run build; scripts/akis-denetimi.mjs ve scripts/kontrast-denetimi.mjs 0 bulgu; 1440 ve 1024'te iki temada kayıt → kurulum → Bugün → "+ Ekle" ekran görüntüleri; CHANGELOG Unreleased; docs/departman-devirleri.md; Vercel önizleme adresi.
- Elle kabul (§4 sonu) Vercel önizlemesinde yeni bir adresle yapılır; sonuç PR'a yazılır.
- Direktifte olmayan ürün kararı gerekirse bana sor, varsayma.
```
