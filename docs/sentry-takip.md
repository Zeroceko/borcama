# Sentry takip kaydı

Bu kayıt yalnız `borcama-web` production (borcama.com, www.borcama.com ve crm.borcama.com) React/JavaScript sorunlarını izler. Kurulum doğrulama olayı `BORCAMA-WEB-1` gerçek kullanıcı sorunu değildir ve sayımlara dahil edilmez.

## Açık sorun özeti

| Durum | Yeni | Çözülen | Açık kritik | Not |
|---|---:|---:|---:|---|
| 2026-09-03 · ilk kontrol | Erişilemedi | Erişilemedi | Erişilemedi | Sentry yönetim API anahtarı veya Issues ekranı oturumu bu çalışma alanında yok. Public DSN yalnız teslim içindir; sorun listesi için kullanılmaz. |
| 2026-09-05 · otomatik takip | 1 | 0 | 1 yeni kayıt | Salt-okunur token Keychain'den okunuyor; olay değişiklikleri kişisel veri yazılmadan checkpoint ile tekilleştiriliyor. |
| 2026-09-05 13:15 TSİ · otomatik takip | 1 | 0 | 0 doğrulanmış kritik | Son 24 saatte üç çözülmemiş production issue var. Yeni `BORCAMA-WEB-5` bir hata olayıyla açıldı; `BORCAMA-WEB-2` iki yeni olayla arttı. Olay ayrıntıları gizlilik filtresi nedeniyle bu kayda alınmadı. |
| 2026-09-06 12:06 TSİ · otomatik takip | 0 | 1 | 0 doğrulanmış kritik | Son 24 saat sorgusunda açık issue sayısı üçten ikiye düştü; kalanlar `BORCAMA-WEB-2` ve `BORCAMA-WEB-5`. İnce istemci önceki üçüncü kaydın kimliğini saklamadığından çözülen kaydın kimliği bu kayda eklenemedi. |
| 2026-09-06 14:29 TSİ · otomatik takip | 0 | 2 | 0 | Son 24 saat production sorgusunda açık çözülmemiş issue kalmadı; önce açık olan `BORCAMA-WEB-2` ve `BORCAMA-WEB-5` artık görünmüyor. |
| 2026-09-07 09:30 TSİ · otomatik takip | 1 | 0 | 0 doğrulanmış kritik | `BORCAMA-WEB-2` yeniden açıldı: gizliliği korunmuş TypeError, 1 olay, ilk/son görülme 08:59 TSİ. Etkilenen akış token kapsamıyla belirlenemedi; P2 inceleme. |
| 2026-09-08 09:58 TSİ · otomatik takip | 0 | 1 | 0 | `BORCAMA-WEB-2` son 24 saat production sorgusundan düştü; açık çözülmemiş issue kalmadı. |
| 2026-09-08 17:07 TSİ · otomatik takip | 1 | 0 | 0 doğrulanmış kritik | `BORCAMA-WEB-2` yeniden açıldı: gizliliği korunmuş TypeError, 1 olay, ilk/son görülme 16:28 TSİ. Etkilenen akış token kapsamıyla belirlenemedi; P2 inceleme. |
| 2026-09-09 17:42 TSİ · otomatik takip | 0 | 1 | 0 | `BORCAMA-WEB-2` son 24 saat production sorgusundan düştü; açık çözülmemiş issue kalmadı. |

## Kontroller

### 2026-09-03 · İlk kısa kontrol

- Kapsam: `borcama-web` production; backend, local ve preview kapsam dışıdır.
- Hariç tutulan: setup-test `BORCAMA-WEB-1`.
- Sonuç: Sentry Issues verisine erişim olmadığı için yeni, çözülen veya açık kritik sorun hakkında güvenilir sayı üretilemedi.
- Güvenlik ve gizlilik: Hata mesajı, kullanıcı kimliği/e-postası, finansal içerik, breadcrumb, replay ve tracing gönderilmeyecek; ayrıntı toplamak için filtre gevşetilmedi.
- Sonraki gerekli erişim: yalnız-okunur Sentry Issues erişimi veya CEO'nun doğrulanmış Issues ekranı özeti. Erişim sağlanınca önce son 24 saatteki yeni/çözülen/açık kritik sorunlar, sonra CRM etkisi incelenir.

### 2026-09-05 · Tarayıcıdan bağımsız takip

- `scripts/check-sentry-issues.mjs --commit` son 24 saatteki production issue değişikliklerini kontrol eder ve yalnız kimlik, kısa başlık, olay/kullanıcı sayısı, son görülme ile bağlantıyı raporlar.
- API tokenı macOS Keychain'de tutulur; depoya, komut çıktısına veya bu belgeye yazılmaz.
- Issue ayrıntısı için mevcut tokenın event stack kapsamı yoktur; hata mesajı ve finansal içerik göndermeyen gizlilik filtresi korunur.

### 2026-09-05 13:15 TSİ · Kısa production kontrolü

- Kapsam: son 24 saat, `borcama-web`, yalnız production ve çözülmemiş issue'lar; setup-test ile `BORCAMA-WEB-1` hariç tutuldu.
- Açık issue sayısı: 3. Yeni kayıt: `BORCAMA-WEB-5` (error, 1 olay, ilk/son görülme 12:52 TSİ). Artış: `BORCAMA-WEB-2` (error, toplam 3 olay; bu kontrolde +2, son görülme 12:57 TSİ).
- Kullanıcı kimliği iletilmediğinden API'deki `userCount` etkilenen kişi sayısı olarak yorumlanmadı. İki kaydın da gizliliği korunmuş genel TypeError başlığı dışında akış bağlamı yok.
- Öncelik: P2 inceleme. Kayıt, giriş, borç, ödeme veya veri bütünlüğünü bozduğunu doğrulayacak kanıt olmadığından kritik olarak sınıflanmadı; rutin CEO raporuna eklenecek.

### 2026-09-06 12:06 TSİ · Kısa production kontrolü

- Kapsam: son 24 saat, `borcama-web`, yalnız production ve çözülmemiş issue'lar; setup-test ile `BORCAMA-WEB-1` hariç tutuldu.
- Açık issue sayısı: 2. Önceki kontroldeki üç kayıttan biri artık sorguda çözülmemiş görünmüyor; kalan kimlikler `BORCAMA-WEB-2` ve `BORCAMA-WEB-5`.
- İnce istemcinin checkpoint'i yalnız güncel açık kayıtları tuttuğu için çözülen üçüncü kaydın kimliği geçmişten geri getirilemedi. Kayıt/giriş/borç/ödeme veya veri bütünlüğü etkisini doğrulayan kanıt yok; açık kritik yok.

### 2026-09-06 14:29 TSİ · Kısa production kontrolü

- Kapsam: son 24 saat, `borcama-web`, yalnız production ve çözülmemiş issue'lar; setup-test ile `BORCAMA-WEB-1` hariç tutuldu.
- Açık issue sayısı: 0. Önceki kontrolde açık olan `BORCAMA-WEB-2` ve `BORCAMA-WEB-5` artık sorguda çözülmemiş görünmüyor.
- Yeni veya artan kayıt yok; açık kritik yok. Kullanıcı ve finansal veri okunmadı ya da değiştirilmedi.

### 2026-09-07 09:30 TSİ · Kısa production kontrolü

- Kapsam: son 24 saat, `borcama-web`, yalnız production ve çözülmemiş issue'lar; setup-test ile `BORCAMA-WEB-1` hariç tutuldu.
- Açık issue sayısı: 1. `BORCAMA-WEB-2` gizliliği korunmuş TypeError ile yeniden göründü (1 olay; ilk ve son görülme 08:59 TSİ).
- Etkilenen akış, hata ayrıntısı ve gerçek kullanıcı sayısı bu salt-okunur tokenın kapsamı dışında. Kayıt/giriş/borç/ödeme ya da veri bütünlüğü etkisini doğrulayan kanıt olmadığından kritik olarak sınıflanmadı; P2 inceleme sırasına alındı.

### 2026-09-08 09:58 TSİ · Kısa production kontrolü

- Kapsam: son 24 saat, `borcama-web`, yalnız production ve çözülmemiş issue'lar; setup-test ile `BORCAMA-WEB-1` hariç tutuldu.
- Açık issue sayısı: 0. Önceki P2 kaydı `BORCAMA-WEB-2` artık sorguda çözülmemiş görünmüyor.
- Yeni veya artan kayıt ve açık kritik yok. Kullanıcı ve finansal veri okunmadı ya da değiştirilmedi.

### 2026-09-08 17:07 TSİ · Kısa production kontrolü

- Kapsam: son 24 saat, `borcama-web`, yalnız production ve çözülmemiş issue'lar; setup-test ile `BORCAMA-WEB-1` hariç tutuldu.
- Açık issue sayısı: 1. `BORCAMA-WEB-2` gizliliği korunmuş TypeError ile yeniden göründü (1 olay; ilk ve son görülme 16:28 TSİ).
- Akış etkisi ve gerçek kullanıcı sayısı token kapsamı dışında. Kayıt/giriş/borç/ödeme veya veri bütünlüğü etkisini doğrulayan kanıt olmadığından kritik olarak sınıflanmadı; P2 inceleme sırasına alındı.

### 2026-09-09 17:42 TSİ · Kısa production kontrolü

- Kapsam: son 24 saat, `borcama-web`, yalnız production ve çözülmemiş issue'lar; setup-test ile `BORCAMA-WEB-1` hariç tutuldu.
- Açık issue sayısı: 0. Önceki P2 kaydı `BORCAMA-WEB-2` artık sorguda çözülmemiş görünmüyor.
- Yeni veya artan kayıt ve açık kritik yok. Kullanıcı ve finansal veri okunmadı ya da değiştirilmedi.
