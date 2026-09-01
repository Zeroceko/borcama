# Borcama çalışma kuralları

Bu klasörde çalışan her ajan, işe başlamadan önce `CHANGELOG.md`, `package.json`, `docs/surum-ve-yayin-sureci.md` ve `docs/ajan-rolleri.md` dosyalarını okumalıdır.

## Değişiklik kaydı zorunluluğu

- Kullanıcı davranışını, arayüzü, hesaplamayı, veri modelini, entegrasyonu veya operasyon ekranlarını etkileyen her tamamlanmış değişikliği aynı commit içinde `CHANGELOG.md` dosyasındaki `Unreleased` bölümüne yaz.
- Kaydı teknik commit mesajı gibi değil, değişikliğin kullanıcıya veya operasyona etkisini anlatan tek ve açık bir cümle olarak yaz.
- Uygun başlığı kullan: `Eklendi`, `Değiştirildi`, `Düzeltildi`, `Güvenlik` veya `Kaldırıldı`.
- Kullanıcıya duyurulabilecek anlamlı yenilikleri ayrıca `docs/mailing-yenilik-havuzu.md` dosyasına ekle. İç düzeltmeleri, güvenlik ayrıntılarını ve kullanıcının işine yaramayan teknik değişiklikleri mailing havuzuna koyma.
- Sadece yorum, test veya geliştirici dokümanı değişiyorsa ürün sürümünü yükseltmek gerekmez; yine de süreç değişikliği ilgili dokümana işlenmelidir.

## Sürümleme

Borcama SemVer kullanır: `MAJOR.MINOR.PATCH`.

- `PATCH`: Hata düzeltmesi, metin, erişilebilirlik, performans veya mevcut akışın küçük görsel iyileştirmesi.
- `MINOR`: Yeni kullanıcı özelliği, yeni ekran, yeni entegrasyon ya da mevcut akışta anlamlı yeni yetenek.
- `MAJOR`: Geriye uyumsuz veri/API değişikliği, temel üyelik veya ödeme modelinin değişmesi ya da zorunlu kullanıcı geçişi.

Bir sürüm canlıya hazırlanırken:

1. `package.json` ve `package-lock.json` sürümlerini birlikte yükselt.
2. `CHANGELOG.md` içindeki ilgili `Unreleased` maddelerini `## [x.y.z] - YYYY-MM-DD` başlığına taşı.
3. `npm run release:check`, `npm test` ve `npm run build` çalıştır.
4. Sürüm commitini oluştur; canlıya çıktıysa aynı commit için `vx.y.z` etiketi kullan.
5. Mailing havuzundaki yayımlanan maddelere sürüm numarasını ekle; aynı yeniliği ikinci kez duyurma.

Sürüm numarasını sessizce veya yalnızca commit mesajına dayanarak değiştirme. Büyük sürümü kullanıcı onayı olmadan yükseltme.
