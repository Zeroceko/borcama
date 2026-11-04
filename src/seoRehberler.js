// Rehber sayfalarının tek veri kaynağı: SeoPages.jsx (SPA) ve
// scripts/prerender-seo.mjs (JavaScript'siz HTML) aynı içeriği buradan okur.

export const BDDK_KAYNAK = "https://www.bddk.org.tr/Mevzuat/DokumanGetir/1349";
export const TCMB_KAYNAK = "https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB%2BTR/Main%2BMenu/Istatistikler/Bankacilik%2BVerileri/Kredi_Karti_Islemlerinde_Uygulanacak_Azami_Faiz_Oranlari";
export const GIB_VERGI_2026 = "https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Fyararli-bilgiler%2Fgelir-vergisi-tarifeleri%2Fgelir-vergisi-tarifesi-2026.pdf";
export const GIB_ASGARI_2026 = "https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Fyararli-bilgiler%2FAsgariUcrettenYapilanKesintiler.pdf";
export const SGK_2026 = "https://www.sgk.gov.tr/Content/Post/2e0c9e1a-2cfe-4456-af10-49d3de0c58ba/Prime-Esas-Kazanc-Miktarlari-2026-01-14-10-35-39";
export const KIDEM_2026 = "https://www.csgb.gov.tr/tr/istatistikler/calisma-hayati-istatistikleri/kidem-tazminati-tavan-miktari/";
const BDDK_YAPILANDIRMA_2026 = "https://www.bddk.org.tr/Mevzuat/DokumanGetir/1325";
const BDDK_YAPILANDIRMA_2024 = "https://www.bddk.org.tr/Mevzuat/DokumanGetir/1254";
const BDDK_BASIN_30_OCAK_2026 = "https://www.bddk.org.tr/Duyuru/EkGetir/2157?ekId=889";
const BDDK_KURUL_KARARLARI = "https://www.bddk.org.tr/Mevzuat/Liste/56";
const KANUN_5464 = "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5464&MevzuatTur=1&MevzuatTertip=5";
const KART_YONETMELIGI = "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=11180&MevzuatTur=7&MevzuatTertip=5";
const BANKACILIK_KANUNU = "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5411&MevzuatTur=1&MevzuatTertip=5";
const ICRA_IFLAS_KANUNU = "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2004&MevzuatTur=1&MevzuatTertip=3";
const BORCLAR_KANUNU = "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1&MevzuatTertip=5";
const ANAYASA = "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2709&MevzuatTur=1&MevzuatTertip=5";
const EDEVLET_RISK_RAPORU = "https://www.turkiye.gov.tr/turkiye-bankalar-birligi-risk-merkezi-raporu-basvurusu";
const EDEVLET_ICRA_DOSYASI = "https://www.turkiye.gov.tr/adalet-icra-dosyasi-sorgulama";

export const REHBERLER = [
  // Kredi kartı borcu rehberleri (Kasım 2026). Rakamlar resmî kaynaktan
  // doğrulanır; TCMB tablosu her ay yenilendiği için faiz sayfası aylık
  // kontrol edilip `guncellendi` tarihi değiştirilir.
  {
    slug: "kredi-karti-faiz-oranlari-2026",
    title: "Kredi Kartı Faiz Oranları Kasım 2026",
    h1: "Kredi kartı faiz oranları (Kasım 2026): akdi, gecikme ve nakit avans faizi",
    description: "TCMB'nin Kasım 2026 için ilan ettiği kredi kartı azami akdi ve gecikme faizi, nakit avans ve KMH oranı, örnek bir borçta TL karşılığı ve asgari ödemeyle ilişkisi.",
    published: "2026-11-03",
    guncellendi: "2026-11-03",
    intro: "Kredi kartında bankaların uygulayabileceği en yüksek aylık faiz oranlarını Türkiye Cumhuriyet Merkez Bankası (TCMB) belirler ve tabloyu her ay yeniden yayımlar. Bankalar bu sınırları aşmamak koşuluyla kendi oranlarını serbestçe belirler. Kasım 2026'da TL kartlardaki azami oranlar, dönem borcunun büyüklüğüne göre üç kademede uygulanıyor.",
    sections: [
      ["Kasım 2026 azami faiz oranları (TL kartlar)", "TCMB tablosuna göre 1 Kasım 2026'dan itibaren aylık azami oranlar şöyle: dönem borcu 30.000 TL'nin altındaysa akdi faiz yüzde 3,25, gecikme faizi yüzde 3,55; 30.000 ile 180.000 TL arasındaysa akdi faiz yüzde 3,75, gecikme faizi yüzde 4,05; 180.000 TL'nin üzerindeyse akdi faiz yüzde 4,25, gecikme faizi yüzde 4,55. En üst kademe, dönem borcuna bakılmaksızın kurumsal kredi kartlarında da geçerli. Tablodaki oranlar Ocak 2026'dan bu yana değişmedi."],
      ["Nakit avans ve ek hesap (KMH) faizi", "Nakit çekim ve nakit kullanımı işlemlerinde Kasım 2026 için azami oran aylık yüzde 4,25 akdi faiz, yüzde 4,55 gecikme faizidir; TCMB bu oranların kredili mevduat hesapları (KMH) için de geçerli olduğunu belirtiyor. Kanuna göre nakit kullanımında faiz, hesap kesim tarihi yerine işlem tarihinden itibaren işletilebilir; bu yüzden nakit avans kısa sürede de maliyet doğurur. Yabancı para kart işlemlerinde azami oranlar aylık yüzde 2,98 akdi, yüzde 3,28 gecikme faizidir."],
      ["Faiz ne zaman işler?", "Dönem borcunun tamamını son ödeme tarihine kadar ödediğinde devreden bakiye kalmaz. Bir kısmını ödersen faiz kalan bakiye üzerinden hesaplanır: asgari tutarı ya da daha fazlasını ödediysen akdi faiz, asgari tutarın altında ödediysen gecikme faizi uygulanır (5464 sayılı Banka Kartları ve Kredi Kartları Kanunu, madde 26). Aynı maddeye göre kart borçlarında bileşik faiz uygulanamaz ve hesap kesim tarihiyle son ödeme tarihi arasında en az on gün olmalıdır. Ekstrende faizle birlikte vergi kalemleri ayrıca gösterilebilir; kesin tutar ekstrede yazar."],
      ["Örnek: 50.000 TL dönem borcu", "Kart limitin 80.000 TL, dönem borcun 50.000 TL olsun. Limit 100.000 TL'nin altında olduğu için asgari ödeme dönem borcunun yüzde 20'si, yani 10.000 TL'dir. Asgariyi ödersen kalan 40.000 TL'ye bu kademede en fazla yüzde 3,75 akdi faiz uygulanabilir; bir aylık faiz en fazla 1.500 TL eder. 5.000 TL ödersen asgarinin altında kaldığın için kalan 45.000 TL'ye en fazla yüzde 4,05 gecikme faizi uygulanabilir; bu da yaklaşık 1.822 TL eder. Tamamını ödersen devreden bakiye ve faiz oluşmaz. Örnek azami oranlarla ve vergiler hariç hesaplanmıştır; bankanın oranı daha düşük olabilir."],
      ["Asgari ödemeyle ilişkisi", "BDDK'nın 1 Ekim 2026 tarihli 11581 sayılı kararına göre asgari ödeme, limiti 100.000 TL ve altındaki kartlarda dönem borcunun yüzde 20'si, limiti 100.000 TL'nin üzerindeki kartlarda yüzde 40'ıdır. Asgariyi ödemek gecikme faizinden korur ama kalan bakiye akdi faizle büyümeye devam eder. Banka Kartları ve Kredi Kartları Hakkında Yönetmelik'e göre bir takvim yılında asgari tutarı toplam üç kez ödenmeyen kart nakit kullanımına, üst üste üç kez ödenmeyen kart alışverişe de kapatılır."],
      ["Oranlar her ay güncellenir", "TCMB azami oran tablosunu her ay yeniden yayımlar; bu sayfa da tabloya göre güncellenir ve son kontrol tarihi sayfanın başında yazar. Sana uygulanan gerçek oran kart sözleşmende ve ekstrende yer alır. Kanuna göre banka faiz oranını artıracaksa bunu en az 30 gün önceden bildirmek zorundadır; bildirimden sonra 60 gün içinde borcun tamamını ödeyip kartı kullanmayı bırakırsan artıştan etkilenmezsin (5464 sayılı Kanun, madde 25)."],
    ],
    sss: [
      ["Kredi kartı faiz oranı Kasım 2026'da kaç?", "TCMB'nin TL kartlar için ilan ettiği azami aylık akdi faiz, dönem borcuna göre yüzde 3,25, 3,75 veya 4,25; azami gecikme faizi yüzde 3,55, 4,05 veya 4,55. Bankan bu sınırların altında bir oran uygulayabilir."],
      ["Nakit avans faizi ne kadar?", "Kasım 2026'da nakit çekim ve kredili mevduat hesabı (KMH) için azami akdi faiz aylık yüzde 4,25, azami gecikme faizi yüzde 4,55."],
      ["Asgari ödersem gecikme faizi öder miyim?", "Hayır. Asgari tutarı veya daha fazlasını ödersen kalan bakiyeye akdi faiz uygulanır. Gecikme faizi, asgari tutarın altında ödeme yaptığında devreye girer."],
      ["Ekstremdeki oran bu tablodan neden farklı?", "Tablo bankaların aşamayacağı üst sınırı gösterir. Bankan daha düşük bir oran uygulayabilir; ayrıca ekstrede faizin yanında vergi kalemleri de görünebilir."],
    ],
    tool: "borc-kapatma-hesaplayici",
    araclar: ["kredi-karti-asgari-odeme-hesaplayici"],
    ilgiliRehberler: ["kredi-karti-borcu-yapilandirma", "kredi-karti-borcu-odenmezse-ne-olur", "asgari-odeme-borcu-nasil-etkiler"],
    terimler: ["akdi-faiz", "gecikme-faizi", "nakit-avans", "ek-hesap-kmh"],
  },
  {
    slug: "kredi-karti-borcu-yapilandirma",
    title: "Kredi Kartı Borcu Yapılandırma 2026",
    h1: "Kredi kartı borcu yapılandırma (2026): kurallar, faiz ve bankaya sorulacaklar",
    description: "BDDK'nın 2026 kararına göre kredi kartı borcu yapılandırmasında azami vade, faiz sınırı, kart limiti ve başvuru süresi; bankaya sorman gerekenler ve kendi ödeme planınla karşılaştırma.",
    published: "2026-11-03",
    guncellendi: "2026-11-03",
    intro: "Kredi kartı borcu yapılandırma, kart borcunun bankayla anlaşılarak yeni bir taksitli ödeme planına bağlanmasıdır. 2026'daki çerçeveyi BDDK'nın 29 Ocak 2026 tarihli 11366 sayılı kararı çizdi. Aşağıda kararın ne getirdiğini, faiz sınırını, kart kullanımına etkisini ve karar vermeden önce bankaya sorman gerekenleri bulacaksın.",
    sections: [
      ["2026 kararı ne getirdi?", "BDDK'nın 11366 sayılı kararına göre, karar tarihi itibarıyla son ödeme tarihinde dönem borcu kısmen ya da tamamen ödenmemiş bireysel kredi kartlarının borcu, kart sahibi karar tarihinden itibaren 3 ay içinde talep ederse en fazla 48 ay vadeyle yeniden yapılandırılabildi. Yapılandırmaya bekleyen taksitli işlemler de dahil edildi. Aynı karar, ödemesi 30 günden fazla gecikmiş ihtiyaç kredileri ve kredili mevduat hesapları (KMH) için de ek kredi kullandırmadan 48 aya kadar yapılandırma imkânı tanıdı. Daha önce 26 Eylül 2024 tarihli 10972 sayılı kararda kart borçları için üst sınır 60 aydı."],
      ["Taksit, limit ve kart kullanımı", "Kararda yapılandırma taksitinin her ay kartın asgari ödeme tutarına ekleneceği yazıyor. Yapılandırılan borcun yüzde 50'si ödenene kadar banka, kart sahibine tanıdığı kart limitlerini artırmıyor. Yapılandırma tutarı kart limitini aşarsa aşan kısım limit aşımı sayılmıyor. Kararda kartın kapatılmasını zorunlu kılan bir hüküm yok; kartın kullanıma açık kalıp kalmayacağını bankana sor."],
      ["Yapılandırmada faiz sınırı", "TCMB'nin azami faiz tablosundaki açıklamaya göre BDDK'nın 2024, 2025 ve 2026 tarihli yapılandırma kararları kapsamında yapılandırılan kart borçlarında aylık akdi faiz, TCMB'nin aylık referans oranını aşamaz; Kasım 2026 için referans oran yüzde 3,11. Bu yapılandırmalarda gecikme olursa uygulanabilecek azami oran, kredi kartı tablosundaki en yüksek gecikme faizidir. Oran kart faizinin üst kademelerinden düşük olsa da vade uzadıkça ödenen toplam faiz artar."],
      ["Başvuru süresi doldu mu?", "11366 sayılı karardaki başvuru süresi karar tarihinden itibaren 3 ay, yani Nisan 2026 sonuna kadardı. 3 Kasım 2026 itibarıyla BDDK'nın yayımladığı kurul kararları arasında kredi kartı borçları için yeni bir yapılandırma dönemi açan karar bulunmuyor. Bankan sana farklı bir taksitlendirme ya da kredi teklifi sunarsa, teklifin hangi düzenlemeye dayandığını, faiz oranını ve toplam geri ödemeyi yazılı olarak iste."],
      ["Kredi kaydına (Risk Merkezi) etkisi", "Bankalar müşterilerinin kredi ve kart bilgilerini Türkiye Bankalar Birliği bünyesindeki Risk Merkezi'ne bildirmekle yükümlüdür (5411 sayılı Bankacılık Kanunu, ek madde 1). Yapılandırmanın raporunda nasıl görüneceği ve kredi notuna etkisi kişiden kişiye değişir. Yapılandırmadan önce ve sonra Risk Merkezi raporunu e-Devlet üzerinden alarak kendi kaydını kontrol edebilirsin."],
      ["Bankaya sorman gerekenler", "Yapılandırılacak toplam tutar, bekleyen taksitler dahil ne kadar? Aylık faiz oranı ve vade sonunda ödeyeceğin toplam tutar ne? Taksit asgari ödemeye eklenince her ay toplam ne ödeyeceksin? Kart kullanıma açık kalacak mı, limitin değişecek mi? Erken kapatırsan ne olur? Bir taksiti kaçırırsan hangi faiz uygulanır? Cevapları sözleşme veya ödeme planı olarak yazılı al."],
      ["Yapılandırma mı, kendi ödeme planın mı?", "Yapılandırma aylık yükü düşürür ama vadeyi uzatır. Bütçen borcu birkaç ay içinde kapatmaya yetiyorsa, kendi planınla ilerlemek daha az toplam faiz ödetebilir. Bütçen asgari ödemeleri bile karşılamıyorsa yapılandırma, gecikme faizi ve takip riskini azaltmanın bir yolu olabilir. İki senaryoyu borç ödeme planı aracında aynı aylık bütçeyle karşılaştır: biri bugünkü kart faiziyle, diğeri bankanın teklifindeki oran ve taksitle."],
    ],
    sss: [
      ["Kredi kartı borcu kaç ay yapılandırılabilir?", "BDDK'nın 29 Ocak 2026 tarihli kararında üst sınır 48 aydı; başvuru süresi karar tarihinden itibaren 3 aydı. Eylül 2024 kararında bu sınır 60 ay olarak uygulanmıştı."],
      ["Yapılandırmada faiz oranı ne olur?", "TCMB'ye göre BDDK kararları kapsamındaki kart borcu yapılandırmalarında aylık akdi faiz, aylık referans oranı aşamaz. Kasım 2026'da bu oran yüzde 3,11."],
      ["Yapılandırma yaparsam kartım kapanır mı?", "Kararda zorunlu kapatma hükmü yok. Ancak yapılandırılan borcun yarısı ödenene kadar kart limitin artırılmaz. Kartının durumunu bankana sor."],
      ["Başvuru süresini kaçırdım, ne yapabilirim?", "Bankanla görüşüp sunabileceği taksitlendirme veya ödeme seçeneklerini yazılı iste. Aynı anda kendi bütçenle bir ödeme planı çıkar; böylece teklifi toplam maliyet üzerinden karşılaştırabilirsin."],
    ],
    tool: "borc-odeme-plani",
    araclar: ["borc-kapatma-hesaplayici"],
    ilgiliRehberler: ["kredi-karti-faiz-oranlari-2026", "kredi-karti-borcu-odenmezse-ne-olur", "borc-kapatma-plani-nasil-hazirlanir"],
    terimler: ["borc-yapilandirma", "risk-raporu", "toplam-geri-odeme", "tasfiye"],
  },
  {
    slug: "kredi-karti-borcu-odenmezse-ne-olur",
    title: "Kredi Kartı Borcu Ödenmezse Ne Olur?",
    h1: "Kredi kartı borcu ödenmezse ne olur? Adım adım süreç",
    description: "Kredi kartı borcu ödenmezse gecikme faizi, kartın kapatılması, Risk Merkezi kaydı, ihtarname, icra takibi ve zamanaşımı nasıl işler? Kanun maddeleriyle sakin bir anlatım ve ilk adım.",
    published: "2026-11-03",
    guncellendi: "2026-11-03",
    intro: "Kredi kartı borcunu ödeyememek korkutucu olabilir ama süreç bir günde değil, aşama aşama ilerler ve çoğu aşamada bankayla konuşup plan yapma şansın vardır. Aşağıda kanunda yazan adımları sırasıyla ve kaynaklarıyla anlatıyoruz. Bu sayfa hukuki tavsiye değildir; resmî bir belge aldıysan süreleri kaçırmamak için uzman desteği almayı düşün.",
    sections: [
      ["1. Son ödeme tarihi geçince: gecikme faizi", "Asgari tutarın altında ödeme yaparsan kalan bakiyeye akdi faiz yerine gecikme faizi uygulanır (5464 sayılı Banka Kartları ve Kredi Kartları Kanunu, madde 26). Kanun, asgari tutar ödenmediğinde ödenmeyen tutar için sözleşmedeki gecikme faizi dışında bir yükümlülük getirilemeyeceğini de söyler (madde 24). Kasım 2026'da TL kartlarda azami gecikme faizi, dönem borcuna göre aylık yüzde 3,55 ile 4,55 arasındadır."],
      ["2. Kartın kullanımı kısıtlanır", "Banka Kartları ve Kredi Kartları Hakkında Yönetmelik'e göre bir takvim yılında asgari tutarı toplam üç kez ödenmeyen kart nakit kullanımına, üst üste üç kez ödenmeyen kart nakit kullanımıyla birlikte alışverişe de kapatılır. Bu kartların limiti dönem borcunun tamamı ödenene kadar artırılamaz (madde 22)."],
      ["3. Risk Merkezi (KKB) kaydı", "Bankalar müşterilerinin kredi ve kart bilgilerini Türkiye Bankalar Birliği bünyesindeki Risk Merkezi'ne bildirmekle yükümlüdür (5411 sayılı Bankacılık Kanunu, ek madde 1). Ödeme gecikmeleri bu kayıtlara yansıyabilir ve yeni kredi ya da kart başvurularını etkileyebilir. Kendi kaydını e-Devlet'teki Risk Merkezi raporu başvurusuyla görebilirsin."],
      ["4. Borcun tamamının istenmesi ve ihtarname", "Ödemeler uzun süre yapılmazsa banka, sözleşmedeki hükümlere dayanarak kalan borcun tamamını talep edebilir ve bunu bir ihtarnameyle bildirebilir. Bu aşamada borç muaccel, yani hemen istenebilir hale gelir. İhtarname aldığında tarihini, tutarı ve verilen süreyi not et; bankayla ödeme planı konuşmak için hâlâ geç değildir."],
      ["5. İcra takibi ve ödeme emri", "Banka alacağını tahsil etmek için icra takibi başlatabilir. Genel haciz yoluyla takipte icra dairesi ödeme emri gönderir; ödeme emrinde borcun yedi gün içinde ödenmesi istenir (İcra ve İflas Kanunu, madde 60). Borca itiraz etmek isteyen borçlu, itirazını ödeme emrinin tebliğinden itibaren yedi gün içinde icra dairesine bildirmelidir (madde 62). Bu süreler kaçırılırsa hak kaybı yaşanabilir; ödeme emrini aldığın günü not et ve gerekirse bir avukattan destek al. Dosyanın durumunu e-Devlet'teki icra dosyası sorgulamasından izleyebilirsin."],
      ["6. Haciz", "Takip kesinleşirse alacaklı haciz isteyebilir. Kanun, maaş ve ücret gibi gelirlerin ancak borçlu ve ailesinin geçimi için gereken kısım ayrıldıktan sonra haczedilebileceğini düzenler (İcra ve İflas Kanunu, madde 83); bazı mal ve haklar ise hiç haczedilemez (madde 82). Hangi gelirin veya malın ne ölçüde haczedileceği dosyaya göre değişir. Anayasa'ya göre de hiç kimse yalnızca sözleşmeden doğan bir yükümlülüğü yerine getiremediği için özgürlüğünden alıkonulamaz (madde 38)."],
      ["Zamanaşımı: beklemek çözüm değil", "Türk Borçlar Kanunu'na göre kanunda aksine hüküm yoksa her alacak on yıllık zamanaşımına tabidir (madde 146); bazı dönemsel alacaklar için beş yıl öngörülür (madde 147). Ancak süre; kısmi ödeme, borcun kabulü ya da icra takibiyle kesilir ve yeniden başlar (madde 154, 156, 157). Zamanaşımı kendiliğinden de işlemez: borçlu ileri sürmedikçe hâkim dikkate alamaz (madde 161). Kart borcunda hangi sürenin uygulanacağı somut duruma bağlıdır; borcun zamanaşımına uğramasını beklemek faizin ve takip masraflarının birikmesine yol açabilir."],
      ["İlk adım: bir plan yap", "Önce bütün borçlarını, son ödeme tarihlerini ve her ay gerçekten ayırabileceğin tutarı tek listede gör. Asgari ödemeyi karşılayabiliyorsan önce onu koru; karşılayamıyorsan son ödeme tarihinden önce bankanı ara ve taksitlendirme ya da yapılandırma seçeneklerini yazılı olarak iste. Elindeki bütçeyle borcun kaç ayda kapanacağını borç kapatma hesaplayıcısında görebilirsin."],
    ],
    sss: [
      ["Kredi kartı borcu yüzünden hapis cezası olur mu?", "Anayasa'nın 38. maddesine göre hiç kimse yalnızca sözleşmeden doğan bir yükümlülüğü yerine getiremediği için özgürlüğünden alıkonulamaz. Ödenmeyen kart borcu faiz, kart kısıtlaması, kayıt ve icra süreciyle sonuçlanabilir."],
      ["Asgariyi ödersem kartım kapanır mı?", "Yönetmelikteki kapatma kuralı asgari tutarın ödenmemesine bağlıdır. Asgariyi her ay ödediğinde bu kural işlemez; ancak kalan bakiyeye akdi faiz uygulanmaya devam eder."],
      ["Borcum icraya düştü, ne yapmalıyım?", "Ödeme emrinin tebliğ tarihini not et; ödeme ve itiraz için kanunda yedi günlük süreler var. Dosyanı e-Devlet'ten kontrol et, bankayla ya da alacaklının avukatıyla ödeme planı konuş ve gerekirse hukuki destek al."],
      ["Kredi kartı borcu kaç yılda zamanaşımına uğrar?", "Türk Borçlar Kanunu'nda genel süre on yıldır; ancak kısmi ödeme, borcun kabulü ya da icra takibi süreyi keser ve yeniden başlatır. Kendi durumun için bir hukukçuya danış."],
    ],
    tool: "borc-kapatma-hesaplayici",
    araclar: ["aylik-odeme-takvimi"],
    ilgiliRehberler: ["kredi-karti-borcu-yapilandirma", "kredi-karti-faiz-oranlari-2026", "borclarimi-nasil-duzenlerim"],
    terimler: ["gecikme-faizi", "muacceliyet", "icra-takibi", "odeme-emri", "risk-raporu"],
  },
  {
    slug: "2026-brut-net-maas-nasil-hesaplanir",
    title: "2026 Brütten Nete Maaş Nasıl Hesaplanır?",
    description: "2026 brüt maaştan net maaşa geçerken SGK, işsizlik primi, gelir vergisi ve damga vergisinin nasıl uygulandığını sade bir örnekle öğrenin.",
    published: "2026-08-24",
    intro: "Brüt maaş, kesintiler yapılmadan önceki toplam tutardır. Net maaş ise çalışanın eline geçen tutarı ifade eder. Aradaki farkı tek bir oran değil, birkaç ayrı kesinti belirler.",
    sections: [
      ["Brüt maaştan hangi kesintiler yapılır?", "Çalışan payı olarak SGK primi ve işsizlik sigortası primi ayrılır. Ardından gelir vergisi matrahına göre gelir vergisi ve brüt tutar üzerinden damga vergisi hesaplanır. Asgari ücret vergi istisnası da sonuçta dikkate alınır."],
      ["Net maaş neden aylar ilerledikçe değişebilir?", "Gelir vergisi yıl içindeki toplam vergi matrahına göre kademeli hesaplanır. Bir üst vergi dilimine geçildiğinde, brüt maaş aynı kalsa bile ele geçen net tutar azalabilir."],
      ["Netten brüte hesaplama nasıl yapılır?", "Hedeflenen net tutarı verecek brüt maaş, kesintiler ve vergi dilimi birlikte hesaba katılarak bulunur. Bu nedenle net tutara sabit bir yüzde eklemek doğru sonuç vermeyebilir."],
      ["Hesaplamada hangi ayı seçmelisin?", "Maaşının bordroya yansıyacağı ayı seç. Araç, aynı brüt maaşı yılbaşından beri aldığın varsayımıyla o aya kadarki toplam matrahı tahmin eder."],
    ],
    tool: "brut-net-maas-hesaplama",
  },
  {
    slug: "2026-kidem-tazminati-nasil-hesaplanir",
    title: "2026 Kıdem Tazminatı Nasıl Hesaplanır?",
    description: "2026 kıdem tazminatı hesabında brüt ücret, düzenli ek ödemeler, çalışma süresi, tavan ve damga vergisinin etkisini öğrenin.",
    published: "2026-08-24",
    intro: "Kıdem tazminatı tutarı; hesaba esas aylık kazanç, toplam çalışma süresi ve ilgili dönemdeki kıdem tazminatı tavanına göre tahmin edilir. Hak kazanma durumu ise işten ayrılma nedenine göre ayrıca değerlendirilir.",
    sections: [
      ["Hesaba esas aylık tutar nedir?", "Brüt maaşa, her ay düzenli sağlanan para ve para ile ölçülebilen bazı menfaatler eklenebilir. Düzensiz veya tek seferlik ödemelerin durumu farklı olabileceğinden bordro kayıtlarını esas al."],
      ["Kıdem tazminatı tavanı nasıl etkiler?", "Hesaba esas aylık kazanç ilgili dönem tavanını aşıyorsa hesaplama tavan tutar üzerinden yapılır. Tavan yıl içinde güncellenebildiği için işten ayrılma tarihindeki tutar önemlidir."],
      ["Çalışma süresi nasıl eklenir?", "Tam yıllara ek olarak artan ay ve günler de oranlanarak hesaba katılır. Başlangıç ve bitiş tarihlerini işveren kayıtlarından kontrol etmek sonucu daha doğru yapar."],
      ["Net tutara nasıl ulaşılır?", "Tahmini brüt tazminattan damga vergisi düşülerek net tutar bulunur. Kesin bordroda yasal durum ve kayıtlar sonucu etkileyebileceğinden aracı bir ön hesap olarak kullan."],
    ],
    tool: "kidem-tazminati-hesaplama",
  },
  {
    slug: "mevduat-faizi-net-getiri-nasil-hesaplanir",
    title: "Mevduat Faizi Net Getiri Nasıl Hesaplanır?",
    description: "Ana para, yıllık brüt faiz, vade günü ve stopaj oranıyla mevduatın brüt faizini ve vade sonu net getirisini hesaplamayı öğrenin.",
    published: "2026-08-24",
    intro: "Bankanın ilan ettiği mevduat faizi genellikle yıllık brüt orandır. Hesabına geçecek net kazanç için vade süresi ve stopaj kesintisi de hesaba katılmalıdır.",
    sections: [
      ["Brüt faiz nasıl bulunur?", "Ana para, yıllık brüt faiz oranı ve vade günü birlikte kullanılır. Kısa vadede yıllık oranın yalnızca vade gününe karşılık gelen kısmı kazanılır."],
      ["Stopaj net getiriyi nasıl etkiler?", "Stopaj, brüt faiz kazancı üzerinden kesilir. Oran; mevduatın türüne, açılış veya yenileme tarihine ve vadeye göre değişebileceği için bankanın teklifinde yazan oranı kullan."],
      ["Vade sonu toplam tutar nedir?", "Ana paraya, stopaj düşüldükten sonra kalan net faiz eklenir. Vade sonunda hesabında görmeyi beklediğin yaklaşık toplam budur."],
      ["Teklifleri karşılaştırırken neye bakmalısın?", "Yalnızca ilan edilen faiz oranını değil; vade gününü, stopajı, hoş geldin oranının geçerlilik süresini ve vade sonu net tutarı birlikte karşılaştır."],
    ],
    tool: "mevduat-faizi-hesaplama",
  },
  {
    slug: "32-gunluk-mevduat-faizi-nasil-hesaplanir",
    title: "32 Günlük Mevduat Faizi Nasıl Hesaplanır?",
    description: "32 günlük vadeli mevduatta ana para, yıllık brüt faiz ve stopajla net kazanç ve vade sonu toplamın nasıl hesaplandığını öğrenin.",
    published: "2026-08-31",
    intro: "32 günlük mevduat getirisi, bankanın verdiği yıllık brüt oranın 32 güne düşen kısmıdır. Net kazanç için brüt faizden bankanın bildirdiği stopaj kesilir.",
    sections: [
      ["32 günlük brüt faiz formülü", "Ana para, yıllık brüt faiz oranı ve 32 gün çarpılır; sonuç 365 gün ve 100'e bölünür. Bankaların gün hesabı ve ürün koşulları farklılaşabildiği için teklif belgesini kontrol et."],
      ["Net getiri nasıl bulunur?", "Brüt faiz kazancından stopaj tutarı çıkarılır. Stopaj oranını varsaymak yerine bankanın ilgili mevduat için bildirdiği güncel oranı hesaplayıcıya yaz."],
      ["Vade sonu toplam nedir?", "Ana para ile net faiz kazancının toplamıdır. Bu rakam, vade bozulmadığı ve oranın teklif boyunca geçerli olduğu varsayımıyla hesaplanır."],
      ["Teklifleri nasıl karşılaştırmalısın?", "Aynı ana para ve 32 günü kullanarak farklı bankaların brüt oranlarını ayrı ayrı hesapla. Karar verirken net getiri kadar erken çekim, alt bakiye ve kampanya süresi koşullarına da bak."],
    ],
    tool: "mevduat-faizi-hesaplama",
  },
  {
    slug: "100-bin-tl-mevduat-getirisi-nasil-hesaplanir",
    title: "100 Bin TL Mevduat Getirisi Nasıl Hesaplanır?",
    description: "100.000 TL için bankanın verdiği yıllık faiz, seçtiğin vade ve stopaj oranıyla tahmini net mevduat getirisini hesaplayın.",
    published: "2026-08-31",
    intro: "100 bin TL'nin getirisi sabit değildir; bankanın sunduğu yıllık brüt faiz, vade günü ve stopaj oranına göre değişir. Bu nedenle güncel teklifteki rakamlarla hesap yapmak gerekir.",
    sections: [
      ["Hesap için hangi bilgiler gerekir?", "Ana para alanına 100.000 TL, faiz alanına bankanın yıllık brüt oranını, vade alanına paranın hesapta kalacağı günü ve stopaj alanına bankanın bildirdiği oranı gir."],
      ["Faiz oranı neden yıllıktır?", "Bankalar mevduat oranını genellikle yıllık brüt olarak sunar. Hesaplayıcı bu oranı seçtiğin gün sayısına oranlayarak vade kazancını tahmin eder."],
      ["Brüt ve net kazanç arasındaki fark", "Brüt kazanç kesinti öncesidir. Net kazanç, brüt faizden stopaj düşüldükten sonra kalan ve ana paraya eklenecek tahmini tutardır."],
      ["Sonuç neden banka teklifinden farklı olabilir?", "Valör, vade bozulması, kampanya süresi, alt ve üst bakiye sınırları ile bankanın gün hesabı sonucu etkileyebilir. Kesin tutar için bankanın vade sonu teklifini esas al."],
    ],
    tool: "mevduat-faizi-hesaplama",
  },
  {
    slug: "borclarimi-nasil-duzenlerim",
    title: "Borçlarımı Nasıl Düzenlerim? Adım Adım Başlangıç Rehberi",
    description: "Dağınık kredi kartı, kredi ve ek hesap borçlarını tek listede toplamak ve uygulanabilir bir aylık plan kurmak için sade rehber.",
    intro: "Borçları düzenlemenin ilk adımı daha fazla hesap yapmak değil, eksiksiz bir fotoğraf çekmektir. Tutarlar tek yerde olmadığında hangi ödemenin öncelikli olduğunu görmek zorlaşır.",
    sections: [
      ["1. Bütün borçları tek listeye yaz", "Her kart, kredi ve ek hesap için kalan borcu, aylık faiz oranını, asgari veya zorunlu ödemeyi ve son ödeme tarihini kaydet. Banka uygulamaları arasında gidip gelmek yerine aynı tarihli tek bir tablo kullan."],
      ["2. Bu ayın zorunlu tutarını ayır", "Toplam borç ile bu ay ödenmesi gereken tutar aynı şey değildir. Önce gecikmeyi önleyecek zorunlu ödemeleri, sonra ek ödeme için kullanabileceğin gerçek bütçeyi belirle."],
      ["3. Tek bir öncelik yöntemi seç", "Maliyeti azaltmak istiyorsan faiz oranı en yüksek borca, hızlı ilerleme hissi istiyorsan bakiyesi en küçük borca odaklan. Yöntemden daha önemlisi, her ay aynı sistemi uygulamaktır."],
      ["4. Haftalık beş dakikalık kontrol yap", "Yeni ekstreleri, yaptığın ödemeleri ve değişen tarihleri güncelle. Planın gerçek hayata uymadığını fark edersen tutarı değiştir; planı tamamen bırakma."],
    ],
    tool: "borc-odeme-plani",
    ilgiliRehberler: ["kredi-karti-borcu-yapilandirma", "kredi-karti-borcu-odenmezse-ne-olur"],
  },
  {
    slug: "kredi-karti-borcu-nasil-takip-edilir",
    title: "Kredi Kartı Borcu Nasıl Takip Edilir?",
    description: "Dönem borcu, asgari ödeme, son ödeme tarihi ve devreden bakiye kavramlarıyla kredi kartı borcunu düzenli takip etme rehberi.",
    intro: "Kredi kartı borcunu takip ederken yalnızca güncel bakiyeye bakmak yeterli değildir. Ekstre dönemi, son ödeme tarihi ve ödeme sonrası devreden tutar birlikte izlenmelidir.",
    sections: [
      ["Ekstre ile güncel borcu ayır", "Dönem borcu kesilmiş ekstrenin tutarıdır. Güncel borç ise ekstre kesildikten sonra yaptığın yeni harcamaları da içerebilir. Aylık planı ekstre tutarı üzerinden kur."],
      ["Dört bilgiyi birlikte kaydet", "Her kart için ekstre tarihi, son ödeme tarihi, dönem borcu ve bankanın bildirdiği asgari tutarı yaz. Kısmi ödeme yaptığında kalan tutarı da aynı dönemde güncelle."],
      ["Yeni harcamayı eski borçtan ayır", "Borç azalırken kartı kullanmaya devam etmek ilerlemeyi gizleyebilir. Mümkünse plan döneminde yeni harcamaları ayrı izle ve aylık net değişime bak."],
      ["Tek bir aylık özet kullan", "Tüm kartların toplam dönem borcu, toplam asgari ödemesi ve ödenen tutarı tek ekranda olduğunda gecikme riski ve gerçek ilerleme daha kolay görülür."],
    ],
    tool: "kredi-karti-asgari-odeme-hesaplayici",
    ilgiliRehberler: ["kredi-karti-faiz-oranlari-2026", "kredi-karti-borcu-odenmezse-ne-olur"],
  },
  {
    slug: "asgari-odeme-borcu-nasil-etkiler",
    title: "Asgari Ödeme Yapmak Borcu Nasıl Etkiler?",
    description: "Kredi kartında asgari ödeme tutarı, kalan borç ve faiz etkisini sade bir örnekle anlayın.",
    intro: "Asgari tutarı ödemek, bankanın bildirdiği son ödeme yükümlülüğünü karşılamaya yardımcı olur; ancak dönem borcunun tamamı kapanmadığı için kalan tutar maliyet oluşturmaya devam edebilir.",
    sections: [
      ["Asgari tutar nasıl belirlenir?", "BDDK'nın 1 Ekim 2026 tarihli kararında kart limiti 100 bin TL ve altındaki kartlar için dönem borcunun yüzde 20'si, bu sınırın üzerindeki kartlar için yüzde 40'ı esas alınır. Bankanın ekstrende bildirdiği tutar her zaman önceliklidir."],
      ["Kalan borç neden önemlidir?", "Asgari ödeme sonrası kalan bakiye sonraki döneme devreder. Uygulanacak oran bankaya, borç türüne ve güncel düzenlemelere göre değişebilir."],
      ["Ek ödeme neyi değiştirir?", "Asgari tutarın üzerindeki her ödeme ana bakiyeyi daha hızlı azaltabilir. Bunun etkisini değerlendirirken yeni harcamaları ve bankanın uyguladığı gerçek oranı da hesaba kat."],
      ["Hangi rakama güvenmelisin?", "Hesaplayıcılar planlama için tahmin sunar. Kesin asgari ödeme, faiz ve vergi tutarları için bankanın ekstresini ve güncel sözleşmeni esas al."],
    ],
    tool: "kredi-karti-asgari-odeme-hesaplayici",
    ilgiliRehberler: ["kredi-karti-faiz-oranlari-2026", "kredi-karti-borcu-odenmezse-ne-olur"],
  },
  {
    slug: "birden-fazla-bankadaki-borclar-nasil-yonetilir",
    title: "Birden Fazla Bankadaki Borçlar Nasıl Yönetilir?",
    description: "Farklı bankalardaki kart, kredi ve ek hesap borçlarını tek aylık düzende takip etmek için uygulanabilir yöntem.",
    intro: "Birden fazla bankayla çalışırken asıl zorluk borç sayısı değil, bilgilerin farklı ekranlarda kalmasıdır. Amaç bütün hesapları tek bir aylık karar tablosuna dönüştürmektir.",
    sections: [
      ["Ortak bir kesim tarihi fotoğrafı oluştur", "Bakiyeleri mümkün olduğunca aynı gün kaydet. Böylece bir bankadaki eski bakiye ile diğerindeki yeni bakiyeyi yanlış karşılaştırmazsın."],
      ["Tarihleri kronolojik sırala", "Son ödeme tarihlerini ayın günlerine göre diz. Gelir tarihinden önce ve sonra gelen ödemeleri görmek nakit akışını planlamayı kolaylaştırır."],
      ["Zorunlu ve isteğe bağlı ödemeyi ayır", "Tüm asgari veya taksit tutarları zorunlu katmandır. Bunun üzerindeki bütçeyi seçtiğin tek bir borca yönlendirerek ilerlemeyi daha okunur hale getir."],
      ["Aylık net değişimi izle", "Sadece yaptığın ödeme toplamına değil, ay başı ve ay sonu toplam borç farkına bak. Yeni harcamalar varsa bu fark gerçek ilerlemeyi daha iyi gösterir."],
    ],
    tool: "aylik-odeme-takvimi",
    ilgiliRehberler: ["kredi-karti-borcu-yapilandirma"],
  },
  {
    slug: "borc-kapatma-plani-nasil-hazirlanir",
    title: "Borç Kapatma Planı Nasıl Hazırlanır?",
    description: "Aylık bütçe, asgari ödemeler, faiz ve öncelik sırasıyla gerçekçi bir borç kapatma planı hazırlayın.",
    intro: "İyi bir borç kapatma planı en iyimser rakama değil, her ay sürdürülebilecek tutara dayanır. Planın temel girdileri toplam bakiye, zorunlu ödemeler, aylık maliyet ve ek ödeme bütçesidir.",
    sections: [
      ["Gerçek aylık bütçeyi belirle", "Barınma, fatura, gıda ve ulaşım gibi temel giderlerden sonra düzenli ayırabileceğin tutarı kullan. Tek seferlik iyimser bir rakam planı erken bozabilir."],
      ["Faiz veya kartopu yöntemini seç", "Faiz yöntemi en yüksek aylık oranlı borcu öne alır. Kartopu yöntemi ise en küçük bakiyeyi önce kapatarak daha erken tamamlanan kalemler oluşturur."],
      ["Kapanan borcun ödemesini devret", "Bir borç bittiğinde o kalem için ayırdığın tutarı harcamaya döndürmek yerine sıradaki borca ekle. Planı hızlandıran ana etki budur."],
      ["Planı her ekstrede yenile", "Faiz oranı, yeni harcama veya gelir değiştiğinde tahmini bitiş tarihi de değişir. Hesabı bir söz değil, güncellenen bir yol haritası olarak kullan."],
    ],
    tool: "borc-odeme-plani",
    ilgiliRehberler: ["kredi-karti-borcu-yapilandirma", "kredi-karti-borcu-odenmezse-ne-olur"],
  },
];

export const REHBER_KAYNAKLARI = {
  "2026-brut-net-maas-nasil-hesaplanir": [
    [GIB_VERGI_2026, "GİB 2026 gelir vergisi tarifesi"],
    [GIB_ASGARI_2026, "GİB 2026 asgari ücret kesintileri"],
    [SGK_2026, "SGK 2026 prime esas kazanç sınırları"],
  ],
  "2026-kidem-tazminati-nasil-hesaplanir": [
    [KIDEM_2026, "Çalışma Bakanlığı kıdem tazminatı tavanı"],
  ],
  "asgari-odeme-borcu-nasil-etkiler": [
    [BDDK_KAYNAK, "BDDK asgari ödeme kararı"],
    [TCMB_KAYNAK, "TCMB kredi kartı azami faiz oranları"],
  ],
  "kredi-karti-faiz-oranlari-2026": [
    [TCMB_KAYNAK, "TCMB · Kredi kartı işlemlerinde azami faiz oranları (Kasım 2026)"],
    [BDDK_KAYNAK, "BDDK · 11581 sayılı asgari ödeme kararı (1 Ekim 2026)"],
    [KANUN_5464, "5464 sayılı Banka Kartları ve Kredi Kartları Kanunu"],
    [KART_YONETMELIGI, "Banka Kartları ve Kredi Kartları Hakkında Yönetmelik"],
  ],
  "kredi-karti-borcu-yapilandirma": [
    [BDDK_YAPILANDIRMA_2026, "BDDK · 11366 sayılı yapılandırma kararı (29 Ocak 2026)"],
    [BDDK_BASIN_30_OCAK_2026, "BDDK · Basın açıklaması (30 Ocak 2026)"],
    [BDDK_YAPILANDIRMA_2024, "BDDK · 10972 sayılı yapılandırma kararı (26 Eylül 2024)"],
    [BDDK_KURUL_KARARLARI, "BDDK · Resmî Gazete'de yayımlanmayan kurul kararları"],
    [TCMB_KAYNAK, "TCMB · Azami faiz oranları ve yapılandırma referans oranı"],
    [BANKACILIK_KANUNU, "5411 sayılı Bankacılık Kanunu (Risk Merkezi, ek madde 1)"],
    [EDEVLET_RISK_RAPORU, "e-Devlet · Risk Merkezi raporu başvurusu"],
  ],
  "kredi-karti-borcu-odenmezse-ne-olur": [
    [KANUN_5464, "5464 sayılı Banka Kartları ve Kredi Kartları Kanunu"],
    [KART_YONETMELIGI, "Banka Kartları ve Kredi Kartları Hakkında Yönetmelik"],
    [TCMB_KAYNAK, "TCMB · Kredi kartı azami faiz oranları"],
    [BANKACILIK_KANUNU, "5411 sayılı Bankacılık Kanunu (Risk Merkezi, ek madde 1)"],
    [ICRA_IFLAS_KANUNU, "2004 sayılı İcra ve İflas Kanunu"],
    [BORCLAR_KANUNU, "6098 sayılı Türk Borçlar Kanunu (zamanaşımı)"],
    [ANAYASA, "Türkiye Cumhuriyeti Anayasası (madde 38)"],
    [EDEVLET_ICRA_DOSYASI, "e-Devlet · İcra dosyası sorgulama"],
    [EDEVLET_RISK_RAPORU, "e-Devlet · Risk Merkezi raporu başvurusu"],
  ],
};

export const REHBER_UYARILARI = {
  "2026-brut-net-maas-nasil-hesaplanir": "Bu içerik genel bilgilendirme amaçlıdır. Kesin tutar için işvereninin hazırladığı maaş bordrosunu esas al.",
  "2026-kidem-tazminati-nasil-hesaplanir": "Bu içerik genel bilgilendirme amaçlıdır. Hak kazanma durumu ve kesin tutar için çalışma kayıtlarını ve güncel mevzuatı esas al.",
  "mevduat-faizi-net-getiri-nasil-hesaplanir": "Bu içerik genel bilgilendirme amaçlıdır. Kesin getiri ve kesinti için bankanın güncel teklifini esas al.",
  "32-gunluk-mevduat-faizi-nasil-hesaplanir": "Bu içerik genel bilgilendirme amaçlıdır. Kesin getiri ve kesinti için bankanın güncel teklifini esas al.",
  "100-bin-tl-mevduat-getirisi-nasil-hesaplanir": "Bu içerik genel bilgilendirme amaçlıdır. Kesin getiri ve kesinti için bankanın güncel teklifini esas al.",
};

export function rehberBul(slug) {
  return REHBERLER.find((rehber) => rehber.slug === slug);
}

// "2026-11-03" -> "3 Kasım 2026". Tarih UTC okunur; saat dilimi günü kaydırmaz.
export function guncellemeTarihiMetni(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
