# Borcama ürün ve büyüme uygulama planı

Başlangıç: 7 Eylül 2026 · Plan ufku: 30 gün · Baz sürüm: v1.50.1

Durum: Paket A ve LANDING-002 tam sayfa A/B altyapısı yerelde hazır; canlı yayın ve gerçek kullanıcı ölçümü bekliyor. Ana geliştirme ve yayın koordinasyonu bu görevde yürütülür. Günlük okuma için [kısa uygulama planı](borcama-kisa-uygulama-plani-2026-09.md) kullanılır. Bu belge yeni departman veya otomasyon oluşturmaz.

Araştırma temeli: [Landing dönüşüm araştırması](landing-donusum-arastirmasi-2026-09-07.md). Mevcut 60 günlük şirket hedefinin süresi bu planla yeniden başlamaz. Başlangıç tarihi ve güncel kullanıcı toplamı doğrulanınca kalan hedef hesaplanır.

## 1. Stratejik tercih

İlk hedef kitle: geliri olan, birden fazla kart/kredi ödemesini bir arada takip etmekte zorlanan kullanıcı. Ekstre analizi kolay başlangıç; aylık ödeme ve bütçe görünümü ilk değer; asistan açıklama ve devam desteği.

Ana vaat: **Bu ay ne ödeyeceğini bil. Bütçenin yetip yetmediğini gör.**

Nakit ve birikim kullanıcıları dışlanmaz; mevduat araçlarından gelenler için Varlıklar ile başlayan ayrı giriş korunur. Borcama kredi sağlamaz veya banka hesaplarını kendiliğinden bağlamaz; ürün mesajı mevcut yetenekleri anlatır.

Global örneklerden mekanizma alınır; metin, marka, özgün görsel veya doğrulanmamış başarı iddiası kopyalanmaz. Türkiye'de tek olma iddiası kullanılmaz.

| İlham | Uyarlanan mekanizma | İlk teslim | Başarı sinyali |
|---|---|---|---|
| YNAB | Düzenli planlama alışkanlığı | Haftalık kısa kontrol ve tek sonraki adım | Anlamlı haftalık dönüş |
| Monarch | Birleşik finansal görünüm | Nakit, borç, ödeme ve aylık planın tutarlı sunumu | İlk görünümü anlayabilme, kayıt güncelleme |
| Rocket Money | Belirli bir sorun üzerinden edinim | Ekstre/ödeme odaklı giriş ve uyumlu içerik | Kaynak bazında doğrulanmış kayıt |
| PocketGuard | Rakamdan günlük karara geçiş | Aylık hedef; veri yeterliyse günlük harcama senaryosu | Hedef ekranından sonra yeni harcama kaydı |

Kaynaklar: [YNAB](https://www.ynab.com/), [Monarch](https://www.monarch.com/), [Rocket Money](https://www.rocketmoney.com/), [PocketGuard](https://pocketguard.com/). Bunlar gözlenen ürün/pazarlama mekanizmalarıdır; Borcama'da başarı garantisi veya rakip dönüşüm oranı değildir.

## 2. Yürütme ve kapasite

- Teknik sorumlu: ana geliştirme görevi; ürün, ölçüm ve yayın tek pakette birleştirilir.
- Büyüme kanalları: var olan Ads, SEO ve içerik sorumlulukları; yalnız yayınlanmış özelliklerden çalışırlar. Bu planı yazmak ilgili görevleri otomatik başlatmaz.
- Yaşam döngüsü ve CRM: mevcut akışlara ek yapar; aynı amaca hizmet eden ikinci e-posta veya rapor sistemi kurmaz.
- Aynı anda bir ana ürün paketi. Diğer kanal işleri o paketin dağıtımına hazırlanır. Yeni ajan/model oluşturmak varsayılan değildir.
- P0/P1 kayıt, ödeme veya finansal hesap hatası aktif paketin önüne geçer.
- Takvim çalışma sırasıdır; kesintisiz arka plan çalışma veya kesin teslim sözü değildir. Geciken paket sonraki paketin kapsamını azaltır; kalite kapısı atlanmaz.

## 3. İlk 30 gün

### Paket A — Kayıt olma gerekçesi · Gün 1–7

**A0 · Başlangıç ölçümü — küçük efor, ilk iş**

- Son 7/14 gün için kanal ve cihaz bazında ziyaret, kayıt ekranı, hesap, doğrulama ve ilk finansal kayıt çıkar.
- Yönetici/test hesaplarını ve ölçülemeyen kaynakları ayır. Mevcut Analytics/CRM ekranlarını kullan.
- LANDING-001 tarihsel ve sonuçsuz olarak ayrı tutulsun. LANDING-002 mevcut sayfa A, yeni sayfa B olacak biçimde yeni ziyaretçileri `%50/%50` ve kalıcı atasın; iki deney verisi birleştirilmesin.
- Teslim: tarihli başlangıç tablosu; her alan gerçek değer veya “ölçüm yok”.

**A1 · Yeni landing — orta efor**

- Kısa sonuç odaklı hero, tek ana “Ücretsiz başla” CTA'sı, ikincil “Örnek hesabı incele”.
- Mevcut siyah logo, krem/lime/mercan dilini koru; tekrar eden “bütün tablo” bloklarını birleştir.
- Üç somut ürün örneği: ekstre kategori analizi, aylık ödeme yükü, asistanın kayıtları açıklaması.
- Nakit/mevduatı varlık anlatımına ekle; her özelliği ayrı büyük bölüm yapma.
- Kalıcı Ücretsiz plan, 30 günlük Pro denemesi ve sonrasındaki durum birbiriyle tutarlı anlatılsın. Fiyat ve paket politikası değişmez.
- Teslim: masaüstü ve 360/390/430 px yerel önizleme; referans alınan canlı özellik listesi.

**A2 · Kayıtsız örnek deneyim — orta efor**

- Mevcut demo bileşenlerini yeniden kullan; ayrı finansal hesap motoru yazma.
- Tek sentetik senaryo; “Örnek hesap” etiketi; Bugün, harcama dağılımı ve asistan örneği arasında kısa geçiş.
- Örnek cevaplar önceden hazırlanmış ve temsili olarak işaretli; her ziyaretçi için ücretli AI çağrısı yapılmaz.
- Gerçek kullanıcı verisi veya kalıcı finansal kayıt yok. “Kendi hesabını oluştur” mevcut kayıt yoluna gider.
- Teslim: butonları çalışan, geri dönülebilen, üyelik gerektirmeyen örnek akış.

**A3 · Kayıt ve ilk adım tutarlılığı — küçük/orta efor**

- Ücretsiz/Pro CTA'larının kayıt ve doğrulama sonrasındaki hedefini kontrol et.
- E-posta/parola alanlarının etiket, otomatik doldurma ve hata açıklamalarını iyileştir; referans isteğe bağlı kalır.
- Kullanıcıya bütün bilgilerini bir kerede doldurması gerektiğini düşündürme; ilk kart/ekstre veya mevduat kaydı için tek başlangıç göster.
- Teslim: kayıt → doğrulama → amaçla uyumlu ilk ekran kontrolü. Yeni giriş sağlayıcısı veya üyelik sistemi bu pakette yok.

**Paket A bitiş ölçütü:** Yerelde incelenebilir bütün akış, tüm CTA'ların doğru hedefi, mobil taşma/örtüşme olmaması, temsili görseller ve doğru ücretsiz mesajı. 7 Eylül 2026 tesliminde yeni landing, `/demo` ve `/register-preview` akışları hazırlandı; demo tek sentetik senaryo kullanıyor, eski landing deneyi yeni temele veri taşımıyor, masaüstü ve mobil ölçümler doğrulandı. Beş hedef kullanıcıyla yönlendirmesiz kısa inceleme hâlâ önerilir; katılımcı yokluğu teknik hazırlığı durdurmaz. “Ne işe yarar / ücretli mi / nereden başlarım?” soruları kaydedilir. Küçük örneklem dönüşüm başarısı sayılmaz.

### Paket B — İlk fayda · Gün 8–14

**B1 · Amaçla başlayan onboarding — orta efor**

- İlk giriş kaynağını koru: borç/ekstre, harcama analizi veya varlık takibi.
- Yeni çok katmanlı anket yerine tek önerilen başlangıç ve isteğe bağlı alternatif sun.
- Bir ekstre sonrası ilk ödeme görünümünü hemen göster; tam aylık plan için gelir ve gider eksiklerini anlaşılır biçimde belirt.
- Eksik veride sıfır veya kesin harcanabilir bakiye üretme. Banka bakiyesi ile aylık planı ayrı isimlendir.

**B2 · Ekstre sonucundan değere geçiş — orta efor**

- Mevcut ayrıştırıcıyı yeniden kurma. Kategorileri kontrol etme, toplam karşılaştırma ve mükerrer aktarım korumasını koru.
- Onaylanan aktarımdan sonra “En çok harcadığın kategoriler” ve ilgili ödeme görünümüne geçiş ver.
- Desteklenen biçimleri test kanıtıyla belirt; tüm bankalar kusursuz okunur vaadi verme.

**B3 · İlk kullanım ölçümü — küçük efor**

- Doğrulama sonrası ilk finansal kayıt oranını ve ilk değere ulaşma süresini ölç; veri eksikse bunu göster.
- Varlıkla başlayan kullanıcı için ilk varlık kaydını ayrı başarı sinyali tut. Mevcut “tam aktivasyon” tanımını sessizce değiştirme.
- Teslim: en büyük tek terk noktasını açıklayan tablo ve o noktaya yönelik bir düzeltme.

**Paket B bitiş ölçütü:** Kullanıcı tek finansal kayıtla faydalı bir sonuç görebiliyor; tam plan eksikleri açıklanıyor; ilk kayıt mevcut ölçüm altyapısında izlenebiliyor.

### Paket C — Geri dönüş nedeni · Gün 15–21

**C1 · Haftalık finansal kontrol — orta efor**

- Bugün ekranında mevcut alanı kullanarak “Bu hafta kontrol et” özeti: yaklaşan ödeme, güncellenmesi gereken kayıt, anlamlı kategori değişimi varsa kısa açıklama.
- Aynı bilgiyi yeni menü ve kutularla çoğaltma; yalnız uygulanabilir tek sonraki adımı öne çıkar.
- Özet deterministik hesaplardan gelsin; her açılışta AI maliyeti doğmasın.

**C2 · Nazik geri çağırma — küçük/orta efor**

- Mevcut doğrulama/Pro/48 saat hatırlatma akışlarını ve gönderim sınırlarını önce kontrol et.
- İlk sürüm uygulama içi. E-posta özeti gerekiyorsa kullanıcı tercihi, mevcut sıklık sınırı ve bastırma kurallarıyla taslakla; toplu gönderim son onayı Özer'de kalır.
- Kullanıcı işi tamamladıysa hatırlatma gönderilmez. Bildirimde hassas finansal ayrıntı gereksiz yere yer almaz.

**C3 · Günlük harcama senaryosu — koşullu, orta efor**

- Yalnız harcama verisinin kapsadığı dönem ve aylık hedef biliniyorsa mevcut Borç Planı içinde göster.
- Kalan hedef / kalan gün hesabında sabit gider ve taksitler çift sayılmasın; negatif hedef ve eksik veri senaryoları açık olsun.
- Bankada hazır para veya garantili güvenli harcama limiti olarak sunulmaz.
- Veri yeterliliği sağlanmazsa bu iş bekler; C1 ve C2 önceliklidir.

**Paket C bitiş ölçütü:** Kullanıcının geri dönünce yapacağı anlamlı iş var; tekrar bildirim yok; finansal özet kayıtlarla tutarlı. D7 sonucu için gözlem süresi dolmamış kohortlar “henüz olgunlaşmadı” gösterilir.

### Paket D — Çalışan yolu büyüt · Gün 22–30

**D1 · Niyete uygun edinim — orta efor**

- Yayınlanan yeni ürün hikâyesini Ads/SEO/Instagram'a taşı: bir içerik, bir sorun, bir CTA.
- Borç/ödeme ve ekstre niyetini ayrı raporla. Mevduat köprüsünü mevcut sonuç ekranında iyileştir; aynı ziyaretçiyi gereksiz ara sayfalara yönlendirme.
- Yeni içerik sayısı yerine doğrulanmış ve ilk kaydını oluşturmuş kullanıcı katkısını değerlendir.
- Reklam bütçesi kayıtlarında tarihsel çelişkiler var; işlem anındaki güncel açık yetki ve hesap ayarı doğrulanmadan bu belge bütçe talimatı olarak kullanılmaz. Bu plan bütçeyi değiştirmez.

**D2 · Pro'nun gerçek değeri — küçük efor**

- Kullanıcının yararlandığı analiz bağlamında Pro açıklaması; kayıt öncesi baskın satış akışı değil.
- Mevcut Ücretsiz/Pro haklarıyla tutarlı karşılaştırma; asistan kotası ve beta bilgisi tek politika kaynağından alınır.
- AI maliyetini başarılı yanıt başına ve aktif kullanıcı başına izle; mümkünse mevcut toplulaştırılmış kayıtları kullan. Fiyat/kota değişikliği bu paketin otomatik sonucu değildir.

**D3 · Öğrenim ve sonraki ay — küçük efor**

- Aynı tanım ve kaynak kırılımıyla başlangıç/sonuç raporu; neden-sonuç kanıtı ile gözlemi ayır.
- Çalışan edinim yolu için sonraki tek deney; yeterli veri yoksa kullanıcı görüşleri ve en büyük terk noktası üzerinden devam.
- Teslim: devam/iyileştir/beklet kararları ve sonraki ayın en fazla üç önceliği.

## 4. Başarı ölçütleri

Mevcut şirket hedefleri korunur: 200 doğrulanmış, 80 aktive, 40 haftalık aktif kullanıcı. Bunlar bugünkü değer veya 30 günlük yeni garanti değildir.

| Ölçüm | Tanım / yorum |
|---|---|
| Landing dönüşümü | Uygun yeni ziyaretçilerden hesap oluşturanlar; kaynak ve sürüm bazında |
| Doğrulama | Hesap oluşturan kohort içinde e-postasını doğrulayanlar; gözlem penceresi belirtilir |
| İlk fayda | Doğrulanmış kullanıcıdan ilk finansal kayda ulaşan; giriş amacına göre ayrı |
| Tam aktivasyon | Mevcut şirket tanımı: borç/ekstre + gelir + ilk hareket; değiştirilirse sürümlü tanım gerekir |
| İlk değer süresi | Başlangıç olayı açıkça tanımlanmış medyan süre; yalnız başarıya ulaşanları ölçmenin yanlılığı ayrıca belirtilir |
| D7 anlamlı dönüş | Önceden belirlenmiş başlangıç olayından 7. gün anlamlı ürün eylemi; yeterli gözlem süresi olmayanları dışarıda tut |
| Edinme maliyeti | Aynı dönem/kaynak harcaması / doğrulanmış veya aktive yeni kullanıcı; payda 0 ise maliyet hesaplanamaz |
| Kalite | Kayıt/ekstre kritik hata, çift kayıt, hesap tutarsızlığı, e-posta şikâyeti ve AI yanıt maliyeti |

Başlangıç verisi görülmeden rastgele dönüşüm yüzdesi veya A/B örneklem sayısı belirlenmez. Hedefin kalan temposu: `(200 − güncel uygun doğrulanmış kullanıcı) / kalan hedef günü`; bilinmeyen değer varsa hesap üretilmez. İlk teslim kalitesi kontrollü kabul kriterleriyle, iş başarısı gerçek kullanıcı sonuçlarıyla değerlendirilir.

## 5. Yayın ve deney sırası

1. LANDING-001 mevcut durumunu ve verisini kaydet. Örneklem yetersizse “sonuçsuz” olarak arşivleme önerisini hazırla; deney kodu bu belgeyle kapanmış sayılmaz.
2. Paket A'yı yerelde somut olarak incele. Büyük landing değişikliğini ayrı sürüm temeli olarak ele al; eski/yeni sonuçları tek deney kolunda birleştirme.
3. Her yayın için mevcut release:check, test ve build kapılarını uygula; ardından canlı kayıt hedefi ve ana ekran açılışını kısa doğrula.
4. Rutin yayımları mevcut yetkiyle yürüt; köklü değişikliklerde somut önizleme üzerinden Başkan kararı alınır. Toplu e-posta ve fiyat gibi özel kapılar korunur.
5. Geri alma: her paketin önceki sürümü bilinsin. Kayıt engeli, yanlış hedef, veri kaybı veya finansal hesap tutarsızlığında yeni paket durdurulur/geri alınır. Düşük örneklemli günlük oran dalgalanması tek başına rollback sebebi değildir.

## 6. Sürdürülebilir çalışma ritmi

- Teknik iş başına bir kısa teslim kaydı: ne değişti, kanıt, hangi metrik, sonraki adım.
- Haftalık değerlendirme: kullanıcı akışı, geri dönüş, kanal maliyeti ve en büyük tek engel; aynı araştırma tekrar üretilmez.
- Mevcut sabah/akşam raporlarına bu paket kimlikleri eklenebilir; yeni rapor otomasyonu oluşturulmaz. Raporlama zamanı gelince veri yoksa açıkça belirtilir.
- Bu plan kendi başına çalıştırıcı değildir. Zamanlanmış görevler ancak mevcut yapılandırma ve çalışma ortamı izin verdiğinde çalışır; görev gönderilmeden “ekip başladı” denmez.

## 7. Şimdi sıradaki somut iş

**A0 + A1:** başlangıç ölçüm tablosunu hazırlamak ve yeni landing'in mobil/masaüstü tasarımını yerelde oluşturmak. Tasarımda kullanılacak ilk senaryo: birden fazla ödeme, kayıtlı gelir/gider, açıklanabilir aylık sonuç. Sonraki iş A2 örnek deneyim ve A3 kayıt bağlantısıdır.

Ertelenenler: aile/ortak hesap, banka bağlantısı, yeni yatırım araçları, yeni model eğitimi, kapsamlı rozet/puan sistemi, maskot/animasyon, ayrı native mobil uygulama ve çok sayıda paralel landing. Kullanıcı verisi bunlardan birinin önceliğini gösterirse plan ayrıca güncellenir.
