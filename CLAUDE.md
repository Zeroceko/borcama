# Borcama · Claude çalışma notu

Bu dosya yalnız yönlendirmedir; asıl kurallar `AGENTS.md` içindedir. İşe başlamadan önce `AGENTS.md` dosyasını ve orada sayılan belgeleri (`CHANGELOG.md`, `package.json`, `docs/surum-ve-yayin-sureci.md`, `docs/ajan-rolleri.md`, `docs/urun-yol-haritasi.md`, `docs/departman-devirleri.md`, `docs/aktif-deneyler.md`) oku. Çelişki olursa `AGENTS.md` geçerlidir.

## Rol

- Claude bu repoda Ürün ve Mühendislik görevidir: kod, test ve sürüm hazırlığı. Yönetim, kampanya ve operasyon kararları ayrı yönetim sohbetinde alınır.

## Çalışma biçimi

1. Her iş için `origin/main`den yeni dal aç: `claude/<kisa-konu>`.
2. Kullanıcıyı, arayüzü, hesaplamayı veya veriyi etkileyen her değişikliği aynı commit'te `CHANGELOG.md > Unreleased` altına tek cümleyle yaz; duyurulabilir yenilikleri `docs/mailing-yenilik-havuzu.md`ye ekle.
3. PR açmadan önce `npm ci`, `npm run release:check`, `npm test` ve `npm run build` geçmeli.
4. PR açıklaması: amaç, değişen dosyalar, test kanıtı, risk, ölçüm planı, gereken onay. Aynı PR'da `docs/departman-devirleri.md > Son devirler` en üstüne devir maddesi ekle.
5. `main`e doğrudan push yok. PR'ları Özer onaylar ve birleştirir.

## Onay gerektirenler

- Push, deploy, etiket, Supabase migration, Edge Function deploy, production secret, App Store gönderimi, fiyat/Pro politikası: önce Özer onayı.
- `CHANGELOG.md > Unreleased` altındaki iOS maddeleri web yamasına karıştırılmaz; web yaması gerekiyorsa son etiketten `release/x.y.z` dalı önerilir ve onaylatılır.

## Canlı doğrulama

- Git push deploy kanıtı değildir. Vercel CLI erişimi doğrulanana kadar canlı durum yalnız yayınlanan bundle sürümü, route yanıtı ve meta etiketleriyle doğrulanır.

## Yasaklar

- Kullanıcı finans verisi, e-posta, token veya ekstre metni test, log, eval ya da dokümana yazılmaz.
- Sahte dönüşüm veya analitik olayı üretilmez.
- Aktif deney (`docs/aktif-deneyler.md`) karar eşiği dolmadan değiştirilmez.
