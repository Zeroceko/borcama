# Borcama değişiklik günlüğü

Borcama'nın kullanıcıya, yönetime ve entegrasyonlara yansıyan değişiklikleri bu dosyada tutulur. Sürümleme [SemVer](https://semver.org/lang/tr/) düzenini izler.

## Unreleased

### Eklendi

- Henüz yayımlanmamış değişiklik yok.

### Değiştirildi

- Yenilik e-postası teknik ve ikincil ayrıntılar yerine ekstre arşivi, taksit dağılımı, borç kapatma planı ve sadeleşen ana ekranlar gibi kullanıcıların doğrudan görebileceği önemli geliştirmeleri anlatacak şekilde yenilendi.

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

[1.35.0]: https://github.com/Zeroceko/borcama/releases/tag/v1.35.0
[1.34.0]: https://github.com/Zeroceko/borcama/releases/tag/v1.34.0
[1.33.1]: https://github.com/Zeroceko/borcama/releases/tag/v1.33.1
[1.33.0]: https://github.com/Zeroceko/borcama/releases/tag/v1.33.0
[1.32.0]: https://github.com/Zeroceko/borcama/releases/tag/v1.32.0
