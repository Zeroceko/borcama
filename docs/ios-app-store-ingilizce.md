# Borcama iOS · İngilizce mağaza ve dünya açılışı

Bu dosya, App Store Connect'e İngilizce (U.S.) yerelleştirme eklemek ve
uygulamayı bütün ülkelere açmak için gereken metinleri ve kararları tutar.
Türkçe kayıt: [ios-app-store-gonderim.md](ios-app-store-gonderim.md).

> Bu metinler ancak İngilizce arayüz ve para birimi seçimi içeren build
> onaylandıktan sonra yayına girer. Önce açılırsa yurtdışı kullanıcısı
> yalnız Türkçe ve TL çalışan bir uygulama görür; açıklama ile ürün
> uyuşmazsa Guideline 2.3.1 (yanıltıcı meta veri) reddi gelir.

## Ürün kararları (25 Ekim 2026)

| Konu | Karar |
|---|---|
| Dil | Cihaz dili Türkçe ise Türkçe, değilse İngilizce. Ayarlar'da elle seçim. |
| Para birimi | İlk açılışta seçilir (TRY, USD, EUR, GBP, …); varsayılan cihaz bölgesinden. |
| Ekstre okuma | Yalnız Türk bankaları; arayüzde "Turkish banks" olarak etiketlenir. Diğer ülkelerde elle giriş. |
| Kur/varlık fiyatı | TCMB yalnız TRY bazlı; diğer para birimlerinde kur çevirisi aynı kaynaklardan çapraz hesaplanır. |
| Yasal metin | İngilizce Privacy Policy ve Terms of Use (GDPR uyumlu). KVKK metni Türkçe kalır. Hukukçu kontrolü gerekir. |
| Ülkeler | Tüm App Store ülkeleri, **Çin anakarası hariç** (ICP lisansı şartı). |
| Fiyat | Türkiye fiyatı taban; diğer ülkeler Apple'ın otomatik eşdeğer fiyatları. |

## App Store Connect · English (U.S.)

- **Name:** `Borcama`
- **Subtitle (≤30):** `Debt payoff & budget planner`
- **Promotional text (≤170):** `See every card, loan and bill in one place. Know what to pay this month, which debt to clear first and what is left over.`
- **Keywords (≤100):** `debt,payoff,budget,credit card,loan,bills,expense,tracker,payments,snowball,avalanche,money,planner`
- **Support URL:** `https://borcama.com/faq`
- **Marketing URL:** `https://borcama.com`
- **Privacy Policy URL:** `https://borcama.com/privacy` (İngilizce sürüm aynı adreste dil seçimiyle)

### Description

```
Borcama turns your debt into a plan.

Add your credit cards, loans and overdrafts, mark your payments, and see three answers every month:

• What do I pay? Every amount and due date in one list.
• Which debt first? A payoff order based on your own balances and interest rates.
• What is left? Income, spending and fixed payments in one monthly picture.

TRY IT WITHOUT AN ACCOUNT
Start right away. An account is only needed to sync between devices, back up your data and use Pro.

PRIVATE BY DESIGN
No bank login. Your records stay in your account; bank statement files from supported Turkish banks are read on your device and never uploaded.

PAYMENT REMINDERS
Optional reminders the day before a payment. The lock screen never shows amounts or bank names.

FACE ID / TOUCH ID LOCK
Keep Borcama locked behind your device biometrics.

BORCAMA PRO
Unlock the personal payoff order, monthly interest insights and more. Pro is an auto-renewing subscription (monthly or yearly), billed through your Apple ID and managed in your App Store account settings. Cancel at least 24 hours before the end of the period to stop renewal.

Terms of Use: https://borcama.com/terms
Privacy Policy: https://borcama.com/privacy

Borcama does not lend money, broker loans or give investment advice. Calculations are based on the information you enter.
```

### What's New (ilk İngilizce sürüm)

```
Borcama now speaks English and is available worldwide. Pick your currency on first launch and start planning your payoff.
```

### App Review Notes (İngilizce ek)

Mevcut Türkçe/İngilizce nota şu paragraf eklenir:

```
Localization: The app follows the device language (Turkish or English) and can be switched in Settings > Language. On first launch the user picks a currency. Bank statement import supports Turkish banks only and is labeled as such; in other regions entries are added manually. All features remain usable without an account ("Continue without an account" on the welcome screen). In-app purchases use StoreKit only; there are no referral codes, promo codes, email-link sign-in or external payment links in the app.
```

## Ekran görüntüleri

Türkçe setle aynı beş akış, İngilizce arayüz ve USD temsili tutarlarla
(6,9" ve 6,5"). Görseller gelince `docs/app-store-gorselleri/en/` altına
konur.

## Açılış sırası

1. İngilizce build TestFlight'ta: dil, para birimi, misafir modu, IAP, geri yükleme.
2. App Store Connect'e English (U.S.) yerelleştirmesi, metinler ve görseller.
3. İnceleme notu güncellenir; build incelemeye gönderilir (Özer onayı).
4. Onaydan sonra Pricing and Availability → bütün ülkeler, Çin anakarası hariç.
5. Abonelik ürünlerinin (`com.borcama.app.pro.monthly`, `.annual`) her ülke fiyatı kontrol edilir; İngilizce görünen ad ve açıklama eklenir.
