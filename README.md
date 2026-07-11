# Borç & Harcama Takibi

Tüm bankalardaki kredi kartı, kredi, ek hesap (KMH) ve gecikmiş borçları tek yerden
takip etmek, harcamaları yönetmek ve borç kapatma planı çıkarmak için kişisel web uygulaması.

Artık her cihazdan (telefon, bilgisayar, tablet) aynı verilere e-posta ile şifresiz
giriş yaparak ulaşabilirsiniz. Veriler Supabase'te, yalnızca sizin hesabınıza bağlı
olarak saklanır — başka hiç kimse göremez.

---

## 1. Supabase projesi oluşturma (ücretsiz, ~5 dakika)

1. https://supabase.com adresine gidip ücretsiz hesap açın, "New Project" deyin.
2. Proje adı ve bölge (Frankfurt/EU önerilir) seçip oluşturun — hazırlanması 1-2 dakika sürer.
3. Sol menüden **SQL Editor**'ü açın, **New query** deyip bu klasördeki `supabase.sql`
   dosyasının tüm içeriğini yapıştırıp **Run** butonuna basın. Bu, verilerinizin
   saklanacağı tabloyu ve "herkes sadece kendi verisini görür" kuralını kurar.
4. Sol menüden **Authentication → Providers → Email**'i açın; "Confirm email"
   kapalıysa açık bırakın, "Enable email OTP / Magic Link" seçeneğinin açık
   olduğundan emin olun (varsayılan olarak açıktır).
5. Sol menüden **Project Settings → API**'ye girin. Burada iki değer lazım:
   - **Project URL** (örn. `https://xxxxxxxx.supabase.co`)
   - **anon public** anahtarı (uzun bir metin)

## 2. Bu projeye bağlama

`.env.example` dosyasını `.env.local` olarak kopyalayıp içine az önce aldığınız
iki değeri yapıştırın:

    VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJhbGci...

## 3. Bilgisayarda deneme

    npm install
    npm run dev

Tarayıcıda http://localhost:5173 açılır. E-posta adresinizi girip "Giriş linki gönder"e
basın, gelen kutunuzdaki linke tıklayın — otomatik giriş yapılır.

## 4. Vercel'e yayınlama

1. Bu klasörü GitHub'da **Private** bir repoya yükleyin.
2. https://vercel.com'da GitHub hesabınızla giriş yapıp "Add New → Project" ile
   reponuzu seçin.
3. **Environment Variables** bölümüne `.env.local` dosyanızdaki iki satırı
   (VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY) aynen ekleyin — bu adım kritik,
   atlarsanız site açılır ama giriş çalışmaz.
4. **Deploy**'a basın. 1 dakika içinde `xxx.vercel.app` adresiniz hazır olur.
5. Son bir adım: Supabase panelinde **Authentication → URL Configuration**'a girip
   "Site URL" ve "Redirect URLs" alanlarına Vercel'in verdiği adresi
   (`https://xxx.vercel.app`) ekleyin. Bu olmadan giriş linki sizi doğru sayfaya
   yönlendirmez.

Bundan sonra repoya her push ettiğinizde site otomatik güncellenir.

## Nasıl çalışıyor, veriler nerede duruyor?

- Her e-posta adresi Supabase'te ayrı bir kullanıcı olarak kaydolur (şifre yok,
  her girişte yeni bir link istenir).
- Verileriniz Supabase'in veritabanında, yalnızca sizin kullanıcı kimliğinizle
  eşleşen satırlarda tutulur (satır seviyesi güvenlik / RLS ile korunur) —
  Supabase hesabınıza başka biri erişmediği sürece veriler size özeldir.
- Aynı e-posta ile hangi cihazdan giriş yaparsanız yapın aynı verileri görürsünüz.

## Önemli notlar

- `.env.local` dosyasını asla GitHub'a yüklemeyin (`.gitignore` zaten engelliyor) —
  içindeki anon anahtar herkese açık olsa da, bu proje Supabase URL'nizi
  gizli tutmak isteyenler için önemlidir.
- Finansal veriler hassastır: Supabase panelinizin şifresini kimseyle paylaşmayın.
- Ücretsiz Supabase katmanı bu ölçekteki kişisel kullanım için fazlasıyla yeterlidir.
