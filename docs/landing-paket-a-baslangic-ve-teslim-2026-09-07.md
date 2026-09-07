# Paket A · Başlangıç ve yerel teslim

Tarih: 7 Eylül 2026
Kapsam: A0 başlangıç ölçümü, A1 landing, A2 kayıtsız örnek, A3 kayıt başlangıcı

## Gerçek ölçüm durumu

| Alan | Durum |
|---|---|
| Ziyaret → kayıt → doğrulama → ilk finansal kayıt | Bu teslimde canlı CRM/Analytics hesabı üzerinden doğrulanmış yeni sayı alınmadı; oran üretilmedi. |
| LANDING-001 kol verisi | Eski deneyin tarihsel raporlaması korunuyor; yeni landing temelinde atama kapalı. |
| Yönetici/test hesapları | Gerçek kullanıcı sonucu olarak sayılmadı. |

Ölçüm yokluğu bir başarı iddiası değildir; tasarım ve ürün akışı ölçümden bağımsız olarak yerelde kabul edildi.

## Teslim edilen akış

- Ana landing kısa ödeme/bütçe vaadi, tek ana Ücretsiz CTA ve ikincil `/demo` bağlantısıyla yenilendi.
- `/demo` tek tutarlı sentetik hesapta Bugün, Harcamalar ve Asistan örneklerini gösteriyor; gerçek hesap, kalıcı yazma veya canlı AI çağrısı yok.
- `/register-preview` gerçek kayıt göndermeden e-posta/parola alanlarını ve ilk adım mesajını incelemeye açıyor.
- Mevduat bağlamı `/register?plan=free&redirect=%2Fassets` hedefine korunuyor.
- Mobil taşma kontrolünde `scrollWidth === clientWidth`; 360/390/430 px hedefleri için CSS tek sütuna geçiyor.
- Eski LANDING-001 ataması yeni temel için kapalı; tarihsel rapor sorguları korunuyor.

## Kontrol kapıları

- `npm run release:check` geçti.
- `npm test` geçti.
- `npm run build` geçti.
- Canlı yayın yapılmadı; Başkan incelemesi bekleniyor.

## Sonraki küçük adım

Sağ panelde masaüstü ve mobil önizlemeyi inceleyip beş hedef kullanıcıyla kısa, yönlendirmesiz görev testi yapmak. Sonuçlar gerçek dönüşüm sonucu olarak değil, Paket B onboarding önceliği için nitel sinyal olarak kaydedilecek.
