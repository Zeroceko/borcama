# Borcama · Devir paketi

Bu dosya, projenin yeni bir geliştiriciye devredilmesi için hazırlanmıştır.
Üç soruyu cevaplar: **ne devrediliyor**, **hangi erişimler verilmeli**,
**devralan nasıl çalışmaya başlar**.

Bilgisayarında sıfırdan kurulum için:
[docs/yeni-gelistirici-kurulum.md](yeni-gelistirici-kurulum.md)

Rakamlar (dosya, test, migration sayıları) `v1.68.0` itibarıyladır.
30 Eylül tarihli [ios-app-devir-2026-09-30.md](ios-app-devir-2026-09-30.md)
App Store öncesi durumu anlatan tarihli kayıttır; güncel bilgi bu dosyadadır.

> Bu dosyada hiçbir parola, API anahtarı veya token yazılı **değildir**.
> Yalnız hangi sırrın nerede durduğu listelenir. Devir sırasında sırlar
> servis panellerinden yeniden üretilip devralan kişiye kendi hesabı
> üzerinden verilir; mevcut değerler kopyalanıp paylaşılmaz.

---

## 1. Ürün özeti

Borcama, Türkiye pazarına yönelik kişisel borç ve bütçe takip uygulamasıdır.
Kredi kartı, kredi, ek hesap ve diğer borçları tek yerde toplar; kart
ekstrelerini **cihazda** ayrıştırır, kapatma planı ve aylık yük hesabı üretir.

- Web: `https://borcama.com`
- Operasyon panelleri: `https://crm.borcama.com` (backoffice, ceo, marketing, analytics)
- iOS: App Store'da yayında, `com.borcama.app`
- Android: Capacitor altyapısı hazır, mağazada **yayında değil**

Güncel sürüm `package.json` içindedir. Kullanıcıya yansıyan tüm değişiklikler
`CHANGELOG.md` dosyasındadır.

---

## 2. Teknik yapı

| Katman | Teknoloji |
|---|---|
| Arayüz | React 18 + Vite 8, tek sayfa uygulama, 162 dosyalık `src/` |
| Native kabuk | Capacitor 8 (iOS); web çıktısı uygulamaya gömülür, uzak site yüklenmez |
| Veritabanı + kimlik | Supabase (Postgres, Auth, Edge Functions) |
| Barındırma + cron | Vercel |
| Ödeme | iOS: StoreKit → RevenueCat · Web: Paddle · Köprü: Shopier |
| E-posta | Resend (Supabase Send Email Hook üzerinden) |
| Hata izleme | Sentry |
| Asistan | Google Gemini (Edge Function içinden) |
| Bot koruması | Cloudflare Turnstile |

### Önemli mimari kararlar

- **Ekstre PDF'leri sunucuya yüklenmez.** Ayrıştırma `pdfjs-dist` ve
  `tesseract.js` ile tarayıcıda/cihazda yapılır; yalnız kullanıcının
  onayladığı kayıtlar hesaba yazılır. App Store incelemesinde ve gizlilik
  metninde bu söz verildi, bozulmamalı.
- **Native sürümün webview origin'i `https://borcama.com`'dur**
  (`capacitor.config.ts`). Turnstile site anahtarı bu alan adına kayıtlı
  olduğu için captcha ancak böyle yükleniyor.
- **Web ve native davranış ayrımı** `src/platform.js` içindeki `nativeMi`,
  `iosMu`, `nativeYoluMu` bayraklarıyla yapılır. App Store kurallarına göre
  uygulamadan kaldırılan şeyler (davet programı, e-posta linkiyle giriş,
  beta rozetleri, ölçüm izni satırı) web'de aynen duruyor.
- **Depolama soyutlaması** `src/storage.js`: hesapsız kullanım ve demo modu
  aynı yerel yolu paylaşır, hesap açılınca veri Supabase'e taşınır
  (`src/misafirModu.js`).

---

## 3. Devredilecek hesap ve erişimler

Devralan geliştirici **kendi hesabıyla** davet edilmelidir. Hiçbir şifre
paylaşılmaz; ortak hesap kullanılmaz.

| Servis | Ne yapılmalı | Rol |
|---|---|---|
| **GitHub** — `Zeroceko/borcama` | Collaborator olarak ekle | Write (veya Admin) |
| **Vercel** — borcama projesi | Takıma davet et | Member / Developer |
| **Supabase** — `pohxifqgxyxyiorejqvg` | Organization'a davet et | Developer veya Owner |
| **Apple Developer** — Özer Öcek, Team `2SH6N4AK3P` | App Store Connect → Users and Access | App Manager |
| **RevenueCat** | Projeye davet et | Admin |
| **Paddle** | Takıma davet et | — |
| **Shopier** | Panel erişimi | — |
| **Resend** | Takıma davet et | — |
| **Sentry** — org `o4512024083562496` | Takıma davet et | Member |
| **Google Ads** — `AW-18403194146` | Hesap erişimi ver | Standart |
| **Google AI Studio / Gemini** | Yeni API anahtarı ürettir | — |
| **Cloudflare** — Turnstile + DNS | Hesap erişimi | — |
| **Alan adı** `borcama.com` | Kayıt firmasında erişim | — |

### Apple tarafında dikkat

Aynı makinede **VMP Mühendislik** adlı ikinci bir Apple takımı bulunuyor.
Borcama'nın tamamı `2SH6N4AK3P` (Özer Öcek) takımındadır. Xcode ve App Store
Connect'te her oturumda takım seçimini doğrula; VMP hesabı üzerinde işlem
yapma.

App Store Connect'teki kimlikler:

- App ID: `6817634876`
- Bundle ID: `com.borcama.app`
- Abonelik grubu: `Borcama Pro` (`22427379`)
- Abonelikler: `com.borcama.app.pro.monthly` (1 ay), `com.borcama.app.pro.annual` (1 yıl)
- RevenueCat hak (entitlement) adı: `pro`

---

## 4. Sır envanteri

Hiçbiri depoda tutulmaz. Nerede tanımlı olduğu ve ne işe yaradığı:

### 4.1 İstemci tarafı (public, `VITE_` önekli)

Vercel → Environment Variables altında ve yerel `.env.local` içinde.
Bunlar tarayıcıya gider; gizli değildir ama doğru olmaları gerekir.

| Değişken | İşlevi |
|---|---|
| `VITE_SUPABASE_URL` | Supabase proje adresi |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anahtarı |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site anahtarı |
| `VITE_REVENUECAT_PUBLIC_API_KEY` | RevenueCat web public anahtarı |
| `VITE_REVENUECAT_IOS_API_KEY` | RevenueCat iOS public anahtarı |
| `VITE_REVENUECAT_ANDROID_API_KEY` | RevenueCat Android public anahtarı (kullanılmıyor) |
| `VITE_REVENUECAT_ENVIRONMENT` | `production` veya `sandbox`; boşsa ödeme akışı başlamaz |
| `VITE_PADDLE_CLIENT_TOKEN` | Paddle istemci token'ı (web ödeme) |
| `VITE_PADDLE_ENVIRONMENT` | `production` |
| `VITE_GOOGLE_ADS_PURCHASE_LABEL` | Google Ads satın alma dönüşüm etiketi (kodda varsayılanı var) |
| `VITE_GOOGLE_ADS_FIRST_DEBT_LABEL` | İlk borç dönüşüm etiketi (kodda varsayılanı var) |

Sentry DSN koda gömülüdür ([src/errorMonitoring.js](../src/errorMonitoring.js));
kimlik doğrulama sırrı değildir.

### 4.2 Supabase Edge Function secret'ları

`supabase secrets set` ile tanımlanır. Panel: Project Settings → Edge Functions → Secrets.

| Secret | Kullanan fonksiyon / işlev |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Tüm fonksiyonlar; **tam yetkili anahtar, asla istemciye gitmez** |
| `SEND_EMAIL_HOOK_SECRET` | `auth-email` — Supabase Send Email Hook imzası |
| `RESEND_API_KEY` | `auth-email`, `lifecycle-emails` — e-posta gönderimi |
| `RESEND_WEBHOOK_SECRET` | `resend-webhook` — teslimat/şikâyet olayları |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_PAID_SERVICE_CONFIRMED` | `financial-assistant` |
| `PADDLE_API_KEY`, `PADDLE_ENVIRONMENT` | Abonelik okuma/yazma (Customers: Read, Subscriptions: Read+Write izinleri gerekir) |
| `REVENUECAT_SECRET_API_KEY` | Abonelik doğrulama |
| `REVENUECAT_WEBHOOK_AUTHORIZATION`, `REVENUECAT_WEBHOOK_SIGNING_SECRET` | `revenuecat-webhook` — RevenueCat olaylarının yetki başlığı ve imzası |
| `REVENUECAT_IOS_APP_ID` | `revenuecat-webhook` — RevenueCat panelindeki iOS uygulama kimliği (`app_...`, bundle ID değil) |
| `SHOPIER_BRIDGE_SECRET`, `SHOPIER_PRODUCT_ID`, `SHOPIER_PRO_PRODUCT_ID` | `shopier-entitlement` |
| `ANALYTICS_SESSION_SECRET` | `analytics-event` — oturum kimliği imzası |
| `LIFECYCLE_CRON_SECRET` | `lifecycle-emails` — Vercel cron çağrısını doğrular |
| `PUBLIC_SITE_URL` | E-posta bağlantılarının tabanı |

### 4.3 Vercel ortam değişkenleri (sunucu tarafı)

| Değişken | Kullanan uç |
|---|---|
| `CRON_SECRET` | `api/lifecycle-emails.js` — Vercel cron çağrısını doğrular |
| `LIFECYCLE_CRON_SECRET` | Aynı uç; Supabase tarafındaki değerle **aynı olmalı** |
| `SHOPIER_ACCESS_TOKEN`, `SHOPIER_BRIDGE_SECRET`, `SHOPIER_PRODUCT_ID` | `api/shopier-webhook.js` |
| `SUPABASE_URL` | `api/lifecycle-emails.js` |

### 4.4 Yerel makinede duran sır

Sentry issue takibi için salt okunur bir Internal Integration token'ı
macOS Keychain'de **`borcama-sentry-token`** adıyla saklanıyor
([scripts/store-sentry-token.sh](../scripts/store-sentry-token.sh)).
Devralan kendi token'ını üretip aynı adla kaydeder; mevcut token iptal edilir.

---

## 5. Çalışan otomasyonlar

| Ne | Nerede | Zamanlama |
|---|---|---|
| Yaşam döngüsü e-postaları | `vercel.json > crons` → `/api/lifecycle-emails` | Her gün 07:15 UTC |
| Supabase Send Email Hook | `supabase/config.toml` → `auth-email` fonksiyonu | Her kayıt/parola yenileme |
| Resend webhook | `resend-webhook` fonksiyonu | Teslimat, bounce, şikâyet olayları |
| RevenueCat webhook | `revenuecat-webhook` fonksiyonu | Abonelik başlangıcı, yenileme, iptal olayları |
| Sentry production issue kontrolü | `scripts/check-sentry-issues.mjs` | Elle çalıştırılır |

**Send Email Hook kritiktir.** Bozulursa kayıt ve parola yenileme
e-postaları sessizce gitmez. Supabase auth e-posta sınırı saatte 30'dur;
düşürülmemeli.

---

## 6. Dış veri kaynakları

Varlıklar ekranındaki fiyatlar `api/market-prices.js`, `api/fund-prices.js`
ve `api/stock-prices.js` üzerinden gelir. Hiçbiri API anahtarı istemez:

TCMB (döviz), CoinGecko ve Coinbase (kripto), gold-api.com (altın/gümüş/platin),
Yahoo Finance (hisse), TEFAS (yatırım fonu).

Bu kaynaklar sözleşmesiz ve ücretsizdir; biri yanıt vermezse diğer
varlıkların son bilinen fiyatı korunur. Uzun vadede ücretli bir sağlayıcıya
geçmek gerekebilir — devralana not edilecek bir risk.

---

## 7. Yayın süreci

Tam akış: [docs/surum-ve-yayin-sureci.md](surum-ve-yayin-sureci.md)

Özet kurallar (`AGENTS.md`'de zorunlu tutuluyor):

1. Kullanıcıyı, arayüzü, hesaplamayı, veri modelini veya operasyon
   ekranlarını etkileyen her değişiklik **aynı commit içinde**
   `CHANGELOG.md > Unreleased` bölümüne yazılır.
2. SemVer: patch = düzeltme/metin, minor = yeni yetenek, major = geriye
   uyumsuz veri/üyelik değişikliği.
3. `package.json` ve `package-lock.json` sürümleri birlikte yükselir.
4. `npm run release:check && npm test && npm run build` üçü de temiz geçmeden
   yayın yapılmaz.
5. Duyurulmaya değer yenilikler `docs/mailing-yenilik-havuzu.md` dosyasına
   eklenir; aynı yenilik ikinci kez duyurulmaz.

Web deploy'u `main` dalına push ile otomatiktir. iOS için ayrıca arşiv alınıp
App Store Connect'e yüklenir (kurulum dosyasının 5. bölümü).

---

## 8. App Store geçmişi — tekrar düşmemek için

Uygulama yayına girene kadar dört kez reddedildi. Devralanın bilmesi gereken,
koda gömülü olmayan kısıtlar:

| Guideline | Sorun | Verilen söz |
|---|---|---|
| **5.1.1(v)** | Hesap olmadan kullanılamıyordu | Karşılama ekranındaki "Hesap açmadan devam et" ile **tüm** özellikler kayıt olmadan çalışmalı. Hesap yalnız eşleme, yedek ve Pro için gerekli. |
| **2.2** | Beta/test öğeleri | Uygulama sürümünde "Beta" rozeti, "Görüş bildir" düğmesi ve "Yakında" satırları bulunmamalı. |
| **3.1.1** | Davet kodu Pro açıyordu | Uygulamada promosyon/davet kodu mekanizması olmamalı. Program yalnız web'de. |
| **3.1.2** | Eksik şartlar bağlantısı | Pro kartında abonelik adı, süresi, fiyatı ve Kullanım Şartları / Gizlilik / İade bağlantıları birlikte bulunmalı. |
| **5.1.2** | Özel izleme uyarısı | Uygulama hiçbir analytics veya reklam SDK'sı yüklemiyor; IDFA istenmiyor. Bu bozulursa App Privacy beyanı da güncellenmeli. |

Bu maddelerin açıklaması App Store Connect → App Review Information → Notes
alanında 3.905 karakterlik metin olarak duruyor. **Uygulamada bunlardan
birini değiştiren bir geliştirme yapılırsa o metin de güncellenmelidir.**

---

## 9. Devam eden işler ve bilinen açıklar

- **Android yayında değil.** Capacitor altyapısı ve RevenueCat Android
  anahtarı hazır, mağaza süreci hiç başlatılmadı.
- **Fiyat sağlayıcıları sözleşmesiz.** 6. bölümdeki ücretsiz kaynaklar
  kapanırsa Varlıklar ekranı fiyatsız kalır.
- **`ios-app` dalı.** iOS çalışmaları bu dalda yürüdü; `main`'de olmayan
  45 commit taşıyor (`git log --oneline main..origin/ios-app`). Devirden
  önce birleştirilecek mi, kapatılacak mı netleştirilmeli. Native sekme çubuğu
  (`NativeTabBar.swift`, `src/nativeSekmeCubugu.js`) yalnız bu dalda.
- **Test hesabı.** Supabase'de `info+bc-misafir1@vmpspares.com` adlı
  tek kullanımlık test hesabı duruyor; devirde silinebilir.
- **Yol haritası ve açık deneyler** `docs/urun-yol-haritasi.md` ve
  `docs/aktif-deneyler.md` dosyalarında.
- **Backlog** `BACKLOG.md` dosyasında.

---

## 10. Devir kontrol listesi

Erişimler:

- [ ] GitHub collaborator eklendi
- [ ] Vercel takımına davet edildi
- [ ] Supabase organization'a davet edildi
- [ ] Apple Developer takımına (`2SH6N4AK3P`) App Manager olarak eklendi
- [ ] RevenueCat, Paddle, Shopier, Resend, Sentry erişimleri verildi
- [ ] Google Ads ve Cloudflare erişimleri verildi
- [ ] Alan adı kayıt firması erişimi verildi

Sırlar:

- [ ] Gemini API anahtarı yeniden üretildi, eskisi iptal edildi
- [ ] Resend API anahtarı yeniden üretildi
- [ ] Paddle API anahtarı yeniden üretildi
- [ ] RevenueCat secret anahtarı yeniden üretildi
- [ ] RevenueCat webhook yetki başlığı ve imza sırrı yenilendi (RevenueCat paneli ve Supabase'de aynı)
- [ ] Shopier access token yeniden üretildi
- [ ] Sentry Internal Integration token'ı devralan adına üretildi, eskisi iptal edildi
- [ ] `CRON_SECRET` / `LIFECYCLE_CRON_SECRET` çifti yenilendi (iki tarafta da aynı)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gerekiyorsa döndürüldü

Doğrulama:

- [ ] Devralan kendi makinesinde `npm test`, `npm run build` ve
      simülatörde iOS derlemesini çalıştırdı
- [ ] Devralan bir test kaydı açıp doğrulama e-postasının geldiğini gördü
- [ ] Devralan sandbox'ta bir Pro satın alma akışını tamamladı
- [ ] Devralan `docs/yeni-gelistirici-kurulum.md` ile kendi başına ayağa kalktı
