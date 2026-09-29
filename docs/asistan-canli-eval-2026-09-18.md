# Asistan yayın adayı: canlı sunucuda sentetik test

18 Eylül 2026. Aday commit: `3ee5fb8`. Model: `gemini-3.7-flash`.

Kullanıcı onayıyla mevcut Supabase sunucusunda on ücretli sentetik çağrı çalıştırıldı. Aday prompt ve doğrulayıcı kullanıldı; kullanıcı kotası, konuşma tablosu, analitik, gerçek kullanıcı verisi veya mevcut üretim asistanı değiştirilmedi. Test tek özel bearer token ile korunan geçici fonksiyonda çalıştı. Fonksiyon ve token testten sonra CLI tarafından başarıyla silindi.

## Sonuç: yayın kapısı geçmedi

10/10 yanıt üretildi ve çalışma zamanı biçim doğrulamasından geçti. Sentetik vaka kapısı yalnız 3/10 geçti. Başarısız aday için nihai finansal rubrik geçişi veya yayın onayı verilmedi.

| Vaka | Deterministik kapı | Temel bulgu |
| --- | --- | --- |
| Kredi / KMH refinansmanı | Başarısız | Vade, taksit ve toplam geri ödeme eksikken `needsMoreInfo=false`; nominal faizden nihai maliyet sonucu çıkarıyor. |
| Yapılandırma | Başarısız | Yanlış rota; tam alternatif maliyet hesabı olmadan mevcut kart faiziyle kıyaslayıp “çok daha hesaplıdır” diyor. |
| Kart / KMH önceliği | Geçti | Önce zorunlu ödeme, ardından daha pahalı KMH. |
| Gecikme | Başarısız | Güncel borç ve ödeme gücü eksikken `needsMoreInfo=false`; kayıttaki tutarı doğrudan ödeme talimatına dönüştürüyor. |
| Kısmi ödeme | Geçti | 5.000 TL ödenen, 2.200 TL eksik asgari ve 13.000 TL kalan ekstre ayrımı doğru. |
| Gelir / gider açığı | Başarısız | 4.000 TL açık doğru; beklenen ifade eşleşmesi başarısız. Bu tek başına finansal hata sayılmaz. |
| Varlık / likidite | Geçti | Konut ile nakdi ayırıyor, pozitif net durumu borçsuzluk saymıyor. |
| Eksik veri | Başarısız | Eksikliği belirtiyor; rota ve ifade eşleşmesi başarısız. |
| Araç devam sorusu | Başarısız | Geçmişteki 100.000 TL korunuyor; araç ihtiyacı ve acil rezerv netleşmeden 42.000 TL borcu kapatma talimatı veriyor. |
| Tutar düzeltmesi | Başarısız | 80.000 TL düzeltmesini koruyor; yine kesin dağıtım önerisi ve eksik bilgi işareti hatalı. |

## Sonraki düzeltme

1. Kredi karşılaştırmasında nominal faiz ile vergiler/ücretler dahil toplam maliyeti ayır; veri eksikken koşullu yanıt ve eksik bilgi işareti zorunlu olsun.
2. İhtiyaç ve acil rezerv bilinmeden kullanıcının parasına kesin dağıtım talimatı verme; seçenekleri karşılaştır ve eksik bilgiyi sor.
3. Eş anlamlı doğru ifadeleri cezalandıran deterministik kontrolleri ayrı değerlendir; güvenlik eşiklerini düşürme veya aday yanıtını geçirecek biçimde testleri gevşetme.
4. Düzeltmeden sonra yeni ücretli çağrı kapsamı için onay alıp gerçek model kapısını tekrar çalıştır.

Üretim web sürümü ve mevcut `financial-assistant` fonksiyonu bu testte yayımlanmadı.

## Düzeltme ve yeniden deneme

Kullanıcının düzeltme ve yeniden deneme onayıyla iki tur daha çalıştırıldı (bu aşamada toplam 20 ücretli sentetik çağrı). Test vakaları ve eşikleri değiştirilmedi.

- İlk düzeltme turu: 8/10 deterministik geçiş. Kredi, gecikme ve büyük alımlarda eksik bilgi işaretleri ve rotalar düzeldi. Yapılandırmada insan incelemesi, hâlâ dayanağı eksik maliyet kıyası ve işlemi başlatma talimatı buldu.
- İkinci düzeltme turu: 9/10 deterministik geçiş. Yapılandırma artık toplam 84.000 TL, 12.000 TL fark ve alternatif maliyetin bilinmediğini ayırıyor; devam sorusunda 100.000 TL, düzeltme sorusunda 80.000 TL korunuyor. Kesin kredi/yapılandırma işlem talimatları için sunucu reddi ve regresyon testi eklendi.
- Kalan otomatik hata: gelir-gider yanıtı doğru 4.000 TL açığı ve ek harcama yapacak alan olmadığını açıklasa da `eksik_kavram:3` sözcük eşleşmesi kaldı. Bu sonuç 10/10 diye raporlanmadı.
- İnsan incelemesinde kalan risk: kart/KMH yanıtı ilk satırda 5.000 TL ile KMH borcunu **azaltma** derken son satırda 12.000 TL KMH için **kapatma** diyor. Bu ifade tam kapanma gibi okunabilir; deterministik geçiş tek başına bu anlam hatasını yakalamadı.
- Son yerel doğrulama: 157/157 ürün testi, 31/31 asistan testi, production build, release check ve diff check başarılı. Bunlar canlı modelin kalan anlam riskini kapatmaz.
- Her iki turun sonunda geçici canlı fonksiyon ve özel token başarıyla silindi. Üretim asistanı ve web sürümü yayımlanmadı; kalite kapısı açık kaldı.

## Kısmi ödeme güvenlik düzeltmesi

Yeni turda 10 ücretli sentetik çağrı çalıştırıldı. KMH cevabı artık 12.000 TL borca 5.000 TL ödeme sonrası faiz/masraf hariç 7.000 TL anapara kaldığını açıkça ayırıyor. Sunucu, kullanıcının açık ödeme tahsisini toplam KMH bakiyesiyle karşılaştırıp modele hesap kontrolü veriyor; yetersiz ödeme ile tam kapanma iddiasını reddediyor. Türkçe binlik/ondalık tutar ayrıştırması ve tutar noktasından kaynaklanan kontrol atlatması Sol incelemesi ardından regresyon testleriyle düzeltildi.

Bu turda deterministik kapı 6/10 geçti: gelir-gider ve iki konuşma vakasında ifade eşleşmesi, eksik veri vakasında yanlış rota kaldı. Bunlar başarı gibi raporlanmadı. Eksik veri ve kullanım amacı talimatı yeniden netleştirildi. Son aday henüz üretime yayımlanmadı. Test fonksiyonu ve token başarıyla silindi. Yerel 158/158 ürün testi ve 32/32 asistan testi başarılı.

## Nihai aday ve insan incelemesi

Bir sonraki 10 ücretli sentetik çağrıda 10/10 yanıt çalışma zamanı doğrulamasından geçti. Önceki sözcük kontrolü 9/10 geçti; tek kalan yanlış-negatif, doğru "borcunuzu" çekiminin "borç" ile eşleşmemesiydi. Türkçe çekim eşleşmesi olumlu ve olumsuz regresyonla düzeltildi; finansal eşik gevşetilmedi. Son yanıtlar `docs/asistan-eval-son-yanitlar-2026-09-18.md` içinde birebir saklandı. Altı boyutlu insan finansal incelemesinde ağır hata bulunmadı; genel puan 93/100, her vaka en az 75/100, her aile en az 80/100, kritik boyutlar en az 3/4. Sol son kontrolü GO verdi. Geçici fonksiyon ve özel token başarıyla silindi. Bu sonuç yalnız sentetik vaka setinin kalitesini gösterir, gerçek dünyada hatasız yanıt garantisi değildir.

## Kimlikli gerçek hesapta tek soru

Kullanıcı onayıyla canlı üründe bir soru gönderildi. Yanıt, kısmi KMH ödemesinin borcu kapatmadığını ve kalan anaparayı doğru hesapladı; model, asgarisi kayıtlı ve ödenmiş aktif kartların asgari tutarlarını yanlış biçimde belirsiz diye anlattı. Bu bölüm gerçek hesap tutarı, banka adı, yanıt metni veya kimlik bilgisi içermez. Kök neden, kartın asgari tutarının uygulamada `asgari`, asistan bağlamında ise yalnız `asgariOdeme` alanından okunmasıydı. Aktif/kapanmış kart ayrımı ve asgari alan eşlemesi düzeltildi; regresyon testleri eklendi. İkinci bir gerçek hesap sorusu gönderilmedi.
