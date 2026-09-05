# Borcama ürün yol haritası

Bu dosya departmanların ortak öncelik kaynağıdır. Bir departman yeni işe başlamadan önce burada çakışan veya daha yüksek öncelikli iş olup olmadığını kontrol eder.

60 günlük şirket hedefi ve ekip işletim modeli için `docs/sirket-isletim-sistemi.md` esas alınır. Aktif sprint işleri bu hedefe hizmet etmiyorsa başlatılmaz.

Yönetim Kurulu Başkanı “roadmap'e bakalım” dediğinde yalnızca aktif işler değil, değerlendirme sırasındaki yeni özellik adayları da etki, efor ve bağımlılıklarıyla birlikte listelenir.

## 60 günlük ana sonuç

- 200 e-postası doğrulanmış kullanıcı
- 80 aktive kullanıcı
- 40 haftalık aktif kullanıcı
- Kanal bazında güvenilir ziyaret → doğrulama → aktivasyon ölçümü

## Mevcut şirket odağı

- Birincil darboğaz kullanıcı edinimidir. Temel ürün güvenilirliği korunurken yeni kapasite önce nitelikli ziyaret, kayıt, e-posta doğrulama ve ilk finansal kayıt zincirini büyütmeye ayrılır.
- Yeni özellikler, kullanıcının ilk değere ulaşmasını veya edinim mesajını belirgin biçimde güçlendirmiyorsa aktif sprinti bölmez.
- Büyüme kararları ziyaret sayısıyla değil, kaynak bazında doğrulanmış ve ilk finansal kaydını oluşturmuş kullanıcıyla değerlendirilir.

## Aktif sprint

### P0 — Güvenilir temel ürün

- Ekstre banka ve tutar ayrıştırmasının desteklenen bankalarda regresyon testleriyle korunması
- Ödeme, kalan borç ve borç kapatma planındaki hesapların tutarlı kalması
- Mobilde temel ödeme ve düzenleme aksiyonlarının erişilebilir olması

### P1 — İlk kullanıcı aktivasyonu

- Welcome sayfasındaki yeni değer önerisinin lokalde doğrulanması ve yayın onayına hazırlanması
- İlk borç veya ekstre, gelir ve ilk hareket adımlarının terk noktalarının ölçülmesi
- Ekstrelerin cihazda işlendiği güven mesajının kayıt öncesi ve ekleme akışında tutarlı olması

### P2 — Kontrollü büyüme

- Tek deneyli Landing A/B altyapısı
- Organik hesaplama aracı ziyaretçisini sonuçtan kalıcı Ücretsiz ürüne taşıyan ve ilk varlık/borç kaydına kadar ölçen dönüşüm köprüsü
- Google Ads, SEO, e-posta ve Instagram mesajlarının canlı ürün sürümüyle eşleştirilmesi
- Referans sisteminin uygun kullanıcılar için görünür ve kötüye kullanıma dayanıklı tutulması

## Değerlendirme sırasındaki yeni özellikler

### Kullanıcıya özel Borcama yardım asistanı

- Durum: Kural tabanlı yanıtlar ile açık onay, veri minimizasyonu ve sunucu tarafı günlük kota kullanan Gemini Flash soru-cevap katmanı yerelde hazır; canlı ortam anahtarı, migration ve Edge Function yayını bekliyor.
- Amaç: Kullanıcının kendi Borcama kayıtlarını anlamasına, eksik veriyi fark etmesine ve yapmak istediği işlem için doğru ekrana ulaşmasına yardımcı olmak.
- İlk sürüm: Bugün ekranından açılan kısa bir soru alanı; “Bu ay neden açığım var?”, “Sıradaki ödemem ne?”, “Yanlış ödemeyi nasıl düzeltirim?” ve “Planım hangi kayıtlara dayanıyor?” gibi soruları kullanıcının kayıtlarından açıklamalı yanıtlar.
- Eylem sınırı: Asistan ilk sürümde finansal kaydı kendiliğinden oluşturmaz, değiştirmez veya silmez; kullanıcıyı ilgili forma götürür ve yapılacak değişikliği onaya bırakır.
- Güvenlik: Finansal tavsiye, kredi/yatırım önerisi veya sonuç garantisi vermez; banka verisi uydurmaz, hesabın dışındaki veriye erişmez ve cevabın dayandığı kayıtları kullanıcıya gösterir.
- Gizlilik: Ham ekstre dosyası modele gönderilmez; mümkün olan yanıtlar uygulamanın hesapladığı özetlerden üretilir. Harici model kullanımı başlamadan veri minimizasyonu, saklama ve sağlayıcı sözleşmesi ayrıca onaylanır.
- Başarı ölçümü: Yardım alan kullanıcının sorusunu tekrar sormadan ilgili ekrana gitmesi, eksik aktivasyon adımını tamamlaması ve destek talebi oranının azalması.
- Yayın sırası: Önce kural tabanlı ve açıklanabilir yardım merkezi; gerçek kullanıcı sorularından güvenli bir değerlendirme seti oluştuktan sonra sınırlı yapay zekâ desteği.
- Soru kapsamı: 20 ana finansal niyet ailesi altında bütçe, ödeme takvimi, kart/asgari/gecikme, kredi ve yeni kredi, yapılandırma, faiz-vergi, borç kapatma, ek hesap, gider analizi, gelir, tasarruf, kayıt düzeltme, ürün kullanımı ve gizlilik; farklı ifade biçimleri tek tek sabit cevap çoğaltmadan model tarafından sınıflandırılır.

### Ekstrelerden aylık gider analizi

- Amaç: Kullanıcının kredi kartı ekstresindeki işlem satırlarını cihazında okuyup aylık harcamalarını kategori, işyeri, tekrar ve dönem eğilimiyle anlamasını sağlamak; Borcama Asistanı'nın bu özetleri açıklayabilmesi.
- Mevcut durum: Ekstre okuyucu ilk iki sayfadaki banka ve özet alanlarını çıkarıyor; işlem satırlarını kalıcı gider detayına dönüştürmüyor. Bu nedenle asistan bugün ekstre içindeki harcama dağılımını güvenilir biçimde yorumlayamaz.
- Cihaz içi akış: Tarih, işyeri açıklaması, tutar, taksit ve iade işaretleri tarayıcıda çıkarılır; kullanıcı kategori eşleşmelerini kontrol eder ve yalnız onayladığı normalize edilmiş kayıtları hesabına kaydeder.
- Asistan bağlamı: Harici modele ham PDF, tam işlem açıklaması veya kart bilgisi gönderilmez. Model yalnız kategori toplamı, dönem farkı, tekrar eden gider, olağandışı değişim ve anonimleştirilmiş işyeri grubu gibi hesaplanmış özetleri açıklar.
- Doğruluk koruması: Toplam işlem tutarı ekstre özetiyle mutabık değilse otomatik analiz engellenir; iade, nakit avans, faiz/vergi ve taksit satırları alışverişten ayrı tutulur; düşük güvenli satırlar kullanıcı onayı bekler.
- İlk kapsam: Enpara, Halkbank, VakıfBank, Garanti BBVA, Akbank ve TEB için fişlenmiş ekstre örnekleriyle ayrı ayrıştırıcı ve mutabakat testleri; ardından diğer bankalar.
- Sunum: Harcamalar ekranında “Ekstreden gelenler” bölümü ve Asistan'da “Bu ay param en çok nereye gitti?”, “Geçen aya göre ne arttı?” ve “Hangi giderler tekrar ediyor?” soruları.

### Günlük harcama üst sınırı

- Amaç: Kullanıcının aylık harcama hedefine ulaşabilmesi için bugünden ay sonuna kadar günde en fazla ne kadar harcayabileceğini göstermek.
- Sunum: Borç Planı'nda tek bir dinamik karar kartı; ayrı ayrı bilgi kutuları oluşturulmaz.
- Hesap: `kalan aylık harcama bütçesi / ayın kalan günü`; bugün yapılan harcamalar, sabit giderler ve taksitlerin aylık payı dikkate alınır.
- Senaryolar: Mevcut hedef, daha temkinli hedef ve açığı kapatmak için gereken hedef; kullanıcıya aynı anda en fazla üç seçenek sunulur.
- Güvenlik sınırı: Eksik veya yalnızca kısmi ay verisi varsa kesin “güvenle harcayabilirsin” dili kullanılmaz; hangi kaydın eksik olduğu ve tahmin niteliği açıklanır.
- Bağımlılık: Bugün/Borç Planı bilgi mimarisi sadeleştirildikten ve aylık açık hesabı doğrulandıktan sonra ele alınır.
- Başarı ölçümü: Kartı gören kullanıcılarda 7 gün içinde ikinci harcama kaydı, Borç Planı'na geri dönüş ve hedef dahilinde kalma oranı.

## Karar kapıları

- Canlı yayın: rutin ve geri alınabilir değişikliklerde CEO; köklü veya geri dönüşü zor değişikliklerde Yönetim Kurulu Başkanı onayı
- Toplu e-posta: hazırlık ve test ekipte; nihai gönderim Yönetim Kurulu Başkanı onayı
- Sosyal paylaşım: CEO tarafından onaylanan aylık plan içinde ekip; plan dışı veya riskli durumda CEO kararı
- Reklam: gerçekleşen toplam harcamada ₺120/gün azami bütçe içinde ekip ve CEO; tavan artışında Yönetim Kurulu Başkanı onayı
- A/B trafik oranı veya kazanan seçimi: CEO kararı
- Fiyatlandırma ve Pro süresi: mevcut politika korunur; değişiklik Yönetim Kurulu Başkanı kararı
- Toplu veya geri döndürülemez kullanıcı verisi işlemi: Yönetim Kurulu Başkanı onayı
