# Limit sonrası işe devam protokolü

## Sorumlu ve tetikleme

CEO görevinin mevcut otomasyonu 30 dakikalık kontrol yapar; yeni ayrı görev açılmaz. Kullanılabilir limit yoksa model çalışamaz. İlk başarılı zamanlanmış çalışmada aşağıdaki kurtarma adımları uygulanır. Bilgisayar, Codex ve gerekli bağlantılar kullanılabilir olmalıdır; tam sıfırlanma anında veya 30 dakika içinde çalışma garantisi değildir.

## Departman kontrol noktası

Her departman kendi `docs/devam-<gorev-kimligi>.md` dosyasını önemli adım sonunda ve mümkünse limit yaklaşınca günceller:

- Yetkilendirilmiş iş ve kapsam
- Durum: çalışıyor / limit bekliyor / erişim bekliyor / onay bekliyor / tamamlandı
- Tamamlanan adımlar ve kanıtı (commit, dosya, test, yayın kimliği)
- Sonraki tek güvenli adım
- Devam eden dış işlem ve kimliği; tekrar yapılmaması gereken eylemler
- Engel ve son güncelleme zamanı

Ani kesintide dosya yazılmamış olabilir. Bu durumda son görev dönüşü, git durumu ve dış işlem sonucu okunur; tahminle tekrar gönderim/yayın/ödeme yapılmaz. Kontrol noktasında sır, token veya finansal kullanıcı verisi tutulmaz.

## CEO kurtarma döngüsü

1. Kullanım limitini oku. Bir pencere doluysa veya harcama sınırı varsa departmanları tetikleme; sıfırlanma zamanını kaydet. Reset kredisi/ücretli yükseltme kullanma.
2. Aktif işleri yeniden mesajla tetikleme. İdle veya kesilmiş görevde tamamlanmamış, yetkili iş olduğunu kanıtla; erişim/onay engelini limit engeli sanma.
3. En yüksek öncelikli en fazla iki işi tek seferlik devam mesajıyla başlat. Aynı checkpoint için tekrar mesaj göndermeden yeni ilerleme/başarısızlık kanıtı bekle; hata durumunda en az 60 dakika geri çekil.
4. Yeni bağımsız işler icat etme; toplu e-posta, kullanıcı verisi, fiyat ve köklü yayın onaylarını koru. Dış işlemlerin sonucunu doğrulamadan tekrar etme.
5. `docs/devam-koordinasyonu.md` içine kontrol zamanı, limit durumu, tetiklenen görev ve sonucu yaz. Değişiklik yoksa sessiz kal.
6. Europe/Istanbul 09.30 ve 18.30 raporunu o dilimdeki ilk başarılı çalışmada bir kere ver. Gecikmişse gecikmeyi açıkla; geçmiş tüm raporları peş peşe gönderme. Yeni/doğrulanmış/aktif kullanıcı ve departman teslimlerini mevcut kanıtla raporla; veri yoksa bilinmiyor yaz.

Bu düzen limit engelini aşmaz; kullanılabilirlik geri geldiğinde işi güvenli biçimde yeniden ele alır.
