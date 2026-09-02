# Borcama ürün yol haritası

Bu dosya departmanların ortak öncelik kaynağıdır. Bir departman yeni işe başlamadan önce burada çakışan veya daha yüksek öncelikli iş olup olmadığını kontrol eder.

60 günlük şirket hedefi ve ekip işletim modeli için `docs/sirket-isletim-sistemi.md` esas alınır. Aktif sprint işleri bu hedefe hizmet etmiyorsa başlatılmaz.

## 60 günlük ana sonuç

- 200 e-postası doğrulanmış kullanıcı
- 80 aktive kullanıcı
- 40 haftalık aktif kullanıcı
- Kanal bazında güvenilir ziyaret → doğrulama → aktivasyon ölçümü

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

## Karar kapıları

- Canlı yayın: kullanıcı onayı
- Toplu e-posta: kullanıcı onayı ve test gönderimi
- Sosyal paylaşım: mevcut otomasyon kapsamı dışında kullanıcı onayı
- Reklam bütçesi veya teklif değişikliği: kullanıcı onayı
- A/B trafik oranı veya kazanan seçimi: ana koordinatör incelemesi ve kullanıcı onayı
