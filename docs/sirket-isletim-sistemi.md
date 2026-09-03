# Borcama şirket işletim sistemi

## 60 günlük şirket hedefi

Hedef yalnız “200 hesap” değildir. 60. gün sonunda:

- En az **200 e-postası doğrulanmış kullanıcı**
- En az **80 aktive kullanıcı**: borç/ekstre + gelir + ilk hareket adımlarını tamamlamış
- En az **40 haftalık aktif kullanıcı**
- Kayıt → aktivasyon oranı en az **%40**
- Her edinim kanalında kayıt, doğrulama, aktivasyon ve maliyetin ölçülebilmesi
- Kritik finansal hesaplarda açık P0 hata bulunmaması

Bu rakamlar hedef, garanti değildir. Büyüme uğruna güvenlik, ölçüm doğruluğu veya finansal hesap kalitesi düşürülemez.

## Organizasyon

### 1. CEO ve şirket koordinasyonu

Yönetim Kurulu Başkanı son stratejik kararı verir. Ana koordinasyon görevi CEO merkezidir: şirket hedefini ve yetki sınırlarını belirler, ekipler arası çakışmayı çözer, metrikleri birleştirir ve yönetim kurulu onayı gereken işleri Başkan'a getirir. CEO haftalık işi dağıtan bir kuyruk değildir; sonuç ekipleri tanımlı sınırlar içinde kendi işini seçer ve yürütür.

Sahip olduğu metrikler: doğrulanmış kullanıcı, aktive kullanıcı, haftalık aktif kullanıcı, Pro deneme ve ücretli dönüşüm.

### 2. Ürün ve mühendislik

Mevcut ana geliştirme ile CRM geliştirme burada birlikte çalışır.

- Çekirdek finansal ürün, onboarding, veri modeli, test ve yayın
- CRM, Analytics, kullanıcı destek araçları ve ölçüm altyapısı
- P0/P1 hata çözümü ve aktivasyon darboğazları

KPI: aktivasyon oranı, ilk değere ulaşma süresi, hata oranı, haftalık aktiflik.

### 3. Büyüme

Landing/CRO, Google Ads, SEO ve Instagram tek büyüme ekibinin kanallarıdır. Kanal başarısı tıklamayla değil aktive kullanıcıyla ölçülür.

- Landing hipotezi ve A/B testi
- Organik içerik ve teknik SEO
- Ücretli edinim ve dönüşüm kalitesi
- Sosyal içerik ve yeniden kullanım

KPI: kanal bazında doğrulanmış ve aktive kullanıcı, dönüşüm oranı, edinme maliyeti. Gösterim ve tıklama yalnız öncü göstergedir.

### 4. Yaşam döngüsü ve müşteri başarısı

E-posta ve kullanıcı özelindeki işler tek ekip olur.

- Kayıt doğrulama, aktivasyon, deneme, geri kazanım ve referans mesajları
- Geri bildirimlerin sınıflandırılması ve ürün ekibine aktarılması
- Kullanıcının ilk değer anına ulaşmasına yardım

KPI: doğrulama, aktivasyon, D7 geri dönüş, e-posta aksiyon oranı, çözülen kullanıcı problemi.

### 5. Güven, veri ve operasyon kapısı

Ayrı içerik üreten departman değil, her ekibin üzerinden geçtiği kontrol kapısıdır.

- Finansal hesaplama ve ekstre ayrıştırma doğruluğu
- KVKK, veri minimizasyonu ve yönetici erişimi
- GA4/Ads/CRM ölçüm sözlüğü ve veri güvenilirliği
- Release, rollback ve canlı smoke test

KPI: P0 hata, veri tutarsızlığı, başarısız yayın ve güvenlik olayı.

## Tek metrik ağacı

```text
Doğrulanmış kullanıcı
├── Ziyaret
├── Kayıt ekranı
├── Hesap oluşturma
└── E-posta doğrulama
    └── Aktivasyon
        ├── Borç veya ekstre
        ├── Gelir
        └── İlk ödeme/harcama
            └── Haftalık aktiflik
                ├── Tekrar giriş
                ├── Yeni hareket
                └── Borç planı kullanımı
```

Her departman haftalık raporunda yalnız şu formatı kullanır:

1. Hedef metrik ve önceki/güncel değer
2. Yapılan tek ana iş
3. Kanıt veya test
4. Risk ve engel
5. Gelecek haftanın tek önerisi
6. Kullanıcı onayı gerektiren işlem

## 60 günlük yürütme planı

### Gün 1–7: Ölçüm ve güvenilir yayın

- Bekleyen referans ve edinim migration/fonksiyonlarını tek kontrollü sürümde yayımla.
- GA4–Ads son bağlantısını onayla; gerçek kayıt dönüşümünü test et.
- CRM CEO ekranına doğrulanma, aktivasyon ve kanal kırılımını koy.
- LANDING-001 için ölçüm ve atama tasarımını tamamla.

Çıkış kriteri: ziyaret → doğrulama → aktivasyon zinciri kanal bazında güvenilir biçimde izleniyor.

### Gün 8–21: Aktivasyon

- Beş yeni kullanıcıyla görev bazlı kullanım testi yap.
- En büyük tek onboarding terk nedenini düzelt.
- Ekstre çekincesi, manuel giriş ve ilk plan deneyimini ölç.
- Kayıt olup aktive olmayanlara en fazla üç mesajlık yardım akışı kur.

Çıkış kriteri: kayıt → aktivasyon en az %40 veya başlangıca göre en az 10 puan artmış.

### Gün 22–42: Kontrollü edinim

- Aynı anda yalnız LANDING-001 çalışır.
- SEO, Ads, Instagram ve e-posta aynı değer önerisini farklı formatta taşır.
- Kanal bütçesi aktive kullanıcı maliyetine göre haftalık değerlendirilir.
- Referans sistemi yalnız canlı smoke test ve kötüye kullanım kontrolü sonrası duyurulur.

Çıkış kriteri: en az iki kanal düzenli doğrulanmış kullanıcı getiriyor; ölçülemeyen trafik ayrı tutuluyor.

### Gün 43–60: Tutundurma ve gelir

- Aktive kullanıcıların D7 davranışını incele; geri dönme nedeni oluşturan bir haftalık ritim geliştir.
- Pro değerini gerçek kullanılan özelliklerle anlat; sonuç garantisi verme.
- Kullanıcı görüşlerinden en sık üç ihtiyacı ürün kuyruğuna al.
- 200 doğrulanmış kullanıcı hedefi için kalan açığı kanal bazında kapat.

Çıkış kriteri: 200 doğrulanmış, 80 aktive, 40 haftalık aktif kullanıcı veya sapmanın kaynak bazında açıklanmış telafi planı.

## Çalışma ritmi

- Her gün: P0 hata, kayıt/aktivasyon anomalisi ve dış servis arızası kontrolü.
- Pazartesi: CEO haftalık planı; tüm ekiplere tek sonuç hedefi.
- Çarşamba: deney ve aktivasyon ara kontrolü; veri yoksa yeni iş üretmek yerine dağıtım sürdürülür.
- Cuma: metrik, öğrenim, harcama ve yayın değerlendirmesi.
- Ayda iki kez: kullanıcı görüşmesi ve ürün öncelik güncellemesi.

## Yönetim Kurulu Başkanı çevrimdışıyken çalışma

- Yönetim Kurulu Başkanı bir hafta erişilebilir olmasa bile ekipler haftalık toplantı veya yeni görev beklemeden 60 günlük hedefteki en yüksek etkili, kendi yetki alanındaki tek işi seçer ve yürütür.
- CEO sabah ve akşam metrikleri ile departman devirlerini birleştirir; ölçüm, aktivasyon, edinim veya canlı hata engelini ilgili ekibe dağıtır ve tamamlanana kadar takip eder.
- Salt okunur analiz, içerik hazırlığı, test, geri alınabilir düzeltme, onaylı plan içindeki sosyal yayın, mevcut azami bütçe içindeki reklam optimizasyonu ve rutin yayınlar devam eder.
- Bir ekip engellendiğinde boşta beklemez; aynı hedefe hizmet eden, yetki sınırındaki sıradaki en yüksek etkili işi seçer ve engeli CEO raporuna yazar.
- Yönetim Kurulu Başkanı kararı gereken konu işi tamamen durdurmaz. Ekip güvenli hazırlık, taslak, test ve geri alma planını tamamlar; yalnız son geri döndürülemez veya yetki dışı adımı bekletir.
- Başkan'a yalnız kararın etkisi, önerilen seçenek, beklenen sonuç, risk ve son karar tarihi olan kısa bir karar notu gönderilir.

## Özerklik ve karar matrisi

Ekipler CEO toplantısını beklemez. Her ekip yol haritasındaki en yüksek öncelikli, kendi alanına ait tek işi seçer; uygular, doğrular ve devir kaydıyla CEO'ya raporlar.

### Ekip doğrudan karar verir ve uygular

- Salt okunur analiz, hata yeniden üretimi ve veri kalite kontrolü
- Taslak, prototip, yerel kod, otomatik test ve dokümantasyon
- Mevcut kabul kriteri içindeki geri alınabilir hata düzeltmesi hazırlığı
- Onaylanmış içerik planı sınırlarında taslak üretim ve tekrar kontrolü
- Kullanıcı geri bildirimini sınıflandırma ve ürün kuyruğuna öneri ekleme
- Yalnız tanımlı yönetici test hesaplarına giden, gerçek kullanıcı segmenti/backfill çalıştırmayan ve mali veya geri döndürülemez etkisi olmayan e-posta, lifecycle, ürün ve ölçüm testleri

### CEO karar verir

- İki ekibi etkileyen teknik öncelik ve ölçüm sözlüğü
- Sprint içi iş sırası ve kapasite değişimi
- Riskli değişikliğin Yönetim Kurulu Başkanı'na sunulmaya hazır olup olmadığı
- Testi başarısız veya metrik sonucu belirsiz işin durdurulması
- Modelin Luna → Terra → Sol yükseltilmesi
- Rutin, geri alınabilir ve köklü olmayan sürümlerin canlı yayın kararı
- Onaylı azami bütçe içinde reklam kampanyası, teklif ve dağılım değişiklikleri
- Sosyal medya aylık planı ve plana uygun paylaşımlar
- A/B testinin başlatılması, trafik oranı, durdurulması ve kazananın kalıcılaştırılması
- Toplu e-postanın hedef, içerik, test, teknik ayar ve gönderime hazır olma kontrolü

### Yönetim Kurulu Başkanı onayı gerekir

- Köklü ürün değişikliği, geri dönüşü zor canlı yayın ve temel veri modeli migration'ı
- Reklam için tanımlanmış azami bütçenin artırılması
- Toplu e-postanın nihai gönderimi
- Fiyat, paket veya Pro süresinde mevcut politikanın değiştirilmesi
- Finansal öneri modeli veya temel ürün stratejisinin değiştirilmesi
- Kullanıcı verisini değiştiren toplu operasyon ve geri dönüşü zor dış sistem işlemi

Mevcut onaylı reklam tavanı gerçekleşen toplam harcamada **₺120/gün**dür. Google'ın ortalama günlük bütçeyi bazı günler iki kata kadar harcayabilmesi nedeniyle mevcut kampanya ortalama bütçesi **₺60/gün** seviyesinde tutulur. Ekip gerçekleşen ₺120 sınırı içinde kampanyalar arasında dağılım yapabilir; tavanın artırılması Başkan kararıdır.

### Acil durum

Canlıda güvenlik, veri kaybı, yanlış finansal hesap veya ödeme riski varsa ekip işi P0 olarak CEO'ya anında bildirir; haftalık toplantıyı beklemez. CEO güvenli durdurma, salt okunur teşhis ve geri alınabilir acil düzeltmeyi yönetebilir. Toplu kullanıcı verisi veya geri döndürülemez etkisi olan müdahale Başkan'a çıkarılır.

## Karar kuralları

- Her ekipte aynı anda yalnız bir ana iş bulunur.
- Yeni özellik, aktivasyon veya güvenilirliği iyileştirmiyorsa 60 günlük dönemde bekler.
- Kanal ajanı tek başına ürün vaadi oluşturamaz; canlı changelog ile eşleşir.
- Düşük örneklemde kazanan veya başarısız ilan edilmez.
- Otomasyonlar analiz, taslak, denetim ve kendi yetki alanlarındaki rutin uygulamaları yapabilir. Başkan kapıları yalnız köklü yayın, azami reklam bütçesi artışı, toplu e-posta gönderimi, fiyat/Pro politika değişikliği ve toplu ya da geri döndürülemez kullanıcı verisi işlemlerinde uygulanır.
