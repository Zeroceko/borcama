# Borcama departmanları ve devir panosu

## Yönetim modeli

Ürün sahibi son kararı verir. Ana geliştirici ve teknik ürün koordinatörü departman çıktılarını birleştirir, teknik kaliteyi denetler ve yayın onayını kullanıcıdan alır. Departman görevleri eş görevlerdir; koordinasyon bu dosya, yol haritası, aktif deney kaydı ve changelog üzerinden yürür.

## Görev haritası

| Departman | Codex görev başlığı | Görev kimliği | Ana teslim |
|---|---|---|---|
| Ana geliştirme ve koordinasyon | Uygulamayı incele | `019f5604-b9e1-7312-9c5c-12c7c529e55a` | Ürün, entegrasyon, test, sürüm ve yayın kararı |
| Google Ads | Google Ads işlerini gözden geçir | `01a03434-d24f-7fe1-b17a-fb8b3732d313` | Kampanya ve dönüşüm önerileri |
| Instagram | Instagram içeriklerini yönet | `01a03da8-fb51-7a33-8b5d-b5bb0fe62ad4` | İçerik planı ve yaratıcı dosyalar |
| SEO | SEO | `01a02578-7ac6-72f3-9774-8b958b705e86` | Organik büyüme ve teknik SEO |
| E-posta | Email - Marketing - Bilgilendirme | `01a059a6-c68c-7551-a99f-443b73c2711b` | Kampanya ve kullanıcı iletişimi |
| CRM | CRM:BORCAMA Ajanı | `01a059a7-ff61-79c0-8301-45803c85135c` | CRM, CEO ve operasyon ekranları |
| Landing ve CRO | Ana koordinasyon içinde, ayrı görev açılana kadar | — | Landing hipotezi, varyant ve huni raporu |

## Devir formatı

Her departman tamamladığı çalışmada aşağıdaki bilgileri bu dosyanın “Son devirler” bölümüne ekler:

- Tarih ve departman
- Baz alınan Borcama sürümü
- Yapılan veya önerilen değişiklik
- Değişen dosyalar ya da dış sistemler
- Test ve doğrulama sonucu
- Başka departmanı etkileyen karar
- Kullanıcı onayı veya sonraki aksiyon ihtiyacı

## Son devirler

- 2026-09-02 · Instagram · Baz sürüm `1.36.4`: Mevcut “Borcama 1 Aylık Instagram Serisi” otomasyonu kullanıcının açık onayıyla haftalık kreatif üretimi, tekrar ve kalite kontrolü, içerik kaydı ve Meta Business Suite zamanlamasını yeniden onay beklemeden yürütecek biçimde güncellendi; kapsam mevcut bir aylık planla sınırlı ve ücretli reklam harcaması kapalıdır. Değişen dış sistem: Codex otomasyonu `borcama-1-ayl-k-instagram-serisi`; ürün kodu ve başka departman dosyaları değiştirilmedi. Doğrulama: otomasyon etkin, ilk çalışma 3 Eylül 2026 saat 10.00 ve haftalık dört çalışma olarak kayıtlı; bu değişiklik sırasında sosyal paylaşım yapılmadı. Bağımlılık: `LANDING-001` hazırlık aşamasında ve canlı trafikte olmadığı için Instagram içeriklerinde kullanılmayacak; sosyal vaatler yalnız yayımlanmış sürüm maddeleriyle eşleştirilecek ve kapsam dışı paylaşım veya reklam bütçesi için yeni kullanıcı onayı gerekecek.
- 2026-09-02 · Google Ads · Baz sürüm `1.36.4`: İzin duyarlı kayıt, doğrulama, Pro deneme ve satın alma ölçümü güvenli hale getirildi; finansal veri olayı kaldırıldı, sandbox satın almaları hariç tutuldu ve ölçüm planı yazıldı. Google Ads'te `Campaign #1` kullanıcı onayıyla mevcut ₺60/gün bütçe ve teklif stratejisi korunarak etkinleştirildi; 26 Ağustos-1 Eylül raporunda 15 gösterim, 1 tıklama, ₺1,20 maliyet ve 0 dönüşüm görüldü. G2RS onayı sonrası Türkiye için mali hizmetler dışında faaliyet gösteren reklamveren başvurusu `zero@borcama.com` hesabından Google'a gönderildi; Google incelemesi ve politika sınırlamasının kalkması bekleniyor. Değişen alanlar: `src/googleAds.js`, `src/Auth.jsx`, `src/App.jsx`, `src/googleAds.test.js`, `docs/google-ads-olcum-plani.md`, Google Ads ve Google Ads Destek. Doğrulama: 66/66 test, production build ve canlı paket kontrolü başarılı. Bağımlılık: Landing/CRO `LANDING-001` deneyinde `sign_up` tekilleştirmesi ile UTM standardı korunmalı; ana koordinasyon ilk gerçek kayıt dönüşümü ve Google politika sonucunu izlemeli. Kullanıcı onayı olmadan bütçe, teklif veya deney trafik oranı değiştirilmeyecek; sonraki karar için en az 7 gün veya yaklaşık 100 tıklama veri birikmesi bekleniyor.
- 2026-09-02 · Ana geliştirme: Welcome sayfasının değer önerisi, güven mesajı ve Pro deneme CTA'sı lokalde yenilendi; testler geçti, canlı yayın için kullanıcı onayı bekleniyor.
- 2026-09-02 · Koordinasyon: Departman görev haritası ve ortak karar kapıları oluşturuldu.

### 2026-09-02 · SEO

- Baz alınan Borcama sürümü: `v1.33.1`; devir anındaki güncel ürün sürümü `v1.36.4`.
- Yapılan değişiklik: Kullanıcıya özel uygulama rotaları ve eski landing varyantları `noindex` yapıldı; rehberlerdeki resmî kaynak notları konularıyla doğru eşleştirildi.
- Değişen dosyalar ve dış sistemler: `src/SeoPages.jsx`, `src/main.jsx`, `src/seoIndexing.js`, `src/seoIndexing.test.js`, `vercel.json`, `CHANGELOG.md`, `package.json`, `package-lock.json`; Vercel canlı dağıtımı ve GitHub `v1.33.1` etiketi.
- Test ve doğrulama: 63 test, sürüm kontrolü ve production build başarılı; canlıda özel rotaların `X-Robots-Tag: noindex, nofollow, noarchive`, halka açık SEO rotalarının indekslenebilir olduğu doğrulandı.
- Başka departmanı etkileyen karar: `LANDING-001` hazırlık aşamasındayken SEO ajanı ana landing metnini, CTA'larını, canonical yapısını veya deney ölçümünü tek başına değiştirmeyecek; organik ve Google Ads trafiğinin ayrı raporlanması korunacak.
- Kullanıcı onayı ve sonraki aksiyon: `v1.33.1` canlı yayını kullanıcı tarafından onaylandı. Rehberlerin tam içeriğinin hazır HTML'e taşınması ve ana sayfa başlangıç JavaScript paketinin küçültülmesi ana koordinasyonla çakışma kontrolü sonrası ele alınacak.
