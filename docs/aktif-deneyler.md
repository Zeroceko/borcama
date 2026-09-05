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
- Durum: Aşama 1 kontrol hunisi canlı; Aşama 2 PMax CTA deneyi `%50/%50` trafikle aktif. `v1.45.0` ile her iki kolun ortak landing temeli borç, gelir, harcama ve varlık bütününü anlatacak biçimde yenilendi; deney kararı verilirken eski sürüm trafiği yeni sürümle birleştirilmeyecek.
- Hipotez: Ekstrenin cihazda işlendiğini ve borç planının somut faydasını ilk ekranda anlatmak, kayıt tamamlama oranını artırır.
- Kontrol: `v1.45.0` ortak landing temeli; kalıcı Ücretsiz planı, kart gerektirmediğini, gizlilik yaklaşımını ve bütün finansal tabloyu açıkça anlatır.
- Varyant: Yalnız hero ana CTA metni: `Ücretsiz başla, ilk planını gör`; hedef `/register?plan=free` ve diğer landing içeriği kontrolle aynı kalır. Yerel önizleme: `/?landing_preview=variant`.
- Birincil metrik: Tamamlanan kayıt / landing ziyareti
- Koruma metrikleri: E-posta doğrulama, ilk borç veya ekstre kaydı, sayfa performansı ve hata oranı
- Aşama 1 ölçümü: Yalnız `google / cpc / tr_pmax_borcama` ilk temasları için `landing_visit → register_view → sign_up → email_verified → first_debt_or_statement`; reklam tıklaması bu hunide ziyaret veya kayıt sayılmaz.
- Atama: Yalnız ilk teması `google / cpc / tr_pmax_borcama` olan ziyaretçiler anonim tarayıcı kaydıyla kontrol veya varyanta atanır ve sonraki ziyaretlerinde aynı varyantı görür.
- Sonraki karar: CEO, kayıt tamamlaması ana metrik; doğrulama ve ilk borç/ekstre kalite metrikleri yeterli örnekleme ulaşmadan oranı değiştirmez veya kazanan ilan etmez.
