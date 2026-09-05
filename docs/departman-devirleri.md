# Borcama departmanları ve devir panosu

Sentry production issue takibi tarayıcıdan bağımsızdır: salt okunur Internal Integration token'ı macOS Keychain'de `borcama-sentry-token` adıyla saklanır; `scripts/check-sentry-issues.mjs --commit` son 24 saatteki çözülmemiş production issue değişikliklerini kişisel veri yazmadan kontrol eder. Token depoya, çıktıya veya departman notlarına yazılmaz.

### 2026-09-05 · Ücretli edinim · Dönüşüm hedefi önceliği

- Google Ads canlı hesabında `Borcama - Hesap Kaydı` hedefinin Kaydolma kategorisinde birincil ve bir kez sayılan dönüşüm olduğu doğrulandı; kampanyanın ilk optimizasyon hedefi olarak korundu.
- `Borcama - Pro Abonelik` hedefi teklif optimizasyonundan çıkarılıp ikincil gözlem hedefine alındı; satış sonucu `Tüm dönüşümler` içinde izlenmeye devam edecek fakat kampanya teklifini yönlendirmeyecek.
- Panelde son 7 gün için 184 gösterim, 7 tıklama, ₺240,74 maliyet ve 0 dönüşüm görüldü. Hesap Kaydı etiketi hiç veri almadığı için hatalı yapılandırılmış uyarısı sürüyor; canlı kod olayı yalnız ölçüm izni vermiş ve e-postasını doğrulamış yeni hesapta tekilleştirilmiş olarak gönderiyor.
- Yönetim Kurulu Başkanı hafta sonu edinim sprinti için fiili günlük ₺300 tavanı onayladı; kampanyanın ortalama günlük bütçesi ₺60'tan ₺150'ye çıkarıldı ve panelde Kaydolma işlemleri hedefiyle kaydedildiği doğrulandı. Hedefleme ve kampanya durumu değiştirilmedi; sonraki doğrulama ilk gerçek izinli/doğrulanmış reklam kaydının Ads tanılamasına ulaşmasıdır.

## Yönetim modeli

Yönetim Kurulu Başkanı son stratejik kararı verir. CEO ve ana teknik ürün koordinatörü ekip çıktılarını birleştirir, teknik kaliteyi denetler ve gerekli onayları Başkan'dan alır. Sonuç ekipleri CEO toplantısından görev beklemez; `docs/sirket-isletim-sistemi.md` içindeki hedef ve yetki matrisine göre kendi haftalık işini seçer, uygular ve raporlar.

Operasyon yapısı kanal departmanlarından dört sonuç ekibine dönüştürülmüştür: Ürün ve Mühendislik, Büyüme, Yaşam Döngüsü ve Müşteri Başarısı, Güven/Veri/Operasyon. Kanal görevleri korunur ancak hedef ve önceliklerini `docs/sirket-isletim-sistemi.md` içindeki ortak metrik ağacından alır.

Model bütçesi `docs/ajan-rolleri.md > Model ve maliyet politikası` üzerinden yönetilir. Departmanların varsayılanı Sol değildir; görev bazında Luna veya Terra kullanılır, Sol yalnız tanımlı yüksek risk kapılarında devreye girer.

### 2 Eylül 2026 yetki kararı

- Yönetim Kurulu Başkanı Özer; köklü ürün ve yayın kararları, azami reklam bütçesi artışı, toplu e-postanın nihai gönderimi, fiyat/Pro politika değişikliği ile toplu veya geri döndürülemez kullanıcı verisi işlemlerinde son onayı verir.
- CEO; rutin ve geri alınabilir yayınları, gerçekleşen harcamada mevcut onaylı **₺120/gün azami reklam bütçesi** içindeki optimizasyonları, sosyal medya aylık planını ve A/B test trafik kararlarını ekiplerle birlikte yönetir. Google'ın iki kata kadar günlük harcama davranışı nedeniyle mevcut kampanyada ortalama günlük bütçe ₺60 seviyesinde tutulur.
- Departmanlar tanımlı sınırlarında CEO toplantısı beklemeden analiz, geliştirme, test, hazırlık ve rutin uygulama yapar; yalnız yetki kapısına giren kararları yükseltir.
- Fiyatlandırma ve Pro süresi mevcut haliyle korunur; ekipler indirim veya politika önerisi hazırlayabilir ancak Başkan kararı olmadan uygulayamaz.
- Haftalık departman otomasyonlarının görev metinleri bu yetki matrisiyle uyumlu hale getirilmiştir; toplu e-posta gönderim kapısı Özer'de kalır.
- Özer çevrimdışıyken şirket çalışmayı durdurmaz: departmanlar tanımlı yetkilerinde kendi işlerini seçer, CEO engelleri dağıtır ve rutin uygulamaları sürdürür; yalnız Başkan kararı gerektiren son adımlar bekletilir.

## Görev haritası

| Departman | Codex görev başlığı | Görev kimliği | Ana teslim |
|---|---|---|---|
| CEO ve koordinasyon | CEO · Borcama Yönetim Merkezi | `019f5604-b9e1-7312-9c5c-12c7c529e55a` | Şirket hedefi, entegrasyon, kalite ve yönetim kurulu kararları |
| Büyüme · Ücretli edinim | Büyüme · Ücretli Edinim ve Analytics | `01a03434-d24f-7fe1-b17a-fb8b3732d313` | Ücretli edinim ve dönüşüm kalitesi |
| Büyüme · İçerik | Büyüme · İçerik ve Sosyal | `01a03da8-fb51-7a33-8b5d-b5bb0fe62ad4` | İçerik planı ve yaratıcı dosyalar |
| Büyüme · Organik | Büyüme · SEO ve Organik | `01a02578-7ac6-72f3-9774-8b958b705e86` | Organik edinim ve teknik SEO |
| Yaşam döngüsü | Yaşam Döngüsü · E-posta ve Müşteri Başarısı | `01a059a6-c68c-7551-a99f-443b73c2711b` | Aktivasyon, tutundurma ve kullanıcı iletişimi |
| Ürün · Operasyon | Ürün · CRM ve Operasyon | `01a059a7-ff61-79c0-8301-45803c85135c` | CRM, veri kalitesi ve operasyon ekranları |
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

- 2026-09-05 · Landing ve CRO · Sürüm `v1.44.0`: LANDING-001, yalnız ilk teması `google / cpc / tr_pmax_borcama` olan ziyaretçilerde mevcut hero CTA ile `Ücretsiz başla, ilk planını gör` metnini `%50/%50` karşılaştıracak biçimde etkinleştirildi. Atama anonim tarayıcı kaydında kalıcıdır; e-posta, kullanıcı kimliği veya finansal veri içermez. Kayıt ekranı, hesap, doğrulama ve ilk borç/ekstre sonuçları Analytics'te varyant bazında raporlanır. CTA hedefi iki varyantta da `/register?plan=free`; landing'in diğer içeriği değişmez. 114 otomatik test, production build ve yerel görsel kontrol başarılıdır.

- 2026-09-05 · Landing ve CRO · Baz sürüm `v1.42.8`: LANDING-001’in görünür varyantı yalnız hero ana CTA metni olarak yerelde hazırlandı: `Ücretsiz başla, ilk planını gör`. CTA hem kontrol hem varyantta `/register?plan=free` hedefini korur; fiyat, güven bölümleri ve sayfanın diğer içeriği değiştirilmedi. Önizleme yalnız geliştirme ortamında `/?landing_preview=variant` ile açılır; canlıda varyant ataması, exposure olayı ve trafik açma kodu yoktur. PMax kontrol verisi 8 landing ziyareti, 0 kayıt ekranı geçişi gösterdiği için varyant henüz canlıya açılmadı; Ads UTM suffix’i ayrı ekip tarafından düzeltildi. Önerilen ilk oran, yeterli kontrol verisi sonrasında CEO kararıyla `%50/%50`; deploy yapılmadı.

- 2026-09-05 · Landing ve CRO · Sürüm `v1.43.0`: LANDING-001 iki aşamaya ayrıldı. İlk aşamadaki PMax kontrol hunisi canlı veritabanına ve `backoffice` Edge Function v35'e yayımlandı; Analytics ekranı ilk teması `google / cpc / tr_pmax_borcama` olan oturumlarda landing ziyareti, kayıt ekranı, kayıt, doğrulama ve ilk borç/ekstre adımını toplulaştırılmış gösterir. Reklam tıklaması huniye dahil edilmez; e-posta, kullanıcı kimliği ve finansal ayrıntı rapora taşınmaz. Landing CTA/metni, kullanıcı ataması ve deney exposure canlıda değişmedi; varyant trafiği `%0` kaldı. Sonraki karar: kontrol verisi toplandıktan sonra CEO A/B trafik oranını ayrıca değerlendirecek.

- 2026-09-03 · Ürün · CRM ve Operasyon · Baz sürüm `v1.37.0`: Kartlar içindeki erişilebilir “Kart borcumu yapılandırdım” akışı yerelde eklendi. Kullanıcı banka planındaki yapılandırılan tutar, kesin aylık taksit, taksit sayısı, ilk ödeme tarihi ve isteğe bağlı toplam geri ödemeyi giriyor; işlem kartın kalan borcundan tutarı düşüp aynı kayıtta “Kredi kartı yapılandırması” kredisi oluşturuyor. Banka planı kesin kabul edildiği için tahmini faiz oranı taksiti ezmiyor; faiz/KKDF/BSMV yalnız isteğe bağlı metadata olarak saklanıyor. Kısmi/tam yapılandırma, çifte sayım, kesin taksit, geçersiz tutar ve eski veri uyumluluğu test edildi; geri al işlemi kartı ve yeni krediyi birlikte eski durumuna döndürüyor. Doğrulama: 88/88 otomatik test, production build ve `git diff --check` başarılı. Kullanıcı verisi, migration veya canlı yayın yapılmadı. Sonraki adım: CEO koordinasyonu minor sürüm kararını ve rutin yayın paketini değerlendirmeli.

- 2026-09-02 · Yönetim / Test yetkisi: Yönetim Kurulu Başkanı, yalnız tanımlı yönetici test adreslerine giden ve gerçek kullanıcı segmenti, backfill, mali taahhüt veya geri döndürülemez işlem oluşturmayan testler için tekrar onay alınmamasını kararlaştırdı. Gerçek kullanıcılara toplu e-postanın nihai gönderim onayı Başkan'da kalır.

- 2026-09-02 · Ürün · CRM ve Operasyon · Baz sürüm `v1.37.0`: CEO görünümüne güvenilir büyüme hunisi eklendi. Toplam kayıtlı/doğrulanmış, bugün yeni/doğrulanan, bugün/son 7 gün anlamlı kullanım ve gözlemlenen aktivasyon sayıları yalnız auth, `user_acquisition` ve gizlilik-minimize edilmiş `activity_logs` kaynaklarından üretiliyor; kişisel e-posta veya finansal ayrıntı huniye taşınmıyor. Aktivasyon, ilk kart/ekstre/kredi/KMH/diğer borç ekleme olayı; kullanım ise giriş hariç borç, ekstre, gelir, gider, varlık veya ödeme kaydı olarak tanımlandı. İlk temas kaydı olmayan eski/ölçülemeyen hesaplar kanal metriklerine “direct” olarak eklenmeyip ayrı satırda tutuluyor. Doğrulama: 83/83 otomatik test, production build ve diff denetimi başarılı. Dış sistem veya kullanıcı verisi değiştirilmedi; canlı yayın bu devir kapsamında yapılmadı. Sonraki adım: CEO koordinasyonunda `backoffice` Edge Function ve web sürümü birlikte rutin yayına alınmalı, ardından sabah/akşam raporu bu ekranın aynı zamanlı çıktısıyla paylaşılmalı.

- 2026-09-02 · Yönetim / Google Ads: Yönetim Kurulu Başkanı gerçekleşen reklam harcaması tavanını ₺120/gün olarak onayladı. Google Ads'in ortalama günlük bütçeyi bazı günler iki kata kadar harcayabilmesi nedeniyle `Campaign #1` için ortalama bütçe ₺60/gün seviyesinde korunacak; gerçekleşen günlük toplam ₺120'yi aşmayacak. Önceki ₺30'a indirme talimatı geri çekildi; daha yüksek tavan yeniden Başkan kararı gerektirir.

- 2026-09-02 · Instagram · Baz sürüm `1.37.0`: 14 günlük büyüme sprinti için mevcut Instagram otomasyonu onaylı aylık plan kapsamında ücretsiz kayıt ve ilk kullanımı destekleyecek şekilde güncellendi; yeni içeriklerde tek CTA tam olarak `Ücretsiz başla`, problem odaklı ilk hafta içerikleri ve kullanıcı tarafından reddedilen Reels pilotları tekrar kullanılmayacak, sabah/akşam CEO raporunda yayın, erişim, tıklama ve ölçülebilen doğrulanmış/aktive katkı ayrı raporlanacak. Değişen dış sistem: Codex otomasyonu `borcama-1-ayl-k-instagram-serisi`; ürün kodu, sosyal medya kreatif dosyaları ve diğer departman dosyaları değiştirilmedi. Doğrulama: otomasyon etkin ve koordinasyon görevine sprint kapsamı bildirildi; bu güncellemede paylaşım, zamanlama, yeni Reels üretimi veya reklam bütçesi işlemi yapılmadı. Bağımlılık: mesajlar canlı `1.37.0` ve önceki doğrulanmış sürümlerle eşleşecek; `LANDING-001` kullanılmayacak, Meta’daki mevcut plan durumları yeniden kullanım öncesi doğrulanacak.
- 2026-09-02 · CEO / Ürün ve Güven · Baz sürüm `v1.37.0`: Referans sisteminin eksik canlı backend'i ile gizlilik odaklı edinim ölçümü tek kontrollü yayın paketinde tamamlandı. `20260901230000_referral_system.sql` ve `20260902183000_funnel_source_conversions.sql` migration'ları canlı veritabanına uygulandı; `referrals`, `lifecycle-emails`, `shopier-entitlement`, `analytics-event` ve `backoffice` fonksiyonları sıralı olarak yayımlandı. 82/82 test, release check, production build ve canlı imzalı analytics oturum smoke testi başarılıdır. Landing'in v1.37.0 hali yeni kontrol kabul edildi; `LANDING-001` için deney varyantı daha sonra tek hipotezle hazırlanacaktır. Toplu e-posta gönderilmedi, reklam bütçesi değiştirilmedi ve kullanıcı finansal verisinde toplu işlem yapılmadı.
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

### 2026-09-02 · Google Ads yayın kontrolü

- Baz alınan Borcama sürümü: canlı `v1.37.0`.
- Yapılan değişiklik: Kampanya, öğe grubu, faturalandırma ve dönüşüm hedefleri canlı hesapta denetlendi; duraklatılmış uygun öğe bulunmadığı için yayın, bütçe veya teklif ayarı değiştirilmedi. Önceki kurulumdan gelen Pro Abonelik dönüşüm sayımı `Bir` olarak kalıyor.
- Değişen dosyalar ve dış sistemler: Yalnız bu devir kaydı; Google Ads hesabında yeni mali taahhüt, bütçe artışı veya kampanya yapısı değişikliği yapılmadı.
- Test ve doğrulama: `Campaign #1` etkin, Maksimum Performans türünde ve onaylı `₺60/gün` bütçe ile yayınlanıyor; aktif ödeme yöntemi mevcut. Tek öğe grubu da etkin. Dönüşüm hedefleri birincil durumda olsa da Google henüz kayıt ve Pro etiketlerinden canlı dönüşüm verisi almamış görünüyor.
- Başka departmanı etkileyen karar: GA4/Ads doğrudan dönüşüm mimarisi korunmalı; test dönüşümü oluşturarak sinyal üretilemez. İlk gerçek dönüşümden sonra ölçüm tanılaması yeniden kontrol edilmeli.
- Kullanıcı onayı ve sonraki aksiyon: Yayını sınırlayan tek uyarı Mali Hizmetler Doğrulaması politika incelemesi; daha önce gönderilmiş başvurunun Google sonucunu bekliyor. İnceleme sonucunda ek bilgi talep edilirse yalnız o talep ele alınmalı.

### 2026-09-02 · Google Ads günlük yayın raporu

- Baz alınan Borcama sürümü: canlı `v1.37.0`.
- Yapılan değişiklik: Kampanya ayarı değiştirilmeden, canlı “Bugün” aralığı performansı CEO koordinasyonuna raporlandı.
- Değişen dosyalar ve dış sistemler: Yalnız bu devir kaydı; Google Ads kampanya, bütçe, teklif, hedefleme ve dönüşüm ayarlarında değişiklik yapılmadı.
- Test ve doğrulama: `Campaign #1` etkin ve `₺60/gün` ortalama bütçede; 2 Eylül canlı raporu 51 gösterim, 2 tıklama, `%3,92` TO, `₺118,44` maliyet ve 0 dönüşüm gösteriyor. Google Ads ortalama günlük bütçede tek gün yaklaşık iki katına kadar harcama yapabilir; test dönüşümü üretilmedi.
- Başka departmanı etkileyen karar: Dönüşüm verisi oluşmadan teklif veya hedefleme optimizasyonu uygulanmayacak; GA4/Ads doğrudan dönüşüm mimarisi korunacak.
- Kullanıcı onayı veya sonraki aksiyon: Devam eden tek yayın engeli Mali Hizmetler Doğrulaması incelemesidir. Google ek bilgi isterse yalnız bu talep değerlendirilmelidir.

### 2026-09-02 · Yaşam Döngüsü

- Baz alınan Borcama sürümü: canlı `v1.37.0`; referans ve edinim altyapısının koordinasyon göreviyle canlıya alındığı doğrulandı.
- Yapılan çalışma: 14 günlük aktivasyon sprinti için davranış segmentleri ve en fazla üç mesajlık yardım akışı taslaklandı; kampanya gönderilmedi.
- Değişen dosyalar ve dış sistemler: `docs/yasam-dongusu-aktivasyon-sprinti.md` eklendi; canlı Supabase, Resend ve CRM'de değişiklik yapılmadı.
- Test ve doğrulama: 2 Eylül 2026 22:46 TRT toplulaştırmasında 21 doğrulanmış kullanıcı; 12 borç/ekstre yok, 3 borç var gelir yok, 4 aktivasyon proxy'si tamam, 18 son 7 gündür dönmemiş, doğrulanmamış 0 olarak ölçüldü.
- Başka departmanı etkileyen karar: Hazırlık aşamasındaki Welcome deneyi iletişimden çıkarıldı; planı oluşmuş kullanıcılar aktivasyon yardım akışından bastırılacak. Referans ödülü iletişimi ayrı davranış olayı olarak izlenmeli.
- Kullanıcı onayı ve sonraki aksiyon: Segment başına test gönderimi, UTM/CTA/oturum yönlendirmesi ve hariç liste kontrolü tamamlanmadan; Yönetim Kurulu Başkanı'nın son toplu gönderim onayı alınmadan gönderim yapılmamalı.

### 2026-09-03 · SEO Perşembe erken sinyal kontrolü

- Baz alınan Borcama sürümü: canlı `v1.37.0`; Search Console verisi 31 Ağustos 2026 sonuna kadar günceldir.
- Yapılan inceleme: Son 7 günde 85 gösterim, 1 tıklama, `%1,2` TO ve `81,3` ortalama konum görüldü. Mevduat hesaplayıcısı 71 gösterim ve 0 tıklamayla görünürlüğün ana kaynağıdır; ürünle daha doğrudan eşleşen `borç hesaplama` sorgusu son 7 günde 4, toplam dönemde 12 gösterim almıştır. Yeni içerik açılmadı; `borç kapatma hesaplayıcı` ve diğer 13 URL Google tarafından keşfedilmiş fakat henüz taranmamış olduğundan mevcut sayfaların değerlendirilmesi beklenecektir.
- Değişen dosyalar ve dış sistemler: Yalnız bu devir kaydı eklendi; Search Console, site haritası, canlı sayfalar ve ürün kodunda değişiklik yapılmadı.
- Test ve doğrulama: `sitemap.xml` 1 Eylül 2026 tarihinde başarıyla okunmuş, 23 URL keşfedilmiş; dizinde 7 URL, “keşfedildi, henüz dizine eklenmedi” durumunda 14 URL ve “tarandı, dizine eklenmedi” durumunda 0 URL vardır. GİB 2026 ücret tarifesi, SGK 2026 prime esas kazanç sınırları, BDDK kart kararları, TCMB 1 Eylül 2026 azami kart faizleri, Çalışma Bakanlığı ikinci yarı kıdem tavanı ve Hazine/Maliye kaynakları kontrol edildi; hesaplayıcılardaki `33.030 TL` asgari brüt, `297.270 TL` SGK tavanı, ücret gelirleri vergi dilimleri ve `73.729,87 TL` kıdem tavanı günceldir. Mevduat stopajı kullanıcı tarafından bankanın teklifine göre girildiğinden sabit oran değişikliği yapılmadı.
- Başka departmanı etkileyen karar: Organik başarıyı aktive kullanıcıyla ilişkilendirecek kanal kırılımı bu kontrolde erişilebilir değildi; CRM oturumu olmadığı için tıklamadan kayıt/doğrulama/aktivasyona katkı uydurulmadı. CEO/CRM raporunda `organic` kanalının yeni, doğrulanmış ve aktive sayıları ayrı gösterilmelidir.
- Kullanıcı onayı ve sonraki aksiyon: Yeni site haritası veya URL gönderimi gerekmiyor; mevcut site haritası başarılı ve tarama kuyruğu günceldir. Pazartesi kontrolünde `borç kapatma hesaplayıcı` taranmışsa `borç hesaplama` sorgusunun konum ve TO değişimi ölçülecek; taranmamışsa en yüksek niyetli bu tek URL için dizine ekleme isteği CEO koordinasyonuna önerilecektir.

### 2026-09-03 · Instagram sprint otomasyonu

- Baz alınan Borcama sürümü: canlı `v1.37.0`.
- Yapılan değişiklik: Mevcut Instagram heartbeat otomasyonu, yeni iş beklemeden her gün 09:30 ve 18:30 TRT CEO raporu verecek; perşembe sabahı takip eden haftanın onaylı içeriklerini çakışma kontrolüyle hazırlayıp zamanlayacak şekilde güncellendi.
- Değişen dosyalar ve dış sistemler: Codex otomasyonu `borcama-1-ayl-k-instagram-serisi`; Meta’da yeni içerik veya reklam bütçesi değişikliği yapılmadı.
- Test ve doğrulama: Otomasyon ACTIVE olarak güncellendi; tek CTA `Ücretsiz başla`, yalnız canlı v1.37.0 özellikleri, reddedilmiş Reels pilotlarının dışlanması ve ödeme/bütçe ekranında iptal koşulu prompt’a işlendi.
- Başka departmanı etkileyen karar: CEO raporlarında yayınlanan/zamanlanan içerik, erişim, tıklama ve ölçülebilen doğrulanmış kayıt/aktivasyon katkısı veri yoksa açıkça “erişilemedi” olarak belirtilmeli.
- Kullanıcı onayı veya sonraki aksiyon: Kullanıcının rutin yayın için verdiği açık onay kapsamında çalışır; kapsam dışı reklam, bütçe veya sonuç garantisi kararı yükseltilmelidir.

### 2026-09-03 · Instagram 09:30 plan kontrolü

- Baz alınan Borcama sürümü: canlı `v1.37.0`.
- Yapılan inceleme: 4, 7 ve 9 Eylül haftası-1 içerikleri yeni görsellerle Meta’da planlanmış; dosya/görsel-caption eşleşmesi yerel yayın paketinde doğrulandı ve tekrar bulunmadı.
- Bulgular: Mevcut yayın paketi CTA olarak `borcama.com` kullanıyor; sprint kuralındaki tek CTA `Ücretsiz başla` standardıyla tutarsız olduğu için plan dışı yeni içerik üretilmedi ve mevcut zamanlamalar değiştirilmedi.
- Sonraki aksiyon: Meta’da düzenleme yetkisi/uyarısı olmadan planlanmış içeriklere müdahale edilmeyecek; uygun ilk düzenleme penceresinde CTA standardizasyonu CEO’ya yükseltilecek. Erişim, tıklama ve doğrulanmış+aktive katkı bu çalışmada ölçülemedi.

### 2026-09-03 · Instagram sosyal dinleme kalıcı kuralı

- Baz alınan Borcama sürümü: canlı `v1.37.0`.
- Yapılan değişiklik: Heartbeat prompt’una günlük en fazla 3, son 14 gün (tercihen 72 saat) UI-tarih doğrulamalı özgün yorum; bağlam uygunsa en fazla 2 doğal Borcama fayda açıklaması ve 24/48 saat ölçüm kuralı eklendi.
- Sonraki aksiyon: Tekrar/spam/DM/garanti yok; platform doğrulaması veya güvenlik uyarısında durulacak.

### 2026-09-03 · Instagram 100 takipçi hedefi

- Başlangıç takipçisi: 7; hedef: 100 (hedef açığı 93).
- Otomasyon raporlarına günlük net artış, profil ziyareti, tıklama ve doğrulanmış+aktive katkı alanları eklendi; organik rutin dışında ücretli aksiyon yok.

### 2026-09-03 · Instagram 18:30 büyüme raporu

- Başlangıç takipçisi: 7; güncel takipçi için bu çalışmada yeni UI doğrulaması alınamadı; hedef açığı en son doğrulamada 93.
- Uygulanan işler: Bio CTA `Ücretsiz başla` olarak güncellendi; içerik üretimi kalite eşiği nedeniyle yayınlanmadı.
- Ölçüm: Bugün için doğrulanmış profil ziyareti, erişim, tıklama veya kayıt/aktivasyon katkısı yok; yeni karar yarın güncel profil doğrulaması ve 24 saat pilot ölçümü sonrası verilecek.

### 2026-09-04 · Instagram somut içerik teslimi

- Baz alınan sürüm: canlı `v1.37.0`.
- Yapılan çalışma: Asgari ödeme sonrası görünürlük problemi için 3 slayt carousel ve Story metni hazırlandı; stok/yapay insan kullanılmadı, QA uygulandı.
- Durum: Taslak teslim edildi, Meta’da yayınlanmadı; yayın bağlantısı ve performans verisi yok.

### 2026-09-04 · Instagram normal plan devamı

- Başkan kararıyla GIF/maskot üretimi durduruldu; eski dosyalar rafa kaldırıldı, yeni animatik yapılmadı.
- 4 Eylül normal plan gönderisi Meta profilinde yayınlandı: https://www.instagram.com/borcama/p/Dc3H3pyEWlV/ .
- Profil UI doğrulaması: 7 takipçi; bu kontrolde erişim/tıklama/kayıt/aktivasyon metriği yok. Organik hedef sonuçlanmış sayılmadı.

### 2026-09-05 · Instagram carousel/Story hazırlığı

- 7 Eylül carousel’inin 1080×1350 dosya sırası, metin-konu eşleşmesi ve temsili veri kuralı yeniden doğrulandı; caption CTA’sının yayın öncesi `Ücretsiz başla` standardına alınması not edildi.
- Bugün için çakışmasız 3 kartlı anket Story paketi hazırlandı: `social-media/buyume-sprint/2026-09-05/story-paketi.md`.
- Story yayınlanmadı; önerilen zaman 7 Eylül carousel’inden 2–3 saat önce. Ölçüm hipotezi ve veri yoksa raporlama kuralı kaydedildi.

### 2026-09-03 · SEO yüksek niyetli borç kapatma sayfası

- Baz alınan Borcama sürümü: canlı `v1.37.0`; çalışma alanında başka departmanların tamamlanmamış değişiklikleri korunmuştur.
- Yapılan değişiklik: `/araclar/borc-kapatma-hesaplayici` sayfasına hesaplama mantığını sade biçimde açıklayan bölüm eklendi; aynı içerik Google'a ilk HTML yanıtında sunulan statik çıktıya taşındı ve mevcut borç kapatma rehberine doğrudan bağlantı kuruldu. Yeni URL veya düşük niyetli içerik üretilmedi.
- Değişen dosyalar ve dış sistemler: `src/SeoPages.jsx`, `scripts/prerender-seo.mjs`, `CHANGELOG.md` ve bu devir kaydı değişti. Search Console'da yalnız canlı URL testi yapıldı; dizine ekleme isteği gönderilmedi.
- Test ve doğrulama: `npm test` 83/83 başarılı; `npm run build` başarılı ve 20 SEO sayfası üretildi. Üretilen HTML'de doğru canonical, iki açıklama bölümü ve `/rehber/borc-kapatma-plani-nasil-hazirlanir` bağlantısı doğrulandı; `git diff --check` geçti. Search Console URL denetiminde sayfanın hiç taranmadığı, yönlendiren sayfa algılanmadığı ve dizinde olmadığı görüldü; 3 Eylül 12:18 canlı testi URL'nin Google tarafından kullanılabilir ve dizine eklenebilir olduğunu, iki geçerli breadcrumb öğesi bulunduğunu doğruladı.
- Başka departmanı etkileyen karar: Değişiklik canlıya alınmadan dizine ekleme isteği gönderilmemeli. Organik başarı bugünden sonraki dış kullanıcılarla ölçülmeli; Search Console tıklaması CRM'deki `organic` kanalının yeni doğrulanmış ve aktive kullanıcılarıyla aynı tarih aralığında karşılaştırılmalıdır.
- Kullanıcı onayı veya sonraki aksiyon: Güvenli rutin sürümde bu yamayı canlıya al; ardından tek URL için Search Console dizine ekleme isteğini kullanıcı onayıyla gönder. CRM yönetim oturumu bu kontrolde açık olmadığı için organik doğrulama/aktivasyon eşleşmesi ölçülemedi; CEO raporunda ölçüm açığı olarak gösterilmelidir.

### 2026-09-03 · Ürün · CRM ve Operasyon · Ürün Sağlığı özeti

- Baz alınan Borcama sürümü: `v1.40.3`.
- Yapılan değişiklik: CEO görünümüne dönem seçilebilir (bugün/7 gün/30 gün/özel), Europe/Istanbul saat diliminde çalışan Ürün Sağlığı özeti eklendi. 200 doğrulanmış kullanıcı hedefi; yeni kayıt, doğrulama, ilk borç/ekstre, gözlemlenen tam aktivasyon, anlamlı aktif tekil kullanıcı, D7/D30, aktif deneme ve ödeme referanslı aktif Pro ayrı sunuluyor; önceki eşit dönem farkı ve kanal bazında kayıt/doğrulama/tam aktivasyon görünür.
- Veri sınırları: Tam aktivasyon yalnız anonim `activity_logs` olaylarıyla (borç/ekstre + gelir + gider/ödeme) gözlemlenir; eski/izlenemeyen hesaplar, kanalı bilinmeyen hesaplar ve test/yönetici sınıflaması ayrı tutulur. İlk ücretli dönüşüm tarihi, kanal maliyeti/edinme maliyeti, kritik akış hatası ve dönemsel açık destek için güvenilir kaynak olmadığı açıkça “hesaplanamıyor” gösterilir; sıfır üretilmez. Kişisel e-posta veya finansal ayrıntı yeni özete taşınmadı.
- Değişen dosyalar: `src/CeoDashboard.jsx`, `supabase/functions/backoffice/index.ts`, `src/growthFunnelIntegration.test.js`, `CHANGELOG.md`.
- Test ve doğrulama: `npm test` 91/91, `npm run release:check`, `npm run build` ve `git diff --check` başarılı.
- Sonraki aksiyon: CEO rutin yayın kararını vermeli; bu devirde kullanıcı verisi değiştirilmedi ve canlıya çıkılmadı.

### 2026-09-05 · SEO borç kapatma tarama sinyali

- Baz alınan Borcama sürümü: canlı `v1.42.7`; yüksek niyetli borç kapatma sayfasının önceki SEO iyileştirmesi `v1.39.0` ile yayımlanmıştır.
- Yapılan değişiklik: `/araclar/borc-kapatma-hesaplayici` için site haritasındaki geride kalmış `lastmod` değeri, içeriğin gerçek yayın tarihi olan `2026-09-03` olarak güncellendi. Yeni URL, içerik veya ürün vaadi eklenmedi.
- URL ve kanıt: Canlı `https://borcama.com/araclar/borc-kapatma-hesaplayici` sayfasında başlık, hesaplama açıklaması, çalışan sonuç tablosu ve `/rehber/borc-kapatma-plani-nasil-hazirlanir` iç bağlantısı doğrulandı. Yerel `public/sitemap.xml` hedef URL'yi içeriyor ve doğru değişiklik tarihini bildiriyor.
- Test ve doğrulama: `npm test` 108/108 başarılı; `npm run build` 20 SEO sayfasını üretti; `npm run release:check` ve `git diff --check` geçti.
- Search Console sonucu: 5 Eylül 11:44 canlı testi URL'nin Google tarafından kullanılabilir ve dizine eklenebilir olduğunu, iki geçerli breadcrumb öğesi bulunduğunu doğruladı. Google Dizini görünümü URL'yi henüz bilinmiyor, taranmamış ve yönlendiren site haritası/sayfa algılanmamış olarak gösterdi.
- Tamamlanan dış aksiyon: Yönetim Kurulu Başkanı'nın işlem anındaki onayıyla yalnız bu URL için dizine ekleme isteği gönderildi; Google isteği kabul ederek URL'yi öncelikli tarama sırasına ekledi.
- Sonraki adım: Site haritası tarih düzeltmesini rutin SEO yayınına dahil et; URL'yi tekrar göndermeden sonraki SEO kontrolünde tarama/dizin durumunu ve `organic` doğrulanmış+aktive kullanıcı katkısını ölç.
### 2026-09-05 · SEO + Landing/CRO + Ürün · Mevduat trafiği dönüşüm köprüsü

- Baz alınan Borcama sürümü: canlı `v1.44.0`; kapsamlı iyileştirme `v1.45.0` için hazırlandı.
- Yapılan değişiklik: Mevduat hesaplayıcısında sonuçtan hemen sonra gelen reklam alanı kaldırıldı; hesaplanan tutarı kaydetmeden borç, gelir, gider ve varlık tablosuna geçiş eklendi. Ana landing yalnız borç yerine finansal tablonun dört parçasını ilk ekranda anlatıyor; mevduat bağlamıyla gelen yeni kullanıcı kayıt sonrası Varlıklar ekranına yönleniyor.
- Ölçüm ve gizlilik: `deposit_result_view` ve `deposit_product_click` olayları yalnız anonim oturum, sayfa ve edinim bilgisini taşır; ana para, faiz, stopaj, getiri veya e-posta gönderilmez. Analytics'te ziyaret → sonuç → ürün geçişi → kayıt → doğrulama → ilk varlık/borç hunisi toplulaştırılır.
- Kaynak doğruluğu: Google, Bing ve Yandex yönlendirmeleri alan adı yerine organik arama kanalı olarak normalize edilir; ilk temas sonraki iç bağlantıyla ezilmez.
- Dosyalar ve yayın sırası: `supabase/migrations/20260905180000_deposit_product_bridge.sql` → `analytics-event` → `backoffice` → frontend. `src/SeoPages.jsx`, `src/LandingAlt.jsx`, `src/Auth.jsx`, analytics/acquisition dosyaları, prerender ve süreç dokümanları birlikte değişti.
- Doğrulama: 116/116 test, production build ve `git diff --check` başarılı; SEO çıktısı 20 sayfayı yeniden üretti.
