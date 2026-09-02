# Google Ads ve GA4 ölçüm planı

Bu belge Borcama'nın reklam hunisindeki olayların ne zaman, nereye ve hangi veriyle gönderileceğini tanımlar. E-posta adresi, banka/borç bilgisi, borç türü, tutar veya kullanıcı tarafından girilen başka bir finansal veri Google'a gönderilmez. CRM ve yönetim sayfaları ölçülmez ve reklam hedefi yapılmaz.

## Dönüşüm matrisi

| Huni adımı / olay | Tetiklenme koşulu | Hedef platform | Tekilleştirme | Test planı |
| --- | --- | --- | --- | --- |
| `landing_visit` | Ziyaretçi herkese açık landing sayfasını ilk kez görüntüler | Birinci taraf Supabase hunisi | Oturum kimliği + olay adı için tek kayıt | Yeni izole tarayıcı oturumunda bir kez oluştuğunu doğrula; GA4 dönüşümü sayma |
| `register_view` | Kayıt ekranı açılır | Birinci taraf Supabase hunisi | Oturum kimliği + olay adı için tek kayıt | Aynı oturumda sayfayı yenileyerek ikinci kayıt oluşmadığını doğrula |
| `sign_up` | Borcama kayıt metadatasına sahip kullanıcı e-postasını doğrulayıp ilk doğrulanmış oturumu açar | GA4 ve Google Ads “Borcama - Hesap Kaydı” | Kayıt başında üretilen, kullanıcı kimliğinden bağımsız olay kimliğiyle tarayıcıda tek gönderim; Ads `transaction_id` | Test hesabıyla GA4 DebugView ve Tag Assistant'ta bir kez doğrula; test tarihini/hesabı performans raporundan hariç tut |
| `email_verified` | Kullanıcının `email_confirmed_at` alanı dolu olan ilk doğrulanmış oturumu | GA4 | Kayıt olay kimliğinden türetilen ayrı doğrulama olay kimliği | DebugView'da e-posta veya kullanıcı finansal verisi taşımadığını doğrula; key event yapmadan önce canlı akışı gözle |
| `trial_started` | Yetkilendirme servisi `trialActive=true` ve `trialStartedAt` döndürür | GA4 | Kullanıcı kayıt kimliği + deneme başlangıç zamanı, yalnız yerel tekilleştirme anahtarı olarak | Test kullanıcısında bir kez doğrula; Ads'e aktarma ve key event yapma kararı canlı veri geldikten sonra verilsin |
| `purchase` | RevenueCat gerçek ortamda etkin Pro hakkı ve işlem kimliği döndürür | GA4 ve Google Ads “Borcama - Pro Abonelik” | RevenueCat işlem kimliği; tarayıcıda ve Ads `transaction_id` ile tekilleştirme | Sandbox işlemlerinin hiç gönderilmediğini otomatik testle doğrula; gerçek düşük riskli işlemi DebugView/Ads tanılamada doğrula |
| `first_debt_added` | Kullanıcı ilk borcunu ekler | Google'a gönderilmez | Uygulanmaz | Kodda olay çağrısı ve bekleyen eski kuyruğun kaldırıldığını doğrula |
| `page_view` | Ölçüm izni verilmiş ziyaretçi yönetim dışı bir sayfa açar veya SPA içinde gezinir | GA4 | GA4 oturum/olay işleme | `code`, `token`, `email`, hash ve benzeri hassas değerlerin temizlendiğini; yalnız izinli kampanya parametrelerinin kaldığını otomatik testle doğrula |

## Veri ve izin kuralları

- Google etiketi yalnız kullanıcı ölçüm izni verdiğinde yüklenir; `ad_user_data` ve `ad_personalization` daima reddedilir.
- Enhanced Conversions kullanılmaz; e-posta veya başka bir kullanıcı verisi hash'lenmiş olsa dahi Google'a gönderilmez.
- Google Signals ve reklam kişiselleştirme sinyalleri kapalıdır; Ads veri redaksiyonu açıktır.
- İzinli URL parametreleri: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `gbraid`, `wbraid`, `plan`.
- Test/sandbox satın almaları canlı dönüşüm olarak gönderilmez. Tag Assistant ve GA4 DebugView kontrolleri test kanıtı olarak ayrıca kaydedilir; üretim performansına katılmaz.

## UTM standardı

Google Ads otomatik etiketleme açık tutulur. Manuel UTM gereken reklamlarda şu biçim kullanılır:

- `utm_source=google`
- `utm_medium=cpc`
- `utm_campaign=tr_pmax_borcama`
- `utm_content={campaignid}_{creative}_{device}`
- `utm_term={keyword}` yalnız anahtar kelime bulunan kampanyalarda

İlk ziyaret kaynağı `gclid`, `gbraid` veya `wbraid` ile birlikte birinci taraf oturumunda tutulur. Bu tıklama kimlikleri kullanıcı profili, e-posta veya finansal verilerle Google'a geri gönderilmez.

## Kullanıcı bazında kaynak görünümü

- GA4 ve Google Ads toplu, anonim performans ölçümü içindir; CRM'de bir kullanıcıyı GA4 kimliğiyle arama yapılmaz.
- Kayıt anındaki ilk temas `source`, `medium`, `campaign`, `content`, `term` ve plan tercihi olarak Supabase Auth metadatasına yazılır.
- CRM yalnız yönetici kullanıcı detayında bu alanları gösterir. Ham `gclid`, `gbraid` ve `wbraid` hiçbir yönetim ekranında gösterilmez.
- Analytics ekranı aynı birinci taraf kaynak bilgisiyle ziyaret → kayıt ekranı → hesap → doğrulama sayılarını kaynak bazında karşılaştırır.
- Bu mimari “hangi kullanıcı hangi kampanyadan geldi?” sorusunu Google'a e-posta, kullanıcı kimliği veya finansal veri göndermeden yanıtlar.

## Canlıya alma kontrolü

1. GA4 ile doğru Google Ads müşteri hesabı bağlantısı tamamlanır.
2. `sign_up` ve gerçek `purchase` olayları Tag Assistant, DebugView ve Ads tanılama ekranında ayrı ayrı doğrulanır.
3. Ads'te kayıt dönüşümü “Bir”, satın alma dönüşümü “Bir” sayım ayarına alınır; deneme olayı yeterli veri görülmeden birincil hedef yapılmaz.
4. Test hesapları ve sandbox işlemleri performans raporlarından hariç tutulur.
5. Kampanya ancak finansal hizmet sınıflandırma incelemesi sonuçlandıktan, negatif kelimeler ve landing bağlantıları kontrol edildikten sonra ayrıca onayla etkinleştirilir.

## 2 Eylül 2026 hesap denetimi

- GA4 veri akışı `G-98HWSTTPDM` aktif görünmektedir; ancak GA4 mülkü ile Google Ads hesabı henüz bağlı değildir.
- Ads'teki “Borcama - Hesap Kaydı” ve “Borcama - Pro Abonelik” dönüşümleri hatalı yapılandırılmış görünmekte ve canlı dönüşüm almamaktadır.
- Ads otomatik etiketleme açıktır; en az bir `google / cpc` oturumu GA4'e ulaşmıştır.
- GA4 gelişmiş ölçümde URL sorgu parametresi redaksiyonu ayrıca etkinleştirilmeli; özel Borcama `page_view` temizliği otomatik olayların tamamını kapsadığı varsayılmamalıdır.
- Bağlantı kurulduğunda doğrudan Ads dönüşümü ile GA4 içe aktarması aynı hedef için birlikte birincil yapılmamalı; her sonuçta tek kanonik birincil dönüşüm seçilmelidir.
