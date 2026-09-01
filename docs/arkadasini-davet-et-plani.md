# Arkadaşını davet et — ürün ve teknik plan

## Hedef

Bir Borcama kullanıcısının kişisel davet bağlantısıyla gelen yeni kullanıcı e-posta adresini doğruladığında iki hesaba da 30 gün Borcama Pro kazandırmak.

Kullanıcıya verilecek söz:

> Arkadaşın davet bağlantınla Borcama'ya kaydolup e-posta adresini doğruladığında ikiniz de 30 gün ek Borcama Pro kazanırsınız.

## Ödülün ne zaman verilmesi gerekir?

- Davet bağlantısına tıklamak veya yalnız kayıt formunu göndermek ödül için yeterli değildir.
- Yeni kullanıcı e-posta adresini doğruladığında davet başarıya dönüşür.
- Aynı davet için davet eden ve davet edilen kullanıcıya yalnız birer ödül yazılır.
- Ödül süresi sistemde belirsiz bir takvim ayı yerine tam 30 gün olarak tutulur.

## Kullanıcı durumlarına göre ödül

| Kullanıcı durumu | 30 günlük ödülün uygulanması |
|---|---|
| Aktif Pro denemesi | Mevcut deneme bitiş tarihine 30 gün eklenir. |
| Denemesi bitmiş veya Ücretsiz | Doğrulama anından başlayan 30 günlük Pro erişimi açılır. |
| Aktif ücretli Pro | Ödül bekleyen hak olarak saklanır; ücretli erişim sona erdiğinde 30 gün olarak devreye girer. |
| Pro erişimi yönetici tarafından kaldırılmış | Otomatik ödül verilmez; CRM incelemesine düşer. |

Ücretli aboneliğin Paddle/RevenueCat yenileme tarihini referans ödülü nedeniyle değiştirmemek gerekir. Böylece ödeme sağlayıcısıyla Borcama hakkı çelişmez.

## Kullanıcı akışı

1. Ayarlar ve Pro ekranında **Arkadaşını davet et** kartı görünür.
2. Kullanıcı kişisel bağlantısını kopyalar veya telefonun paylaşım menüsüyle gönderir.
3. Arkadaş bağlantıyı açtığında sade bir mesaj görür: **Davetle geldin. E-postanı doğruladığında ikiniz de 30 gün Pro kazanacaksınız.**
4. Referans kodu kayıt boyunca korunur; Google Analytics'e, Google Ads'e veya üçüncü taraf servislere gönderilmez.
5. Arkadaş e-posta adresini doğruladığında backend iki ödülü tek işlemde oluşturur.
6. İki kullanıcı da uygulama içi başarı mesajı ve e-posta alır.
7. Davet eden kullanıcı kartta ödülün durumunu **Bekliyor**, **Kazanıldı** veya **İncelemede** olarak görür. Arkadaşın e-posta adresi gösterilmez.

## Veri modeli

### `referral_codes`

- `user_id`: Kodu oluşturan kullanıcı; kullanıcı başına tek aktif kod.
- `code`: Tahmin edilmesi zor, kısa ve benzersiz kod.
- `status`: `active`, `paused` veya `revoked`.
- `created_at`, `updated_at`.

### `referrals`

- `referrer_user_id`: Davet eden kullanıcı.
- `invitee_user_id`: Davet edilen kullanıcı; tek bir davet edene bağlanabilir.
- `referral_code_id`.
- `status`: `registered`, `verified`, `rewarded`, `review`, `rejected`.
- `attributed_at`, `verified_at`, `rewarded_at`.
- `rejection_reason`: Yalnız yönetim ekranında görünür.

Kısıtlar:

- `invitee_user_id` benzersizdir.
- Kullanıcı kendini davet edemez.
- Aynı kullanıcı çifti ikinci kez ödül üretemez.
- Davet ilişkisi e-posta doğrulamasından sonra değiştirilemez.

### `referral_rewards`

- `referral_id`, `user_id`, `role`: `referrer` veya `invitee`.
- `days`: İlk sürümde 30.
- `status`: `pending`, `active`, `applied`, `review`, `revoked`.
- `starts_at`, `ends_at`, `applied_at`.

Her `referral_id + user_id` çifti benzersiz olur. Ödül defteri silinmez; geri alma gerekiyorsa yeni durum ve işlem kaydı yazılır.

## Backend akışı

- Referans kodu oluşturma ve durum sorgulama yalnız oturum açmış kullanıcıya açık bir Edge Function üzerinden yapılır.
- Kayıt sırasında kod `raw_user_meta_data` içinde taşınır; doğrulama anında sunucu tarafından gerçek ve aktif bir koda karşı doğrulanır.
- Mevcut `start_borcama_trial_after_confirmation` akışı davet ödülünü de tek veritabanı işlemi içinde yönetecek şekilde genişletilir.
- Önce yeni kullanıcının temel 30 günlük denemesi başlatılır, ardından iki ödül satırı idempotent biçimde oluşturulur.
- Aktif denemedeki kullanıcıların `trial_ends_at` tarihi mevcut bitişten 30 gün uzatılır.
- Süresi uzatılan kullanıcı için daha önce gönderilmiş üç gün kala hatırlatması sıfırlanır; yeni bitişe göre tekrar gönderilebilir.
- Aktif ücretli kullanıcı ödülü bekletilir ve ücretli hak sona erdiğinde entitlement kontrolü sırasında devreye alınır.

## Kötüye kullanım önlemleri

- Ödül yalnız doğrulanmış yeni hesap için verilir.
- Kullanıcı kendisini davet edemez ve davet edilen hesap sonradan başka davetçiye taşınamaz.
- IP adresi veya cihaz parmak izi toplamadan, gizlilik dostu kurallarla başlanır.
- Bir davet eden için ayda ilk üç doğrulanmış davet otomatik ödüllendirilir; sonraki başarılı davetler CRM incelemesine düşer. Bu sınır yönetim ayarı olmalıdır.
- Kapatılmış, engellenmiş veya yönetici tarafından Pro hakkı kaldırılmış hesaplar otomatik ödül alamaz.
- CRM'de davet ve ödül defteri görünür; iptal işlemi geçmişi silmez.

## Arayüzler

### Borcama

- Ayarlar ve Pro alanında davet kartı.
- Bağlantıyı kopyala ve paylaş butonları.
- Kaç davetin beklediği ve kaç gün kazanıldığı.
- Başarılı davet sonrası kutlama mesajı.

### CRM

- Toplam davet bağlantısı, kayıt, doğrulama ve verilen Pro günü KPI'ları.
- Davet eden–davet edilen ilişkisi ve ödül durumu.
- İncelemeye alınan kayıtları onaylama veya reddetme.
- Kullanıcı detayında kazanılan referans ödülleri.

### E-posta

- Davet eden: **Arkadaşın katıldı, 30 gün Pro kazandın.**
- Davet edilen: **Davet ödülün hazır: Pro sürene 30 gün eklendi.**
- E-postalarda arkadaşın e-posta adresi veya finansal bilgisi gösterilmez.

## Ölçüm

Ürün olayları:

- `referral_link_created`
- `referral_link_shared`
- `referral_signup_started`
- `referral_email_verified`
- `referral_reward_granted`

GA4'e yalnız olay adı ve genel kaynak bilgisi gönderilir. Referans kodu, kullanıcı kimliği ve e-posta gönderilmez. CRM'de bağlantı açılışı, kayıt, doğrulama ve ödül hunisi ayrı sayılır.

## Yayın sırası

1. Veritabanı tabloları, kısıtlar ve ödül fonksiyonu.
2. Referans kodu oluşturma ve kayıt sırasında ilişkilendirme.
3. Ayarlar/Pro davet kartı ve davet landing durumu.
4. Ödül e-postaları ve CRM görünümü.
5. Birim testleri, iki ayrı gerçek test hesabıyla uçtan uca doğrulama.
6. Özellik bayrağıyla önce yönetici hesabına, sonra küçük kullanıcı grubuna açma.
7. Davet doğrulama oranı, verilen toplam Pro günü ve kötüye kullanım kayıtlarını izledikten sonra herkese açma.

## Kabul kriterleri

- Aynı davet iki kez işlense bile iki kullanıcıya ikinci ödül yazılmaz.
- Davet edilen kullanıcı e-postasını doğrulamadan kimse Pro günü kazanmaz.
- Aktif denemenin sonuna tam 30 gün eklenir; kalan gün kaybolmaz.
- Giriş/kayıt sırasında referans kodu kaybolmaz.
- Ücretli Pro aboneliğinin Paddle/RevenueCat yenileme tarihi değiştirilmez.
- Referral kodu ve kullanıcı tanımlayıcıları Google ölçümüne gönderilmez.
- CRM'de her ödülün nedeni, tarihi ve durumu denetlenebilir.

