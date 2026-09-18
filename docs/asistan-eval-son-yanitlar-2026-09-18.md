# Son canlı sentetik tur — gerçek yanıt metinleri

Model gemini-3.7-flash. 10/10 çalışma zamanı doğrulaması geçti. Eski kavram kontrolü 9/10 geçti; yalnız konusma-araba-devam borç/borcunuzu çekim eşleşmesi başarısızdı. Aşağıdaki answer alanları canlı çıktılardır. Vakalar evals/financial-assistant/cases.js ve conversationCases.js içindedir. Gerçek kullanıcı verisi kullanılmadı.

## kredi-pahali-kmh-refinansman — plan, needsMoreInfo=true

Kısa cevap: Teklifin aylık faizi (%1,5) mevcut KMH maliyetinden (%4,5) belirgin şekilde düşük olduğu için mantıklı olabilir ancak vade ve taksit tutarını kontrol etmelisin.
• 20.000 TL KMH borcunun aylık %4,5 faizi yerine %1,5 faizli kredi kullanmak faiz maliyetini düşürmeye yardımcı olabilir.
• Yeni kredinin vadesi, aylık taksit tutarı ve tahsis ücreti gibi ek masraflar toplam geri ödemeyi doğrudan etkiler.
• Kredinin yalnız bu pahalı KMH borcunu tamamen kapatması ve aylık taksitin bütçeni zorlamaması önemlidir.
Yapman gereken: Bankadan net aylık taksit tutarını ve toplam geri ödeme planını öğrenip bütçene uygunluğunu karşılaştır.

## yapilandirma-aylik-acigi-azaltma — plan, needsMoreInfo=false

Kısa cevap: Aylık ödeme baskısını hafifletir ancak toplamda 12.000 TL ek maliyet getirir.
• 12 ayda toplam geri ödeme 84.000 TL olur; bu da 72.000 TL anaparaya göre 12.000 TL fark demektir.
• Aylık 7.000 TL taksit, mevcut 28.800 TL asgari ödemeye göre bütçeni rahatlatır ve aylık açığını kapatmana yardımcı olabilir.
• Kartın mevcut faizle kapatılma planı tam bilinmediğinden yapılandırmanın kesin daha ucuz olduğu söylenemez ama nakit akışını toparlar.
Yapman gereken: Bankadan faiz, vergi ve masraflar dahil resmi ödeme planını teyit edip bütçene göre karar vermek.

## kart-kmh-oncelik — borclar, needsMoreInfo=false

Kısa cevap: Aylık maliyeti daha yüksek olan KMH (ek hesap) borcunu azaltmak öncelikli bir seçenek olarak öne çıkıyor.
• KMH borcun %4,8 faiz oranıyla kartına göre (%3,8) daha pahalıdır; yüksek maliyetli borcu önceliklendirmek faiz yükünü hafifletir.
• Ayırabildiğin 5.000 TL bütçeyle 12.000 TL'lik KMH borcunu tamamen kapatamazsın; bu ödeme sonrasında faiz ve vergiler hariç yaklaşık 7.000 TL anapara borcun kalır.
• Kartının asgari tutarını ödediğin görünüyor, kalan bütçeyi daha maliyetli olan KMH bakiyesini azaltmak için kullanabilirsin.
Yapman gereken: KMH güncel faiz ve bakiye durumunu bankandan kontrol edip ödemeni bu doğrultuda planlamak.

## gecikme-kosullu-acil-yonlendirme — odemeler, needsMoreInfo=true

Kısa cevap: Gecikme faizi eklendiği için önce bankadan güncel tutarı öğrenip ödeyebileceğiniz miktarı yatırmalısınız.
• Kayıtlardaki 16.000 TL asgari tutara 10 günlük gecikme faizi ve vergiler ekleneceğinden güncel borç tutarı değişmiştir.
• Bütçenizde 1.000 TL aylık açık göründüğünden bugün ne kadar nakit ayırabileceğinizi belirlemeniz önemlidir.
• Ödeyebileceğiniz tutarı hemen yatırıp kalan bakiye için gecikme büyümeden bankanızla görüşebilirsiniz.
Yapman gereken: Bankanızdan faiz dahil güncel borcu teyit edip bütçenize göre ödeme adımı planlayın.

## odeme-kismi-kayit — odemeler, needsMoreInfo=false

Kısa cevap: Hayır, kart ödemen henüz tamamlanmadı.
• Bu ay 18.000 TL ekstre borcuna karşılık 5.000 TL ödeme yapılmış görünüyor.
• Zorunlu olan 7.200 TL asgari tutarı karşılamak için 2.200 TL daha ödeme gerekiyor.
• Ekstrenin tamamını kapatmak için kalan borç tutarı ise 13.000 TL'dir (faiz ve masraflar hariç).
Yapman gereken: Gecikme faizi ve olası ek maliyetlerle karşılaşmamak için son ödeme gününe kadar en az 2.200 TL daha ödeme yapmayı planlayabilirsin.

## gelir-gider-yapisal-acik — plan, needsMoreInfo=false

Kısa cevap: Bu ay ek harcama alanın bulunmuyor; bütçen şu anda açık veriyor.
• Aylık 40.000 TL gelirine karşılık kayıtlı harcamaların ve zorunlu ödemelerin toplamı nedeniyle bütçende 4.000 TL aylık açık görünüyor.
• Toplam 30.000 TL kart borcun bulunuyor ve likit varlığın 2.000 TL seviyesinde.
• Yapılacak yeni harcamalar mevcut bütçe açığını ve borç yükünü daha da büyütecektir.
Yapman gereken: Bütçe açığını kapatmak için zorunlu olmayan harcamaları sınırlamak ve mevcut kart borcunu azaltmaya odaklanmak.

## varlik-likidite-ayrimi — ozet, needsMoreInfo=false

Kısa cevap: Hayır, net varlığın pozitif olsa da borçsuz sayılmazsın; kayıtlı 150.000 TL borcun ve aylık geri ödeme yükümlülüğün devam ediyor.
• Toplam 200.000 TL varlığın (180.000 TL konut, 20.000 TL nakit) ile 150.000 TL borcun çıkarıldığında net finansal durumun +50.000 TL'dir (yani varlıkların borcundan fazladır).
• Konut hemen paraya çevrilemeyen bir varlıktır; elindeki 20.000 TL nakit ise 150.000 TL borcun tamamını kapatmaya yetmez.
• Her ay 18.000 TL zorunlu taksit ödemen olduğu için borç ödeme disiplinini sürdürmen gerekir.

## veri-eksigi-odeme-gucu — sabit-gelirler, needsMoreInfo=true

Kısa cevap: Aylık taksit tutarını belirlemek için kredinizin faiz oranı, vade süresi ve aylık gelir-gider bilginiz gerekiyor.
• Kayıtlarınızda 50.000 TL kredi borcu görünüyor ancak faiz oranı, vade ve aylık gelir/gider bilgileriniz eksik olduğu için ödenebilecek taksit hesaplanamaz.
• Aylık ödeme gücünüzü görebilmemiz ve bütçenizi zorlamayacak taksit tutarını hesaplayabilmemiz için gelir ve giderlerinizi eklemeniz gerekir.
• Kredinin faiz oranına ve seçeceğiniz vadeye (örneğin 12, 24 veya 36 ay) göre bankanızın çıkaracağı taksit ve toplam geri ödeme tutarı değişecektir.
Yapman gereken: Gelir ve giderlerini kaydedip bankanın sunduğu faiz ve vade koşullarını kontrol et.

## konusma-araba-devam — plan, needsMoreInfo=true

Kısa cevap: 100.000 TL beyanınız ve işe gidiş-geliş amacınız netleşti ancak araç masrafları ve kalan bütçe belirsiz.
• Düşündüğünüz aracın fiyatı, sigorta, kasko, yakıt ve bakım gibi ek aylık masrafları bilinmiyor.
• Kayıtlı 42.000 TL yüksek maliyetli borcunuzu (kart ve ek hesap) azaltmak veya kapatmak, araç bütçesinden önce değerlendirebileceğiniz bir seçenektir.
• Beklenmedik durumlar için kenarda bırakacağınız acil ihtiyaç rezervi miktarı da hesaba katılmalıdır.
Yapman gereken: Almayı planladığınız aracın toplam fiyatını ve tahmini aylık yürütme giderlerini belirleyin.

## konusma-tutar-duzeltme — plan, needsMoreInfo=true

Kısa cevap: Beyan ettiğin 80.000 TL ile araç almadan önce borç maliyetlerini ve araç giderlerini karşılaştırman gerekir.
• Kayıtlarında toplam 42.000 TL borç (aylık %4,8 faizli 12.000 TL ek hesap ve %3,8 faizli kart borcu) bulunuyor; yüksek maliyetli borçları azaltmak bir seçenek olabilir.
• Almayı düşündüğün aracın fiyatı, zorunlu sigorta/kasko, yakıt ve bakım masrafları ile kullanım amacın henüz bilinmiyor.
• Beklenmedik durumlar için kenarda tutulacak acil durum rezervi de bütçeni doğrudan etkiler.
Yapman gereken: Araç için gereken toplam bütçeyi ve aylık ek masrafları belirleyip ihtiyaç durumunu netleştir.
