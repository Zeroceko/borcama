# Borcama landing dönüşüm araştırması

Tarih: 7 Eylül 2026 · İncelenen ürün: v1.50.1 · Durum: Araştırma ve karar önerisi; uygulama veya yayın yapılmadı.

## Sonuç

Borcama'nın önerilen ana vaadi: **Bu ay ne ödeyeceğini ve bütçenin yetip yetmediğini tek yerde gör.** Ekstre analizi bu değere ulaşmayı kolaylaştıran başlangıç; asistan ise kayıtlarını anlamanın devam yolu olmalı. Nakit, varlık ve yapılandırma desteği bu ana hikâyeyi tamamlamalı.

Mevcut sayfa kalıcı Ücretsiz planı ve cihazda ekstre işlemeyi açıkça anlatıyor. Sorun bunların yokluğu değil: genel “bütün tablo” vaadi tekrar ediliyor, ilk kazanım yeterince gösterilmiyor ve son güçlü özellikler anlatılmıyor. Daha uzun bir özellik listesi yerine bir somut sonuç, gerçek ürün görünümü ve kolay ilk adım öneriyorum.

Kayıt azlığının tek nedeninin landing olduğu henüz kanıtlanmış değil. Trafik niyeti, kayıt akışı, doğrulama ve ilk finansal kayıt ayrı incelenmeli.

## İnceleme kapsamı ve sınırlar

- Canlı ana sayfanın HTML'i ve yayımlanan JavaScript paketi incelendi; başlık, CTA ve iş akışı metinleri yerel `src/LandingAlt.jsx` ile eşleşiyor.
- `src/Auth.jsx`, `src/main.jsx`, `src/landingExperiment.js`, `src/SeoPages.jsx`, v1.50.1 changelog'u, aktif deney ve departman kayıtları incelendi.
- YNAB, Monarch, Rocket Money, PocketGuard, Ekstre ve Hatırla'nın herkese açık sayfaları; NN/g ve Google'ın birincil araştırma/dokümantasyon kaynakları karşılaştırıldı.
- Tarayıcıdaki mevcut oturum `/` adresini `/summary` ekranına yönlendirdi. Oturum kapatılmadı. Bu rapor yeni ziyaretçinin mobil ekranına ait tamamlanmış bir görsel QA veya canlı kayıt testi değildir; görsel yerleşim çıkarımları CSS ve bileşen yapısına dayanır.
- Güncel CRM hunisi ve gerçek kullanıcı performans ölçümü alınmadı. Aşağıdaki eski sayılar güncel performans olarak sunulmuyor. Rakiplerin özellikleri ve başarı iddiaları kendi beyanlarıdır; ürünlerinin doğruluğu veya dönüşüm başarısı bağımsız olarak sınanmadı.

## Mevcut sayfadaki bulgular

| Bulgu | Kanıt | Öneri | Öncelik |
|---|---|---|---|
| Ana vaat geniş ve soyut | “Tüm finansal tablonu gör. Bu ay ne yapacağını bil.”; ardından beş veri türü sıralanıyor | İlk başlıkta aylık ödeme ve bütçenin yetmesi sorununu anlat; kapsamı açıklamada tamamla | Yüksek |
| Aynı fikir tekrar ediyor | Hero, “Tek rakam değil, bütün tablo”, faydalar ve varlık bölümü benzer birleşik görünüm mesajını taşıyor | Tek bir ürün kanıtı ve üç farklı kullanım örneğiyle tekrarları azalt | Yüksek |
| Yeni yetenekler görünmüyor | Landing'de asistan ve ekstre kategori analizi yok; varlık bölümünde nakit yok | Kategori analizi ve asistanı kısa gerçek örneklerle göster; nakdi varlık açıklamasına ekle | Yüksek |
| Önizleme ürünü deneyimletmiyor | `DashboardPreview` statik HTML; ok simgesi var ama aksiyon yok. “Sıradaki adım” genel açıklama | Temsili verilerle gerçek Bugün görünümü ve kayıt gerektirmeyen kısa örnek inceleme | Yüksek |
| İlk görsel borç büyüklüğüne odaklanıyor | En büyük sayı ₺284.750 toplam borç; aylık karar küçük kutularda | Görselde bu ay ödenecekler, yaklaşan tarih ve plan sonucunu öne al | Yüksek |
| Başlangıç büyük bir veri girişi işi gibi algılanabilir | “Kartlarını, kredilerini, gelirini, harcamalarını ve birikimlerini ... topla” | “Bir kartını veya ekstreni ekleyerek başla”; tam plan için ek verileri aşamalı iste | Yüksek |
| Düzenli kullanım vaadi eksik | “Her ay yalnızca yeni ekstreni ve yaptığın ödemeyi kaydetmen yeterli” | Gelir/gider değişikliklerinin de güncellenmesi gerektiğini kısa ve doğru anlat | Yüksek |
| Ücretsiz/Pro yolu farklı beklenti yaratabilir | Hero `/register?plan=free`; Pro CTA `/register?plan=pro`; kayıt metni 30 günlük erişimin otomatik açıldığını söylüyor | Ana başlangıcı tek Ücretsiz kayıt yolunda tut; Pro koşullarını tutarlı açıklayıp ayrı niyet yolunu doğrula | Orta |
| Başlık ile görsel kanıt mobilde ayrışabilir | 900 px altında tek kolon; uzun büyük başlık ve açıklamadan sonra önizleme geliyor | 360–430 px ekranlarda ana vaat, CTA ve kısa ürün kanıtının sırasını görsel olarak doğrula | Yüksek |
| Kayıt yükü araştırılmalı | E-posta, parola, parola tekrarı, açılır referans, iki kabul alanı ve Turnstile | Alan etiketleri/otomatik doldurma ve hata açıklamaları; parola tekrarı gerekliliğini değerlendir. Güvenlik ve kabul koşullarını ölçüm olmadan kaldırma | Orta |
| İlk HTML'de ürün metni yok | Canlı HTML `root` boş; landing JS ve oturum çözümünden sonra render ediliyor | Herkese açık landing'in ön oluşturulmasını değerlendir; ölçülmüş hız sorunu olduğunu iddia etme | Orta |
| Yeni landing eski deneyle karışabilir | LANDING-001 yalnız CTA metni ve PMax ilk teması için; ortak içerik önceki sürümlerde değişmiş | Yenileme öncesi mevcut veriyi sürüm/tarih/kol bazında arşivle; yeni temeli ayrı dönem olarak ölç | Yüksek |

Korunacak güçlü yönler: Borcama'nın siyah logo, krem, lime ve mercan renkleri; kalıcı Ücretsiz plan; banka şifresi istenmemesi; ham ekstre dosyasının cihazda okunması; Türkiye'deki kart/asgari/KMH/yapılandırma sorunlarına yönelik ürün derinliği.

## Rakiplerden alınacak dersler

| Kaynak | Gözlenen yaklaşım | Borcama'ya uyarlama |
|---|---|---|
| [YNAB](https://www.ynab.com/) | Para endişesi üzerinden sonuç anlatımı; CTA yanında kart gerekmemesi; örnekler ve müşteri anlatıları | Kullanıcının “Bu ay yetiştirebilecek miyim?” sorusuyla başla. Tasarruf garantisi veya rakibin başarı sayılarını kullanma |
| [Monarch](https://www.monarch.com/) | Bütün hesaplar yaklaşımını takip, bütçe, plan ve ürün görselleriyle açıyor | “Tek yer” vaadini somut bir aylık sonuçla kanıtla. Banka bağlantısı özelliğini Borcama'ya mal etme |
| [Rocket Money](https://www.rocketmoney.com/) | Genel para yönetimi vaadinden abonelik yönetimi gibi belirli işlere ve ilgili aksiyonlara geçiyor | Her bölüm ayrı bir işi çözsün; aynı genel faydayı tekrar etmesin |
| [PocketGuard](https://pocketguard.com/) | Harcama kontrolü, borç planı ve kalan para çevresinde karar odaklı anlatım | “Aylık plan” ile “bankadaki kullanılabilir para” ayrımını koruyarak anlaşılır sonuç göster |
| [Ekstre](https://ekstre.co/) | PDF → kategori/taksit/ödeme sonucu çok doğrudan; cihazda işleme açık | Ekstre analizini güçlü giriş noktası yap. Bu özellik ve gizlilik yaklaşımı tek başına benzersizlik iddiası olamaz |
| [Hatırla](https://hatir.la/) | Ekstre kategorileri, ücretsiz başlangıç ve nasıl çalışır yolu ilk bölümde | Borcama'nın daha geniş aylık ödeme/bütçe tablosuyla farkını göster; doğrulanmamış süre ve banka destek iddialarını kopyalama |

Bu örnekler hangi düzenin daha çok kayıt getirdiğini kanıtlamıyor. Tasarım ve mesaj seçeneklerini gösteriyor. Özellikle yerel ürünler nedeniyle “AI var” veya “ekstre okuyor” tek başına güçlü bir konumlandırma değil.

## Kullanıcı ve giriş niyeti

İlk odak önerisi: Birden fazla kartı veya kredisi olan, geliri bulunan, ay içindeki ödemeleri ve kalan yükü zihninde birleştirmekte zorlanan kullanıcı. Borcama'nın mevcut özellikleri bu sorunla doğrudan eşleşiyor; bu bir strateji önerisi, doğrulanmış kullanıcı segmenti sonucu değil.

Üç giriş yolu aynı cümleye zorlanmamalı:

1. **Borç/ödeme araması veya ilgili reklam:** “Bu ay ne ödeyeceğini tek yerde gör.” İlk adım kart/ekstre/kredi kaydı.
2. **Ekstre analizi araması:** “Ekstrendeki harcamaları kategorilere ayır.” Sonraki adım kategorileri kontrol edip kaydetme ve ödeme planı.
3. **Mevduat hesaplayıcısı:** Önce hesaplanan sonucun yanındaki ürün geçişini geliştir. “Nakit ve birikimlerini aylık ödemelerinle birlikte takip et.” Borcu olmayan ziyaretçiyi borçlu varsayma.

Mevduat köprüsü zaten var: doğrudan Varlıklar'a yönlenen kayıt CTA'sı ve `/?from=mevduat` açıklaması. Dolayısıyla sıfırdan köprü kurulduğu iddia edilmemeli; mevcut adımın anlaşılabilirliği ve dönüşümü ölçülmeli. Kaydedilmeyen hesaplayıcı sonucuna “sonucunu kaydet” denmemeli.

Google, reklamdan doğan beklentiyle hedef sayfanın alakalı olmasını ve kolay gezinmeyi landing deneyiminin parçaları olarak tanımlar. Bu nedenle niyete göre mesaj eşleşmesi yalnız görsel bir tercih değildir. [Google Ads](https://support.google.com/google-ads/answer/14086?hl=en)

## Önerilen sayfa mimarisi

### 1. İlk ekran: sonuç, başlangıç, kanıt

Önerilen başlık: **Bu ay ne ödeyeceğini bil. Bütçenin yetip yetmediğini gör.**

Önerilen açıklama: “Kartlarını, kredilerini, gelir ve giderlerini tek yerde takip et. Borcama, kayıtlarına göre yaklaşan ödemelerini ve aylık açığını göstersin.”

Ana CTA: **Ücretsiz başla**

İkincil aksiyon: **Örnek hesabı incele** — ancak gerçekten çalışır, kayıt gerektirmeyen, temsili verili bir deneyim hazırlandıktan sonra.

CTA altı kısa açıklama: “Ücretsiz planın süresi dolmaz. Kart bilgisi gerekmez.” Banka şifresi istenmediği ekstre başlangıç alanında da görünmeli.

Yanında/altında gerçek uygulamanın temsili verilerle üretilmiş kısa görünümü: bu ay kalan ödeme, sıradaki ödeme ve aylık plan. Görselde “Örnek hesap” etiketi. Tam ekranı küçültüp okunmaz hale getirmek yerine ilgili bölümü göster. Bir bölgedeki temsili rakamlar diğer örneklerle aynı senaryodan gelmeli.

### 2. Bir başlangıç, üç somut sonuç

- Ekstreni ekle, harcamaların kategorilere ayrılsın; kaydetmeden önce kontrol et.
- Kredi taksitlerini ve sabit giderlerini aynı aylık yükte gör.
- Kayıtların hakkında Borcama Asistanı'na sor; kısa, maddeli açıklama al.

Her biri bir gerçek ekran kesiti ve bir kısa cümle. Asistan beta olarak gösterilir; rastgele canlı model çağrısı yerine temsili, hesapla tutarlı örnek cevap kullanılabilir. Her ayrıntı ana sayfaya eklenmez.

### 3. Başlamak için gerekenler

“Hesabını aç → bir kart veya ekstre ekle → ilk ödeme görünümünü gör.” Tam aylık bütçe için gelir ve giderlerin eklenmesi gerektiği sonraki adımda netleşmeli. “Bir dakikada tüm finansal plan” gibi ölçülmemiş süre/sonuç sözü verilmemeli.

### 4. Güven ve itirazlar

Kısa cevaplar: Banka şifresi gerekir mi? Ham ekstre nereye gider? Ücretsiz planın süresi var mı? Ekstresiz başlayabilir miyim? Pro denemesi bitince ne olur?

Dosyanın cihazda işlenmesi, hesapta kaydedilen verilerin de yalnız cihazda kaldığı anlamına gelmez. Önerilen açıklama: “Ham ekstre dosyan cihazında okunur. Onayladığın kayıtlar hesabına kaydedilir.” Asistanın ayrı veri kullanım onayı kendi akışında anlaşılır kalmalı.

İzinli ve gerçek kullanıcı yorumları varsa somut kullanım deneyimiyle eklenebilir. Yoksa müşteri sayısı/yorum uydurmak yerine ürünün kendisini kanıt olarak kullan.

### 5. Ücretsiz başlangıç ve sade Pro bilgisi

Ücretsiz özellikler ve deneme sonrası durum açık kalmalı. Pro fiyatı saklanmamalı; fakat kayıt öncesinde iki ayrı satın alma kararı gerektirmeyen bir hiyerarşi kurulmalı. Fiyat ve Pro politikası bu araştırmada değiştirilmedi. Mevcut asistan kotası Ücretsiz 3, Pro 20 soru/gün; gösterilecekse ürünün tek politika kaynağından alınmalı.

Son CTA yeniden “Ücretsiz başla”. Rehberler ve hesaplayıcılar erişilebilir kalır; ana hikâyeyi kesmeyecek konuma alınır.

## Mobil ve teknik kabul önerileri

- 360, 390 ve 430 px genişlikte başlık, CTA, kısa güven metni ve ürün kanıtının sırasını incele. Taşma, okunmaz ekran görüntüsü ve içerik örten sabit düğme olmamalı.
- Sayfa normal akışta anlaşılmalı; kritik mesaj animasyon, carousel veya hover'a bağlı olmamalı. NN/g, açık amaç, somut örnek ve sade ana sayfa yapısını birlikte öneriyor. [NN/g ana sayfa ilkeleri](https://www.nngroup.com/articles/homepage-design-principles/)
- Her ekranı okumayı gerektiren paragraflar yerine açık başlık, kısa açıklama ve örnek kullan. Bu öneri tarayarak okuma davranışına dayanıyor; Borcama için belirli bir dönüşüm artışı tahmini değildir. [NN/g web'de okuma](https://www.nngroup.com/articles/how-users-read-on-the-web/)
- Laboratuvar ve gerçek kullanıcı performansı ayrı raporlansın. Hedefler: LCP ≤2,5 sn, INP ≤200 ms, CLS ≤0,1; gerçek kullanıcı değerlendirmesinde 75. yüzdelik. Bu raporda Borcama'nın bu değerleri ölçülmedi. [Google Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- Kayıt formunda kalıcı alan etiketleri ve uygun autocomplete; parola/güvenlik doğrulaması hatasında görünür açıklama. Doğrulama e-postası ve kayıt sonrası ilgili ekrana dönüş ayrıca kontrol edilmeli. Bu araştırmada yeni hesap oluşturulmadı.

## Ölçüm ve karar disiplini

Eldeki tarihli kanıtlar: 5 Eylül devir kaydında PMax kontrolünde 8 landing ziyareti ve 0 kayıt ekranı; SEO'nun 7 Eylül raporunda son 7 günde 70 gösterim ve 1 organik tıklama, mevduat sayfasında 50 gösterim ve 1 tıklama. Bunlar farklı kaynak/dönemlerdir, toplanmamalı; bugünün trafiği veya güvenilir dönüşüm oranı olarak alınmamalı.

Raporlanacak aynı dönem ve kaynak bazlı huni:

**Landing ziyareti → kayıt ekranı → hesap oluşması → e-posta doğrulama → ilk finansal kayıt.**

- Ana landing metriği: gerçek yeni kullanıcı kayıt tamamlama / uygun landing ziyareti.
- Kalite: doğrulanan kayıt ve ilk finansal kayıt; borç odaklı girişte ilk borç/ekstre, mevduat girişinde ilk varlık kaydı ayrı tanımlanmalı.
- Ara ölçüm: örnek hesabı açma ve kayıt CTA'sı; tıklama başarı yerine geçmez.
- Kaynak, cihaz, ilk giriş sayfası, landing sürümü ve deney kolu ayrılmalı. İç/test hesapları hariç tutulmalı; ölçülemeyen trafik ayrı gösterilmeli.
- Mevcut olaylar yeniden adlandırılmadan eksik ölçümler değerlendirilir. Finansal tutar veya soru metni analitik olayına eklenmez.
- LANDING-001 için önce veriyi dondurma ve “sonuçsuz/yetersiz örneklem” kararı değerlendirilir. Büyük yenileme eski CTA testinin kazananı gibi sunulmaz. Yeni sürüm öncesi/sonrası farkı trafik değişiminden etkilenir; tek başına nedensel kanıt değildir.
- Önce 5 hedef kullanıcıyla yönlendirmesiz anlaşılabilirlik oturumu: “Ne işe yarar?”, “Ücretli mi?”, “Nasıl başlayacaksın?”, “Banka şifren gerekir mi?” Bu nitel bir kontrol, istatistiksel dönüşüm testi değil.
- A/B örneklemi taban dönüşüm ve anlamlı en küçük artış belirlendikten sonra hesaplanmalı; birkaç kayıttan veya sabit bir takvim süresinden kazanan çıkarılmamalı.

## Aksiyon planını düzenlerken önerilen sıra

| Sıra | İş paketi | Somut çıktı | Efor / bağımlılık |
|---|---|---|---|
| 1 | Kitle ve tek ana vaat | Onaylanabilir başlık, açıklama, CTA ve ilk ürün örneği | Küçük; mevcut huni erişimi paralel doğrulanır |
| 2 | Masaüstü + mobil tasarım | Yerelde review edilebilir tam landing, gerçek ürün kesitleri, kısa örnek deneyim | Orta; sentetik tek veri seti ve çalışan demo yolu |
| 3 | Başlangıç tutarlılığı | Ücretsiz/Pro mesajı, ilk kayıt yönlendirmesi, form hata ve doğrulama akışı | Orta; üyelik davranışını koruma |
| 4 | Mevduat ve ekstre girişleri | Niyete uygun ürün geçişi ve ilk kayıt hedefi | Orta; mevcut kaynak ölçümünü koruma |
| 5 | Kontrollü yayın ve takip | Yeni sürüm ölçümü, mobil QA, kısa nitel test ve tarihli sonuç raporu | Ölçüm erişimi ve somut tasarım değerlendirmesi |

İlk pakete alınmaması önerilenler: yeni animasyon/maskot üretimi, herkese açık sınırsız AI sohbeti, çok sayıda landing varyantı, kanıtsız tasarruf ve kullanıcı sayıları, araştırma gerekçesiyle reklam bütçesi veya fiyat politikası değişikliği.

Bir sonraki karar: Borcama'yı öncelikle “aylık ödeme ve bütçe netliği” üzerinden konumlandırıp ekstre analiziyle kolay başlayan, asistanla devam eden bir deneyim olarak tasarlamak. Bu doküman aksiyon planı için araştırma girdisidir; yol haritası, aktif deney, kampanya ve canlı sayfa değiştirilmedi.
