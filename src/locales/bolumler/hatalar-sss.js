// Bölüm sözlüğü: hatalar-sss. tr değerleri ekranda bugün görünen Türkçe metnin
// birebir aynısıdır; en yalnız native (iOS) İngilizce modunda görünür.
export const tr = {
  // Apple ile giriş hataları (appleGiris.js)
  "hata.appleBaglanti": "Apple ile giriş için bağlantı kurulamadı. Bağlantını kontrol edip tekrar dene.",
  "hata.appleTamamlanamadi": "Apple ile giriş tamamlanamadı. Lütfen tekrar dene ya da parolanla giriş yap.",
  // Parola yenileme hataları (authAttempt.js)
  "hata.cokFazlaDeneme": "Çok fazla deneme yapıldı. Lütfen biraz bekleyin.",
  "hata.dogrulamaYenilendi": "Güvenlik doğrulaması yenilendi. Doğrulama tamamlanınca tekrar gönderin.",
  "hata.baglantiYok": "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
  "hata.yenilemeGonderilemedi":
    "Parola yenileme bağlantısı gönderilemedi. Tekrar deneyin; sorun sürerse zero@borcama.com adresine yazın.",

  // SSS sayfası (Faq.jsx)
  "sss.logoEtiket": "Borcama ana sayfa",
  "sss.baslik": "Merak ettiğin şeyler. Net cevaplar.",
  "sss.giris": "Kullanım, Pro üyeliği, iptal, iade ve veriler hakkında sık sorulan sorular.",
  "sss.iletisim": "Aradığın cevabı bulamadın mı?",
  "sss.altSozlesme": "Kullanıcı Sözleşmesi",
  "sss.altGizlilik": "Gizlilik ve KVKK",
  "sss.altIade": "İade Politikası",

  "sss.ne.soru": "Borcama ne yapar?",
  "sss.ne.cevap":
    "Borçlarını, ödemelerini, gelir-harcamalarını ve varlıklarını tek yerde takip etmene yardımcı olur. Pro; girdiğin bilgilere göre borç ödeme önceliği, faiz yükü ve harcama eğilimleri hakkında kişiselleştirilmiş öneriler sunar.",
  "sss.banka.soru": "Banka hesaplarım otomatik olarak bağlanıyor mu?",
  "sss.banka.cevap":
    "Hayır. Şimdilik bilgileri sen girersin; Borcama internet bankacılığı parolanı istemez. Yeni ekstreleri ve yaptığın ödemeleri aylık olarak güncellersin.",
  "sss.odemeGorunuyor.soru": "Ödeme yaptığım halde neden borç görünüyor?",
  "sss.odemeGorunuyor.cevap":
    "Ödeme kaydı ilgili borcun bakiyesinden ve ekstre döneminden ayrı izlenebilir. {ekran} ekranından kaydın doğru borca ve aya bağlı olduğunu kontrol et; düzelmiyorsa bize yaz.",
  "sss.odemeGorunuyor.ekran": "Ödemeler",
  "sss.asgari.soru": "Asgari ödeme ile tam ödeme arasındaki fark nedir?",
  "sss.asgari.cevap":
    "Asgari ödeme ekstrede belirtilen minimum tutardır; tam ödeme ise o dönemki borcun tamamını kapatmayı hedefler. Kesin hesap özeti için bankanı kontrol et.",
  "sss.yapilandirma.soru": "Yapılandırma ödeme sayılır mı?",
  "sss.yapilandirma.cevap":
    "Yapılandırma, ödeme kaydıyla aynı şey değildir. Plan koşullarını bankanla doğrula ve Borcama'daki kayıtlarını buna göre güncel tut.",
  "sss.ekstreAyi.soru": "Ekstre ayı ile ödeme ayı neden farklı?",
  "sss.ekstreAyi.cevap":
    "Ekstre harcamaların hesaplandığı dönemi, ödeme ise borcun kapatıldığı tarihi anlatır. İlgili ekstreyi ve ödeme kaydını ayrı ayrı kontrol et.",
  "sss.tahmin.soru": "Borcama'daki tahmin ile banka bakiyem neden farklı?",
  "sss.tahmin.cevap":
    "Tahminler senin girdiğin kayıtlara dayanır; banka bakiyesi değildir. Güncel tutar için bankanı kontrol et ve eksik kayıtları uygulamada düzelt.",
  "sss.kaynak.soru": "Hesap kaynağımı nasıl kontrol eder veya düzeltirim?",
  "sss.kaynak.cevap":
    "Kayıt kaynağını {ekran} ekranından kontrol edebilirsin. Yanlışsa değişiklik yapmadan önce {eposta} adresine yaz.",
  "sss.kaynak.ekran": "Ayarlar",
  "sss.paketFark.soru": "Ücretsiz paket ile Pro arasındaki fark nedir?",
  "sss.paketFark.cevap":
    "Ücretsiz paket temel borç, ödeme, harcama ve varlık takibiyle her ay bir kişisel öneri içerir. Pro; tüm kişisel finansal sinyalleri, faiz ve ödeme önceliği analizlerini ve gelişmiş senaryoları açar.",
  "sss.deneme.soru": "30 günlük Pro denemesi nasıl çalışır?",
  "sss.deneme.cevap":
    "Yeni hesabında Pro özellikleri 30 gün boyunca kart bilgisi istemeden açılır. Süre sonunda ödeme alınmaz; hesabın ve verilerin korunarak otomatik olarak Ücretsiz plana döner.",
  "sss.yenileme.soru": "Pro aboneliği otomatik yenilenir mi?",
  "sss.yenileme.cevap":
    "Evet. Aylık veya yıllık seçtiğin dönem sonunda aboneliğin otomatik yenilenir. Yenilemeyi durdurmak için bir sonraki faturalandırma tarihinden önce aboneliğini iptal edebilirsin.",
  "sss.iptal.soru": "Pro paketimi nasıl iptal ederim?",
  "sss.iptal.cevapNative":
    "Uygulamadaki aboneliğin App Store üzerinden yürür. {yol} yolundan App Store abonelik ekranını açıp yenilemeyi durdurabilirsin; Pro erişimin ödediğin dönemin sonuna kadar sürer.",
  "sss.iptal.yol": "Ayarlar → Paketimi yönet / iptal et",
  "sss.iptalHemen.soru": "İptal edince Pro hemen kapanır mı?",
  "sss.iptalHemen.cevap":
    "Hayır. İptal sonraki yenilemeyi durdurur; Pro özelliklerini ödediğin mevcut faturalandırma döneminin sonuna kadar kullanmaya devam edersin.",
  "sss.iade.soru": "İptal ile iade aynı şey mi?",
  "sss.iade.cevap":
    "Hayır. İptal gelecek yenilemeyi durdurur, geçmiş ödemeyi otomatik iade etmez. Ayrıntılar için {baglanti}'na bakabilirsin.",
  "sss.iade.baglanti": "İade Politikası",
  "sss.paylasim.soru": "Finansal bilgilerim kimlerle paylaşılır?",
  "sss.paylasim.cevap":
    "Veri işleme ve saklama açıklamaları {baglanti}'nde yer alır. Abonelik kart bilgileri Borcama tarafından saklanmaz; bu, uygulamaya kendi eklediğin borç ve ödeme kayıtlarından ayrıdır.",
  "sss.paylasim.baglanti": "Gizlilik ve KVKK Aydınlatma Metni",
};

export const en = {
  "hata.appleBaglanti": "Couldn't connect to sign in with Apple. Check your connection and try again.",
  "hata.appleTamamlanamadi": "Sign in with Apple couldn't be completed. Please try again or sign in with your password.",
  "hata.cokFazlaDeneme": "Too many attempts. Please wait a moment.",
  "hata.dogrulamaYenilendi": "The security check was refreshed. Send again once the check is complete.",
  "hata.baglantiYok": "Couldn't connect. Check your internet connection and try again.",
  "hata.yenilemeGonderilemedi":
    "We couldn't send the password reset link. Try again; if the problem continues, email zero@borcama.com.",

  "sss.logoEtiket": "Borcama home",
  "sss.baslik": "Your questions. Clear answers.",
  "sss.giris": "Frequently asked questions about using Borcama, Pro, canceling, refunds and your data.",
  "sss.iletisim": "Didn't find the answer you were looking for?",
  "sss.altSozlesme": "Terms of Use",
  "sss.altGizlilik": "Privacy & KVKK",
  "sss.altIade": "Refund Policy",

  "sss.ne.soru": "What does Borcama do?",
  "sss.ne.cevap":
    "It helps you track your debts, payments, income and spending, and assets in one place. Based on what you enter, Pro gives personalized suggestions on debt payment priority, interest burden and spending trends.",
  "sss.banka.soru": "Are my bank accounts connected automatically?",
  "sss.banka.cevap":
    "No. For now you enter the details yourself; Borcama never asks for your online banking password. Each month you update your new statements and the payments you've made. Statement import supports Turkish banks.",
  "sss.odemeGorunuyor.soru": "Why does a debt still show after I paid it?",
  "sss.odemeGorunuyor.cevap":
    "A payment record can be tracked separately from the debt's balance and statement period. On the {ekran} screen, check that the record is linked to the right debt and month; if it still looks wrong, write to us.",
  "sss.odemeGorunuyor.ekran": "Payments",
  "sss.asgari.soru": "What's the difference between the minimum payment and paying in full?",
  "sss.asgari.cevap":
    "The minimum payment is the smallest amount shown on your statement; paying in full aims to clear the entire balance for that period. Check with your bank for the exact statement details.",
  "sss.yapilandirma.soru": "Does restructuring count as a payment?",
  "sss.yapilandirma.cevap":
    "Restructuring is not the same as a payment record. Confirm the plan terms with your bank and keep your records in Borcama up to date accordingly.",
  "sss.ekstreAyi.soru": "Why are the statement month and the payment month different?",
  "sss.ekstreAyi.cevap":
    "A statement covers the period in which spending is calculated; a payment is the date the debt is paid off. Check the related statement and the payment record separately.",
  "sss.tahmin.soru": "Why is Borcama's estimate different from my bank balance?",
  "sss.tahmin.cevap":
    "Estimates are based on the records you enter; they are not your bank balance. Check with your bank for the current amount and fix any missing records in the app.",
  "sss.kaynak.soru": "How do I check or fix my account source?",
  "sss.kaynak.cevap":
    "You can check your record source on the {ekran} screen. If it's wrong, email {eposta} before making any changes.",
  "sss.kaynak.ekran": "Settings",
  "sss.paketFark.soru": "What's the difference between the Free plan and Pro?",
  "sss.paketFark.cevap":
    "The Free plan includes basic debt, payment, spending and asset tracking plus one personal suggestion each month. Pro unlocks all personal financial signals, interest and payment-priority analysis, and advanced scenarios.",
  "sss.deneme.soru": "How does the 30-day Pro trial work?",
  "sss.deneme.cevap":
    "On a new account, Pro features are unlocked for 30 days without asking for card details. You aren't charged when it ends; your account automatically returns to the Free plan with your data kept.",
  "sss.yenileme.soru": "Does the Pro subscription renew automatically?",
  "sss.yenileme.cevap":
    "Yes. Your subscription renews automatically at the end of the monthly or yearly period you chose. To stop renewal, cancel your subscription before the next billing date.",
  "sss.iptal.soru": "How do I cancel Pro?",
  "sss.iptal.cevapNative":
    "Your in-app subscription is managed through the App Store. Go to {yol} to open the App Store subscription screen and turn off renewal; you keep Pro access until the end of the period you paid for.",
  "sss.iptal.yol": "Settings → Manage / cancel my plan",
  "sss.iptalHemen.soru": "Does Pro turn off as soon as I cancel?",
  "sss.iptalHemen.cevap":
    "No. Canceling stops the next renewal; you can keep using Pro features until the end of the current billing period you paid for.",
  "sss.iade.soru": "Is canceling the same as a refund?",
  "sss.iade.cevap":
    "No. Canceling stops future renewals; it doesn't automatically refund past payments. See the {baglanti} for details.",
  "sss.iade.baglanti": "Refund Policy",
  "sss.paylasim.soru": "Who is my financial information shared with?",
  "sss.paylasim.cevap":
    "How data is processed and stored is explained in the {baglanti}. Borcama doesn't store subscription card details; that is separate from the debt and payment records you add to the app yourself.",
  "sss.paylasim.baglanti": "Privacy and KVKK Notice",
};
