# 14 günlük yaşam döngüsü aktivasyon sprinti

Bu belge kampanya gönderim onayı değildir. Amaç, doğrulanmış fakat ilk değere ulaşmamış kullanıcıyı en fazla üç davranışa dayalı mesajla borç/ekstre → gelir → ilk hareket akışına taşımaktır.

## Segment görünümü

Canlı `v1.37.0` verisinden 2 Eylül 2026 22:46 TRT kontrolü:

| Segment | Kullanıcı | Tanım |
|---|---:|---|
| Doğrulanmamış | 0 | E-posta doğrulaması tamamlanmamış hesap |
| Doğrulanmış, borç/ekstre yok | 12 | Doğrulanmış; borç/ekstre verisi bulunmuyor |
| Borç var, gelir yok | 3 | Borç/ekstre verisi var; pozitif gelir kaydı yok |
| Plan oluşmuş | 4 | Borç + gelir + ilk ödeme/harcama hareketi tamamlanmış aktivasyon proxy'si |
| 7 gündür dönmemiş | 18 | Doğrulanmış; son giriş yok veya son girişten en az 7 gün geçmiş |

Segmentler davranış sinyallerine göre örtüşebilir; 7 gündür dönmeyenler ayrı bir geri kazanım katmanıdır. Bu sorguda 21 hesabın tamamı doğrulanmış, 19 hesabın veri kaydı vardır.

## Canlı cadence (tekil ve davranış durdurmalı)

Doğrulama e-postası bu sayaca dahil değildir. `trial-started` doğrulama sonrası 5–15 dakika içinde yalnızca bir kez gönderilen transactional karşılama mesajıdır. Kullanıcı 48 saat boyunca login/activity üretmezse `trial-first-plan-reminder` yalnızca bir kez gönderilir; herhangi bir activity bunu kalıcı olarak bastırır.

İlk 7 gün e-posta yerine uygulama içi yönlendirme kullanılır. E-posta gerekiyorsa 7. günden sonra yalnızca en yüksek öncelikli eksik adıma göre tek mesaj seçilir: `no_debt` → `debt_no_income` → `first_activity`. Bu üç durum birbirini dışlar; aynı kullanıcıya aynı anda üç mesaj gönderilmez. Eksik-adım mesajından önce en az 72 saat, tüm mesajlar arasında en az 48 saat bırakılır. İlk 14 günde (doğrulama hariç) üst sınır üç lifecycle e-postasıdır.

### Mesaj 1 — Borç/ekstre adımı

- Hedef: 7. günden sonra seçilen tek öncelikli eksik adım.
- Zaman: İlk 7 gün uygulama içi; gerekiyorsa 7. günden sonra tek mesaj.
- Konu taslağı: `Borcama'da ilk adımın hazır`
- Önizleme: `Bir kartını veya borcunu ekle; ödeme tarihlerini ve önceliklerini tek yerde gör.`
- CTA: Borçlar ekranı.
- UTM: `utm_source=resend&utm_medium=email&utm_campaign=activation_sprint_2026_09&utm_content=no_debt`

### Mesaj 2 — Gelir adımı

- Hedef: Öncelik sırasındaki ikinci eksik adım; yalnızca tek seçim.
- Zaman: İlk 7 gün e-posta yok; 7. günden sonra ve son Borcama e-postasından en az 72 saat sonra.
- Konu taslağı: `Aylık ödeme gücünü birlikte netleştirelim`
- Önizleme: `Gelirini eklediğinde zorunlu ödemelerden sonra kalan alanı daha gerçekçi görebilirsin.`
- CTA: Gelir ekranı.
- UTM: `utm_source=resend&utm_medium=email&utm_campaign=activation_sprint_2026_09&utm_content=debt_no_income`

### Mesaj 3 — İlk değer veya geri dönüş adımı

- Hedef: Öncelik sırasındaki üçüncü eksik adım; yalnızca tek seçim.
- Zaman: 7. günden sonra, önceki 72 saatte Borcama e-postası almamışsa; ilk hareket yapıldığında bastırılır.
- Konu taslağı: `İlk planını tamamlamak için son bir adım`
- Önizleme: `Bir ödeme ya da harcama kaydettiğinde aylık planın kişisel kayıtlarına dayanır.`
- CTA: Ödemeler veya Harcamalar ekranı.
- UTM: `utm_source=resend&utm_medium=email&utm_campaign=activation_sprint_2026_09&utm_content=first_activity`

Planı oluşmuş 4 kullanıcı bu akıştan çıkarılır; onlara aktivasyon yardımı değil, ürün geri bildirimi veya referans iletişimi ayrı bir kampanya olarak planlanabilir.

## Gönderim güvenliği ve ölçüm

- Hariç liste: doğrulanmamış hesaplar; iletişimden çıkma metadatası; geçmiş `bounced` veya `complained` teslimat; ilgili kampanyada daha önce gönderim; silinmiş/bloke hesaplar; planı oluşmuş kullanıcılar.
- Her kullanıcıda ilk 14 günde (doğrulama hariç) en fazla üç lifecycle mesajı; `trial-started` + no-login reminder + gerekirse tek eksik-adım mesajı. Aktivasyon tamamlanınca seri derhal durur.
- Gönderen: `Borcama <zero@borcama.com>`; konu ve önizleme test gönderiminden sonra sabitlenir.
- Test: Önce `ozerocek@gmail.com` adresine segment başına bir test gönderimi; masaüstü/mobil önizleme, ana CTA ve oturum açmamış yönlendirme kontrolü yapılır. Test teslimatı toplu kampanya metriğine dahil edilmez.
- Ölçüm: Resend teslim/bounce/complaint, açılma ve tıklama; Borcama dönüşü; 7 gün içinde aktivasyon proxy'si (borç + gelir + ilk hareket). Finansal sonuç veya aktivasyon artışı garanti edilmez; kontrol grubu olmadan nedensel etki ilan edilmez.
- Toplu gönderim için Yönetim Kurulu Başkanı'nın son onayı gerekir; bu belge gönderim yetkisi vermez.

## Sonraki adım

Kampanya şablonları ve lifecycle hedefleme, ana koordinasyon tarafından canlı ürün ve mevcut ölçüm sözlüğüyle eşleştirildikten sonra hazırlanmalı; kullanıcı onayı ve test gönderimi olmadan gönderim yapılmamalıdır.
