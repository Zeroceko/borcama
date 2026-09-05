# Borcama aktif deneyleri

## Kurallar

- Aynı anda bir ana landing hipotezi çalışır.
- Kontrol ve varyant arasındaki temel fark tek cümleyle açıklanabilir olmalıdır.
- Kullanıcı aynı varyantı görmeye devam eder; atama finansal veya kişisel veri içermez.
- Ana metrik kayıt tamamlamadır. CTA tıklaması ara metriktir; e-posta doğrulama ve ilk finansal kayıt kalite metrikleridir.
- Google Ads ve organik trafik ayrı raporlanır.
- Yeterli örneklem oluşmadan kazanan seçilmez.

## Sıradaki deney

- Kod: `LANDING-001`
- Durum: Aşama 1 kontrol hunisi yerelde hazır; varyant trafiği, CTA/metin değişikliği ve deney exposure kapalı
- Hipotez: Ekstrenin cihazda işlendiğini ve borç planının somut faydasını ilk ekranda anlatmak, kayıt tamamlama oranını artırır.
- Kontrol: `v1.37.0` ile canlıya alınacak sade, güven ve plan odaklı welcome sayfası
- Varyant: Yalnız hero ana CTA metni: `Ücretsiz başla, ilk planını gör`; hedef `/register?plan=free` ve diğer landing içeriği kontrolle aynı kalır. Yerel önizleme: `/?landing_preview=variant`.
- Birincil metrik: Tamamlanan kayıt / landing ziyareti
- Koruma metrikleri: E-posta doğrulama, ilk borç veya ekstre kaydı, sayfa performansı ve hata oranı
- Aşama 1 ölçümü: Yalnız `google / cpc / tr_pmax_borcama` ilk temasları için `landing_visit → register_view → sign_up → email_verified → first_debt_or_statement`; reklam tıklaması bu hunide ziyaret veya kayıt sayılmaz.
- Sonraki karar: CEO, yeterli kontrol verisinden sonra A/B atama ve trafik oranını ayrıca inceler; önerilen ilk oran `%50/%50`dir. Köklü ürün değişikliği oluşmadıkça ayrıca Yönetim Kurulu Başkanı onayı beklenmeyecek.
