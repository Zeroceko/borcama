# Sentry takip kaydı

Bu kayıt yalnız `borcama-web` production (borcama.com, www.borcama.com ve crm.borcama.com) React/JavaScript sorunlarını izler. Kurulum doğrulama olayı `BORCAMA-WEB-1` gerçek kullanıcı sorunu değildir ve sayımlara dahil edilmez.

## Açık sorun özeti

| Durum | Yeni | Çözülen | Açık kritik | Not |
|---|---:|---:|---:|---|
| 2026-09-03 · ilk kontrol | Erişilemedi | Erişilemedi | Erişilemedi | Sentry yönetim API anahtarı veya Issues ekranı oturumu bu çalışma alanında yok. Public DSN yalnız teslim içindir; sorun listesi için kullanılmaz. |
| 2026-09-05 · otomatik takip | 1 | 0 | 1 yeni kayıt | Salt-okunur token Keychain'den okunuyor; olay değişiklikleri kişisel veri yazılmadan checkpoint ile tekilleştiriliyor. |

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
