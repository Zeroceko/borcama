# Sürüm ve yayın süreci

## Tek kaynaklar

- Güncel ürün sürümü: `package.json`
- Teknik ve kullanıcı etkili değişiklikler: `CHANGELOG.md`
- Gelecek toplu e-posta içerikleri: `docs/mailing-yenilik-havuzu.md`
- Çalışma zorunlulukları: `AGENTS.md`

## Değişiklikten yayına akış

1. Değişikliği geliştir ve doğrula.
2. Aynı commit içinde `CHANGELOG.md > Unreleased` bölümüne kullanıcı etkisini yaz.
3. Değişiklik duyurulmaya değerse mailing havuzuna kullanıcı dilinde fayda ve aksiyon ekle.
4. Canlı sürüm hazırlanırken değişikliklerin toplam etkisine göre patch, minor veya major numarası seç.
5. Paket ve kilit dosyası sürümünü birlikte güncelle; Unreleased maddelerini tarihli sürüme taşı.
6. Sürüm kontrolü, test ve production build tamamlanmadan yayınlama.
7. Canlı doğrulama sonrası sürüm etiketini gönder.

## iOS sürümü ve build numarası

- `CFBundleShortVersionString`, `package.json` içindeki SemVer sürümünü izler.
- `CFBundleVersion` yalnız yeni bir TestFlight veya App Store build'i yüklenirken artan tamsayıdır; her web yayınında artırılmaz.
- iOS arşivi hazırlamadan önce `npm run ios:version -- --bump-build` çalıştırılır ve oluşan Xcode proje değişikliği aynı iOS teslim commitine eklenir.
- Aynı pazarlama sürümünden yeniden build alınırsa SemVer değişmez, yalnız build numarası artar.
- App Store'a gönderimden önce `npm run release:check`, `npm test`, `npm run build`, `npx cap sync ios` ve imzasız simulator build doğrulaması tamamlanır.

## Sürüm kararı örnekleri

| Değişiklik | Sürüm etkisi | Örnek |
|---|---:|---|
| Mevcut akışta hata veya görsel düzeltme | Patch | `1.33.0 → 1.33.1` |
| Yeni ekstre yöntemi veya yeni rapor | Minor | `1.33.1 → 1.34.0` |
| Geriye uyumsuz veri/üyelik modeli | Major | `1.34.0 → 2.0.0` |

Bir sürüm birden fazla tür değişiklik içeriyorsa en yüksek etki geçerlidir.

## Mailing hazırlama

Mailing, changelog'un kopyası değildir. Yalnızca kullanıcıya somut fayda sağlayan maddeler seçilir. Her madde şu yapıda tutulur:

- Kullanıcının söylediği ihtiyaç veya yaşadığı sorun
- Borcama'da yapılan değişiklik
- Kullanıcıya sağladığı sonuç
- İlgili sayfaya götüren tek aksiyon

Toplu gönderimden önce hedef kitle, konu satırı, önizleme metni, bağlantı UTM'leri, test gönderimi ve açılma/tıklama ölçümü ayrıca doğrulanır.
