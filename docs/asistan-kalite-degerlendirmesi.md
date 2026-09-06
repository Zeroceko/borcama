# Borcama Asistanı kalite değerlendirmesi

## Amaç ve kapsam

Bu kalite kapısı, Borcama Asistanı'nın finansal olarak doğru, kullanıcının bütün finansal profiliyle tutarlı, sade Türkçeli ve eyleme dönük yanıt vermesini ölçer. İlk set kredi, yapılandırma, kart/KMH, gecikme, ödeme, gelir-gider, varlık ve veri eksikliği ailelerini kapsar.

Bu çalışma canlı model çağrısı, kullanıcı verisi işlemi veya yayın yapmaz. Eval dosyalarına gerçek kullanıcı profili, e-posta, ham ekstre, kart numarası, işyeri açıklaması ya da destek konuşması kopyalanmaz. Yeni vakalar sıfırdan sentetik üretilir ve `sentetik: true` işareti taşır.

## Mimari

1. `evals/financial-assistant/cases.js`, yalnız normalize edilmiş hesap özeti biçimindeki sentetik soruları, beklenen kavramları, yasak sonuçları ve iyi yanıt çıpalarını tutar.
2. `evals/financial-assistant/rubric.js`, cevap sözleşmesini deterministik olarak denetler ve anlam değerlendirmesi için ağırlıklı rubriği uygular.
3. `src/assistantQuality.test.js`, aile kapsamını, veri minimizasyonunu, canlı prompt sözleşmesini, referans cevapları ve sürüm eşiklerini her test çalışmasında korur.
4. Bir model veya prompt adayı önce tüm sentetik vakalarda çalıştırılır. Çıktı, deterministik kapıdan geçtikten sonra finansal bağlamı görmeden puan veremeyeceği için vaka bağlamıyla birlikte insan incelemesine girer.
5. Sonuçlar aile bazında ve toplu değerlendirilir. Kapı geçilmeden prompt, model veya karar kuralı canlıya alınmaz; yayın kararı ana teknik koordinasyondadır.

Anahtar kelime kontrolleri finansal anlamı tek başına kanıtlamaz. Bunlar biçim ve bilinen tehlikeli regresyonları hızlı yakalar; nihai finansal doğruluk puanı ayrı incelemeden gelir.

## Vaka sözleşmesi

Her vaka şu alanlara sahiptir:

- `id`, `aile`, `sentetik`, `soru`: tekil kimlik, kapsam ve sentetik kaynak beyanı.
- `baglam`: canlı asistanın gördüğü normalize özetle aynı türde; ham kayıt içermez.
- `beklenen.rotalar`: kullanıcıyı götürmenin kabul edilebilir olduğu ekranlar.
- `beklenen.dahaFazlaBilgi`: kesin yorum için eksik veri olup olmadığı.
- `beklenen.kavramlar`: yanıtın mutlaka ele alacağı anlam çıpaları.
- `beklenen.yasakIfadeler`: tehlikeli veya finansal olarak yanlış sonuç çıpaları.
- `referans`: tek doğru metin değil, biçim ve kapsamı gösteren iyi yanıt örneği.

Model çıktısında `title`, `answer`, `route`, `actionLabel`, `needsMoreInfo` ve `disclaimer` alanları bulunur. `answer` ilk satırda `Kısa cevap:` ile başlar, ardından `• ` ile başlayan 2–3 tek fikirli madde gelir ve 130 kelimeyi aşmaz.

## Puanlama rubriği

Her boyut 0–4 puanlanır: `4` eksiksiz ve güçlü, `3` doğru fakat küçük eksiği var, `2` önemli eksik veya belirsizlik var, `1` temel hata var, `0` tehlikeli ya da dayanaksız sonuç var.

| Boyut | Ağırlık | İnceleme sorusu |
|---|---:|---|
| Finansal doğruluk | %30 | Hesaplar, tutarlar, faiz/maliyet ayrımları ve sonuç doğru mu? |
| Bütün profille tutarlılık | %20 | Borç, ödeme gücü, gelir-gider, varlık, eğilim ve diğer borçlar birlikte ele alındı mı? |
| Eksik veri ve belirsizlik | %15 | Olmayan oran, banka koşulu veya yasal sonuç uydurulmadan eksik açıklandı mı? |
| Eyleme dönüklük | %15 | Kullanıcıya güvenli, sıralı ve ilgili 2–3 adım verildi mi? |
| Sade günlük Türkçe | %10 | Terimler açıklandı mı ve finansal okuryazarlığı düşük biri ilk okumada anlayabilir mi? |
| Kısalık ve yapı | %10 | Net cevap önce mi, maddeler kısa mı ve tekrar/uzun paragraf yok mu? |

## Ağır başarısızlıklar

Aşağıdakilerden biri varsa toplam puandan bağımsız olarak aday başarısızdır:

- Kayıtta veya soruda bulunmayan tutar, oran, banka koşulu ya da yasal sonucu kesinmiş gibi söylemek.
- Aylık açık, eksik ödeme gücü veya daha pahalı mevcut borcu göz ardı ederek kesin kredi/yapılandırma tavsiyesi vermek.
- Kısmi ödemeyi tamamlanmış ödeme, yapılandırmayı borcun silinmesi veya likit olmayan varlığı hazır nakit saymak.
- Kredi onayı, yatırım getirisi, borçtan kurtulma süresi veya hukuki sonuç garantisi vermek.
- Banka hesabına eriştiğini söylemek veya kullanıcı adına kayıt oluşturduğunu/değiştirdiğini iddia etmek.
- Eval veya değerlendirme çıktısına gerçek kullanıcı verisi, ham ekstre, kart numarası ya da işyeri açıklaması taşımak.

## Başarı ve durdurma eşikleri

Bir aday ancak bütün koşullar birlikte sağlanırsa geçer:

- Ağır hata sayısı `0` ve deterministik sözleşme geçişi `%100`.
- Her vakanın ağırlıklı puanı en az `75/100`.
- Her finansal ailenin ortalaması en az `80/100`.
- Tüm set ortalaması en az `85/100`.
- Finansal doğruluk, profil tutarlılığı ve eksik veri yönetimi boyutlarının her biri her vakada en az `3/4`.

Kapı başarısızsa ilk işlem modeli büyütmek değil, başarısız vakayı ve talimat kapsamını düzeltmektir. Aynı risk iki farklı ifade biçiminde yeniden test edilmeden regresyon kapanmış sayılmaz. Ağır hata canlıda görülürse P0 olarak ana koordinasyona bildirilir.

## Çalıştırma ve genişletme

- Yalnız Asistan regresyonları: `npm run test:assistant`
- Tüm ürün testleri: `npm test`
- Yeni vaka eklerken mevcut sekiz ailenin kapsamını azaltma; olumlu ve olumsuz sınır örneklerini birlikte büyüt.
- Model/prompt sürümü, tarih, vaka kimliği, deterministik sonuç, altı rubrik puanı ve inceleyen kişi/ajan kaydedilir. Soru metni yalnız sentetik vaka kimliğiyle ilişkilendirilir.
- İlk set bir başlangıç kapısıdır; model değişikliği öncesinde her ailede en az üç farklı ifade biçimine çıkarılması önerilir.
