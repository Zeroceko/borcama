# Kurulum akışı v3 · Claude Code direktifi

Tarih: 28 Ekim 2026 · Hazırlayan: Claude (CEO sohbeti) · Hedef: `Zeroceko/borcama` · Sürüm: 1.73.0 (minor)
Görsel referans: `docs/onboarding-v3-prototip.html` (tarayıcıda aç; solda ekran listesi, üstte Sistem/Açık/Koyu). Prototipteki her renk, yazı tipi ve boşluk hedeftir; bu doküman neyin neden öyle olduğunu ve koda nasıl bağlanacağını anlatır.

> Tek cümle: **Mantığa dokunma, yüzeyi değiştir.** `onboardingAdimlari.js` içindeki adım sırası, atlama kuralları, hesaplar ve `veriyeYaz` çıktısı aynen kalır; `Onboarding.jsx` + `onboardingAkis.css`, PocketPal'ın kolaylığını Borcama'nın kendi kimliğiyle alır.

---

## 0. Onaylı kararlar (Özer, 28 Ekim 2026)

CLAUDE.md'ye göre ana akış yeniden tasarımı Özer onayı ister. Aşağıdakiler bu sohbette onaylandı; PR açıklamasında "onaylı" diye yazılır.

| # | Karar |
|---|---|
| K1 | Onboarding'de çerçeve ve blok gölge **yüzeylerden** kalkar; derinlik dolgu farkıyla (kenarlıksız, sakin). Borcama imzası (lime dolgu + coral blok gölge, logodaki yıldız) yalnız **CTA, büyük tutar, plan kartı ve kapanışta** kalır. |
| K2 | 2. adım olarak **"Açık mı, koyu mu?"** eklenir (Sistem / Açık / Koyu). `ayarlar.tema` zaten var; `"system"` değeri eklenir. |
| K3 | Dokunmatik cihazda tutar girişi **uygulama içi tuş takımı**; masaüstünde normal `<input>`. |
| K4 | Native karşılama tek sayfadan **3 slaytlı karusele** geçer; maket uygulamanın gerçek ekranıdır (banka logoları, gerçek tutar biçimi). |
| K5 | iOS SwiftUI (`NativeOnboarding.swift`) paritesi **ayrı PR**; bu görev iOS'a dokunmaz. |
| K6 | **Emoji yok.** İkonlar uygulamadaki lucide seti; gerekirse aynı çizgi diliyle (2.2 kalınlık, yuvarlak uç) yeni SVG çizilir. Ülke listesinde bayrak yerine mono kod rozeti (TR, GB…). |
| K8 | **Giriş ve kayıt ekranları (Auth.jsx) aynı yüzeye geçer.** Akış ve Supabase/Turnstile/Apple mantığı aynen; yalnız görünüm. Web'de "Ana sayfaya dön" ve Landing bağlamı korunur. |
| K7 | **Soluk başlık yok.** İki tonlu "gri + vurgu" başlık kalkar; başlık tek renk, Archivo Black. Sözlükteki `baslikGri`/`baslik` anahtarları birleştirilerek basılır (anahtar silinmez; native köprüsü aynı anahtarları kullanıyor). |

---

## 1. Referanstan ne alındı, ne alınmadı

PocketPal onboarding videosundan (135 sn) **alınan** kalıplar; hepsi prototipte uygulanmış durumda:

1. Kenarlıksız yüzeyler; derinlik üç katmanlı dolguyla (zemin → yüzey → yüzey-2).
2. Seçili durum = dolgu + koyu metin (Borcama'da lime + mürekkep; uygulamadaki aktif pill gibi).
3. Üst kabuk: yuvarlak geri düğmesi, parçalı ilerleme (biten = metin rengi, sıradaki = coral, bekleyen = soluk), sağda "Şimdilik geç".
4. "ADIM n/12" etiketi (Borcama'da mono, büyük harf).
5. Her girdiden sonra yankı cümlesi; değer lime `mark` içinde (uygulamanın mevcut imzası).
6. Bilgi kartı (ikon + kalın cümle + açıklama) yankının altında.
7. Sayılı CTA: "2 türle devam et".
8. İçerik CTA'nın altından akar; CTA üstünde zemine solma; düğme hiç kaymaz.
9. Büyük tutar + yanıp sönen imleç + 3×4 tuş takımı; pasif CTA gri.
10. Gün seçici: ortalanmış şerit + kaydırıcı; seçili gün coral daire.
11. Kapanış: alttan büyüyen perde (Borcama'da lime), sonra ana ekran.
12. Geçişler: adım 260 ms aşağıdan, seçim 180 ms, ilerleme 250 ms.

**Alınmayan:** adım başına değişen pastel renkler, soluk iki tonlu başlıklar, emoji ikonlar, maskot, paywall, fiş tarama adımı, "harika iş çıkardın" tonu. Borcama "sakin uzman" konuşur: düz, kısa, ünlemsiz (bkz. `research_notes/…/ses_ve_guven.md`).

---

## 2. Tasarım sistemi

Kaynak: prototipin `:root` bloğu. `src/onboardingAkis.css` başındaki `.oa` bloğuna token olarak taşınır. **Renkler uygulamanın `ACIK_TEMA` / `KOYU_TEMA` değerleridir (App.jsx)**; onboarding ayrı bir palet icat etmez.

### 2.1 Token'lar

```css
.oa {                                   /* Açık */
  --oa-zemin: #f4efe0;                  /* CREAM */
  --oa-parlama: radial-gradient(70% 40% at 20% 0%, rgba(205,245,100,.42), transparent 70%);
  --oa-yuzey: #ffffff;                  /* panel */
  --oa-yuzey-2: #f6f3e8;                /* panel2 */
  --oa-yuzey-3: #e6e1d2;
  --oa-metin: #14160f;                  /* INK */
  --oa-metin-2: #55584c;                /* dim  (7.6:1) */
  --oa-metin-3: #8a8c7e;                /* faint, yalnız yer tutucu */
  --oa-ozet: #d9e7e1;                   /* summaryBg (mint) */
  --oa-ozet-metin: #14160f;
  --oa-ozet-tutar: #14160f;
  --oa-ozet-golge: 3px 3px 0 #cdf564, 5px 5px 0 #ff6f59;   /* summaryShadow */
  --oa-yasam: #899285;                  /* debtAccount */
  --oa-ilerleme-tamam: #14160f;
  --oa-ilerleme-sirada: #e65340;        /* debtLoan; açık zeminde 3:1 */
  --oa-ilerleme-bekleyen: rgba(20,22,15,.14);
  --oa-cerceve: #14160f;                /* maket telefon çerçevesi */
  --oa-ink: #14160f; --oa-lime: #cdf564; --oa-coral: #ff6f59; --oa-mint: #d9e7e1;
}
.oa.oa-koyu {                           /* Koyu = KOYU_TEMA */
  --oa-zemin: #0f110a;
  --oa-parlama: radial-gradient(70% 40% at 20% 0%, rgba(205,245,100,.16), transparent 70%);
  --oa-yuzey: #191c12; --oa-yuzey-2: #22261a; --oa-yuzey-3: #2e3324;
  --oa-metin: #f4efe0; --oa-metin-2: #b5b2a0; --oa-metin-3: #8a8c7e;
  --oa-ozet: #191c12; --oa-ozet-metin: #f4efe0; --oa-ozet-tutar: #cdf564;
  --oa-ozet-golge: 3px 3px 0 #ff6f59;
  --oa-yasam: #c8c9be;
  --oa-ilerleme-tamam: #f4efe0; --oa-ilerleme-sirada: #ff6f59; --oa-ilerleme-bekleyen: rgba(244,239,224,.16);
  --oa-cerceve: #2e3324;
  color-scheme: dark;
}
```

Renk kuralları:
- **Seçili** her yerde `--oa-lime` dolgu + `--oa-ink` metin (satır, kart, çip, tema kartı). Kod rozeti seçilince ink dolgu + lime metin.
- **Coral** yalnız dikkat için: sıradaki ilerleme parçası, seçili gün, imleç, ödemeler dilimi, sıradaki borcun tutar rozeti, CTA blok gölgesi.
- **Mint** yalnız plan kartı zemini (açık temada); koyuda plan kartı panel + lime tutar + coral gölge (uygulamanın özet kartıyla aynı).
- Kodda token tanımları dışında literal hex yok.

### 2.2 Tipografi (uygulamanınki)

- Başlık `.oa-baslik`: **"OB Archivo"** (Archivo Black, pakette), 28px / ≥760px 34px, `line-height 1.12`, `letter-spacing -.01em`, tek renk `--oa-metin`, `text-wrap: balance`.
- Gövde: "OB Space" (Space Grotesk). Açıklama 14.5px `--oa-metin-2`; satır/kart metni 15px/14px 700; CTA 16px 700.
- Mono etiket `.oa-mono-etiket`: JetBrains Mono 10.5px 700, `.08em`, büyük harf, `--oa-metin-2` (soluk değil). "ADIM 3/12", "AYIN GÜNÜ", "AY SONUNDA KALAN", form alanı etiketleri.
- Mono tutar: liste tutarları, çip tutarları, tuş takımı rakamları, kod rozetleri.
- Büyük tutar `.oa-tutar`: Archivo Black 50px, `color: var(--oa-ozet-tutar)`, `text-shadow: var(--oa-ozet-golge)`; simge 32px `--oa-metin-2`. Boşken `--oa-metin-3`, gölgesiz.
- Yankı `.oa-yanki`: 17px 700 `--oa-metin`; `mark` = lime dolgu, ink, mono, 7px köşe.
- Kapanış başlığı: Archivo Black 44px, `text-shadow: 4px 4px 0 var(--oa-coral)` (logodaki blok gölge).
- `font-variant-numeric: tabular-nums` `.oa` kökünde. Archivo Black'te ₺ glifi var (uygulama hero tutarında kullanıyor).

### 2.3 Boşluk, köşe, gölge

- Kolon `--kenar 20px`; üst güvenli alan + 10px; alt güvenli alan + 24px; `min(100%, 480px)`, ≥760px'de 560px ortalı.
- Köşe: satır 18px, kart 20px, plan kartı 22px, bilgi/form alanı 16px, düğme ve çip 999px, geri düğmesi daire, kod rozeti 7px.
- Gölge yalnız: CTA `0 4px 0 var(--oa-coral)` (basınca `translateY(3px)` + `0 1px 0`), maket `0 -10px 40px rgba(0,0,0,.18)`, büyük tutar/plan tutarı/kapanış başlığı metin gölgesi. Başka hiçbir yerde yok.
- Katmanlar: zemin → `--oa-yuzey` (satır, kart, alan, bilgi) → `--oa-yuzey-2` (geri, pasif CTA, basılı tuş, ikon rozeti, kod rozeti) → `--oa-yuzey-3` (ray, halka kenarı).
- `.oa::before` üst %44 `--oa-parlama` (lime, iki temada da); `pointer-events: none`.
- `.oa-govde` kendi içinde kayar; `.oa-alt` sabit, üstünde 28px `linear-gradient(to top, var(--oa-zemin) 70%, transparent)`.

### 2.4 İkonlar

Uygulama `lucide-react` kullanıyor; onboarding de aynı paketten alır. Eşleme:

| Yer | lucide |
|---|---|
| Geri / ileri / tik / artı / kapat | `ChevronLeft`, `ChevronRight`, `Check`, `Plus`, `X` |
| Sil tuşu | `Delete` |
| Bilgi kartı (dönem), hedef.aySonu | `CalendarCheck` |
| hedef.borc | `Target` |
| hedef.kontrol | `SlidersHorizontal` |
| turler.kart | `CreditCard` |
| turler.kredi | `Building2` (uygulamada banka ikonu) |
| turler.kmh | `Wallet` |
| turler.kisi | `Users` |
| Kapanış yıldızı | `Sparkles` (logodaki yıldız; uygulamada zaten var) |
| Ülke / dil / kişi borcu | ikon değil, **mono kod rozeti** `.oa-kod` (TR, EN, KİŞİ) |
| Banka | `bankLogos.js > BANK_LOGOS` varsa logo (28px, beyaz zemin, 8px köşe); yoksa `BANKA_KOD` rozeti |

İkon rozeti `.oa-kart .ikon`: 40px, 12px köşe, `--oa-yuzey-2` zemin, 20px ikon; seçilince ink zemin + lime ikon.

---

## 3. Bileşenler (Onboarding.jsx; sınıf adları Türkçe, mevcutlar korunur)

| Bileşen | Sınıf | Davranış |
|---|---|---|
| `Kabuk` | `.oa-kabuk` | geri (40px daire, `--oa-yuzey-2`) · ilerleme (n parça, 4px, gap 4) · opsiyonel `.oa-atla` ("Şimdilik geç", 13px 700 altı çizili `--oa-metin-2`). İlk adımda (dil) native'de geri = karşılamaya dön (`setEkran("karsilama")` yolu; akış durumu korunur); web'de önceki ekran olmadığından 40px boşluk. |
| `Baslik` | `.oa-baslik` | `{gri} {vurgu}` tek `<h1>`, tek renk. `oa-baslik-gri` sınıfı kaldırılır. |
| `BirincilDugme` | `.oa-dugme` | 56px pill, lime + coral blok gölge, ink metin; ok ikonu kalkar. Pasif: `--oa-yuzey-2`, `--oa-metin-3`, gölgesiz. |
| `SecimSatiri` | `.oa-secim` | 60px, `--oa-yuzey`, 18px köşe; sol opsiyonel `.oa-kod` rozeti; orta metin + `small`; sağ `.sag` (mono) + `.oa-halka` (22px; seçilince ink dolgu + lime tik). `aria-pressed` kalır. |
| `SecimKarti` (yeni) | `.oa-kart` | 2 sütun `.oa-izgara`; 124px min, 20px köşe; sol üst ikon rozeti, sağ üst halka, alt metin 14px 700. `hedef`, `turler`. |
| `EkSatir` | `.oa-ek` | kenarlıksız 54px, `small` alt satır, sağda `ChevronRight`. Gizli `<select>` yaklaşımı aynen. |
| `GunSecici` | `.oa-gun-kutu` | yüzey kartı: "AYIN GÜNÜ" etiketi + 31'lik şerit (48px daire, mono 16px, seçili coral + `scale(1.12)`, snap, ortaya kayar) + görsel kaydırıcı rayı (`input[type=range]` 1–31 ile de sürülebilir). Hafta günleri 7 eşit sütun. |
| `Yanki` | `.oa-yanki` | mevcut `VurguluMetin` + `mark`. |
| `BilgiKarti` (yeni) | `.oa-bilgi` | 30px lime ikon rozeti + kalın cümle + açıklama. `gun` adımında. |
| `TusTakimi` (yeni) | `.oa-tuslar` | 3×4: 1–9, "000", 0, sil. Tuş 56px, mono 24px 600, basınca `--oa-yuzey-2`. Yalnız `matchMedia("(pointer: coarse)")`; aksi halde mevcut `TutarAlani`. Haptik her tuşta `dokunusGeriBildirimi("hafif")`. |
| `TutarGosterimi` (yeni) | `.oa-tutar` | simge + sayı (`Intl.NumberFormat(locale())`) + 3px coral imleç (`steps(2)` 1 s). `aria-live="polite"`. |
| `PlanKarti` | `.oa-plan` | `--oa-ozet` zemin; "AY SONUNDA KALAN"; Archivo 40px tutar (+ özet gölgesi); formül satırı (mevcut `plan.formul`); 10px üç dilimli serit (coral ödemeler, `--oa-yasam` yaşam, lime kalan); altında 3 satır açıklama (kare + ad + mono tutar). Eksi bakiyede serit tamamen coral. |
| `SiradakiBorc` | `.oa-sira` | lime "1" dairesi + banka logosu/rozeti + ad + alt satır (`plan.siradaki`) + sağda coral mono tutar rozeti. |
| `TemaSecimi` (yeni) | `.oa-temalar` | 3 kart (Sistem / Açık / Koyu); 190px mini maket (üst çizgi, Archivo "₺8.450", lime/coral/mint bar, lime toggle); Sistem kartı dikey bölünmüş. Seçince `.oa-koyu` anında değişir. |
| `HazirPerdesi` (yeni) | `.oa-hazir` | lime perde `clip-path: circle(0% at 50% 120%)` → `circle(150%)` 900 ms; `Sparkles` 56px, "PLAN KURULDU." mono, "Hazırsın, {ad}." Archivo + coral gölge, açıklama, altta ink CTA "Bugün'e geç" (coral gölge). Otomatik yönlendirme yok; düğme. |
| `Karsilama` (native) | `.oa-karsilama` | logo (`/borcama-logo-368.png` açık, `/borcama-logo-koyu.png` koyu) + 3 nokta + Archivo slogan + açıklama + maket. Maket (`.oa-mockup`): 262px, üst köşeler 40px, `--oa-cerceve` çerçeve, ekranın altına taşar; içinde "MAAŞA KADAR KALAN", Archivo tutar + özet gölgesi, "Maaşa 19 gün var." satırı, "BORÇLAR" listesi (banka logolu 4 satır). Slayt 3.6 s; sağa/sola kaydırma. Altta "Başla", "Zaten hesabım var", misafir bağlantısı. |

---

## 4. Ekran ekran

Sıraya tek ekleme: `gorunum` (dil'den sonra). Metinler mevcut sözlükten; yeniler §7'de.

| Adım | Başlık (tr) | İçerik | CTA |
|---|---|---|---|
| karsilama | slayt 1 "Borcunu yaz. Planın çıksın." / 2 "Hangi borç önce biter, gör." / 3 "Maaştan ne kalır, bil." | alt satır: 1 "Banka bağlantısı yok; şifre ve kart numarası istemez." 2 "Sıradaki ödeme ve bitiş tarihi her borcun yanında." 3 "Ödemeler ve yaşam düşülür; kalan her maaşta yenilenir." Maket: slayt 1–2'de ilk borç lime halkalı, slayt 3'te maaş satırı lime dolgu. | Başla |
| dil 1/12 | Hangi dilde konuşalım? | `SecimSatiri`, kod rozeti (TR…), alt satır seçili dildeki ad (`Intl.DisplayNames`). | Devam et |
| gorunum 2/12 | Açık mı, koyu mu? | "Birine dokun, uygulamanın tamamı o anda değişir. Sonradan Ayarlar'dan değişir." `TemaSecimi`, varsayılan Sistem. | Devam et |
| isim 3/12 (native) | Sana nasıl seslenelim? | 64px kenarlıksız girdi; sağ üstte "Şimdilik geç". | Devam et |
| ulke 4/12 | Hangi ülkede harcıyorsun? | kod rozeti + ad + sağda `TRY ₺`; `EkSatir` "Başka bir ülke" ve "Başka para birimi · TRY ₺". | Devam et |
| hedef 5/12 | Seni buraya ne getirdi? | 3 `SecimKarti` (Target, CalendarCheck, SlidersHorizontal); çoklu; 0 seçimde pasif. | Devam et |
| siklik 6/12 | Ne sıklıkla para giriyor? | satırlar; "Ayda iki" sağda "1 ve 15"; "Düzensiz" alt satırı "Plan 30 günde bir yenilenir". | Devam et |
| gun 7/12 | Maaş hangi gün yatıyor? | `GunSecici` + yankı "Bir sonraki maaş **15 Kas Pazar**. 19 gün kaldı." + `BilgiKarti` dönem cümlesi. | Devam et |
| gelir 8/12 | Eline ne kadar geçiyor? | `TutarGosterimi` + "AYLIK NET · HER AY" + yankı "Günde yaklaşık **₺1.067**." + `TusTakimi`. 0'da pasif. | Devam et |
| turler 9/12 | Hangi borçların var? | 4 `SecimKarti` + `EkSatir` "Şimdilik borç yok / Gelir ve harcamayla devam et". | {n} türle devam et |
| borc 10/12 | İlk kartı ekle. | sağ üst "Şimdilik geç"; tür çipleri (metin, ikonsuz); `.oa-alan` alanları (mono etiket, 18px girdi, odakta 2px lime iç halka); "+ Başka borç ekle" kesik altı çizili; eklenenler banka logolu satır; yankı. Sistem klavyesi kalır. | Bu kadar |
| yasam 11/12 | Yaşamak için kabaca ne gidiyor? | 3 mono çip + "Kendim yazayım"; seçili lime; kendim → `TutarGosterimi` + `TusTakimi`; yankı. | Devam et |
| plan 12/12 | İşte plan. | `PlanKarti` + `SiradakiBorc` + yankı "Akbank **2 ayda** biter. İlk ödeme 12 Kas." | Planı aç |
| hazir | Hazırsın, {ad}. | `HazirPerdesi`. | Bugün'e geç |

`gorunum` → `durum.tema` ("system"|"light"|"dark") → `veriyeYaz` → `ayarlar.tema`. **App.jsx:** `isDark = tema === "dark" || (tema === "system" && matchMedia("(prefers-color-scheme: dark)").matches)`, `change` olayında yeniden çiz; `.bt-tema-secim`'e "Sistem" seçeneği.

### 4b. Giriş ve kayıt (Auth.jsx) — aynı yüzey

Prototipteki `kayit`, `giris`, `gonderildi` ekranları hedef. Auth.jsx'in davranışı (Supabase OTP/parola, Apple ile giriş, Turnstile, referans kodu, sözleşme onayı, pro niyeti, `?yeni=1`) **değişmez**; bileşen içindeki inline CSS (`auth-*` sınıfları) onboarding token'larına taşınır.

**Yapı (üstten alta):**

| Parça | Sınıf | Not |
|---|---|---|
| Kabuk | `.oa-kabuk` | solda geri (native: karşılamaya; web: "Ana sayfaya dön" aynı daire düğme, `aria-label`), sağda dil çipi `.oa-cip.kucuk` (mono "TR"; mevcut `DilDugmesi` bu sınıfı alır). Logo yok; kabuk sade. |
| Etiket + başlık | `.oa-mono-etiket` "KAYIT" / "GİRİŞ"; `.oa-baslik` | "Ücretsiz hesabını oluştur." / "Hesabına giriş yap." (mevcut anahtarlar, nokta eklenir). |
| Açıklama | `.oa-aciklama` | kayıt: `auth.kayit.aciklama` **kısaltılır**: "Ücretsiz planın süresi dolmaz. İlk 30 gün Pro dahil; kart istemez." (yeni anahtar `auth.kayit.aciklamaKisa`; web'de uzun metin gerekiyorsa Landing'de kalır). giriş: `auth.giris.aciklamaNative` / `aciklamaWeb`. |
| Apple | `.oa-apple` | 52px pill, `--oa-metin` zemin + `--oa-zemin` metin (açıkta siyah/beyaz, koyuda krem/siyah; Apple HIG'e uygun), Apple glifi 16px. Yalnız `appleGirisiVarMi`. |
| Ayırıcı | `.oa-yada` | "YA DA" mono, iki yanda 1px `--oa-yuzey-3` çizgi. |
| Sekmeler (web giriş) | `.oa-sekmeler` + `.oa-sekme` | Parola / E-posta linki; seçili lime + ink. Native'de yok (mevcut kural). |
| Alanlar | `.oa-alan` | mono etiket (E-POSTA, PAROLA), 18px girdi; parola alanında sağda `.oa-goz` (lucide `Eye`/`EyeOff`); parola girdisi mono + `.12em` aralık. Hata: alanın altında `.oa-hata` (coral değil, `--oa-ilerleme-sirada`; 13px 700) ve alan `box-shadow: 0 0 0 2px var(--oa-coral) inset`. |
| Referans kodu (kayıt) | `.oa-ek` | "Referans kodun var mı? / İsteğe bağlı; ikiniz de 30 gün Pro kazanırsınız" → dokununca altında `.oa-alan` açılır (mono girdi, `auth.referans.*` durum metinleri `small` içinde). |
| Onaylar (kayıt) | `.oa-onaylar` > `.oa-onay` | 22px kare kutu `.oa-kutu` (6px köşe; seçilince ink dolgu + lime tik), metin 13px, bağlantılar altı çizili 700. Mevcut iki onay (`auth.onay.sozlesme`, `auth.onay.aydinlatma`). Metin açma (`auth.metniKapat`) mevcut davranış. |
| Ara satır (giriş) | `.oa-satir-ara` | solda `.oa-anahtar` (44×26; açıkken lime ray + ink topuz) + "Bu cihazda oturumu açık tut"; sağda "Parolamı unuttum" bağlantısı. |
| Turnstile (web) | `.oa-alan` benzeri yüzey kutusu içinde, 16px köşe; tema `data-theme` ile Turnstile'a geçer (`theme: isDark ? "dark" : "light"`). |
| CTA | `.oa-dugme` | "Hesap oluştur ve devam et" / "Giriş yap" (`auth.gonder.parolaylaGiris` → kısa "Giriş yap", yeni anahtar `auth.gonder.giris`) / link modunda "Giriş linki gönder". Gönderilirken metin değişir, düğme pasif. |
| Geçiş | `.oa-gecis` | "Zaten hesabın var mı? **Giriş yap**" / "Hesabın yok mu? **Ücretsiz oluştur**" (`auth.gecis.*`). |
| Gönderildi durumu | `.oa-posta` | 64px lime rozet + coral blok gölge, lucide `Mail`; mono "LINK GÖNDERİLDİ" / "E-POSTANI KONTROL ET"; başlık; açıklama (e-posta `mark` içinde, yüzey zemin); CTA "Giriş ekranına dön"; "Gelmedi mi? Tekrar gönder". Parola sıfırlama ve kayıt doğrulama aynı düzen, metinler mevcut `auth.gonderildi.*`. |

**Tema:** Auth sayfası `.oa` kökünü ve `.oa-koyu` sınıfını kullanır; giriş öncesi tercih yoksa `prefers-color-scheme` (kullanıcı `ayarlar.tema` yüklenmeden önce). Native'de karşılama → kayıt → kurulum akışı tek görsel dünya olur.

**Yeni anahtarlar (6 dil):** `auth.kayit.aciklamaKisa`, `auth.gonder.giris` ("Giriş yap"), `auth.gonderildi.tekrar` ("Tekrar gönder"), `auth.gonderildi.gelmedi` ("Gelmedi mi?"), `auth.referans.altSatir` ("İsteğe bağlı; ikiniz de 30 gün Pro kazanırsınız").

**Dokunulmayacaklar:** `authIstegiYap`, Turnstile yükleme/kurtarma, Apple akışı, referans kodu doğrulama, pro niyeti, analitik olayları, `auth.hata.*` metinleri.

---

## 5. Hareket ve haptik

| Olay | Süre / eğri |
|---|---|
| Adım girişi | 260 ms `cubic-bezier(.2,.8,.2,1)`, opacity + translateY 10→0 |
| Seçim dolgusu | 180 ms ease |
| İlerleme parçası | 250 ms ease |
| CTA basma | 80 ms, `translateY(3px)` + gölge 4→1px (uygulamadaki düğmeyle aynı) |
| Satır/kart basma | 120 ms `scale(.985)` |
| Gün seçimi | 150 ms `scale(1.12)`; şerit `scrollTo({behavior:"smooth"})` |
| Perde | 900 ms clip-path; yıldız/etiket/başlık/açıklama/CTA 0.7–1.3 s arası 400 ms solarak |
| Karşılama slaytı | 3.6 s; metin 300 ms çapraz solma; maket vurgusu 300 ms |
| `prefers-reduced-motion` | tüm geçişler kapalı, perde anında dolu |

Haptik: `platform.js > dokunusGeriBildirimi("hafif")` seçimde ve her tuşta; `"orta"` "Devam et" ve plan kaydında. Web'de zaten sessiz.

---

## 6. Erişilebilirlik

- Tüm etkileşimler `button`; `aria-pressed`, gün seçicide `role="radio"`/`aria-checked`; ilerleme `role="progressbar"`.
- Odak: `outline: 3px solid var(--oa-coral); outline-offset: 2px`.
- Kontrast: açıklama `--oa-metin-2` ≥ 7:1 iki temada; `--oa-metin-3` yalnız yer tutucu.
- Tuş takımı gerçek düğmeler; sil `aria-label`; tutar `aria-live`.
- iOS 16px girdi kuralı korunur; tuş takımı input olmadığından zoom riski yok.
- Yalnız renkle anlam yok: tik, sayı etiketi, metin.

---

## 7. i18n — yeni anahtarlar (tr, en, de, es, fr, it)

```
onboarding.karsilama.slayt1 / slayt1Alt / slayt2 / slayt2Alt / slayt3 / slayt3Alt
onboarding.karsilama.maketKalan      "Maaşa {gun} gün var. Ödemeler planda."
onboarding.gorunum.baslikGri         ""            (boş; Baslik tek parça basar)
onboarding.gorunum.baslik            "Açık mı, koyu mu?"
onboarding.gorunum.aciklama          "Birine dokun, uygulamanın tamamı o anda değişir. Sonradan Ayarlar'dan değişir."
onboarding.gorunum.sistem / acik / koyu
onboarding.siklik.duzensizAlt        "Plan 30 günde bir yenilenir"
onboarding.gun.donem                 "Bu dönem {bas} – {bit}."
onboarding.gun.donemAciklama         "Plan {tarih} ve her ayın aynı gününde yenilenir."
onboarding.gun.donemHafta            "Plan her {gun} yenilenir."
onboarding.gelir.etiketKisa          "Aylık net · her ay"   (düzensizde "Aylık net · ayda ortalama")
onboarding.turler.yokAlt             "Gelir ve harcamayla devam et"
onboarding.tuslar.sil                "Sil"
onboarding.plan.odemeler / yasam / kalan
onboarding.ulke.baskaUlkeAlt         "Tüm ülkeler arasından seç"
ayarlar.gorunum.sistem               "Sistem"
```
Kaldırılan anahtar yok; `baslikGri` anahtarları kalır, tek renk basılır. `onboardingKoprusu.js > baslatMesaji` `onboarding.*` anahtarlarını otomatik topladığı için native de görür.

---

## 8. Fazlar

**PR-1 `claude/onboarding-v3-yuzey`** (bu görev)
1. `onboardingAkis.css` sıfırdan: §2 token'ları + §3 stilleri. Silinen sınıflar: `oa-baslik-gri`, `oa-acilis-daire`, `oa-acilis-alt`, `oa-sayaclar`, `oa-sayac`, `oa-rozet`, `oa-serit` (eski). Kalan sınıf adları korunur, görünümleri değişir.
2. `Onboarding.jsx`: `Kabuk` (atla sağda), `SecimKarti`, `GunSecici` (kaydırıcı), `TusTakimi` + `TutarGosterimi`, `BilgiKarti`, `PlanKarti`, `SiradakiBorc`, `TemaSecimi`, `HazirPerdesi`, karşılama karuseli; `.oa-koyu` sınıfı (`durum.tema` + `matchMedia`).
3. `onboardingAdimlari.js`: `ADIMLAR`'a `"gorunum"`, `bosDurum().tema = "system"`, `veriyeYaz` → `ayarlar.tema`, `durumdanSonuc`/`sonuctanDurum` → `tema` (geçersiz → `"system"`). Testler.
4. `App.jsx`: `tema === "system"` + Ayarlar'da "Sistem".
4b. `Auth.jsx`: inline `auth-*` CSS kaldırılır, §4b yapısı `.oa-*` sınıflarıyla kurulur; `onboardingAkis.css` import edilir. Davranış değişmez; `Auth` testleri (varsa) ve `src/testVerisi/*login*/*register*` HTML fikstürleri güncellenir.
5. 6 dil anahtarları; `CHANGELOG.md > Unreleased`; `docs/mailing-yenilik-havuzu.md`; `docs/departman-devirleri.md`.
6. `npm ci && npm run release:check && npm test && npm run build`.

**PR-2 `claude/ios-onboarding-v3`** (ayrı, Özer onayı): `NativeOnboarding.swift` aynı token/bileşenler; status bar temaya göre (`.darkContent` sabiti kalkar); `baslatMesaji`'na `tema` + slayt metinleri.

---

## 9. Kabul ölçütleri

- [ ] `durumdanSonuc` çıktısı `tema` dışında değişmedi; mevcut testler yeşil; yeni testler: `gorunum` sırada, `tema` sonuçta/durumda, geçersiz tema → `system`.
- [ ] 16 ekran (3 hesap + 12 adım + kapanış) iki temada prototiple eşleşiyor: kenarlık yok, yüzey gölgesi yok, seçili = lime + ink, başlık tek renk Archivo Black, mono etiketler, emoji yok.
- [ ] CTA lime + coral blok gölge; büyük tutar ve plan tutarı özet gölgesiyle; kapanış lime perde + yıldız + coral gölgeli başlık.
- [ ] "Sistem" seçiliyken OS teması değişince onboarding ve uygulama anında değişiyor.
- [ ] Dokunmatikte gelir/yaşam adımında sistem klavyesi açılmıyor; masaüstünde input çalışıyor.
- [ ] Uzun listede CTA sabit, içerik altından akıyor, solma var.
- [ ] 360px'te yatay taşma yok; 667px yükseklikte tuş takımı + başlık sığıyor (başlık `clamp(24px, 7vw, 28px)`).
- [ ] `prefers-reduced-motion`'da perde ve geçişler anında.
- [ ] Klavyeyle akış tamamlanabiliyor; odak halkası görünür. Lighthouse mobil erişilebilirlik ≥ 95.
- [ ] Vercel önizlemesinde `?yeni=1` ile iki temada ekran görüntüleri PR'da.
- [ ] Analitik olay adları ve `sure_ms` değişmedi; `gorunum` da `onboarding_adim` olarak loglanıyor.
- [ ] Giriş/kayıt/gönderildi ekranları iki temada prototiple eşleşiyor; Supabase, Apple, Turnstile, referans kodu ve sözleşme onayı akışları önceki davranışla aynı (manuel: parola ile giriş, e-posta linki, Apple (TestFlight), yanlış parola hatası, referans kodu geçerli/geçersiz).
- [ ] Kodda emoji ve literal hex yok (token tanımları hariç); `grep -nP "[\x{1F300}-\x{1FAFF}]" src/Onboarding.jsx` boş.

---

## 10. Dokunulmayacaklar

Veri modeli ve `veriyeYaz` kayıt şekli; hesaplar (`planOdemeleri`, `ilkBitecekBorc`, `aySonuKalan`, `sonrakiGunTarihi`); `kurulumGosterilsinMi`; `onboardingKoprusu.js` protokolü (yalnız `tema` eklenir); misafir modu, kayıt/giriş yönlendirmeleri; ana uygulamanın görünümü; iOS Swift (PR-2).

---

## 11. Claude Code'a yapıştırılacak görev metni

```
Görev: Kurulum akışını (Onboarding.jsx + onboardingAkis.css) ve giriş/kayıt ekranını (Auth.jsx) v3 yüzeyine taşı.
Spesifikasyon: docs/onboarding-v3-direktifi.md (tamamını oku). Görsel hedef: docs/onboarding-v3-prototip.html; Playwright ile 390x844 açık+koyu 16 ekranın görüntüsünü al, hedef bu.

Özer onayı: K1–K8 onaylı. iOS SwiftUI (K5) bu PR'ın dışında.

Kurallar:
- Dal: claude/onboarding-v3-yuzey (origin/main'den).
- onboardingAdimlari.js'de yalnız "gorunum" adımı ve tema alanı eklenir; hesaplar ve kayıt şekli değişmez. Mevcut testler bozulmaz, yenileri eklenir.
- Renkler yalnız dokümandaki token'lardan (uygulamanın ACIK_TEMA/KOYU_TEMA değerleri); yüzeylerde kenarlık ve gölge yok; imza (lime + coral blok gölge, Sparkles yıldızı) yalnız CTA, büyük tutar, plan kartı ve kapanışta.
- Emoji kesinlikle yok; ikonlar lucide-react'ten (§2.4 eşlemesi); ülke/dil için mono kod rozeti; banka için bankLogos.js.
- Başlık tek renk Archivo Black; soluk parça yok.
- Yeni metinler 6 dilde (§7). Ton: düz, kısa, ünlemsiz.
- App.jsx: ayarlar.tema "system" + Ayarlar'da "Sistem".
- Auth.jsx: yalnız görünüm (§4b); Supabase/Apple/Turnstile/referans/onay mantığına dokunma.
- Her adımda önce dokümanı, sonra prototipin ilgili ekranını uygula; adım bitince Playwright ile iki temada görüntü al, prototiple yan yana karşılaştır, fark varsa düzelt.
- Bitince: npm ci, npm run release:check, npm test, npm run build; CHANGELOG Unreleased, mailing-yenilik-havuzu, departman-devirleri; PR açıklamasında iki temada 16 ekran görüntüsü ve Vercel önizleme adresi.
- Kabul ölçütleri (§9) tek tek işaretlenmeden PR açma.
```
