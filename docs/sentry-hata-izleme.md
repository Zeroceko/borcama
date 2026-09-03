# Sentry hata izleme

- Organizasyon: borcama; proje: borcama-web (React, Almanya ingestion).
- Kapsam: canlı borcama.com, www.borcama.com ve crm.borcama.com JavaScript hataları ve React ErrorBoundary. Yerel ve preview ortamları kapalıdır. Backend henüz kapsamda değildir.
- Alarm: proje kurulurken yüksek öncelikli sorunlar için e-posta seçildi.
- Gizlilik: beforeSend izin listesi yalnız hata türü, sürüm, zaman, olay kimliği, birinci taraf statik JS dosyası/satırı/sütununu geçirir. Hata mesajı, kullanıcı kimliği/e-postası, request, breadcrumb, ekstre/form içeriği, extra ve context taşınmaz. IP alanı 0.0.0.0 olarak gönderilir; ağ bağlantısı sırasında sağlayıcının IP'yi teknik olarak görmesini engellemez.
- Session Replay, tracing, otomatik oturum takibi ve log toplama kapalıdır. Ücretli plan veya ek kota alınmadı.
- Public DSN gizli anahtar değildir. Yönetim tokenı tarayıcı koduna konmaz.
- Source map yükleme henüz yoktur; hata konumları build'in minified dosya/satır bilgisidir. Gizli kaynak haritası yükleme ayrı yetkilendirme ile kurulabilir.
- Kontrol: npm test içindeki errorMonitoringPrivacy testi veri sızıntısı regresyonunu denetler. Canlı olay teslimi ayrıca Sentry Issues ekranında doğrulanmalıdır.
- Geri alma: errorMonitoring.js init koşulunu kapatmak SDK gönderimini durdurur; kullanıcı verisine etkisi yoktur.
