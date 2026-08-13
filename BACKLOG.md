# Borcama iş listesi

## Ekstre okuma

- [ ] AI destekli ekstre okuyucu ekle.
  - Mevcut banka kuralları ve cihaz içi OCR önce çalışmalı.
  - AI yalnızca tanınmayan banka, eksik alan veya düşük güven durumunda devreye girmeli.
  - İlk aşamada sohbet asistanı değil, yapılandırılmış ekstre alanı çıkarıcısı olmalı.
  - Belge veya OCR metni dış servise gönderilmeden önce kullanıcıdan açık onay alınmalı.
  - AI sonucu hiçbir zaman otomatik kaydedilmemeli; banka, dönem, toplam borç, asgari ödeme, önceki bakiye ve ödemeler kullanıcıya doğrulatılmalı.
  - Tutar denklemleri ve tarih kontrolleri mevcut doğrulama kurallarından geçmeli.
  - Maliyet için Cloudflare Workers AI ücretsiz kotası değerlendirilebilir; anahtar yalnızca sunucuda tutulmalı.

