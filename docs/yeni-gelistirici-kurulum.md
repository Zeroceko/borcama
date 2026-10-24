# Yeni geliştirici · Kurulum ve çalıştırma

Bu dosya, projeyi devralan geliştiricinin kendi bilgisayarında sıfırdan
çalışır hale gelmesi içindir. Sırayla uygula; her adımın sonunda ne görmen
gerektiği yazıyor.

Devrin tamamı (hangi hesaplar, hangi servisler, hangi sırlar) için
`docs/devir-paketi.md` dosyasına bak.

---

## 0. Gereken araçlar

| Araç | Sürüm | Not |
|---|---|---|
| Node.js | **>= 22.12** | `package.json > engines` bunu zorunlu tutuyor. 24.x ile geliştirildi. |
| npm | 10+ | Node ile gelir. |
| Git | herhangi | |
| Xcode | **26+** | Yalnız iOS derlemesi için. Sadece web üzerinde çalışacaksan gerekmez. |
| Supabase CLI | 2.x | Migration ve Edge Function deploy'u için. `brew install supabase/tap/supabase` |
| Vercel CLI | son | Opsiyonel; `npm i -g vercel`. Deploy zaten Git push ile otomatik. |

macOS dışı bir makinede web tarafı sorunsuz çalışır; **iOS derlemesi yalnız
macOS + Xcode ile mümkündür.**

---

## 1. Depoyu al ve bağımlılıkları kur

```bash
git clone https://github.com/Zeroceko/borcama.git
cd borcama
npm install
```

Ana dal `main`. iOS çalışmaları `ios-app` dalında yürüdü; devir anında bu iki
dalın durumunu `git log --oneline main..ios-app` ile karşılaştır.

---

## 2. Hiçbir ayar yapmadan çalıştır (demo modu)

```bash
npm run dev
```

Supabase anahtarı tanımlı değilken uygulama **yerel demo moduna** düşer
([src/supabaseClient.js](../src/supabaseClient.js)): giriş yapılamaz, veriler
yalnız tarayıcının `localStorage`'ında tutulur. Arayüzü, hesaplamaları ve
ekstre okumayı gerçek bir veritabanı olmadan bu modda inceleyebilirsin.

Konsolda şunu görmelisin: `Supabase ayarları eksik; uygulama yerel demo modunda çalışıyor.`

---

## 3. Gerçek Supabase'e bağlan

`.env.example` dosyasını kopyala:

```bash
cp .env.example .env.local
```

Yerel geliştirme için **yalnız şu dört değer** gerekli:

| Değişken | Nereden alınır |
|---|---|
| `VITE_SUPABASE_URL` | Supabase panel → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Aynı sayfa (public anahtar, gizli değil) |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile → site anahtarı (public) |
| `VITE_REVENUECAT_IOS_API_KEY` | RevenueCat → Project → API keys → iOS public key |

Diğer `.env.example` satırları **sunucu tarafı sırlarıdır**; yerel dosyaya
yazılmaz. Nerede durduklarını `docs/devir-paketi.md > Sır envanteri`
bölümünde bul.

`.env.local` gitignore'dadır; asla commit etme.

---

## 4. Testler ve derleme

```bash
npm test              # 253 test, node:test ile, ağ gerektirmez
npm run release:check # CHANGELOG ile package.json sürümünü doğrular
npm run build         # vite build + 222 statik SEO sayfası üretir
```

Üçü de temiz geçmeden yayın yapma. `npm run build` sonunda
`Prerendered 222 SEO pages.` satırını görmelisin.

Asistan testleri ayrı: `npm run test:assistant`. Canlı Gemini çağrısı yapan
eval (`npm run test:assistant:live`) ücretli API kullanır ve
`ASSISTANT_EVAL_LIVE_CONFIRMED` ortam değişkeni olmadan çalışmaz.

---

## 5. iOS uygulamasını çalıştır

### 5.1 Apple erişimi

iOS tarafı **Özer Öcek** Apple Developer takımına bağlıdır:

- Team ID: `2SH6N4AK3P`
- Bundle ID: `com.borcama.app`

Devralan geliştirici bu takıma **App Manager** rolüyle davet edilmelidir.
Kimsenin Apple ID parolası paylaşılmaz. Aynı makinede başka bir Apple takımı
(VMP Mühendislik) varsa dikkat et: Xcode ve App Store Connect'te takım
seçiminin `2SH6N4AK3P` olduğunu her oturumda doğrula.

### 5.2 Derle ve simülatörde aç

```bash
npm run build
npx cap sync ios
open ios/App/App.xcodeproj
```

Xcode'da hedef cihazı bir iPhone simülatörü seçip Run. İlk açılışta Xcode
imzalama için takımı soracaktır; `Borcama (2SH6N4AK3P)` seç.

Komut satırından:

```bash
cd ios/App
xcodebuild -project App.xcodeproj -scheme App -configuration Debug \
  -destination 'generic/platform=iOS Simulator' build
```

**Önemli:** `npm run build` çalıştırmadan `npx cap sync ios` yaparsan
uygulamaya eski web çıktısı gömülür. Sıra her zaman `build` → `sync` → Xcode.

### 5.3 Sürüm numarası

Elle `project.pbxproj` düzenleme; script var:

```bash
npm run ios:version              # package.json sürümünü Xcode'a taşır
npm run ios:version -- --bump-build   # ayrıca build numarasını bir artırır
```

- `MARKETING_VERSION` = web sürümü (`1.58.0`)
- `CURRENT_PROJECT_VERSION` = App Store'a yüklenen her build için artan sayı

Aynı sürümden ikinci bir build yüklenecekse yalnız build numarası artar.

### 5.4 App Store'a yükleme

```bash
cd ios/App
xcodebuild -project App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath /tmp/Borcama.xcarchive -allowProvisioningUpdates archive

xcodebuild -exportArchive -archivePath /tmp/Borcama.xcarchive \
  -exportOptionsPlist ios/UploadOptions.plist \
  -exportPath /tmp/export -allowProvisioningUpdates
```

`UploadOptions.plist` içeriği:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>teamID</key><string>2SH6N4AK3P</string>
  <key>destination</key><string>upload</string>
  <key>uploadSymbols</key><true/>
  <key>signingStyle</key><string>automatic</string>
</dict>
</plist>
```

Yükleme için makinedeki Xcode'un Apple hesabına giriş yapmış olması gerekir
(Xcode → Settings → Accounts). Oturum düşerse yükleme "Failed to Use
Accounts" hatası verir; çözüm Xcode'dan yeniden giriş yapmaktır.

---

## 6. Veritabanı ve Edge Function'lar

Supabase projesi: `pohxifqgxyxyiorejqvg`

```bash
supabase link --project-ref pohxifqgxyxyiorejqvg
supabase db push                      # migrations/ altındaki 28 migration
supabase functions deploy <isim>      # tek fonksiyon
```

Fonksiyonlar `supabase/functions/` altında (11 adet):
`analytics-event`, `auth-email`, `backoffice`, `delete-account`,
`email-redirect`, `financial-assistant`, `lifecycle-emails`, `referrals`,
`resend-webhook`, `shopier-entitlement`, `_shared`.

`supabase/config.toml` auth ayarlarını tutar; en kritik satır **Send Email
Auth Hook**'un `auth-email` fonksiyonuna bağlı olmasıdır. Bu hook bozulursa
kayıt ve parola yenileme e-postaları gitmez.

Migration veya fonksiyon deploy'u canlı kullanıcıyı etkiler; devir
sonrasında ilk birkaç kez önce bir kopya projede dene.

---

## 7. Yayın akışı (web)

1. Değişikliği yap ve doğrula.
2. **Aynı commit içinde** `CHANGELOG.md > Unreleased` bölümüne kullanıcı
   etkisini tek cümleyle yaz. Bu zorunluluk `AGENTS.md`'de tanımlı.
3. Sürüm numarasını SemVer'e göre seç; `package.json` ve
   `package-lock.json` birlikte güncellenir.
4. `npm run release:check && npm test && npm run build`
5. Commit ve `main`'e push → Vercel otomatik deploy eder.
6. Canlı doğrulamadan sonra `vx.y.z` etiketini gönder.

Ayrıntı: [docs/surum-ve-yayin-sureci.md](surum-ve-yayin-sureci.md)

---

## 8. Sık karşılaşılan tuzaklar

- **Capacitor eklentisi JS'e görünmüyor.** Uygulama hedefinde tanımlanıp
  `capacitorDidLoad()` içinde `registerPluginInstance` ile kaydedilen
  eklentiler native tarafta kayıtlı olur ama JS'e tanıtılmaz; çağrılar
  sessizce askıda kalır. Çözüm olarak native sekme çubuğu doğrudan WebKit
  mesaj kanalı kullanıyor ([ios/App/App/NativeTabBar.swift](../ios/App/App/NativeTabBar.swift),
  [src/nativeSekmeCubugu.js](../src/nativeSekmeCubugu.js)).
- **`CAPBridgeViewController.view` doğrudan WKWebView'dir.** Üzerine eklenen
  alt görünümler çizilir ama dokunuş almaz; native çubuk bu yüzden
  `view.window` üzerine ekleniyor.
- **Universal Links**, `public/.well-known/apple-app-site-association`
  dosyasının canlıda `200` ve `application/json` dönmesine bağlıdır.
  `vercel.json` bu Content-Type'ı zorluyor; dosyaya dokunurken bozma.
- **Webview origin'i `https://borcama.com`.** `capacitor.config.ts` bunu
  böyle ayarlıyor çünkü Cloudflare Turnstile site anahtarı bu alan adına
  kayıtlı. Değiştirirsen captcha çalışmaz.
- **Native/web ayrımı** `src/platform.js` içindeki `nativeMi`, `iosMu` ve
  `nativeYoluMu` ile yapılır. Uygulamaya özel gizlemelerin tamamı bu
  bayraklara dayanır; web davranışını istemeden değiştirmemek için yeni
  koşulları da aynı yerden türet.
- **Supabase auth e-posta sınırı** saatte 30'dur. Daha düşük bir değer gerçek
  kullanıcı kayıtlarını sessizce bozar (daha önce 2/saat'te yaşandı).
