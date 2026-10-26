# Borcama değişiklik günlüğü

Borcama'nın kullanıcıya, yönetime ve entegrasyonlara yansıyan değişiklikleri bu dosyada tutulur. Sürümleme [SemVer](https://semver.org/lang/tr/) düzenini izler.

## Unreleased

### Eklendi

- iOS uygulaması katlanabilir iPhone (iPhone Duo), iPad genişliği, Split View ve yatay konuma hazırlandı: alt sekme çubuğu sabit kaydırma yerine pencerenin o anki güvenli alanına göre yerleşiyor ve pencere boyutu, size class veya sahne geometrisi değişince yeniden hesaplanıyor (geniş pencerede öğeler iPad'deki gibi ortalanıyor) ve gerçek yüksekliğini web'e bildiriyor, pencereler bu kadar alt boşluk bırakıyor; sol/sağ güvenli alanlar asimetrik olabildiğinden uygulama ekranları, giriş/kayıt, pencereler ve hızlı işlem düğmeleri her kenarın kendi boşluğunu kullanıyor; karşılama ekranı geniş pencerede okunabilir bir sütunda ortalanıyor, kısa-geniş pencerede görsel ve metin yan yana diziliyor; ekrandan uzun pencereler artık kayıyor ve üstten kesilmiyor. Tarayıcı görünümü değişmedi.

## [1.70.0] - 2026-10-27

### Eklendi

- Tarayıcı sürümünün uygulama içi ekranları (giriş, kayıt, uygulama, Ayarlar, SSS ve yasal metinler) iOS'taki gibi Türkçe, İngilizce, Almanca, Fransızca, İspanyolca ve İtalyanca açılıyor: dil kayıtlı seçimden, yoksa tarayıcı dilinden (desteklenen ilk dil), o da yoksa Türkçe belirleniyor; giriş/kayıt ekranının sağ üstünden ve Ayarlar > Dil satırından değiştirilebiliyor, `<html lang>` seçili dile eşitleniyor. Landing, araç/rehber/sözlük sayfaları ve CRM Türkçe kalıyor; tarayıcı dili Türkçe olan ziyaretçi web'i birebir eskisi gibi görüyor.
- Tarayıcı sürümünde Ayarlar > Para birimi satırı var. Yeni hesapta (Türkçe dışı dilde) varsayılan birim ziyaretçinin ülkesinden, o bilinmiyorsa tarayıcı bölgesinden geliyor ve ülke ortalaması faiz/asgari ödeme kuralları buna göre uygulanıyor; mevcut hesaplar ve Türkçe arayüz TRY'de kalıyor.
- `/api/ulke` uç noktası eklendi: Vercel'in `x-vercel-ip-country` başlığından yalnız iki harfli ülke kodunu döner, önbelleğe alınmaz (`private, no-store`), hiçbir şey saklamaz veya loglamaz.
- Tarayıcı sürümünde İngilizce (ve diğer diller için İngilizce) Kullanım Şartları, Gizlilik Politikası ve İade Politikası gösteriliyor; web satın alımlarının Paddle (Merchant of Record) üzerinden yapıldığı, Paddle iade süreci ve web'de Pro'nun yalnız Türkiye'de satıldığı bölümleri içeriyor. Taslak, hukuk kontrolü bekliyor.
- Her borç (kart, kredi, ek hesap, diğer borç) kendi para biriminde kaydedilebiliyor: formdaki para birimi seçicisiyle örneğin İngiltere'de yaşayan kullanıcı GBP kartının yanında Türk kartını ve kredisini TRY olarak takip ediyor. Kurallar borç bazında (TRY borçta TCMB azami faizi, BDDK asgari oranı, KKDF/BSMV ve Türk bankası listesi; diğer birimlerde o ülkenin ortalaması), en az bir TRY borcu olan kullanıcıda Türk bankası ekstre/kredi planı okuma açık. Toplam borç, zorunlu ödeme, plan, Bugün ve öneriler ana birime TCMB/ECB kuruyla çevriliyor ("≈ kur tarihi" notuyla); kuru olmayan kayıt toplama katılmıyor, "kur bekliyor" diye ayrıca gösteriliyor. Tek birimli TRY kullanıcısının ekranları değişmedi.
- Tarayıcı sürümünde Türkçe dışındaki dillerde kalan web'e özel metinler (Görüş bildir düğmesi ve penceresi, Ayarlar'daki E-posta linki, Gizlilik ve ölçüm, Bankaları yönet/Verileri dışa aktar satırları, davet kartı ve Bugün ekranındaki davet bandı) seçili dilde gösteriliyor; davet programı ödülü Pro olduğundan Pro'nun satılmadığı ülkede davet kartı ve bandı gizleniyor. Türkiye'deki Türkçe web çıktısı değişmedi.

### Değiştirildi

- Tarayıcı sürümünde Pro satışı iOS ile aynı karar fonksiyonundan besleniyor: ziyaretçinin ülkesi Türkiye ise Paddle akışı aynen sürüyor; Türkiye dışındaysa "Pro'ya Geç", Pro penceresi, Ayarlar'daki abonelik kartı, deneme hatırlatıcısı ve /upgrade gizleniyor, Pro özellikleri yalnız tarayıcıda ücretsiz açılıyor (sunucuya hak yazılmıyor). Ücretli aboneliği olan kullanıcı her yerde normal akışı görüyor; ülke alınamazsa Pro satışta sayılıyor.
- Paddle ödeme penceresi uygulamanın seçili dilinde açılıyor.

## [1.69.2] - 2026-10-27

### Değiştirildi

- Borcama Asistanı'nda Pro için aylık 80 soru üst sınırı eklendi; günlük 20 soru hakkı aynı. Aylık hak dolunca asistan "Bu ayki 80 soru hakkını kullandın" diyor ve hak ayın 1'inde yenileniyor.

## [1.69.1] - 2026-10-27

### Kaldırıldı

- Hesaplama araçlarının sonuç alanındaki "Markanızı burada tanıtın" reklam satış kutusu kaldırıldı; reklam ve işbirliği iletişimi artık araç, sözlük, rehber ve ana sayfa alt bilgisindeki bağlantıdan yapılıyor.

### Düzeltildi

- Hesaplama araçlarının sonuç kartında tutarlar artık ikiye bölünmüyor; dar ekranda kutular alt alta diziliyor ve çok uzun tutarlarda yazı tek satıra sığacak kadar küçülüyor.
- Kart veya kredi ekleme/düzenleme formu açıkken üstteki "Gösterilen dönem" seçicisi gizleniyor; seçici artık formun bir alanı gibi görünmüyor.

## [1.69.0] - 2026-10-26

### Eklendi

- iOS uygulaması Almanca, Fransızca, İspanyolca ve İtalyanca destekliyor; cihaz dili bu dillerden biriyse uygulama o dilde açılıyor, dil karşılama ekranında ve Ayarlar'da seçilebiliyor; Face ID izin metni de aynı dillerde.
- iOS uygulaması AB ülkeleri ve ABD App Store'larında yayına hazırlandı; Pro'nun satışta olmadığı ülkelerde satın alma ekranları gizleniyor ve Pro özellikleri ücretsiz açılıyor, Borcama Asistanı kullanıcının dilinde yanıt veriyor.
- iOS uygulamasında para birimi seçilebiliyor; ilk açılışta cihaz bölgesinden (Türkiye için TRY, desteklenmeyen bölgelerde USD) belirleniyor, karşılama ekranındaki seçiciden ve Ayarlar > Para birimi satırından değiştirilebiliyor. Kur çevirisi yapılmıyor; TRY dışındaki birimlerde BDDK asgari ödeme oranı yerine girilen asgari tutar kullanılıyor ve TRY bazlı piyasa fiyatlarıyla otomatik varlık değerlemesi kapalı. Mevcut kullanıcılar TRY'de kalıyor, tarayıcı sürümü değişmedi.
- iOS uygulamasının İngilizce modunda ana ekranlar (Bugün, Borçlar, Hareketler, Plan, Varlıklar, Gelir/Gider, Ayarlar ve hesap silme), asistan arayüzü, Pro satın alma kartı, kilit/bağlantı/doğrulama ekranları, bildirimler, hata mesajları ve SSS İngilizce gösteriliyor; Kullanım Şartları, Gizlilik ve İade Politikası İngilizce taslak olarak ekleniyor, ekstre okuma Türk bankaları için olduğunu belirtiyor. Tarayıcı sürümü Türkçe kalmaya devam ediyor.
- iOS uygulamasında giriş yapmadan dil değiştirilebiliyor; tanıtımın ilk ekranında, karşılama ekranında ve giriş/kayıt ekranlarında sağ üstteki düğmeyle, oturum açıkken Ayarlar > Dil satırından Türkçe ile İngilizce arasında geçiliyor. Tarayıcı sürümünde düğme yok.
- iOS uygulamasına İngilizce dil altyapısı eklendi; cihaz dili Türkçe değilse tanıtım, giriş, kayıt ve parola yenileme ekranları İngilizce açılıyor, tarih ve para biçimi seçili dile uyuyor. Tarayıcı sürümü Türkçe kalmaya devam ediyor.
- iOS uygulamasında hesap açmadan kullanım eklendi; karşılama ekranındaki "Hesap açmadan devam et" ile borçlar, ekstreler, varlıklar ve tüm hesaplamalar kayıt olmadan kullanılabiliyor, kayıtlar yalnızca cihazda tutuluyor. Kullanıcı sonradan hesap açtığında ya da giriş yaptığında cihazdaki kayıtlar hesabına taşınıyor; hesapta zaten kayıt varsa üzerine yazılmıyor. Tarayıcı sürümündeki akış değişmedi.
- iOS uygulamasında Apple ile giriş eklendi; giriş ve kayıt ekranlarında tek dokunuşla hesap açılabiliyor veya girilebiliyor.
- iOS uygulamasında Pro satın alma kartında abonelik adı, süresi ve fiyatı ile Kullanım Şartları, Gizlilik Politikası ve İade Politikası bağlantıları gösteriliyor; aynı kartta "Satın alımları geri yükle" seçeneği yer alıyor.
- iOS uygulamasında ilk kurulumda dört ekranlık tanıtım akışı gösteriliyor: borçların tek yerde toplanması, kapatma önceliği, ay sonu planı ve ardından ücretsiz başlama veya giriş seçimi. Tanıtım atlanabiliyor, parola yenileme ve e-posta doğrulama bağlantılarını engellemiyor.
- iOS uygulamasında oturumu olmayan kullanıcı artık doğrudan giriş formu yerine "Ücretsiz başla / Giriş yap" karşılama ekranını görüyor; tanıtımı daha önce görmüş ya da çıkış yapmış kullanıcıya da bu ekran açılıyor.
- iOS uygulamasında giriş ve kayıt ekranlarına geri butonu eklendi; karşılama ekranına dönülebiliyor.
- iOS uygulamasında bağlantı kesildiğinde boş finansal ekran yerine, bağlantının gerekli olduğunu ve kayıtların silinmediğini açıklayan bir durum ekranı gösteriliyor.
- iOS uygulamasında ödeme günü hatırlatması açılabiliyor; kayıtlı ödemelerden bir gün önce saat 09:00'da bildirim geliyor, aynı güne denk gelen ödemeler tek bildirimde birleşiyor ve bildirimde tutar, banka veya borç türü gösterilmiyor. Hesaplama cihazda yapılıyor, sunucuya veri gitmiyor.
- iOS uygulamasında Face ID veya Touch ID ile uygulama kilidi açılabiliyor; kilit açıkken Borcama her açılışta ve arka plandan her dönüşte kimlik doğrulaması istiyor, tercih yalnızca cihazda saklanıyor.
- iOS uygulamasında Kullanıcı Sözleşmesi ve İade Politikası, satıcının Apple olduğu ve iptal/iade işlemlerinin App Store üzerinden yürüdüğü bilgisiyle gösteriliyor.
- iOS uygulamasında Pro aboneliği App Store içi satın alma (StoreKit) ile alınabilir; abonelik aynı `pro` hakkına bağlandığı için web'den alan iOS'ta, iOS'tan alan web'de Pro olarak devam eder. Satın alımları geri yükleme yolu eklendi.
- Borcama'nın iOS uygulaması için Capacitor tabanlı native kabuk kuruldu; uygulama açılışında landing, SEO ve yönetim ekranları yerine doğrudan giriş ve uygulama akışı geliyor, cihazın çentik ve ev çubuğu boşlukları hesaba katılıyor. Tarayıcı sürümünün davranışı değişmedi.

### Değiştirildi

- iOS uygulamasında Pro'nun App Store ülkesinde satışta olup olmadığı hesap açmadan kullananlarda da anlaşılıyor: RevenueCat açılışta anonim kullanıcıyla teklifleri sorguluyor, ürün yoksa misafirde de "Upgrade to Pro" ve Pro kartı gizleniyor ve Pro özellikleri açılıyor; hesap açıldığında anonim RevenueCat kullanıcısı hesapla birleşiyor. Türkiye App Store'unda ve tarayıcı sürümünde davranış değişmedi.
- iOS uygulamasında para birimi TRY değilse faiz ve asgari ödeme varsayılanları ülkeye göre belirleniyor: oran girilmemiş kart ve ek hesapta cihaz bölgesinin (bölge para birimiyle uyuşmuyorsa para biriminin ülkesinin) tipik yıllık oranı aylığa bölünerek kullanılıyor (ör. ABD kart %22, Almanya Dispo %11,5, İngiltere overdraft %39,9), asgari tutar girilmemişse ülkenin asgari ödeme kuralıyla tahmin ediliyor; plan, Bugün faiz tahmini, öneriler, gecikme hesabı ve asistan bağlamı bu değerleri kullanıyor ve ekranda "ülke ortalaması, değiştirebilirsin" notu gösteriliyor. Tanıtım, rehber, asistan örnek sorusu ve tutar alanlarındaki örnek tutarlar ile harcama önerisi eşikleri para birimine göre ölçekleniyor. TRY kullanıcıları ve tarayıcı sürümü değişmedi.
- iOS uygulamasının İngilizce metinlerinden Türkiye'ye özgü ifadeler kaldırıldı: asistan örnek sorusu "TL" yerine seçili para biriminin simgesini, SSS'deki gizlilik bağlantısı "KVKK" yerine "Privacy" başlığını, plan yöntemi açıklaması "lira" yerine para birimi bağımsız ifadeyi kullanıyor. Türkçe metinler değişmedi.
- iOS uygulamasında gelir-gider kayıtlarının, ekstre dönemlerinin, kredi ilk taksitinin ve ödeme planı satırlarının tarihleri seçili dilin tarih biçimiyle gösteriliyor (ör. İngilizcede 10/5/2026); tarayıcı sürümünde GG.AA.YYYY biçimi değişmedi.
- iOS uygulamasında Pro aboneliği kullanıcının App Store ülkesinde satışta değilse (RevenueCat teklifi boş dönüyorsa) "Pro'ya Geç" düğmesi, Pro tanıtım penceresi, Ayarlar'daki abonelik kartı, deneme hatırlatıcısı ve asistandaki Pro önerisi gösterilmiyor, Pro'ya bağlı özellikler ücretsiz açılıyor. Son bilinen durum cihazda saklandığı için açılışta düğme görünüp kaybolmuyor; Türkiye App Store'unda bu durum hiçbir koşulda devreye girmiyor ve ürünler geldiğinde mevcut satın alma akışı aynen sürüyor. Tarayıcı sürümü değişmedi.
- Finansal asistan isteği kullanıcının uygulama dilini (`language`) taşıyor; `financial-assistant` Edge Function'ı bu alan geldiğinde sistem talimatına "kullanıcının dilinde yanıt ver" kuralını ekliyor, alan yoksa (tarayıcı, eski iOS sürümü) Türkçe talimat birebir aynı kalıyor. iOS uygulamasında dil Türkçe değilse ya da para birimi TRY değilse bağlama dil ve para birimi tercihi de ekleniyor, Türkçe olmayan dilde Türkçe hazır yedek yanıt gösterilmiyor ve konuşma geçmişindeki yapı işaretleri seçili dilde gösteriliyor.
- iOS uygulamasında para birimi TRY değilse ekstre ve kredi ödeme planı okuma seçenekleri gösterilmiyor (okuyucu yalnız Türk bankalarının belgelerini tanıyor); "Ekstre ekle" ve "Yeni kredi" doğrudan elle giriş formunu açıyor. Banka listesinde Türk bankaları yerine kullanıcının eklediği ve kayıtlarında geçen bankalar ile "Diğer" seçeneği yer alıyor. TRY kullanıcıları ve tarayıcı sürümü değişmedi.
- iOS uygulamasında para birimi TRY değilse Türkiye'ye özgü faiz kuralları uygulanmıyor: kart faizi TCMB azami oranı yerine kartta girilen aylık orandan, ek hesap faizi %4,25 varsayımı yerine girilen orandan hesaplanıyor, plan ve asistan KKDF/BSMV vergi-fon yükü eklemiyor, yapılandırma formunda KKDF/BSMV alanları gösterilmiyor; oran girilmemiş kart ve ek hesapta ülke ortalaması kullanılıyor. TRY kullanıcıları ve tarayıcı sürümü değişmedi.
- iOS uygulamasının alt gezinme çubuğu artık iOS'un kendi sekme çubuğu; simgeler sistem simge kütüphanesinden geliyor, çubuk ev çubuğunun üstüne oturuyor ve klavye açılınca gizleniyor. Tarayıcı sürümündeki çubuk değişmedi.
- iOS uygulamasının giriş ekranından tek kullanımlık e-posta linkiyle giriş kaldırıldı; uygulamada giriş Apple ile ya da parolayla yapılıyor. Tarayıcı sürümünde iki seçenek de duruyor.
- iOS uygulamasının kayıt ekranındaki uzun tanıtım metni kaldırıldı; ekran doğrudan Apple ile devam et seçeneği ve formla açılıyor.
- Pro ödeme ekranında abonelik adı ve süresi ayrı satırda gösteriliyor; Kullanıcı Sözleşmesi, Gizlilik Politikası ve İade Politikası bağlantıları tek cümlede toplandı.
- iOS uygulamasında Google Analytics ve Google Ads etiketi yüklenmiyor; ölçüm yalnızca tarayıcı sürümünde çalışmaya devam ediyor.

### Düzeltildi

- iOS uygulamasında hesapsız kullanımda Ayarlar'daki boş "Veri ve yönetim" kartı gösterilmiyor; asistanın yanıt veremediği sorularda "Görüş bildir" düğmesi çıkmıyor.
- iOS uygulaması web'deki 1.59.0–1.68.1 yeniliklerini alıyor; kart asgari ödemesi BDDK'nın 1 Ekim 2026 oranlarıyla hesaplanıyor.
- iOS uygulamasında giriş ve kayıt ekranının üstünde alt sekme çubuğu artık görünmüyor; çubuğun altında kalan "Giriş yap" ve sözleşme bağlantılarına ulaşılabiliyor.
- Koyu temada Borcama logosu okunuyor; harfler koyu zeminde kaybolmuyordu.
- iOS uygulamasında alt sekme çubuğu uygulamanın kendi temasını izliyor; koyu temada seçili sekme açık renkle gösteriliyor, önceden koyu zeminde koyu kalıyordu.
- iOS uygulamasında alt sekme çubuğu ekranın altına, ev çubuğunun hemen üstüne oturuyor; önceden ekranın epey yukarısında kalıyordu.
- iOS uygulamasında kaydırma çubuğu görünmüyor.
- iOS uygulamasında kayıt ve giriş ekranı tek ekrana sığıyor; kart içinde kaydırma gerekmiyor.
- iOS uygulamasında alt sekme çubuğunun altında koyu bir bant görünmüyor; uygulama ekranın altına kadar yayılıyor. Sistem koyu temadayken çubuğun altına çizilen katman, açık zeminli uygulamada bant gibi duruyordu.
- iOS uygulamasında sekme değiştirince ekran en üstten açılıyor; önceki ekranın kaydırma konumu taşınmıyor.
- iOS uygulamasında Ayarlar gibi sekmelerden biri olmayan ekranlarda alt çubukta hiçbir sekme seçili görünmüyor; önceden son sekme yanık kalıyordu.
- iOS uygulamasında Ayarlar'daki "Google Analytics ve reklam ölçümü" izin satırı kaldırıldı; uygulama zaten ölçüm veya reklam etiketi yüklemiyordu, izin istenecek bir şey yoktu. Tarayıcı sürümündeki tercih aynen duruyor.
- Kayıt ve parola yenileme e-postalarının saatlik gönderim sınırı 2'den 30'a çıkarıldı; aynı saat içinde kayıt olan üçüncü kullanıcı artık "Çok fazla deneme yapıldı" uyarısıyla karşılaşmıyor.
- iOS uygulamasında hesabını silen kullanıcı artık "bağlantının süresi dolmuş" uyarısıyla karşılaşmıyor; silme bitince doğrudan giriş ekranına dönüyor.
- iOS uygulamasında abonelik yönetimi ve Sık Sorulan Sorular metinleri App Store aboneliğini anlatıyor; uygulama içinde artık App Store dışı bir ödeme sağlayıcısından söz edilmiyor. Tarayıcı sürümünün metinleri değişmedi.
- iOS uygulamasında e-posta bağlantısı doğrulanamazsa kullanıcı giriş formuna düşmüyor; bağlantının süresinin dolduğunu ya da daha önce kullanıldığını söyleyen ve yeni bağlantı istemeye yönlendiren bir ekran gösteriliyor.
- iOS uygulamasında e-posta doğrulama ve parola yenileme bağlantıları doğrudan uygulamada açılıyor; ara sayfa ya da tarayıcı devreye girmiyor ve kullanıcı doğrulamadan sonra giriş yapmış olarak uygulamayla karşılanıyor. Uygulama kurulu değilse ya da bağlantı bilgisayarda açılırsa aynı adres tarayıcıda çalışıyor. Önceden bağlantı tarayıcıda açılıyor, tek kullanımlık anahtar orada harcanıyor ve uygulama "E-postanı kontrol et" ekranında kalıyordu.
- App Store aboneliği satın alındıktan sonra Pro erişimi açılmayabiliyordu; ödeme tamamlandığı halde "Pro'ya geç" ekranı gösteriliyordu. Satın alma kaydı artık uygulama ekran değiştirmeden önce yazılıyor ve geçerli bir abonelik hiçbir durumda kapalı sayılmıyor.
- iOS uygulamasında Kullanım Şartları, Gizlilik Politikası, İade Politikası ve Sık Sorulan Sorular sayfalarından geldiğin ekrana dönülüyor; önceden yalnızca ana sayfaya dönülebiliyordu.
- iOS uygulamasında giriş ve kayıt ekranında klavye açıkken başlık durum çubuğunun altında kalmıyor.
- iOS uygulamasında sayfa sonundaki içerik yüzen "Görüş bildir" ve hızlı ekleme düğmelerinin altında kalmıyor.
- Pro ekranında plan değiştirirken fiyat kısa süreliğine kaybolmuyor; üstteki "Pro'ya Geç" düğmesi durum yenilenirken kaybolup geri gelmiyor.
- Varlıklar ekranında fiyat servisinin bir kaynağı geçici olarak yanıt vermediğinde diğer varlıkların son bilinen fiyatları korunuyor; eksik kaynak yüzünden tüm liste fiyatsız kalmıyor.
- Varlıklar ekranında fiyatı hiç alınamamış otomatik varlık artık ₺0,00 yerine "Fiyat alınamadı" olarak gösteriliyor.
- iOS uygulamasında Varlıklar ekranındaki döviz, altın, kripto, fon ve hisse fiyatları artık güncelleniyor; "Canlı fiyatlar alınamadı" uyarısı yerine güncel değerler geliyor. Tarayıcı sürümü etkilenmedi.
- iOS uygulamasında giriş ve kayıt ekranları artık sayfa olarak kaymıyor; ekran sabit kalıyor ve kart dikeyde ortalanıyor.
- iOS uygulamasında Pro üyelik durumu ve abonelik fiyatları artık yükleniyor; ekran "Fiyat yükleniyor…" ve "Kontrol ediliyor…" durumunda takılı kalmıyor.
- iOS uygulamasında Pro üyelik durumu, davet kodu, hesap silme ve Borcama'ya sor artık çalışıyor; native kabuğun sunucu isteklerini engelleyen kaynak kısıtı giderildi. Tarayıcı sürümü etkilenmedi.
- iOS uygulamasında daha önce Pro planı seçmiş bir kullanıcı e-posta bağlantısıyla giriş yaptığında bağlantı uygulamaya dönüyor; önceden tarayıcıda açılıyordu. Seçilen plan korunuyor ve Pro ekranı açıldığında geri geliyor. Tarayıcı sürümündeki yönlendirme değişmedi.

### Kaldırıldı

- iOS uygulamasının Ayarlar ekranındaki "Giriş yöntemleri" bölümünden "E-posta linki" satırı kaldırıldı; bu yöntem uygulamadan zaten çıkarılmıştı ve satır var olmayan bir seçeneği "Aktif" gösteriyordu. Parola belirlendikten sonra çıkan onay metninden de e-posta linki cümlesi çıkarıldı. Tarayıcı sürümünde ikisi de duruyor.
- iOS uygulamasından davet programı kaldırıldı: Ayarlar'daki "Arkadaşını davet et" kartı, Bugün ekranındaki davet şeridi ve kayıt ekranındaki "Referans kodun var mı?" alanı uygulama sürümünde görünmüyor, uygulamadan yapılan kayıtta referans kodu gönderilmiyor. Program tarayıcı sürümünde aynen sürüyor; web üzerinden kazanılmış Pro günleri korunuyor.
- iOS uygulamasından "Beta" rozetleri, "Görüş bildir" düğmesi ve Ayarlar'daki "Yakında" satırları kaldırıldı; uygulama sürümünde yalnızca kullanıma hazır özellikler görünüyor. Tarayıcı sürümü değişmedi.

## [1.68.1] - 2026-10-24

### Düzeltildi

- Ana sayfanın son çağrı bölümünde "Ücretsiz başla" butonu App Store rozetiyle aynı hizaya alındı.

## [1.68.0] - 2026-10-24

### Eklendi

- iOS uygulaması App Store'da yayında: ana sayfada (üst bölüm ve son çağrı) resmî Türkçe "App Store'dan İndirin" rozeti, site ve SEO sayfası alt bilgisinde "iPhone uygulaması" bağlantısı ve iPhone Safari için App Store akıllı bandı (`apple-itunes-app`).

## [1.67.2] - 2026-10-14

### Değiştirildi

- Asistanda Pro'ya geçen kullanıcı, o gün ücretsizken kullandığı sorulardan bağımsız olarak günde 20 soru hakkı alıyor; ücretsiz ve Pro soruları ayrı sayılıyor.

## [1.67.1] - 2026-10-14

### Eklendi

- Borcama Asistanı döviz, altın, gümüş ve bitcoin çevirisi sorularını güncel kurla (TCMB döviz satış, Gold API, CoinGecko) yanıtlıyor; kurlar sunucuda alınıyor ve kur tarihi yanıtta belirtiliyor.

### Düzeltildi

- Asistan, gidilecek anlamlı bir ekran olmayan yanıtlarda (kur çevirisi, genel bilgi) artık anlamsız aksiyon butonu göstermiyor.
- `financial-assistant` fonksiyonundaki iOS kaynağı (`capacitor://borcama.com`) repoya işlendi; canlıdaki izin korunuyor.

## [1.67.0] - 2026-10-14

### Değiştirildi

- Borcama Asistanı'nda ücretsiz plan günlük soru hakkı 3'ten 5'e çıktı; Pro'da günde 20 soru.
- Asistan, plan etiketini sunucunun uyguladığı limite göre gösteriyor (istemcideki Pro durumu sunucuyla farklıysa yanlış "Pro" görünmez).

### Eklendi

- Ücretsiz soru hakkı bitince asistanda "Pro'yu aktif et" kutusu çıkıyor ve Pro penceresini açıyor.

## [1.66.5] - 2026-10-12

### Değiştirildi

- Borcama rehberi, kayda değer veri giren kullanıcıda (en az 2 borç kaydı, 5 harcama/gider ve gelir) artık hiç görünmüyor; rehber yalnız kullanıcı bu noktaya gelene kadar yol gösteriyor.

## [1.66.4] - 2026-10-12

### Değiştirildi

- Ek hesap / KMH listesinde borcu kapanan hesaplar artık "Kapattığın borçlar" başlığı altında, açık borçların altında ayrı bir bölümde gösteriliyor.

## [1.66.3] - 2026-10-12

### Değiştirildi

- Ek hesap / KMH listesinde borcu süren hesaplar üstte, borcu kapanan (kalan 0) hesaplar en altta gösteriliyor.

## [1.66.2] - 2026-10-12

### Kaldırıldı

- Borcama Asistanı'ndaki "Beta" etiketi kaldırıldı (pencere başlığı, menü düğmesi, landing ürün görseli); App Store 2.2 gereği mağaza sürümünde beta ifadesi yer almıyor.

## [1.66.1] - 2026-10-12

### Değiştirildi

- CRM "İletişim" ekranı otomatik e-postaları ve toplu kampanyaları tek tabloda durum, gönderilen, açılma, tıklama ve siteye gelme oranlarıyla özetliyor; toplu gönderim ve konu düzenleme iki adımlı onayla "Kampanya yönetimi" sekmesinde.

## [1.66.0] - 2026-10-12

### Eklendi

- CRM "Büyüme" ekranı yeniden yazıldı: 7/30/90 gün seçimli kayıt hunisi ve günlük ziyaret grafiği, ziyaretçinin giriş sayfasına göre ne yaptığı (landing'in yarısını görme, kayıt butonu, içerikten ürüne geçiş, kayıt ekranı), borç kapatma ve mevduat araç hunileri, kayıttan kullanıma (doğrulama, ilk borç/ekstre, tam aktivasyon, aktif kullanıcı, 7. gün dönüşü) ve kanal tablosu tek ekranda.

## [1.65.1] - 2026-10-11

### Düzeltildi

- Borç kapatma ve mevduat araçlarının hunisi artık sonuç görme ve ürüne geçiş adımlarını sayıyor; ziyaret olayı sonuçtan önce kaydediliyor ve rapor milisaniyelik sıra farkını tolere ediyor (geçmiş veri de düzeldi).

## [1.65.0] - 2026-10-11

### Eklendi

- Borcama rehberi: her ekranın üstünde tek bir sıradaki adım gösteriliyor (ilk kurulum, ödemesi gelen veya geçen ödemeyi işaretleme, kesilen yeni ekstreyi girme, diğer borçları ve sabit giderleri ekleme). Kullanıcı iki ay düzenli kullandığında rehber "Hepsi bu kadar! Artık hazırsın." deyip kapanıyor; öneriler kapatılabiliyor veya kalıcı olarak geçilebiliyor.

### Değiştirildi

- Yeni kredi kartı tek formda ekleniyor: banka, bu ayki ekstre borcu ve son ödeme günü yeterli; kart ve bu ayın ekstresi birlikte oluşuyor, borç hemen görünüyor. Kart adı, limit, kesim günü ve devreden borç isteğe bağlı.
- Yeni kredi dört bilgiyle ekleniyor: banka, aylık taksit, kalan taksit ve ödeme günü; kalan borç otomatik hesaplanıyor. Kredi adı, faiz, tutar, toplam ve ödenen taksit ile ilk taksit tarihi isteğe bağlı.

## [1.64.1] - 2026-10-11

### Düzeltildi

- Ana sayfanın arama motorları için eklenen statik metni, uygulama ekranlarında ve oturumu açık kullanıcıda artık kısa süre bile görünmüyor; gizleme betiği sitenin güvenlik politikasının engellemediği ayrı bir dosyadan yükleniyor.

## [1.64.0] - 2026-10-11

### Eklendi

- CRM'de kullanıcı detayından hesap silinebiliyor: sebep (test hesabı, kullanıcı talebi, diğer) seçilip kullanıcının e-postası yazılarak onaylanıyor; hesap ve bütün kayıtları kullanıcının kendi silme akışıyla aynı şekilde kalıcı olarak siliniyor. Yönetici hesabı ve aktif ücretli aboneliği olan hesap silinemiyor; her silme, e-posta açık tutulmadan iz kaydına yazılıyor.

## [1.63.0] - 2026-10-11

### Eklendi

- Yeni CRM kabuğu: crm.borcama.com solda tek menüyle (Bugün, Kullanıcılar, Büyüme, İletişim) açılıyor; mobilde üstte sekme olarak çalışıyor.
- CRM "Bugün" ekranı toplam/yeni/haftalık aktif/Pro özetini, son 7 günün kayıt hunisini önceki haftayla karşılaştırmalı ve "ilgilenilecekler" listesini (veri girmeyen yeni kayıtlar, doğrulanmamış e-postalar, biten denemeler, yeni geri bildirimler, davet incelemeleri) gösteriyor.
- CRM "Kullanıcılar" ekranı segmentler (son 7 gün yeni, veri girmemiş, son 7 gün giriş, doğrulanmamış, deneme, Pro), arama ve sayfalı listeyle çalışıyor; kullanıcı detayı, büyüme ve iletişim ekranları yeni kabuğun içinde açılıyor.

## [1.62.6] - 2026-10-11

### Güvenlik

- CRM'de ücretli aboneliği olan kullanıcıya elle Pro günü eklenemiyor; önceden bu işlem ödeme bağlantısını siliyordu.
- CRM'de Google Analytics/Ads etiketleri ve çerez bandı yüklenmiyor; kullanıcı kimliği içeren yönetim adresleri ölçüme gitmiyor.
- Eski manuel toplu e-posta kampanyaları (deneme daveti, Ağustos ve 1 Eylül yenilik duyuruları) CRM'den kaldırıldı ve sunucu tarafında gönderilemiyor; durdurulmuş veya arşivlenmiş kampanya gönderilebilir görünmüyor.

### Düzeltildi

- CRM'de Pro tanımlama ve davet ödülü onayı yanlışlıkla tıklamaya karşı onay istiyor; boş Pro bitiş tarihi CEO ekranını çökertmiyor. Kredi kapanışı tebriği ve deneme ilk plan hatırlatması e-postaları kampanya listesinde görünüyor.

## [1.62.5] - 2026-10-11

### Değiştirildi

- Bank run sözlük sayfasındaki İngilizce bölüm kaldırıldı; sayfa yalnız Türkçe. İngilizce içerik, sitenin dil seçeneğiyle birlikte gelecek.

## [1.62.4] - 2026-10-11

### Eklendi

- Finansal sözlüğe "Bank run (banka hücumu)" sayfası eklendi; kavram Türkçe ve İngilizce anlatılıyor ve Eylül 2026 fon krizindeki benzer durumla ilişkilendiriliyor.

### Değiştirildi

- Tasfiye sayfası "borcun tasfiyesi ne demek?" sorusunu doğrudan cevaplıyor; kredi kartı borcunun tasfiyesi, yapılandırma ve ibra farkı, borcun kapandığını teyit etme yolları ve SPK'nın Eylül 2026 fon tasfiye kararı kaynaklarıyla birlikte anlatılıyor, sık sorulan sorular eklendi.

## [1.62.3] - 2026-10-11

### Değiştirildi

- Arama motorları ve yapay zekâ arama araçları ana sayfanın metnini JavaScript çalıştırmadan okuyabiliyor; uygulama ekranlarında ve oturum açıkken bu metin gösterilmiyor.
- Bütün sayfalar paylaşıldığında Borcama görseli, başlığı ve açıklamasıyla önizleniyor (Open Graph ve Twitter kartı); yeni sayfalar IndexNow ile Bing ve Yandex'e bildirilebiliyor.

## [1.62.2] - 2026-10-10

### Düzeltildi

- Taksitleri uygulamadan ödenerek bittiği halde kaydı açık kalan kredi artık Bugün ekranında gecikmiş ödeme veya açık borç olarak görünmüyor; Krediler'de kapanmış sayılan kredi açıkça kapatılıyor (kalan borç 0, kapanış tarihi son ödeme günü) ve tüm ekranlar aynı sonucu gösteriyor.

## [1.62.1] - 2026-10-10

### Değiştirildi

- Uygulama başlığı sadeleşti: tema düğmesi ve "Çıkış" bağlantısı başlıktan kaldırıldı. Tema Ayarlar > Görünüm'deki "Açık | Koyu" seçicisinden, çıkış Ayarlar > Hesap > Oturum'daki "Çıkış yap" düğmesinden yapılıyor.

## [1.62.0] - 2026-10-10

### Eklendi

- Bir kredi kapandığında kullanıcıya kredi başına tek bir tebrik e-postası gönderiliyor; e-posta tutar veya banka adı içermiyor ve yalnız bu sürümden sonraki kapanışlar için gidiyor.

### Düzeltildi

- Kapatılan kredinin kutlaması artık yalnız bir kez görünüyor; "gösterildi" bilgisi tarayıcıda değil kullanıcının kaydında tutulduğu için yeni bir tarayıcıda veya cihazda aynı kredi için tekrar çıkmıyor.

## [1.61.0] - 2026-10-10

### Eklendi

- Finansal sözlük, rehber ve borç araçlarının (kredi kartı asgari ödeme, kredi ödeme planı, borç ödeme planı, aylık ödeme takvimi) sonunda ücretsiz hesaba geçiş bölümü var; sayfada girilen tutarlar kayıt bağlantısına veya ölçüme eklenmiyor.
- Landing'deki kayıt butonu tıklamaları, landing'in yarısının görülmesi ve içerik sayfalarından ürüne geçişler anonim olarak ölçülüyor; bu olaylar tutar, e-posta veya kişisel bilgi taşımıyor.
- **iOS:** iOS'taki e-posta giriş ve parola yenileme bağlantıları Safari'de yarım kalmadan Borcama uygulamasındaki doğru ekrana dönebiliyor; internet kesildiğinde boş finansal ekran yerine kayıtların korunduğunu açıklayan bağlantı durumu gösteriliyor.
- **iOS:** iOS uygulamasında Face ID veya Touch ID ile uygulama kilidi açılabiliyor; kilit açıkken Borcama her açılışta ve arka plandan her dönüşte kimlik doğrulaması istiyor, tercih yalnızca cihazda saklanıyor.
- **iOS:** iOS uygulamasında Kullanıcı Sözleşmesi ve İade Politikası, satıcının Apple olduğu ve iptal/iade işlemlerinin App Store üzerinden yürüdüğü bilgisiyle gösteriliyor.
- **iOS:** iOS uygulamasında Pro aboneliği App Store içi satın alma (StoreKit) ile alınabilir; abonelik aynı `pro` hakkına bağlandığı için web'den alan iOS'ta, iOS'tan alan web'de Pro olarak devam eder. Satın alımları geri yükleme yolu eklendi.
- **iOS:** Borcama'nın iOS uygulaması için Capacitor tabanlı native kabuk kuruldu; uygulama açılışında landing, SEO ve yönetim ekranları yerine doğrudan giriş ve uygulama akışı geliyor, cihazın çentik ve ev çubuğu boşlukları hesaba katılıyor. Tarayıcı sürümünün davranışı değişmedi.
- **iOS:** iOS uygulamasında kullanıcı onayıyla açılan ödeme hatırlatmaları, yaklaşan kart ve kredi ödemelerini bir gün önce saat 09.00'da tutar veya banka adı göstermeden cihazda bildiriyor; tamamlanan ödemeler yeniden planlanmıyor.

### Değiştirildi

- LANDING-003 deneyi durduruldu; tüm ziyaretçiler kontrol landing'ini görüyor ve yeni olaylara deney etiketi eklenmiyor.
- **iOS:** iOS uygulamasındaki varsayılan Capacitor simgesi, küçük boyutta okunabilen 1024 piksel opak Borcama App Store ikonu ile değiştirildi.
- **iOS:** iOS uygulaması Google Analytics ve Google Ads etiketlerini yüklemiyor; App Store gizlilik beyanı hesap, finansal kayıt, abonelik, ürün kullanımı ve kişisel bilgi içermeyen çökme verisiyle sınırlandırıldı.
- **iOS:** iOS sürümü web SemVer sürümünü izlerken build numarası yalnız yeni TestFlight veya App Store yüklemesinde artırılacak biçimde yayın sürecine bağlandı.

### Güvenlik

- Pro hakkı artık istemcinin gönderdiği bitiş tarihine göre açılamıyor; satın alma sunucudan RevenueCat ile doğrulanıyor, App Store abonelik olayları yetki başlığı ve HMAC imzası doğrulanan tekilleştirilmiş webhook üzerinden işleniyor.

### Düzeltildi

- Otomasyon ve bot tarayıcılarından gelen ziyaretler artık huniye yazılmıyor; 3 Ekim gecesi tek saatte gelen 201 oturum gibi trafik ziyaretçi sayısını şişirmiyor.
- Araç sayfalarındaki ürüne geçiş tıklamaları sayfa değişmeden önce kaydediliyor; önceden bağlantı açılırken ölçüm isteği iptal olabiliyordu.
- Kullanıcı Sözleşmesi ve İade Politikası sayfaları iki satın alma kanalını da açıkça anlatıyor: iOS uygulamasından alınan aboneliklerde yetkili satıcı Apple ve yönetim App Store üzerinden, borcama.com'dan alınanlarda ise Paddle üzerinden. Önceden tarayıcıda açılan metin yalnız Paddle'ı anlatıyordu.
- E-posta doğrulama ve parola yenileme bağlantıları artık doğrudan uygulamada açılıyor; iOS uygulaması kuruluysa tarayıcı hiç devreye girmiyor ve kullanıcı giriş yapmış olarak karşılanıyor. Uygulama kurulu değilse ya da bağlantı bilgisayarda açılırsa aynı adres tarayıcıda çalışmaya devam ediyor.
- **iOS:** RevenueCat testleri veya tanınmayan kullanıcı kimlikleri webhook kaydını durdurmuyor; abonelik olayı yalnız Supabase Auth'ta gerçekten bulunan kullanıcıya bağlanıyor.
- **iOS:** iOS projesi doğru Apple geliştirici takımıyla otomatik imzalanarak cihaz ve App Store arşivi oluşturulabilir hale geldi.

## [1.60.5] - 2026-10-03

### Değiştirildi

- Landing sayfasındaki açık örnek hesap kaldırıldı; ürünü denemek isteyen kullanıcılar artık kendi ücretsiz hesaplarını oluşturarak gerçek kayıt akışına başlıyor.

## [1.60.4] - 2026-10-03

### Düzeltildi

- Hesabını kalıcı olarak silen kullanıcıya işlemin tamamlandığı açıkça gösteriliyor ve kullanıcı 5 saniye sonra otomatik olarak ana sayfaya yönlendiriliyor.

## [1.60.3] - 2026-10-02

### Eklendi

- Marketing merkezine, kredi kartı asgari ödeme sınırındaki 100.000 TL güncellemesini resmî BDDK kaynağıyla açıklayan ve yalnız uygun doğrulanmış üyelere tek sefer gönderilebilen bilgilendirme kampanyası eklendi.

### Düzeltildi

- Kredi kartı asgari ödeme tahmini, 1 Ekim 2026 tarihli BDDK kararına uygun olarak 100.000 TL ve altındaki kart limitlerinde yüzde 20, bu tutarın üzerindeki limitlerde yüzde 40 oranını kullanıyor.

## [1.60.2] - 2026-10-02

### Düzeltildi

- Son taksiti önceki sürümde ödenmiş krediler artık aktif krediler arasında kalmıyor; ödeme geçmişinden tamamlandığı doğrulanınca sayfanın altındaki Kapatılan krediler alanına taşınıyor ve kutlama bir kez gösteriliyor.

## [1.60.1] - 2026-10-02

### Düzeltildi

- CRM ve ana uygulama girişindeki güvenlik kontrolü, Cloudflare'ın otomatik toparlanması tamamlanmadan hata göstermiyor; script tek kez yükleniyor ve ağ, içerik engelleyici, tarayıcı desteği ile alan adı yapılandırma sorunları kullanıcıya ayrı yönlendirmelerle sunuluyor.

## [1.60.0] - 2026-10-01

### Eklendi

- Son taksiti tamamlanan krediler ve tamamen ödenen ek hesaplar için kutlama gösteriliyor; kapanan krediler aktif listeden Krediler bölümünün altındaki geçmiş alanına taşınırken ek hesaplar yeniden borç eklenebilmesi için yerinde kalıyor.

## [1.59.1] - 2026-10-01

### Değiştirildi

- Krediler ekranındaki ayrı “Ödeme planı yükle” ve “Yeni kredi ekle” düğmeleri tek “Yeni kredi” akışında birleştirildi; kullanıcı artık manuel giriş veya ödeme planı yükleme yöntemini açılan pencereden seçiyor.

## [1.59.0] - 2026-09-30

### Eklendi

- Bugün ekranı değişken faizli borçların aylık faiz yükünü ve Pro kullanıcılar için ilk üç kapatma önceliğini gösteriyor; Krediler ekranındaki her kredi kartı ise kalan taksitlerdeki gelecekteki faizi dışarıda bırakan ayrı bir “Bugün kapatırsam” tahmini sunuyor.

### Düzeltildi

- Kredi ödeme planı aktarımı VakıfBank, Yapı Kredi, Fibabanka ve Enpara'nın farklı PDF satır düzenlerinde taksit, faiz, vergi ve kalan anaparayı doğru kolonlardan okuyor; belgede ayrı faiz alanı yoksa oranı ödeme satırlarından tahmini çıkarıp kullanıcıyı uyarıyor.

## [1.58.0] - 2026-09-28

### Değiştirildi

- Manuel kredi ekleme formu banka, kredi adı, başlangıç kredi tutarı, aylık faiz, toplam ve ödenen taksit, aylık taksit ile ilk ödeme tarihini birlikte alıyor; kalan taksit ve ödeme günü çelişkiyi önlemek için otomatik hesaplanıyor.

## [1.57.3] - 2026-09-28

### Değiştirildi

- Borç, ekstre, ödeme, yapılandırma, varlık, gelir, harcama ve ücretsiz hesaplama araçlarındaki para alanları yazarken Türkçe binlik ve ondalık ayırıcıyla gösteriliyor; dinamik TL çıktıları ortak `₺1.234,56` biçimine getirildi.

## [1.57.2] - 2026-09-28

### Düzeltildi

- Yeni bir kredi ödeme planı yüklendiğinde aynı banka ve kredi türündeki önceki kredi artık otomatik seçilip üzerine yazılmıyor; her PDF varsayılan olarak ayrı kredi oluşturuyor ve mevcut kayıt yalnız kullanıcı açıkça seçerse güncelleniyor.

## [1.57.1] - 2026-09-28

### Düzeltildi

- Kredi eklerken toplam ve ödenen taksit sayısından kalan taksit ile kalan toplam ödeme otomatik hesaplanıyor; aylık faiz bankanın taksitini değiştirmeden saklanıyor ve kredi borçları kartında ayrıca gösteriliyor.
- Kredi silme düğmesi artık kaydı doğrudan kaldırmıyor; banka, kredi türü ve kalan ödeme tutarını gösteren açık onay penceresinden sonra siliyor.
- Borç, taksit, limit, ekstre ve ödeme tutarı alanları yazarken binlik ayırıcıyla Türk lirası biçiminde gösteriliyor; örneğin `4000000` girişi ekranda `4.000.000` oluyor.

## [1.57.0] - 2026-09-28

### Eklendi

- Borç kapatma hesaplayıcısında tahmini sonucu görenler, hesaplanan tutarlar ölçüme taşınmadan doğrudan kendi borç planlarını oluşturmaya geçebiliyor; kayıt, doğrulama ve ilk borç/ekstre adımları ayrı izleniyor.

## [1.56.10] - 2026-09-25

### Değiştirildi

- Harcama içinden kart veya hesap eklerken banka adı, yazım farklılıklarını önlemek için serbest metin yerine banka listesinden seçiliyor; listede olmayan kurumlar “Diğer banka” ile eklenebiliyor.

## [1.56.9] - 2026-09-25

### Değiştirildi

- Harcama kaynağına kart veya hesap ekleme seçenekleri dropdown içine taşındı; seçim yapıldığında ayrıntıların girildiği modal açılıyor ve kaydedilen kaynak harcamada otomatik seçiliyor.

## [1.56.8] - 2026-09-25

### Eklendi

- Harcama kaydında henüz kartı veya banka hesabı olmayan kullanıcılar, formdan ayrılmadan yeni kaynak ekleyip harcamada doğrudan seçebilir hale geldi.

### Değiştirildi

- Harcama kaynağı listesi tüm banka adlarını hesap gibi göstermek yerine yalnız kullanıcının kayıtlı kart ve mevduat hesaplarını gösteriyor; aynı adlı kartlar son dört hanesiyle ayırt ediliyor.

## [1.56.7] - 2026-09-25

### Eklendi

- Google Ads arama kampanyası için yazı, logo ve arayüz bindirmesi içermeyen, tek sahneli kare ve yatay finans planlama görselleri eklendi.

### Değiştirildi

- Kredi ödeme planı aracının kredi sunmadığı veya aracılık yapmadığı sayfanın ilk alanında açıklandı; araç yalnız kullanıcının mevcut banka teklifindeki bilgilerle hesaplama yaptığını belirtecek biçimde yeniden adlandırıldı.

## [1.56.6] - 2026-09-24

### Değiştirildi

- Finansal Sözlük 200 terime çıkarıldı; tasfiye kavramları ile kredi kartı borcu, KMH borcu, borç kapatma kredisi, yapılandırma faizi ve ödenmeyen borç gibi yüksek niyetli aramalar için ayrı, bağlantılı açıklama sayfaları eklendi.
- Sözlük ana sayfası ile 200 terim sayfası üretim sitemap'ine otomatik eklenerek arama motorlarının bu URL'leri keşfetmesi sağlandı.

## [1.56.5] - 2026-09-23

### Düzeltildi

- Önceki ekstre döneminde yapılandırılmış kart borcu yeni ekstre borcundan yeniden düşülmüyor; kalan borç artık güncel ekstre toplamını ve bu döneme ait ödemeleri gösteriyor.

## [1.56.4] - 2026-09-23

### Düzeltildi

- Ekstre önizlemesindeki “Ekstreyi kaydet” düğmesi, kayıt yardımcılarının bileşene aktarılmaması nedeniyle sessiz kalıyordu; kaydetme işlemi tekrar veri saklama akışına bağlandı.

## [1.56.3] - 2026-09-23

### Değiştirildi

- Mevcut kartlardaki “Yeni ekstre” işlemi, seçili kartı koruyarak cihazda okutma veya manuel giriş yöntemini seçtiriyor.

### Düzeltildi

- Enpara ekstrelerinde harcama kalemleri bulunduğunda önizleme ekranını kapatan tarih ve tutar gösterimi hataları giderildi; geçersiz işlem tarihleri ekranı düşürmeden açıklanıyor.

## [1.56.2] - 2026-09-23

### Değiştirildi

- Finansal Sözlük 100 terime çıkarıldı; Türkçe A-Z dizini, çalışan kategori filtreleri ve alfabetik terim grupları eklendi.

## [1.56.1] - 2026-09-23

### Değiştirildi

- Finansal Sözlük; kredi, kart, borç hukuku, bütçe ve birikim başlıklarında 77 özgün kavrama genişletildi.

## [1.56.0] - 2026-09-23

### Eklendi

- Ücretsiz Araçlar bağlantısının yanına; faiz, temerrüt, tasfiye, kredi kartı, kredi ve bütçe kavramlarını sade tanım, örnek ve ilgili terimlerle açıklayan taranabilir Finansal Sözlük eklendi.

## [1.55.4] - 2026-09-22

### Değiştirildi

- Kullanıcılar ilk taksit tarihi gelmemiş kredilere ve seçtikleri gelecek ayın taksitine şimdiden ödeme kaydedebilir; ödeme seçilen aya yazılır.

## [1.55.3] - 2026-09-22

### Düzeltildi

- Eski kredi kayıtlarında kalan ödeme tutarı bir taksit gösterirken kalan taksit sayısının sıfıra düşmesi engellendi.

## [1.55.2] - 2026-09-22

### Düzeltildi

- Kredi kartlarında kalan toplam ödeme, aylık taksit, kalan taksit ve ödeme günü ayrı alanlarda gösteriliyor; ödeme planı olmayan kredilerde kalan borç artık anapara sanılmıyor ve bilinmeyen faiz/masraf sıfır diye sunulmuyor.

## [1.55.1] - 2026-09-22

### Düzeltildi

- Kredi ödeme planı aktarımı, kalan anaparayı gelecek taksitlerin toplamından ve kalan faiz/masraf yükünden ayırıyor; kredi satırı ödeme geçmişi ilerledikçe bu üç tutarı plana göre güncelliyor.

## [1.55.0] - 2026-09-22

### Eklendi

- Kullanıcılar bankadan indirdikleri kredi ödeme planı PDF'sini cihazlarında okuyup banka, kalan anapara, taksit, faiz ve ödeme tarihlerini kontrol ettikten sonra yeni veya mevcut kredilerine aktarabilir.

### Güvenlik

- Kredi ödeme planının ham PDF'i sunucuya yüklenmeden tarayıcıda işleniyor; kullanıcı onayı olmadan finansal kayıt oluşturulmuyor.

## [1.54.9] - 2026-09-22

### Düzeltildi

- Güvenlik betiği tarayıcıda yüklenemezse kayıt düğmesinin açıklamasız biçimde pasif kalması engellendi; sekiz saniye içinde kontrol tamamlanmazsa yeniden deneme uyarısı gösteriliyor.

## [1.54.8] - 2026-09-22

### Değiştirildi

- Kayıt, giriş ve parola yenilemedeki güvenlik kontrolü normal ziyaretçide arka planda çalışıp yalnız riskli durumda görünür hale getirildi; hata veya zaman aşımında kullanıcıya açık bir yeniden deneme yolu sunuldu.

## [1.54.7] - 2026-09-20

### Değiştirildi

- LANDING-003'ün iki kolu da tekrar eden açıklamalardan arındırıldı; hero, temel faydalar, güven bilgisi, fiyat kararı ve son kayıt çağrısı daha kısa bir akışta birleştirildi.
- Landing fayda kartları mobilde kompakt satırlara dönüştürüldü; hero vurgusu ile son kayıt çağrısındaki sıkışık aralıklar açıldı.

## [1.54.6] - 2026-09-19

### Düzeltildi

- Faiz sorusunda model yanıtı üretilemez veya kalite kontrolünden geçmezse Asistan, uygulamanın hesapladığı kart/KMH aylık tahmini ve bilinen kredi maliyetini güvenli yedek yanıt olarak gösteriyor.

## [1.54.5] - 2026-09-19

### Değiştirildi

- Borcama Asistanı faiz sorularında kesin toplam bilinmese bile kart ve ek hesapların vergiler dahil aylık tahminini ve ödeme planı bilinen kredilerin kalan finansman maliyetini rakamla yanıtlıyor.

## [1.54.4] - 2026-09-19

### Düzeltildi

- Borcama Asistanı, kapanmış veya sıfırlanmış eski borçlardaki boş faiz alanlarını aktif kart ve ek hesapların faizi eksikmiş gibi raporlamıyor.

## [1.54.3] - 2026-09-19

### Düzeltildi

- Borcama Asistanı, kart ve ek hesap faizlerinde Borç Planı'nın çözdüğü TCMB ve ürün referans oranlarını artık bağlama gerçekten taşıyor; kullanıcı alanı boş olduğunda bu oranları eksikmiş gibi raporlamıyor.

## [1.54.2] - 2026-09-18

### Değiştirildi

- Ana sayfanın iki deney kolu aynı ücretsiz başlangıç ve otomatik 30 günlük Pro hediyesini anlatıyor; borçlanmayı teşvik eden ifade kaldırıldı, kayıt hedefleri eşitlendi ve yeni LANDING-003 ölçümünde eski deney verileri ayrı tutuldu.
- Her landing içindeki varlık ve harcama tutarları tutarlı örneklere bağlandı; küçük açıklama metinleri büyütüldü ve hero vurgusu yüksek kontrastlı satır şeritleriyle okunabilir hale getirildi.

### Güvenlik

- Landing gizlilik açıklaması, ham ekstre dosyasının cihazda işlendiğini ve kullanıcının onayladığı kayıtların hesabına kaydedildiğini açıkça ayırıyor.

## [1.54.1] - 2026-09-18

### Düzeltildi

- Asistan, kartlarda kayıtlı asgari ödemeyi ve kalan borcu doğru alanlardan okuyor; kapanmış kartlardaki boş alanı eksik saymıyor ve bilinen asgarileri belirsiz diye sunan yanıtı göstermiyor.

## [1.54.0] - 2026-09-18

### Eklendi

- Borcama Asistanı aynı konuşmadaki son beş soru ve yanıtı birlikte değerlendirerek devam sorularını ve kullanıcı düzeltmelerini anlayabiliyor; konuşma bağlamı ayrı bir “Yeni konuşma” aksiyonuyla sıfırlanabiliyor.

### Düzeltildi

- Asistan, ödeme bütçesi KMH borcunun tamamını karşılamadığında kalan anaparayı hesaplıyor ve tam kapatma iddiası içeren yanıtı kullanıcıya göstermiyor.
- Borcama Asistanı eksik banka maliyeti, gecikme ve büyük alım değerlendirmelerinde koşullu açıklama yapıyor; ödeme gücü bilinmeden kesin para dağıtımı önermiyor.
- Borcama Asistanı düzenli gelir ve giderleri dönem eğiliminde aynı kuralla değerlendiriyor; eksik borç alanlarını gerçek sıfırdan ve farklı varlık türlerini genel kategorilerden ayırıyor.
- Borcama Asistanı model yanıtlarını göstermeden önce kısa yanıt düzeni, kelime sınırı, kayıt dışı faiz oranı ve kesin kredi sonucu iddiaları açısından sunucuda doğruluyor.

## [1.53.0] - 2026-09-18

### Eklendi

- Ek hesap sıfırlandıktan sonra aynı hesaba yeniden kullanılan tutar “Yeni borç ekle” ile eklenebiliyor; önceki ödemeler korunuyor ve güncel bakiye limit üzerinden kontrol ediliyor.

## [1.52.3] - 2026-09-18

### Değiştirildi

- CEO görünümü, büyüme ve ürün sağlığını yalnız doğrulanmış kullanıcı, dönem aktivasyonu, haftalık aktif kullanıcı ve aktif Pro ile özetleyip ayrıntıları isteğe bağlı hale getirdi.

## [1.52.2] - 2026-09-11

### Düzeltildi

- Borcama'ya Sor duyuru e-postasındaki büyük tanıtım rozeti de ana düğme gibi doğrudan asistan ekranına bağlandı.

## [1.52.1] - 2026-09-11

### Eklendi

- Borcama'ya Sor'u tanıtan üçüncü “Siz istediniz, biz yaptık” e-postası, yalnız doğrulanmış ve iletişime uygun üyelere iki aşamalı onayla gönderilebilecek kampanya olarak hazırlandı.

### Değiştirildi

- Borcama'ya Sor duyuru e-postasındaki ana bağlantı, oturumu açık kullanıcılarda asistanı doğrudan açacak; oturumu kapalı kullanıcılarda ise girişten sonra aynı hedefi koruyacak biçimde düzenlendi.

## [1.52.0] - 2026-09-08

### Eklendi

- Kullanıcılar Ayarlar'dan metinli güvenlik onayıyla hesaplarını ve Borcama'daki kişisel kayıtlarını kalıcı olarak silebilir; aktif ücretli abonelik güvenle durdurulmadan silme işlemi başlamaz.

## [1.51.4] - 2026-09-08

### Değiştirildi

- Landing A hero mesajı “Paran nereye gidiyor? Akıllıca borçlan, kontrolü al.” olarak kısaltıldı, vurgu şeritleri inceltildi ve belirsiz ekstre rozeti kaldırıldı.

## [1.51.3] - 2026-09-08

### Düzeltildi

- Landing A hero vurgusu daha kısa mesajla ve birbirinden ayrı, yüksek kontrastlı satır şeritleriyle sunuluyor.

## [1.51.2] - 2026-09-08

### Düzeltildi

- LANDING-002 deneyinin A versiyonundaki eski hero mesajı güncellendi ve vurgu metni Borcama renkleriyle daha rahat okunur hale getirildi.

## [1.51.1] - 2026-09-08

### Düzeltildi

- Yeni landing hero başlığındaki lime vurgu, harfleri birbirine bindiren çok katmanlı gölge kaldırılarak ince koyu kontur ve tek coral gölgeyle daha okunur hale getirildi.

## [1.51.0] - 2026-09-08

### Eklendi

- Ziyaretçiler kayıt olmadan temsili bir hesabın aylık ödemelerini, ekstre kategorilerini ve asistan örneğini inceleyebilir hale getirildi.
- Mevcut landing ile yeni sonuç odaklı landing'i anonim ve kalıcı `%50/%50` atamayla karşılaştıran LANDING-002 tam sayfa deneyi başlatıldı.

### Değiştirildi

- Ana sayfa aylık ödeme ve bütçe faydasını kısa ürün örnekleriyle anlatacak, kalıcı Ücretsiz başlangıcı tek kayıt yolunda sunacak biçimde yenilendi; eski CTA deneyinin yeni sayfaya veri ataması durduruldu.
- Kayıt başlangıcı tek kart, ekstre veya nakit kaydıyla açıklanıyor; e-posta ve parola alanları kalıcı etiketler ve otomatik doldurma desteğiyle daha anlaşılır hale getirildi.
- Yeni landing'in renkleri canlı Borcama paletine geri çekildi; yapay görünümlü eyebrow etiketleri kaldırıldı ve mobil başlık akışı korunarak sadeleştirildi.
- Ücretsiz hesapta e-posta doğrulamasından sonra ilk 30 günlük Pro denemesinin hediye, otomatik ve kart bilgisi olmadan başladığı paket alanında vurgulandı; sonrasında Ücretsiz kalma veya Pro'ya geçme seçimi netleştirildi.
- Landing'deki tekrarlayan güven şeridi kaldırıldı; banka şifresi, ekstre ve veri açıklamaları SSS/gizlilik bölümünde tek yerde bırakıldı.
- Kayıt başlangıcı paneli arka plandan ayrıştırılarak kenarlık ve coral gölgeyle daha belirgin hale getirildi.
- Kayıt başlangıcı bandı orta koyulukta Borcama yeşiline taşınarak mint zeminle kontrastı ve renk katmanları güçlendirildi.
- Hero ile “Nasıl çalışır?” bölümü arasındaki renk kırılması yumuşak gradient geçişine dönüştürüldü.
- “Nasıl çalışır?” bölümündeki tam genişlik renk bandı kaldırılarak sayfanın tek krem zemin üzerinde kesintisiz akması sağlandı.
- Landing mesajları yeni ürün akışına geri alındı; tekrarlayan CTA'lar “İlk kaydını ekle”, “Hesabını oluştur” ve “Tablomu oluşturmaya başla” olarak ayrıştırıldı.
- Landing vurgu renkleri Borcama'nın krem, mint, lime, coral ve peach paletine sabitlendi; referans dışı mavi vurgu kaldırıldı.
- Landing arka plan ve kart renkleri mevcut ürün token'larına (#f4efe0, #d9e7e1, #eef2e5, #cdf564, #ff6f59) eşlendi.
- Landing arka planındaki içerikten bağımsız coral daire kaldırılarak hero daha temiz ve okunur hale getirildi.
- Ana landing hero mesajı “Paranı yönetmenin en yeni yolu” ve bütçe/ilerleme odaklı açıklamayla güncellendi.
- Ana landing hero mesajı “Paranın nereye gittiğini bil. Akıllıca borçlan ve kontrolü ele al.” metnine çekildi.
- Hero vurgu metni ürünün mevcut lime, koyu yeşil ve coral renk sistemine eşlendi; referans dışı zeytin tonu kaldırıldı.
- Landing ve kayıtsız demo içindeki örnek tablolar, giriş yapan kullanıcının açık tema görünümüne yaklaştırılarak mint ana yüzey ve beyaz iç kartlarla daha okunur hale getirildi.
- A/B testindeki iki landing'in üst menüsü `Nasıl çalışır?`, `Giriş yap` ve `Ücretsiz başla` bağlantılarında eşitlendi; hesaplama araçları footer'da bırakıldı.
- Yeni landing'in arka plan geçişleri ve bölüm aralıkları daha akıcı hale getirildi; son kayıt butonunun hover gölgesi Borcama'nın coral rengine çevrildi.

## [1.50.1] - 2026-09-07

### Düzeltildi

- Sabit Giderler ve Sabit Gelirler sayfalarının canlıda doğrudan açılması ve arama motorlarına kapalı kalması sağlandı.

## [1.50.0] - 2026-09-07

### Eklendi

- Nakit ve banka mevduatları Varlıklar'da ayrı bir kategori ve doğrudan ekleme aksiyonuyla kolayca kaydedilebilir hale getirildi.
- Kredi ve kart yapılandırma taksitleri Sabit Giderler'de otomatik, başlangıç tarihi ve kalan taksit bilgisiyle, bütçeye ikinci kez eklenmeden gösterilmeye başlandı.

### Düzeltildi

- Sabit Giderler ve Sabit Gelirler adresleri doğrudan açıldığında ana sayfaya dönmek yerine ilgili kullanıcı ekranını açıyor.

## [1.49.3] - 2026-09-07

### Düzeltildi

- Sık Sorulan Sorular sayfasının Google'a ana sayfa yerine kendi başlığı, açıklaması, içeriği ve adresiyle sunulması sağlandı.

## [1.49.2] - 2026-09-07

### Düzeltildi

- “Borcama'ya sor” mobil alt navigasyondan çıkarılıp üst bölümde ayrı bir asistan aksiyonuna taşındı; alt navigasyon yeniden dört ana ürün bölümüne ayrıldı.

## [1.49.1] - 2026-09-07

### Değiştirildi

- Borcama Asistanı penceresinde serbest soru sorma ana aksiyon haline getirildi; hazır soru görünümü yerine finansal amaca göre seçilebilen kısa inceleme yolları ve yanıtla birleşen tek bir sonraki adım sunuldu.

## [1.49.0] - 2026-09-06

### Eklendi

- Kredi kartı ekstresindeki harcamalar cihazda otomatik ayrıştırılıp kategorilere bölünebilir, ekstre toplamıyla karşılaştırılabilir ve kullanıcı onayından sonra mükerrer kayıt oluşturmadan Harcamalar'a aktarılabilir hale getirildi.

## [1.48.2] - 2026-09-06

### Düzeltildi

- Borcama Asistanı'nın koyu “Yapman gereken” kartındaki vurgulu metinlerin açık renkte ve okunabilir kalması sağlandı.

## [1.48.1] - 2026-09-06

### Değiştirildi

- Borcama Asistanı'nın sonuç kontrolü uyarısı daha sakin bir görünüme getirildi ve veri kullanımı açıklaması daha anlaşılır biçimde sadeleştirildi.

## [1.48.0] - 2026-09-06

### Eklendi

- Kullanıcıların Borcama Asistanı'na sorduğu sorular ve aldıkları cevaplar, finansal analiz bağlamı kopyalanmadan yetkili CRM kullanıcı profilinde görüntülenebilir hale getirildi.

## [1.47.7] - 2026-09-06

### Değiştirildi

- Pro kullanıcıların Borcama Asistanı günlük soru hakkı 10'dan 20'ye çıkarıldı.

## [1.47.6] - 2026-09-06

### Değiştirildi

- Borcama Asistanı yönlendirmeleri “Yapman gereken” diliyle sadeleştirildi; günlük soru hakkı Ücretsiz planda 3, Pro'da 10 olarak güncellendi ve kalan hak daha görünür bir sayaçta gösteriliyor.

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
