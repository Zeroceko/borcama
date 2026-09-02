# Borcama departmanları ve devir panosu

## Yönetim modeli

Ürün sahibi son kararı verir. Ana geliştirici ve teknik ürün koordinatörü departman çıktılarını birleştirir, teknik kaliteyi denetler ve yayın onayını kullanıcıdan alır. Departman görevleri eş görevlerdir; koordinasyon bu dosya, yol haritası, aktif deney kaydı ve changelog üzerinden yürür.

Operasyon yapısı kanal departmanlarından dört sonuç ekibine dönüştürülmüştür: Ürün ve Mühendislik, Büyüme, Yaşam Döngüsü ve Müşteri Başarısı, Güven/Veri/Operasyon. Kanal görevleri korunur ancak hedef ve önceliklerini `docs/sirket-isletim-sistemi.md` içindeki ortak metrik ağacından alır.

Model bütçesi `docs/ajan-rolleri.md > Model ve maliyet politikası` üzerinden yönetilir. Departmanların varsayılanı Sol değildir; görev bazında Luna veya Terra kullanılır, Sol yalnız tanımlı yüksek risk kapılarında devreye girer.

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

- 2026-09-02 · Instagram · Baz sürüm `1.36.4`: Mevcut sosyal medya taslakları ve yarım işler yayın yapılmadan denetlendi. Aylık hikâye omurgası ile birinci hafta 1080 × 1350 statik kreatifleri metadata ve Meta tekrar kontrolü koşuluyla yeniden kullanılabilir; eski ekran görüntüleri ve hazır gönderiler yalnız iç referanstır; kullanıcının reddettiği `social-media/reels/pilot-01`–`pilot-04` çalışmaları bırakılmalıdır. Değişen dosya: `social-media/denetim/2026-09-02/taslak-denetimi.md`; ürün kodu ve dış sistemler değiştirilmedi. Doğrulama: statik kreatifler 1080 × 1350, Reels dosyalarının çoğu 1080 × 1920; `pilot-04/woman-speaking-trackpad-original.mp4` geçersiz dosya ve pilot metinlerindeki “bitir” ifadesi sonuç garantisi riski taşıyor. Bağımlılık: `LANDING-001` ve `Unreleased` mesajları yayımlanana kadar sosyal içeriğe taşınmayacak; birinci hafta içeriklerinin Meta'daki plan durumunu yeniden kullanımdan önce doğrulamak gerekiyor. Bu denetimde kullanıcı onayı gerektiren yayın veya zamanlama yapılmadı; yeni Reels yönü ayrı kullanıcı talebi olmadan başlatılmayacak.
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

### 2026-09-02 · SEO tarama normalizasyonu

- Baz alınan Borcama sürümü: `v1.36.4` ve henüz yayımlanmamış `LANDING-001` / edinim ölçümü çalışmaları.
- Yapılan değişiklik: Kişisel davet rotaları istemci ve Vercel başlığı düzeyinde `noindex` kapsamına alındı; ana landing için sorgu parametrelerinden bağımsız `https://borcama.com/` canonical tanımlandı ve ön oluşturulan SEO sayfalarında tek canonical korunacak biçimde derleme akışı güncellendi.
- Değişen dosyalar: `src/seoIndexing.js`, `src/seoIndexing.test.js`, `vercel.json`, `index.html`, `scripts/prerender-seo.mjs`, `CHANGELOG.md`, `docs/departman-devirleri.md`.
- Test ve doğrulama: 76 otomatik test ve production build başarılı; ana landing, araç ve rehber örneklerinde tam olarak bir ve doğru canonical bulunduğu, Vercel davet rotasında `X-Robots-Tag` kuralı bulunduğu doğrulandı.
- Başka departmanı etkileyen karar: Landing metni, CTA'lar, A/B deney ataması ve UTM/gclid edinim davranışı değiştirilmedi; `LANDING-001` ile mesaj veya ölçüm çakışması yok.
- Kullanıcı onayı ve sonraki aksiyon: Yama yalnızca yerelde hazırlandı; commit ve canlı yayın yapılmadı. Ana koordinasyon test sonucunu inceleyip sürüm/yayın kararı vermeli.

### 2026-09-02 · CRM

- Baz alınan Borcama sürümü: `v1.34.0`; devir anındaki güncel ürün sürümü `v1.36.4`.
- Yapılan değişiklik: Kullanıcı detayına e-posta doğrulama ve deneme tarihleri, destek geçmişi ve kullanıcı bazlı kampanya etkileşimleri eklendi; CEO geri bildirim ve üyelik kayıtlarından ilgili kullanıcıya geçiş sağlandı; detay API yanıtı yalnız seçili kullanıcıyla sınırlandı.
- Değişen dosyalar ve dış sistemler: `src/Backoffice.jsx`, `src/CeoDashboard.jsx`, `supabase/functions/backoffice/index.ts`, `CHANGELOG.md`; teslim commit'i `6540637`. Commit `origin/main` içinde; canlı `backoffice` fonksiyonu bu committen sonra güncellenmiş aktif sürümde.
- Test ve doğrulama: 63 otomatik test, `release:check`, production build ve masaüstü/mobil yerel CRM görsel kontrolü başarılı.
- Başka departmanı etkileyen karar: E-posta departmanının teslimat, açılma, tıklama ve ziyaret kayıtları CRM'de salt okunur gösteriliyor; gönderim davranışı veya hedef kitle değiştirilmedi. E-posta/ana koordinasyon kampanya teslimat şemasını değiştirirken `user_campaigns` CRM yanıtını korumalı.
- Kullanıcı onayı ve sonraki aksiyon: Bu devir sırasında yeni yayın veya kullanıcı verisi değişikliği yapılmadı. Destek kaydını CRM'den “incelendi” olarak işaretleme gibi yazma operasyonları ayrı kapsam ve açık onay gerektirir.

### 2026-09-02 · E-posta

- Baz alınan Borcama sürümü: `v1.35.1`; kampanyadaki özellikler canlı `v1.33.0–v1.33.1` kapsamından seçildi.
- Yapılan değişiklik: `Siz istediniz, biz yaptık · 1 Eylül 2026` kampanyası Marketing ekranında tarihli ad, uygun alıcı sayısı, iki aşamalı onay ve tekilleştirilmiş hedeflemeyle kullanıma açıldı.
- Değişen dosyalar ve dış sistemler: `src/Marketing.jsx`, `supabase/functions/backoffice/index.ts`, `supabase/functions/_shared/borcama-email.ts`, `public/borcama-v1-33-email-preview.html`, `public/email-assets/gorus-bildir-ekran.jpg`, kampanya migration'ları, Supabase `backoffice` fonksiyonu, Marketing/CRM kampanya kaydı ve Vercel canlı dosyaları.
- Test ve doğrulama: Sürüm kontrolü, 66 test ve production build geçti; canlı kampanya kaydı, e-posta önizlemesi ve görseli doğrulandı. Kampanya sonrası 20/20 teslimat, 0 ölçülen açılma, 0 ölçülen tıklama, 1 Borcama ziyareti ve 0 hata kaydedildi.
- Başka departmanı etkileyen karar: Google Ads, SEO ve Instagram bu e-postadaki vaatleri yalnız belirtilen canlı sürümlerle eşleştirmeli; hazırlık aşamasındaki Welcome deneyi bu kampanyaya dahil edilmedi.
- Kullanıcı onayı ve sonraki aksiyon: Canlı yayın kullanıcı isteğiyle yapıldı; toplu gönderim sonradan Marketing ekranından gerçekleşti. Ayrı test gönderimi kaydı bulunmadığı için gelecek kampanyalarda test gönderimi kapısı teknik olarak zorunlu hale getirilmeli.

### 2026-09-02 · E-posta kampanya kontrolü

- Baz alınan Borcama sürümü: canlı `v1.36.4`; `Unreleased` Welcome ve edinim ölçümü değişiklikleri canlı kabul edilmedi.
- Yapılan inceleme: Canlı kampanya tablosu, teslimatlar, Supabase fonksiyonları, bekleyen migration'lar, Marketing önizlemeleri ve mailing havuzu karşılaştırıldı; e-posta gönderilmedi ve yeni kampanya oluşturulmadı.
- Değişen dosyalar ve dış sistemler: Yalnız bu devir kaydı eklendi; Supabase, Resend, CRM ve canlı uygulamada değişiklik yapılmadı.
- Test ve doğrulama: `features-v1-33` kampanyasının 20/20 teslim edildiği doğrulandı. `v1.36.0` için sabit gelir/gider, kart ödemesi düzeltme ve arkadaş daveti faydaları mailing havuzunda bulunuyor ancak bunlara ait toplu kampanya, şablon veya test gönderimi yok.
- Başka departmanı etkileyen karar: Referans ödülü e-posta şablonları ve iki lifecycle kampanyası repoda hazır olsa da `20260901230000_referral_system.sql` canlı veritabanında uygulanmamış, `referrals` Edge Function canlıda bulunmuyor ve canlı `lifecycle-emails` sürümü referans e-postalarından önceye ait. Bu nedenle referans sistemi ve otomatik ödül bilgilendirmesi canlı kabul edilmemeli; ana koordinasyon veri modeli, `referrals`, `lifecycle-emails`, `shopier-entitlement` ve ilgili CRM bağımlılıklarını tek yayın olarak doğrulamalı.
- Kullanıcı onayı ve sonraki aksiyon: Referans veya `v1.36.0` yenilik e-postası gönderilmeden önce ana koordinasyon canlı özellikleri doğrulamalı; ardından hedef/hariç listesi, konu, önizleme, gönderen, UTM, ölçüm ve ayrı test gönderimi tamamlanarak toplu gönderim için yeniden kullanıcı onayı alınmalı.

### 2026-09-02 · CRM edinim güvenilirliği

- Baz alınan Borcama sürümü: `v1.36.4`; edinim özellikleri `Unreleased` kapsamında ve yalnız yerelde.
- Yapılan değişiklik: Edinim kaydı kullanıcı metadata'sından ayrılarak auth kaydı anında tek sefer yazılan ve kullanıcı rollerine kapalı `user_acquisition` tablosuna taşındı; Analytics adımları aynı `session_id` ve ilk temas tarihine göre kohortlandı; eski/ölçülemeyen hesaplar CRM'de "Ölçülmedi" olarak ayrıldı.
- Değişen dosyalar ve dış sistemler: `src/acquisition.js`, `src/funnelAnalytics.js`, `src/Auth.jsx`, `src/Backoffice.jsx`, `src/Analytics.jsx`, `src/funnelAnalytics.test.js`, `src/acquisitionIntegration.test.js`, `supabase/functions/analytics-event/index.ts`, `supabase/functions/backoffice/index.ts`, `supabase/migrations/20260902183000_funnel_source_conversions.sql`, `CHANGELOG.md`; dış sistem değiştirilmedi.
- Test ve doğrulama: Edinim normalizasyonu, server-owned tablo, session kohortu, RPC yetkisi, oturum imzası, oran sınırı ve ham click-id saklamama sözleşmeleri otomatik testlere eklendi; 82/82 test, `release:check`, production build, iki Edge Function için TypeScript bundle kontrolü ve ölçülmüş/ölçülmemiş CRM detaylarının yerel tarayıcı kontrolü başarılı.
- Başka departmanı etkileyen karar: Landing/CRO ve Google Ads, kaynak bilgisini ilk tarayıcı oturumuna bağlı kabul etmeli; `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` alanları güvenli karakterlerle sınırlıdır. Yeni analytics kayıtları ham `gclid/gbraid/wbraid` değerini saklamaz, yalnız tıklama kimliği bulundu bilgisini tutar.
- Kullanıcı onayı ve sonraki aksiyon: Migration, `analytics-event`, `backoffice` ve frontend birlikte ve bu sırayla yayınlanmalıdır. Bu çalışmada commit, canlı yayın veya kullanıcı verisi değişikliği yapılmadı; yayın için açık kullanıcı onayı gerekir.
