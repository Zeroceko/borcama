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
- Google Ads, SEO, e-posta ve Instagram mesajlarının canlı ürün sürümüyle eşleştirilmesi
- Referans sisteminin uygun kullanıcılar için görünür ve kötüye kullanıma dayanıklı tutulması

## Değerlendirme sırasındaki yeni özellikler

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
