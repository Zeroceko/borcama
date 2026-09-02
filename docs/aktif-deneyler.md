# Borcama aktif deneyleri

## Kurallar

- Aynı anda bir ana landing hipotezi çalışır.
- Kontrol ve varyant arasındaki temel fark tek cümleyle açıklanabilir olmalıdır.
- Kullanıcı aynı varyantı görmeye devam eder; atama finansal veya kişisel veri içermez.
- Ana metrik kayıt tamamlamadır. CTA tıklaması ara metriktir; e-posta doğrulama ve ilk finansal kayıt kalite metrikleridir.
- Google Ads ve organik trafik ayrı raporlanır.
- Yeterli örneklem oluşmadan kazanan seçilmez.

## Hazırlık aşamasındaki deney

- Kod: `LANDING-001`
- Durum: Tasarım ve ölçüm altyapısı hazırlanacak; canlı trafik yok
- Hipotez: Ekstrenin cihazda işlendiğini ve borç planının somut faydasını ilk ekranda anlatmak, kayıt tamamlama oranını artırır.
- Kontrol: `v1.36.4` canlı landing sayfası
- Varyant: `9c12123` commitindeki sade, güven ve plan odaklı welcome sayfası
- Birincil metrik: Tamamlanan kayıt / landing ziyareti
- Koruma metrikleri: E-posta doğrulama, ilk borç veya ekstre kaydı, sayfa performansı ve hata oranı
- Sonraki karar: A/B atama ve olay tekilleştirme tasarımı ana koordinatör tarafından incelenecek; kullanıcı onayı olmadan canlıya çıkmayacak.
