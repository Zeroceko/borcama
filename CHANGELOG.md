# Borcama değişiklik günlüğü

Borcama'nın kullanıcıya, yönetime ve entegrasyonlara yansıyan değişiklikleri bu dosyada tutulur. Sürümleme [SemVer](https://semver.org/lang/tr/) düzenini izler.

## Unreleased

## [1.47.5] - 2026-09-06

### Düzeltildi

- Google Ads kayıt dönüşümü, ölçüm izni reddedildiğinde kişisel veri veya çerez kullanmadan Consent Mode modelleme sinyali olarak gönderilecek biçimde düzeltildi.

## [1.47.4] - 2026-09-06

### Değiştirildi

- “Borcama'ya sor” düğmesi sayfa içeriğini kapatan sabit konumdan kaldırılıp masaüstü ve mobil ana menüye taşındı; asistanın beta olduğu ve sonuçların kontrol edilmesi gerektiği daha görünür hale getirildi.

## [1.47.3] - 2026-09-06

### Değiştirildi

- Borcama Asistanı yanıtları kısa cevap, ayrı eylem maddeleri ve vurgulanan kritik tutarlarla daha kolay taranabilir bir görünüme kavuştu.

## [1.47.2] - 2026-09-06

### Düzeltildi

- Borcama Asistanı, borcu karşılayabilecek hazır kaynağı değerlendirirken ev ve araç gibi kolayca nakde çevrilemeyen varlıkları artık nakit birikim olarak saymıyor.

## [1.47.1] - 2026-09-06

### Değiştirildi

- Borcama Asistanı cevapları finansal terimleri günlük dille açıklayan, kısa cevap ve 2–3 okunabilir maddeden oluşan sabit bir yapıya geçirildi.

## [1.47.0] - 2026-09-06

### Değiştirildi

- Borcama Asistanı her sorudan önce kart, kredi, KMH, yapılandırma, ödeme, gelir, sabit gider, harcama eğilimi ve varlıkları ham finansal belge aktarmadan tek bir normalize finansal profilde birlikte analiz ediyor.

## [1.46.1] - 2026-09-06

### Düzeltildi

- Gemini 3.7 Flash isteklerinin güncel API parametreleriyle yanıt vermesi sağlandı; model hatasıyla sonuçlanmayan sorular artık kullanıcının günlük soru hakkından düşmüyor.

## [1.46.0] - 2026-09-06

### Değiştirildi

- Borcama Asistanı, belirgin düşük maliyetli yeni kredinin daha pahalı kayıtlı borcu tamamen kapatması ve taksidin bütçeye sığması halinde bunun mantıklı bir refinansman olabileceğini koşullarıyla birlikte söyleyebiliyor.
- “Borcama'ya sor” girişi masaüstünde ekranın orta kenarında, mobilde alt gezinmenin hemen üzerinde kalan kalıcı bir asistan kısayoluna dönüştürüldü.
- Kullanıcı ölçümü reddetse bile Google etiketi varsayılan `denied` durumunda çerezsiz sinyaller gönderecek şekilde gelişmiş Consent Mode'a alındı; tam ölçüm yalnız izin verildiğinde açılıyor ve kişisel/finansal veri paylaşılmıyor.
- Ana sayfanın ilk ekranındaki kalabalık soru kutuları kaldırıldı; ödeme yükü, aylık açık ve sıradaki adım vaadi ana açıklamanın doğal bir parçası haline getirildi, kalıcı Ücretsiz plan vurgusu korundu.

### Eklendi

- Bugün ekranına, kullanıcının yalnız kendi kayıtlarından aylık durumunu, açığın nedenini, ilk adımını ve yanlış kaydı düzeltme yolunu açıklayan güvenli Borcama Asistanı eklendi.
- Borcama Asistanı'na serbest soru alanı eklendi; desteklenmeyen sorularda yanıt uydurmak yerine kullanıcı görüş bildirimine yönlendiriliyor.
- Borcama Asistanı, kullanıcının açık onayından sonra yalnız normalize edilmiş finansal özetini Gemini Flash ile yorumlayarak bütçe, kredi, yapılandırma, ödeme ve gider konularındaki farklı soru biçimlerine kişisel yanıt verebilir hale getirildi; günlük kullanım Ücretsiz planda 10, Pro'da 50 soruyla sınırlandı.

### Düzeltildi

- Borcama Asistanı demo görünümünde serbest soruyu reddetmek yerine temsili kayıtlardan kredi, gider ve aylık plan etkisini açıklayan güvenli bir örnek yanıt veriyor.

## [1.45.0] - 2026-09-05

### Eklendi

- Mevduat faizi hesaplayıcısı, sonucu borç, gelir, harcama ve varlık tablosuna bağlayan gizlilik odaklı bir ürün geçişiyle yenilendi; bu yolculuğun kayıt ve ilk finansal kayıt sonucu yönetimden tutar toplamadan izlenebiliyor.

### Değiştirildi

- Ana sayfa yalnız borç takibini değil, borç, gelir, harcama ve varlıkları tek tabloda birleştiren Borcama değerini ilk ekranda anlatacak biçimde yeniden kurgulandı; mevduat aracından gelenler bağlamını kaybetmeden varlık eklemeye yönlendiriliyor.
- Arama motoru yönlendirmeleri edinim raporunda alan adı yerine organik Google, Bing veya Yandex kanalı olarak sınıflandırılıyor.

## [1.44.0] - 2026-09-05

### Eklendi

- Google Ads PMax ziyaretçileri için mevcut CTA ile “Ücretsiz başla, ilk planını gör” CTA'sını kalıcı ve gizlilik odaklı `%50/%50` atamayla karşılaştıran LANDING-001 deneyi başlatıldı; kayıt, doğrulama ve ilk borç/ekstre sonuçları yönetimden ayrı izlenebiliyor.

## [1.43.0] - 2026-09-05

### Eklendi

- Google Ads PMax'tan gelen ziyaretçilerin kayıt ve ilk finansal kayıt yolculuğu, landing deneyini veya sayfa mesajlarını değiştirmeden yönetimden ayrı izlenebilir hale geldi.

## [1.42.8] - 2026-09-05

### Düzeltildi

- Pro deneme başlangıç e-postası doğrulamadan en az beş dakika sonra ve hatırlatma eşiğinden önce güvenle gönderiliyor; 48 saatlik hatırlatma yalnız deneme başladıktan sonraki kullanımı dikkate alıyor.

### Değiştirildi

- Borçlar altındaki tekrar eden Gecikenler sekmesi kaldırıldı; gecikmiş ödemeler varsa Bugün ekranının altındaki ödeme takviminde öncelikli gösteriliyor.
- Ödemeler ekranındaki tekrar eden durum menüsü kaldırıldı; ay özeti ve bekleyenler doğrudan, tamamlananlar ile geri alınabilir işlem geçmişi aynı sayfada kompakt bölümler halinde sunuluyor.

## [1.42.7] - 2026-09-05

### Değiştirildi

- Borç Planı'nın bütçe açığı görünümü karar odaklı sadeleştirildi; aylık açık ve güvenli yaşam harcaması sınırı öne çıkarılırken hesap dökümü ile alternatif senaryolar isteğe bağlı açılır hale getirildi.
- Bugün ekranındaki “Şimdi ne yapmalısın?” alanına aylık açığı veya faiz yükünü açıklayan doğrudan Borç Planı bağlantısı eklendi.
- Bugün ve Borç Planı ekranlarında aylık sonuç ile kullanıcının sıradaki eylemi görsel olarak öne alındı; hesap ayrıntıları ikinci seviyeye indirildi.
- Bugün ekranındaki borç dağılımı ek bir bilgi katmanı oluşturmadan doğrudan görülecek biçimde varsayılan açık hale getirildi.
- Bugün ekranındaki yoğun “ne yapmalısın” kutusu kaldırıldı; yaklaşan ödeme ve aylık plan kısa, bağımsız aksiyonlara dönüştürüldü.
- Bugün ekranında rakamları tekrar eden bütçe açıklaması kaldırıldı; borç dağılımı açılır başlık olmadan doğrudan ve tek tıkla düzenlenebilir hale getirildi.
- Anlaşılmayan “aylık fark” yerine Bugün özetinde planın gerçek aylık açığı gösterilmeye başlandı ve tekrar eden gelir-oran metni kaldırıldı.
- Borç dağılımı kategorileri seçilirken toplam alanının konumu sabitlendi; filtreleme artık ekranı sıçratmadan yalnızca sayıyı ve dağılımı değiştiriyor.

## [1.42.6] - 2026-09-04

### Düzeltildi

- Borçlar ekranının kredi formu kapalıyken ilk taksit tarihi kontrolünde çökmesi giderildi.

## [1.42.5] - 2026-09-04

### Düzeltildi

- Google Ads kayıt dönüşümü, doğrulanmamış oturumlar yerine yalnız e-posta doğrulamasını tamamlayan uygulama kaynaklı hesaplarda gönderilir.

## [1.42.4] - 2026-09-04

### Düzeltildi

- Kredi taksitlerinin ödendi görünümü seçili aya göre hesaplanıyor; bu ayki ödeme gelecek ayın taksidinin üzerini çizmiyor.
- Yeni kredilerde ilk taksit tarihi girilebiliyor; ödeme takvimi ve borç planı taksitleri başlangıç ayından önce hesaba katmıyor.
- Bütçe kartı stilleri eklenirken bozulan font yükleme sırası düzeltildi; ana borç tutarının özgün yazı tipi geri getirildi.

### Değiştirildi

- Bugün ekranındaki hesap açıklaması renkli bir bütçe kartına dönüştürüldü; gelir, ödeme ve harcama tutarları mobilde alt alta, doğrudan incelenebilen alanlarla sunuluyor.

## [1.42.3] - 2026-09-04

### Değiştirildi

- Bugün ekranındaki aylık farkın banka bakiyesi olmadığı belirginleştirildi; hesap dayanağından ödeme, harcama ve gelir kayıtlarına doğrudan geçiş eklendi.

## [1.42.2] - 2026-09-03

### Düzeltildi

- Pro ödeme ekranından veya giriş ekranından ana sayfaya dönüşte eski paket seçimi temizleniyor; kullanıcı tekrar ödeme ekranına gönderilmiyor.

- Borç planında yaşam giderleri geliri aştığında oluşan eksi bakiye artık asgari ödemelerle birlikte toplam bütçe açığında gösteriliyor.
- Yaşam harcaması tahmininde taksitli alışverişlerin aylık payları kullanılıyor; eksik ay kayıtları tüm aya çarpılmıyor ve tek başına güvenli günlük limit üretemiyor.
- Harcama azaltımı açığı kapatmaya yetmiyorsa Bugün ekranı bunu açıkça belirtiyor; borç planı tahmini ile kalan gerçek ödemelerin farklı olduğu açıklanıyor.
- Giriş ve parola yenileme denemeleri tamamlandıktan sonra güvenlik doğrulaması yenileniyor; bağlantı hatalarında işlem takılı kalmıyor ve yeniden deneme mesajı gösteriliyor.

## [1.42.1] - 2026-09-03

### Düzeltildi

- Yapılandırma planına taşınan kartlar artık gerçek ödeme veya gecikmiş bekleyen ödeme gibi görünmüyor; zorunlu ödeme ilerlemesi yalnız gerçekten ödenecek asgari ve taksit hedeflerini sayıyor.
- Varlıklarda alış maliyeti bilinmeyen kayıtlar toplam değerde korunurken kazanç/kayıp hesabından ayrı tutuluyor; karşılaştırmanın kapsamadığı kayıtlar açıkça belirtiliyor.
- CRM’de son 30 günlük giriş etkinliği erişim durumundan ayrıldı; gerçek erişim engeli yalnız doğrulanmış ban kaydı varsa ayrı gösteriliyor.

## [1.42.0] - 2026-09-03

### Eklendi

- Turnstile doğrulaması Auth ekranında açık render yaşam döngüsü, süre dolumu/hata temizliği ve her denemede tek kullanımlık token yenilemesiyle güvenli hale getirildi.
- Yardım/SSS ekranına borç ve ödeme kayıtlarını doğru yorumlamaya yönelik güvenli açıklamalar ile abonelik kartı ve kullanıcı kayıtları ayrımını netleştiren metinler eklendi.
- Borcama ve CRM ekranlarına, kişisel ve finansal içerikleri göndermeden uygulama hatalarını sürüm ve kod konumuyla izleyen Sentry takibi ve ekran hatasında yeniden deneme seçeneği eklendi.

## [1.41.0] - 2026-09-03

### Eklendi

- CEO görünümüne, 60 günlük doğrulanmış kullanıcı hedefini; kayıt, doğrulama, ilk borç/ekstre, gözlemlenen tam aktivasyon, anlamlı kullanım, kohort geri dönüşü, Pro ve kanal sonuçlarını dönem ve önceki eşit dönem karşılaştırmasıyla gösteren gizlilik odaklı Ürün Sağlığı özeti eklendi.

## [1.40.3] - 2026-09-03

### Düzeltildi

- Yapılandırma formundaki faiz ve vergi bölümü dar bir bilgi simgesine dönüşmek yerine tam genişlikte açılır başlıkla gösteriliyor; metin artık düğmelerin üzerine taşmıyor.

## [1.40.2] - 2026-09-03

### Düzeltildi

- Bankanın güncel dönem borcunu dahil ederek kayıtlı ekstre bakiyesinden yüksek tutarda yaptığı yapılandırmalar kabul ediliyor; karttan yalnız kayıtlı bakiye düşülüyor ve mobil faiz/KKDF/BSMV alanları taşmadan gösteriliyor.

## [1.40.1] - 2026-09-03

### Düzeltildi

- Tamamı yapılandırılan kart borcu kartta yapılandırma durumu ve taksit sayısıyla gösteriliyor; yeni taksit planı kredi ve ödeme akışına aktarılırken eski kart ekstresi gecikmiş borçtan çıkarılıyor.
- Ödenen kredi taksitleri kredi satırında tamamlanmış görünümle işaretleniyor ve kalan taksit sayısı kayıtlı ödeme geçmişine göre doğru azaltılıyor.

## [1.40.0] - 2026-09-03

### Eklendi

- Kart borcu yapılandırma formu anapara, aylık faiz, KKDF, BSMV ve vade girildiğinde eşit aylık taksiti otomatik hesaplıyor; bankanın verdiği kesin taksit biliniyorsa kullanıcı bu tutarı kullanmaya devam edebiliyor.

## [1.39.1] - 2026-09-03

### Düzeltildi

- Kart borcu yapılandırma işlemi eklendikten sonra Borçlar ekranının veriler yüklenince kapanmasına neden olan gösterim hatası giderildi.

## [1.39.0] - 2026-09-03

### Eklendi

- CEO görünümüne kayıt, doğrulama, anlamlı kullanım ve gözlemlenen aktivasyonu Türkiye saatine göre özetleyen; kanal bazındaki günlük yeni/doğrulanan/aktive sayıları ile ölçülemeyen hesapları ayrı gösteren gizlilik odaklı büyüme hunisi eklendi.
- Doğrulama sonrası Pro deneme bilgilendirmesine, 48 saatlik tek nazik ilk-plan hatırlatması ve kullanıcı başına 7 günde en fazla iki yaşam döngüsü e-postası sınırı eklendi.
- Aktivasyon cadence'i tekil öncelikli eksik-adım mesajına indirildi; ilk 7 gün uygulama içi yönlendirme, ilk 14 günde doğrulama hariç en fazla üç lifecycle e-postası ve 72 saatlik eksik-adım baskısı tanımlandı.

### Değiştirildi

- Borç kapatma hesaplayıcısına hesabın nasıl ilerlediğini anlatan kısa açıklama ve ilgili borç kapatma rehberine doğrudan bağlantı eklendi.

## [1.38.0] - 2026-09-03

### Eklendi

- Kartlar bölümüne, bankanın kesin ödeme planını esas alarak kart borcunun seçilen tutarını tek işlemde sabit taksitli yapılandırma kredisine taşıyan; kartta ve kredide çifte sayımı önleyen yapılandırma akışı eklendi.

## [1.37.0] - 2026-09-02

### Eklendi

- CRM kullanıcı detayına kayıt kaynağı, kanal, kampanya, reklam içeriği, arama terimi ve başlangıç planı; Analytics ekranına da kaynak bazında ziyaret, kayıt ve doğrulama sonuçları eklendi.
- 14 günlük aktivasyon sprinti için davranışa göre en fazla üç yardım e-postası şablonu hazırlandı; gönderim öncesi segment, test ve durdurma koşulları tanımlandı.

### Değiştirildi

- Welcome sayfası borç kapatma planını ve bütçe faydasını daha net anlatacak, ekstrelerin cihazda işlendiğini görünür kılacak ve kalıcı Ücretsiz paketi ana başlangıç seçeneği olarak sunacak biçimde sadeleştirildi; ilk 30 günlük Pro erişimi ek fayda olarak anlatılıyor.
- Kullanıcının edinim kaynağı aynı oturumdaki sonraki kampanya bağlantılarıyla ezilmeyecek biçimde ilk temas olarak sabitlendi.
- CRM ve Analytics edinim bilgileri kullanıcının değiştirebildiği hesap alanları yerine kayıt anında sabitlenen yönetim kaydından okunuyor; ölçülemeyen eski hesaplar artık doğrudan trafik sayılmıyor.

### Güvenlik

- Google Ads kayıt dönüşümünde kullanıcı kimliği yerine kayıt başına üretilen ilişkisiz olay kimliği kullanılmaya başlandı; e-posta doğrulama olayı yalnız gerçek doğrulama sonrasında gönderiliyor.
- Edinim alanları güvenli karakter ve uzunluk sınırlarıyla normalize edildi; ziyaretçi ölçümü oturum imzası ve dakikalık alım sınırıyla kötüye kullanıma karşı güçlendirildi ve ham reklam tıklama kimliğinin yeni ölçüm satırlarında saklanması durduruldu.

### Düzeltildi

- Kişisel davet bağlantılarının arama sonuçlarında görünmesi engellendi ve kampanya parametreli ana sayfa adresleri tek ana adreste birleştirildi.

## [1.36.4] - 2026-09-02

### Değiştirildi

- Hareketler menüsü kullanıcı önceliğine göre Ödemeler, Sabit Giderler, Harcamalar ve Sabit Gelirler sırasına alındı.

## [1.36.3] - 2026-09-02

### Düzeltildi

- Ziraat Bankası ve VakıfBank için temsili çizimler kaldırılarak bankanın resmî kurumsal amblemi ve kullanıcı tarafından sağlanan gerçek logo görseli kullanılmaya başlandı.

## [1.36.2] - 2026-09-02

### Eklendi

- DenizBank, ING Bank, TEB, HSBC ve Türkiye Finans seçim listelerine ve çözünürlükten bağımsız banka işaretleriyle kart görünümlerine eklendi.

## [1.36.1] - 2026-09-02

### Düzeltildi

- Ziraat Bankası kartlarında eksik olan banka işareti eklendi ve VakıfBank işareti mobil ekranlarda pikselleşmeyen vektör çizimle yenilendi.

## [1.36.0] - 2026-09-02

### Eklendi

- Hareketler ekranına her ay otomatik hesaba katılan Sabit Giderler ve Sabit Gelirler alanları eklendi.
- Kredi kartındaki ödeme durumuna tıklayarak o ekstreye ait ödemeleri görme, yanlış tutarı düzenleme veya kaydı silme akışı eklendi.
- Kullanıcıların değişmeyen kişisel davet bağlantısıyla arkadaşlarını çağırabildiği, doğrulama sonrası iki tarafa da 30 gün Pro kazandıran referans sistemi eklendi.
- Kayıt ekranına bağlantıdan otomatik dolabilen veya elle yazılabilen isteğe bağlı referans kodu alanı eklendi.
- Ayarlar ekranına davet bağlantısını kopyalama, paylaşma ve kazanılan/bekleyen Pro günlerini görme kartı eklendi.
- CRM'e referans hunisi, verilen Pro günleri ve olağan dışı davetleri onaylama veya reddetme araçları eklendi.
- Aktif ücretli Pro kullanıcısı referans ödülü kazandığında sıradaki tahsilatı 30 gün erteleyen ve sonrasında otomatik yenilemeyi sürdüren abonelik akışı eklendi.

### Güvenlik

- Referans ödülleri e-posta doğrulamasına, tekil davet kayıtlarına ve aylık otomatik ödül sınırına bağlandı; kullanıcının planladığı iptal veya abonelik değişikliği otomatik olarak ezilmiyor.

### Değiştirildi

- Hareketler menüsü Sabit Giderler, Sabit Gelirler, Ödemeler ve Harcamalar olarak dört anlaşılır bölüme sadeleştirildi.
- Kayıt ekranındaki isteğe bağlı referans kodu alanı sade bir açılır bölüme taşındı; davet bağlantısıyla gelenlerde alan otomatik açılıyor.
- Arkadaşını davet et kartının mobil aksiyonları kompaktlaştırıldı ve kampanya kullanıcının Bugün ekranına sade bir davet bandı olarak eklendi.
- Kayıt ekranındaki tekrar eden avantaj şeridi kaldırıldı, referans alanının açılışı yumuşatıldı ve Bugün ekranındaki gereksiz dikey boşluk azaltıldı.

### Düzeltildi

- Enpara ekstrelerindeki işyeri adında geçen “Bonus” ifadesinin kartı Garanti olarak tanıtması engellendi; ekstre borcu, ödemeler, yeni dönem işlemleri ve ücretler Enpara özet denkleminden doğrulanarak ayrıştırılıyor.

## [1.35.1] - 2026-09-01

### Değiştirildi

- Yenilik e-postası önemli geliştirmeleri anlatan renkli bir hero, özellik kartları ve güçlü ana aksiyonlarla yenilendi; gerçek “Görüş bildir” butonu görseli kullanıcıyı geri bildirim formuna yönlendiriyor ve iletişim metni soru, görüş ve önerileri kapsıyor.
- Tarihli yenilik kampanyası Marketing ekranında uygun alıcı sayısı, iki aşamalı gönderim onayı ve geçmiş teslimat engellerini dikkate alan hedeflemeyle kullanıma açıldı.

## [1.35.0] - 2026-09-01

### Eklendi

- CRM kullanıcı detayında e-posta doğrulama ve deneme tarihleriyle birlikte destek geçmişi ve kampanya etkileşimleri tek müşteri görünümünde birleştirildi; CEO ekranından ilgili kullanıcıya doğrudan geçiş eklendi.

### Düzeltildi

- E-posta doğrulaması ve Pro deneme başlangıcı ayrı, tekilleştirilmiş huni olayları olarak ölçülüyor; sandbox satın almaları canlı dönüşüm sayılmıyor.

### Güvenlik

- Google ölçümüne borç türü ve hassas doğrulama bağlantısı parametreleri gönderilmesi engellendi; yalnız izin verilen kampanya parametreleri ölçülüyor.

## [1.34.0] - 2026-09-01

### Eklendi

- Marketing merkezine v1.33 yeniliklerini tek e-postada anlatan, gönderimden önce önizlenebilen ve yanlışlıkla toplu gönderilemeyen taslak kampanya eklendi.

## [1.33.1] - 2026-09-01

### Düzeltildi

- Kullanıcıya özel uygulama ekranları ile eski landing varyantlarının arama motorlarında sonuç olarak görünmesi engellendi.
- Rehber ve hesaplama araçlarındaki resmî kaynak notları yalnızca ilgili konuya ait kaynakları gösterecek biçimde düzeltildi.

## [1.33.0] - 2026-09-01

### Eklendi

- Kredi kartı ekstrelerinde tek bir “Ekstre ekle” aksiyonundan cihazda okutma veya manuel giriş yöntemi seçilebiliyor.
- Manuel ekstre girişinde mevcut kart seçilebildiği için aynı kartın yanlışlıkla yeniden oluşturulması önleniyor.
- Desteklenen bankalar kredi kartı, ödeme, gecikme ve borç planı satırlarında gerçek marka işaretleriyle ayırt ediliyor; bilinmeyen bankalarda harf rozeti kullanılmaya devam ediyor.
- Ekstre seçilmeden önce dosyanın cihazda işlendiğini ve ham belgenin Borcama'ya yüklenmediğini açıklayan güven mesajı gösteriliyor.

### Değiştirildi

- Banka işaretleri beyaz kutu yerine bankaya özel pastel zemin, kurumsal renk çerçeve ve Borcama'nın mercan gölgesiyle gösteriliyor.
- Yeni kullanıcının ilk borç veya ekstre ekleme adımları sadeleştirildi ve boş ekran aksiyonları netleştirildi.
- CRM kullanıcı listesine sıralama eklendi ve yönetici için kullanıcı e-posta görünümü netleştirildi.

### Düzeltildi

- Ödenen kart ve kredi kayıtları seçilen ödeme ayına göre filtreleniyor; eski dönem kayıtları güncel ayda yinelenmiyor.
- Aylık zorunlu ödeme özeti fazla ödemeyi hedef tutarla sınırlandırıyor ve aynı borcu birden fazla kez saymıyor.
- Geçmişten gelen ek hesap ödeme kayıtları güncel borcun kapatılmasını engellemiyor.
- Taksitli harcamalar tek aya yığılmak yerine ilgili ekstre aylarına dağıtılıyor.
- Kesim tarihinden sonraki harcamalar doğru sonraki ekstre döneminde gösteriliyor.

## [1.32.0] - 2026-08-31

### Eklendi

- Faiz, vergi, kredi taksitleri, yaşam harcaması ve güvenlik payını birlikte kullanan borç kapatma planı eklendi.
- Kullanıcılar daha önce yükledikleri ekstreleri arşivden görebiliyor, kartlar arasında taşıyabiliyor ve isteğe bağlı olarak finansal kayıtla birlikte silebiliyor.
- Yönetim ekranları CRM alan adına taşındı; kullanıcı detayları ve hareket geçmişi tek müşteri görünümünde toplandı.
- Kayıt hunisi, Google Analytics ve Google Ads dönüşüm olayları için izin duyarlı ölçüm eklendi.
- Doğrulama sonrası Pro deneme başlangıcı ve üyelik yaşam döngüsü e-postaları için otomatik akış eklendi.

### Değiştirildi

- Bugün ve Borçlar ekranları ilk kez kullanan kişiye tek öncelikli adım gösterecek biçimde sadeleştirildi.
- Borç planı Borçlar ekranında daha görünür bir ana aksiyon haline getirildi.
- Landing sayfasının okunabilirliği ve ilk yükleme performansı iyileştirildi.

### Düzeltildi

- Mobil Safari'de ekstre PDF'lerinin hazırlanması sırasında oluşan PDF.js uyumsuzluğu giderildi.
- VakıfBank ekstrelerinde metin katmanı OCR'dan önce okunarak kesim tarihi ve asgari tutar yakalama güvenilirliği artırıldı.
- Kredi kartı ödeme ve ek hesap kapatma formlarının açıldığı kayıtla aynı yerde kalması sağlandı.

[1.37.0]: https://github.com/Zeroceko/borcama/releases/tag/v1.37.0
[1.35.1]: https://github.com/Zeroceko/borcama/releases/tag/v1.35.1
[1.35.0]: https://github.com/Zeroceko/borcama/releases/tag/v1.35.0
[1.34.0]: https://github.com/Zeroceko/borcama/releases/tag/v1.34.0
[1.33.1]: https://github.com/Zeroceko/borcama/releases/tag/v1.33.1
[1.33.0]: https://github.com/Zeroceko/borcama/releases/tag/v1.33.0
[1.32.0]: https://github.com/Zeroceko/borcama/releases/tag/v1.32.0
