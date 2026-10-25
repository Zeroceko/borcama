# Borcama iOS App Store gönderim kaydı

## Ürün kararı

- Uygulama adı: `Borcama`
- Alt başlık: `Borç ve bütçe takibi`
- Birincil kategori: Finans
- Pazarlama URL'i: `https://borcama.com`
- Destek URL'i: `https://borcama.com/faq`
- Gizlilik URL'i: `https://borcama.com/privacy`
- Telif: `© 2026 Borcama`

## Açıklama

Borcama; kredi kartı, kredi, ek hesap, gelir, gider, ödeme ve varlıklarını tek yerde görmeni sağlayan kişisel finans takip uygulamasıdır.

Yaklaşan ödemelerini ve aylık yükünü takip et, kart ekstrelerini cihazında ayrıştır, borç planını kendi kayıtlarına göre incele. Ham ekstre dosyan Borcama sunucularına yüklenmez; ayrıştırma cihazında yapılır ve yalnız senin onayladığın kayıtlar hesabına kaydedilir.

Ücretsiz hesapla başlayabilir, ilk 30 günlük Pro erişimini kart bilgisi vermeden kullanabilirsin. Pro aboneliği iOS'ta App Store üzerinden yönetilir ve aynı Borcama hesabında web ile birlikte çalışır.

Borcama kredi vermez, krediye aracılık etmez ve yatırım danışmanlığı sunmaz. Hesaplamalar kullanıcının girdiği bilgilere dayanır.

## Anahtar kelimeler

`borç,bütçe,kredi kartı,ödeme,gelir,gider,ekstre,finans,borç planı`

## Ekran görüntüsü planı

6,9 inç ve 6,5 inç iPhone setlerinde aynı beş akış gösterilir:

1. Bugün: toplam borç, yaklaşan ödeme ve aylık durum.
2. Borçlar: kart, kredi ve ek hesapların anlaşılır listesi.
3. Ödemeler: yaklaşan ve tamamlanan ödeme takvimi.
4. Ekstre: cihazda işleme ve kategori kontrolü.
5. Borç Planı: kullanıcının kendi kayıtlarından oluşturulan plan.

Görüntüler gerçek kullanıcı verisi içermez. Temsili tutarlar kullanılır. Görsel üstü kısa metin kullanılabilir; ekranın gerçek ürünü incelemeyi engelleyecek kaplama kullanılmaz.

## Yaş derecelendirmesi

Uygulamada şiddet, cinsellik, kumar, kullanıcı üretimli kamusal içerik, kontrolsüz web erişimi veya madde kullanımı içeriği yoktur. Finansal takip ve abonelik bulunur. App Store Connect soruları gönderim gününde güncel ürün davranışına göre yeniden yanıtlanır.

## App Privacy envanteri

| Veri | Toplanıyor | Amaç | Kimliğe bağlı | Tracking |
|---|---|---|---|---|
| E-posta adresi | Evet | Hesap, giriş ve destek | Evet | Hayır |
| Supabase kullanıcı kimliği | Evet | Hesap, veri erişimi ve abonelik eşleme | Evet | Hayır |
| Borç, gelir, gider ve onaylanmış ekstre kayıtları | Evet | Uygulama işlevi | Evet | Hayır |
| Ham ekstre PDF'i | Hayır | Cihazda geçici olarak ayrıştırılır | Hayır | Hayır |
| Kart/ödeme bilgisi | Hayır | Apple tarafından işlenir | Hayır | Hayır |
| Satın alma ve abonelik geçmişi | Evet | Pro hakkı ve restore | Evet | Hayır |
| Ürün kullanım olayları | Evet | Ürün işlevi ve toplu ürün analizi | Evet | Hayır |
| Google Analytics / Google Ads verisi | Native uygulamada hayır | Native kabukta etiket yüklenmez | Hayır | Hayır |
| Çökme verisi | Evet | Hata giderme | Hayır | Hayır |
| Reklam kimliği / IDFA | Hayır | Kullanılmıyor | Hayır | Hayır |

Sentry olaylarında hata metni, breadcrumb, oturum, IP, e-posta ve finansal içerik gönderilmez. RevenueCat ve diğer üçüncü taraf SDK manifestleri Xcode arşivindeki birleşik privacy report ile ayrıca doğrulanır; App Store Connect beyanı bu raporla eşleştirilmeden gönderim yapılmaz.

## Ödeme hatırlatması kuralı

- Hatırlatma yalnız kullanıcı Ayarlar'dan açıkça açarsa kurulur.
- Kart için önce `sonOdemeTarihi` kullanılır. Bu alan yoksa ekstre dönemi, `kesimGunu` ve `sonOdemeGunu` ile mevcut ürün hesabındaki aynı kurala göre tarih üretilir. `kesimGunu` tek başına ödeme tarihi değildir.
- Kredi için kayıtlı taksit planındaki gerçek sıradaki ödeme tarihi kullanılır.
- Bildirim ödeme tarihinden bir gün önce yerel saatle 09:00'da gösterilir.
- Aynı güne denk gelen ödemeler tek bildirimde gruplanır.
- Kilit ekranında tutar, banka, kart son hanesi veya borç türü gösterilmez. Metin: `Yarın için kayıtlı ödemen var. Ayrıntıları Borcama'da kontrol et.`
- Bildirim cihazda hesaplanır; finansal içerik push servisine gönderilmez.

## Offline kararı

İlk App Store sürümünde çevrimdışı okuma veya yazma yoktur. Bağlantı kesildiğinde boş ya da sıfır finansal ekran gösterilmez; uygulama bağlantının gerekli olduğunu ve kayıtların silinmediğini açıklayan engelleyici durum gösterir. Local-first senkronizasyon ayrı bir ürün hedefi olmadan eklenmez.

## Gönderim kapıları

- AASA canlıda doğrudan `200` ve `application/json` dönmeli.
- Associated Domains capability imzalı build içinde `applinks:borcama.com` içermeli.
- Magic link ve parola sıfırlama gerçek cihazda uygulamaya dönmeli.
- Supabase Redirect URLs canlı panelde kaynak yapılandırmasıyla eşleşmeli.
- RevenueCat webhook authorization, HMAC imzası ve iOS `app_id` değeri doğrulanmalı; sandbox olayı canlı hak vermemeli.
- Satın alma, yenileme, iptal, sona erme, iade ve restore TestFlight sandbox'ta denenmeli.
- Xcode privacy report ile bu envanter ve App Store Connect formu karşılaştırılmalı.
- İade metni Türkiye tüketici mevzuatı açısından hukukçu tarafından son kez incelenmeli.
