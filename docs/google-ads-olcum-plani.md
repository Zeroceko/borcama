# Google Ads ve GA4 ölçüm planı

Bu belge Borcama'nın reklam hunisindeki olayların ne zaman, nereye ve hangi veriyle gönderileceğini tanımlar. E-posta adresi, banka/borç bilgisi, borç türü, tutar veya kullanıcı tarafından girilen başka bir finansal veri Google'a gönderilmez. CRM ve yönetim sayfaları ölçülmez ve reklam hedefi yapılmaz.

## Dönüşüm matrisi

| Huni adımı / olay | Tetiklenme koşulu | Hedef platform | Tekilleştirme | Test planı |
| --- | --- | --- | --- | --- |
| `landing_visit` | Ziyaretçi herkese açık landing sayfasını ilk kez görüntüler | Birinci taraf Supabase hunisi | Oturum kimliği + olay adı için tek kayıt | Yeni izole tarayıcı oturumunda bir kez oluştuğunu doğrula; GA4 dönüşümü sayma |
| `register_view` | Kayıt ekranı açılır | Birinci taraf Supabase hunisi | Oturum kimliği + olay adı için tek kayıt | Aynı oturumda sayfayı yenileyerek ikinci kayıt oluşmadığını doğrula |
| `sign_up` | Borcama kayıt metadatasına sahip kullanıcı e-postasını doğrulayıp ilk doğrulanmış oturumu açar | GA4 ve Google Ads “Borcama - Hesap Kaydı” | Kullanıcı kayıt kimliğiyle tarayıcıda tek gönderim; Ads `transaction_id` | Test hesabıyla GA4 DebugView ve Tag Assistant'ta bir kez doğrula; test tarihini/hesabı performans raporundan hariç tut |
| `email_verified` | `sign_up` ile aynı doğrulanmış oturum | GA4 | `sign_up` ile aynı kullanıcı bazlı anahtar | DebugView'da e-posta veya kullanıcı finansal verisi taşımadığını doğrula; key event yapmadan önce canlı akışı gözle |
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

## Canlıya alma kontrolü

1. GA4 ile doğru Google Ads müşteri hesabı bağlantısı tamamlanır.
2. `sign_up` ve gerçek `purchase` olayları Tag Assistant, DebugView ve Ads tanılama ekranında ayrı ayrı doğrulanır.
3. Ads'te kayıt dönüşümü “Bir”, satın alma dönüşümü “Bir” sayım ayarına alınır; deneme olayı yeterli veri görülmeden birincil hedef yapılmaz.
4. Test hesapları ve sandbox işlemleri performans raporlarından hariç tutulur.
5. Kampanya ancak finansal hizmet sınıflandırma incelemesi sonuçlandıktan, negatif kelimeler ve landing bağlantıları kontrol edildikten sonra ayrıca onayla etkinleştirilir.
