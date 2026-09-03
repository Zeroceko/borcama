# Değer teklifi destek gereksinim planı

## Kapsam

- Kullanıcı, yardım talebini konu ve kayıt bağlamıyla iletebilmeli; finansal kayıtlar destek tarafından değiştirilememeli.
- Talebin durumu (alındı, inceleniyor, yanıtlandı, kapandı), son yanıt zamanı ve kullanıcıya gösterilen yanıt ayrı tutulmalı.
- Kullanıcı kendi verilerinin dışa aktarılmasını isteyebilmeli; aktarım kapsamı ve kim tarafından üretildiği kayda alınmalı.
- Silme talepleri için kimlik doğrulama, kapsam teyidi, geri döndürülemezlik uyarısı ve denetim kaydı zorunlu olmalı.

## Güvenlik ve operasyon sınırları

Destek ekranı yalnız gerekli özetleri göstermeli; tam finansal ayrıntı, ödeme işaretleme, hesap silme veya kayıt mutasyonu yapmamalı. Dışa aktarma ve silme ayrı onay akışları olarak tasarlanmalı; mevcut üründe olmayan bir özelliği kullanıcıya varmış gibi anlatmamalı.

## Kabul ölçütleri

Durum değişiklikleri denetlenebilir, yanıtlar kullanıcıya doğru thread altında görünür, dışa aktarma yalnız yetkili kullanıcıya verilir, silme işlemi açık teyit olmadan çalışmaz ve tüm aksiyonlar audit kaydına yazılır.
