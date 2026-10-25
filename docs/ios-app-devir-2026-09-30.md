# Borcama iOS geliştirici devir dokümanı

**Tarih:** 30 Eylül 2026

**Baz ürün sürümü:** `1.58.0`

**Durum:** Uygulama ve canlı backend entegrasyonu hazır. Paid Apps Agreement ile banka güncellemesi Apple tarafında işleniyor; vergi formları aktif. İmzalı arşiv, App Store abonelik ürünü ve gerçek cihaz/TestFlight kabul testleri henüz tamamlanmadı.

## Kısa durum

Borcama'nın Capacitor tabanlı iOS uygulaması App Store gönderimine teknik olarak hazırlanmıştır. Universal Links, uygulama ikonu, sürüm eşleme, privacy manifest, cihaz içi bildirimler, çevrimdışı durum ekranı, RevenueCat istemci entegrasyonu ve güvenli Supabase webhook akışı tamamlandı. RevenueCat'in canlı webhook testi `200` yanıtı verdi ve olay veritabanına kaydedildi.

Bu çalışma **App Store'a gönderilmiş bir sürüm değildir**. Bu Mac'te Apple dağıtım sertifikası ve provisioning profile bulunmadığı için imzalı `.xcarchive`/TestFlight yüklemesi üretilemedi. Ayrıca abonelik ürün kimliği, süre ve fiyat kararı verilmeden gerçek satın alma testi yapmak doğru değildir.

## App Store ticari hesap durumu

30 Eylül 2026 tarihinde App Store Connect > Business ekranında doğrulanan durum:

| Konu | Durum | Not |
|---|---|---|
| Paid Apps Agreement | `Processing` | Sözleşme 30 Eylül 2026 tarihinde kabul edildi; Apple'ın işlemesi bekleniyor. |
| Banka bilgileri | `Processing` | Apple, banka güncellemesinin işlendiğini ve değişikliklerin 24 saat içinde görünmesinin beklendiğini bildiriyor. Bu sürede yeni güncelleme yapılamıyor. |
| U.S. Certificate of Foreign Status of Beneficial Owner | `Active` | 30 Eylül 2026 tarihinde gönderilmiş ve aktif. |
| U.S. Form W-8BEN | `Active` | 30 Eylül 2026 tarihinde gönderilmiş ve aktif. |
| Digital Services Act | `In Review` | Trader bildirimi 30 Eylül 2026 tarihinde güncellendi; Apple incelemesi sürüyor. |

`Processing` ve `In Review` durumları tamamlanmış sayılmamalıdır. Ürünleri satışa açmadan önce App Store Connect'te `Paid Apps Agreement = Active`, banka hesabı = aktif/onaylı ve DSA incelemesi = tamamlanmış olarak yeniden doğrulanmalıdır.

## Kimlikler

| Sistem | Değer |
|---|---|
| Apple Team ID | `2SH6N4AK3P` |
| Bundle ID | `com.borcama.app` |
| App Store Connect uygulaması | `Borcama` |
| App Store Apple ID | `6817634876` |
| App Store sürümü | `1.0 Prepare for Submission` |
| Xcode marketing version | `1.58.0` |
| Xcode build number | `2` |
| RevenueCat project ID | `5ef95fe9` |
| RevenueCat iOS app ID | `app953d5b46f7` |
| RevenueCat iOS public SDK key | `appl_xCiiIMdoUubYuTJxwXzSaUVAjzn` |
| RevenueCat entitlement | `pro` |
| RevenueCat webhook integration | `whintgrd6465d45ca` |
| Supabase project ref | `pohxifqgxyxyiorejqvg` |

## Brief karşılığı

| Madde | Durum | Kanıt / not |
|---|---|---|
| 1. Universal Links / AASA | Tamamlandı ve canlı | `https://borcama.com/.well-known/apple-app-site-association` doğrudan `200` ve `application/json` dönüyor. Entitlement `applinks:borcama.com` içeriyor. |
| 2. Supabase redirect izinleri | Tamamlandı | `/login`, `/welcome`, `/summary`, `/reset-password` canlı Auth redirect listesine eklendi. |
| 3. App ikonu | Tamamlandı | Asset Catalog içinde `1024x1024`, PNG ve alfa kanalsız ikon var. |
| 4. Sürüm politikası | Tamamlandı | `MARKETING_VERSION=1.58.0`, `CURRENT_PROJECT_VERSION=2`; senkronizasyon ve release kontrolleri eklendi. |
| 5. Gizlilik envanteri | Kod tarafı tamamlandı | `PrivacyInfo.xcprivacy` e-posta, kullanıcı ID, finansal bilgi, satın alma geçmişi, ürün etkileşimi ve çökme verisini tanımlıyor; tracking ve IDFA kapalı. App Store formu arşivin privacy report'u ile son kez eşleştirilmeli. |
| 6. Mağaza içeriği | Hazır, panele girilmedi | Açıklama, alt başlık, anahtar kelimeler, URL'ler ve yaş derecelendirme notu `docs/ios-app-store-gonderim.md` içinde. 6,9 ve 6,5 inç ekran görüntüleri teslim paketinde. |
| 7. Ödeme günü bildirimi | Tamamlandı | Kullanıcı onayıyla, ödeme tarihinden bir gün önce 09:00, aynı gün için gruplanmış ve kilit ekranında finansal ayrıntı göstermeyen yerel bildirim. |
| 8. Offline karar | Tamamlandı | İlk sürümde offline veri yazma/okuma yok; bağlantı kesildiğinde sıfır/boş finansal veri yerine açıklayıcı engelleyici ekran gösteriliyor. |
| 9. iOS hukuki metinleri | Teknik metin hazır, hukuk kontrolü bekliyor | Apple abonelik ve iade akışı native metinlere işlendi. Türkiye tüketici mevzuatı açısından nihai hukukçu kontrolü yapılmalı. |

## Canlı entegrasyon

### RevenueCat

- `Borcama iOS` App Store uygulaması oluşturuldu ve `com.borcama.app` ile bağlandı.
- Apple In-App Purchase anahtarı yüklendi; RevenueCat paneli kimlik bilgilerini `Valid credentials` olarak doğruladı.
- Webhook yalnız iOS App Store uygulamasını, production ve sandbox ortamlarını dinliyor.
- Authorization başlığı ve HMAC imzası zorunlu.
- RevenueCat test olayındaki sahte UUID artık Supabase Auth foreign key hatası üretmiyor; olay yalnız gerçekten var olan Auth kullanıcısına bağlanıyor.
- Canlı `Test webhook` sonucu: `Response 200`.
- Sandbox olayı üretim Pro hakkı açmıyor; hak yalnız `PRODUCTION + APP_STORE` koşulunda güncelleniyor.

### Supabase

Canlıda etkin fonksiyonlar:

- `revenuecat-webhook`, version `3`
- `shopier-entitlement`, version `34`

Canlı secret adları:

- `REVENUECAT_SECRET_API_KEY`
- `REVENUECAT_WEBHOOK_AUTHORIZATION`
- `REVENUECAT_WEBHOOK_SIGNING_SECRET`
- `REVENUECAT_IOS_APP_ID`

Secret değerlerini bu belgeye, Git'e, istemci paketine veya loglara koymayın.

## Apple varlıkları

- App ID: `com.borcama.app`
- Associated Domains ve In-App Purchase yetenekleri açık.
- In-App Purchase key adı: `Borcama RevenueCat`
- Key ID: `SPKVP5WS5V`
- Issuer ID: `72a6f2f5-4a4b-474a-8532-cba7d8236eb8`
- Private key yalnız yerel dosyada: `~/Downloads/SubscriptionKey_SPKVP5WS5V.p8`

`.p8` dosyasını parola yöneticisi veya ekip secret kasasına taşıyın. İçeriğini Slack, e-posta, issue, Git veya bu dokümana eklemeyin.

## Ekran görüntüleri

Teslim paketindeki `Ekran-Goruntuleri` klasöründe:

- `6.9-inch`: `1320x2868`, 5 PNG
- `6.5-inch`: `1242x2688`, 5 PNG

Görseller simülatörde temsili demo verisiyle üretildi; gerçek kullanıcı verisi içermez. App Store'a yüklemeden önce görsel sırası ve metadatası ürün sorumlusu tarafından kontrol edilmelidir.

## Doğrulama sonuçları

30 Eylül 2026 tarihinde:

- `npm run release:check`: geçti
- `npm test`: `230/230` geçti
- `npm run build`: geçti, `222` SEO sayfası üretildi
- `npx cap sync ios`: geçti
- iOS Simulator `Debug` build: geçti
- Generic iOS device archive: proje ayarları doğru takıma bağlandı; yerel dağıtım sertifikası/provisioning profile olmadığı için imzalama adımında durdu
- AASA canlı kontrolü: `HTTP 200`, `content-type: application/json`, redirect yok
- RevenueCat canlı webhook testi: `Response 200`

## Kalan zorunlu adımlar

1. App Store Connect Business ekranını 24 saat sonra yeniden kontrol edin; Paid Apps Agreement ve banka hesabının aktif olduğunu, DSA incelemesinin tamamlandığını doğrulayın.
2. Xcode > Settings > Accounts altında Apple Developer hesabını ekleyin; dağıtım sertifikası ve `com.borcama.app` provisioning profile üretin/indirin.
3. App Store Connect'te abonelik grubu ile ürünleri oluşturun. Product ID, süre, fiyat ve deneme süresi ürün sahibinin açık kararıyla belirlenmeli; bunları tahmin ederek oluşturmayın.
4. Ürünleri RevenueCat'te `pro` entitlement'a ve current offering'e bağlayın.
5. İmzalı arşiv üretip TestFlight'a yükleyin.
6. Sandbox hesapla satın alma, yenileme, iptal, sona erme, refund ve restore senaryolarını test edin; her adımda web ve iOS Pro durumunun aynı kaldığını doğrulayın.
7. Bağlı gerçek iPhone'da magic link ve parola sıfırlama Universal Link akışlarını test edin.
8. Xcode Organizer privacy report'u `docs/ios-app-store-gonderim.md` envanteri ve App Store Connect App Privacy formuyla karşılaştırın.
9. Hukukçuya native abonelik/iade metinlerinin son kontrolünü yaptırın.
10. App Store metadata, ekran görüntüleri, App Privacy, yaş derecelendirmesi ve review notlarını girip gönderim öncesi ürün sahibi onayı alın.

## Build komutları

Önce canlı Supabase değerlerini güvenli yerel environment'tan yükleyin. RevenueCat public SDK key gizli değildir; secret API key hiçbir zaman `VITE_` değişkeni olmamalıdır.

```bash
export VITE_REVENUECAT_IOS_API_KEY='appl_xCiiIMdoUubYuTJxwXzSaUVAjzn'
npm ci
npm run release:check
npm test
npm run build
npx cap sync ios
open ios/App/App.xcodeproj
```

İmzalama hesabı kurulduktan sonra terminal doğrulaması:

```bash
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$PWD/build/Borcama.xcarchive" \
  -allowProvisioningUpdates \
  archive
```

## Güvenlik ve sahiplik notu

- RevenueCat secret API key ve webhook secret'ları yalnız RevenueCat/Supabase panellerinde tutulur.
- iOS uygulamasına yalnız `appl_...` public SDK key gömülür.
- Supabase service role key hiçbir istemci build'ine girmez.
- Webhook gelen kullanıcı ID'sine güvenmeden önce Supabase Auth'ta kullanıcıyı doğrular.
- Paid Apps Agreement hesap sahibinin açık onayıyla kabul edildi. Fiyat belirlemek, abonelik ürünlerini satışa açmak ve TestFlight/App Review yayını hesap sahibi sorumluluğundadır.

## İlgili dosyalar

- `docs/ios-app-store-gonderim.md`
- `src/nativeDeepLinks.js`
- `src/nativeNotifications.js`
- `src/revenuecatSync.js`
- `supabase/functions/revenuecat-webhook/index.ts`
- `supabase/functions/shopier-entitlement/index.ts`
- `ios/App/App/App.entitlements`
- `ios/App/App/PrivacyInfo.xcprivacy`
