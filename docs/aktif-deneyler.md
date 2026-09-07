# Borcama aktif deneyleri

## Kurallar

- Aynı anda bir ana landing hipotezi çalışır.
- Kullanıcı aynı varyantı görmeye devam eder; atama finansal veya kişisel veri içermez.
- Ana metrik kayıt tamamlamadır. E-posta doğrulama ve ilk finansal kayıt kalite metrikleridir.
- Google Ads ve organik trafik ayrı raporlanır.
- Yeterli örneklem oluşmadan kazanan seçilmez.

## Aktif olmaya hazır deney

- Kod: `LANDING-002`
- Durum: Yerelde hazır; site, veritabanı migration'ı ve Edge Function birlikte yayımlanmadan canlı deney başlamış sayılmaz.
- Hipotez: Aylık ödeme, ekstre kategorileri ve ilk kayıt adımını somut örneklerle gösteren yeni sayfa kayıt tamamlama oranını artırır.
- Kontrol A: Canlıdaki mevcut landing.
- Varyant B: Yeni sonuç odaklı landing ve kayıtsız temsili demo.
- Ortak navigasyon: Üst menüde `Nasıl çalışır?`, `Giriş yap` ve `Ücretsiz başla`; hesaplama araçları footer'da.
- Atama: Tüm yeni landing ziyaretçilerine `%50/%50`; anonim tarayıcı kaydı sayesinde aynı ziyaretçi aynı kolu görür.
- Yerel önizleme: A için `/?landing_preview=control`, B için `/?landing_preview=variant`.
- Birincil metrik: Tamamlanan kayıt / landing ziyareti.
- Koruma metrikleri: E-posta doğrulama, ilk borç veya ekstre kaydı, sayfa performansı ve hata oranı.
- Raporlama: Kaynak ve cihaz ayrımı korunur; `landing_visit → register_view → sign_up → email_verified → first_debt_or_statement` zinciri iki kol için ayrı gösterilir.
- Karar: Kayıt artarken doğrulama ve ilk finansal kayıt kalitesi bozuluyorsa B kazanmaz.

## Tarihsel deney

- Kod: `LANDING-001`
- Durum: CTA ile sınırlı eski deney kapatıldı; verisi tarihsel olarak korunur ve LANDING-002 ile birleştirilmez.
- Sonuç: Yeterli örneklem oluşmadığı için kazanan ilan edilmedi.
