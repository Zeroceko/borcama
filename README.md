# Borcama

**Borçlarını gör, ekstreni kontrol et, kapatma planını oluştur.**

Borcama; farklı bankalardaki kredi kartı, kredi, ek hesap (KMH) ve diğer borçları tek ekranda takip etmeyi kolaylaştıran kişisel finans web uygulamasıdır.

Kullanıcılar yaklaşan ödemelerini görebilir, banka ekstresiyle kendi harcama kayıtlarını karşılaştırabilir ve borçlarını çığ veya kartopu yöntemine göre sıralayabilir.

## Özellikler

- Kredi kartı, kredi, ek hesap/KMH ve diğer borçları tek yerde takip etme
- Banka bazında toplam borç dağılımı
- Yaklaşan ve gecikmiş ödeme takvimi
- Kart limitine göre otomatik yasal minimum ödeme hesabı
- Devreden kredi kartı borcu için tahmini faiz hesabı
- Manuel harcamaları banka ekstresiyle karşılaştıran ekstre kontrolü
- Çığ ve kartopu borç kapatma stratejileri
- Ekstra ödeme ve faiz tasarrufu simülasyonu
- Aylık gelir, harcama ve net nakit akışı takibi
- Kullanıcı tarafından yeni banka ekleme
- Açık ve koyu tema
- Mobil, tablet ve masaüstü uyumlu arayüz
- E-posta Magic Link ile şifresiz giriş

## Kullanım akışı

1. Kart, kredi ve diğer borçlarınızı ekleyin.
2. Ekstre borcunuzu ve yaptığınız ödemeyi girin.
3. Yaklaşan minimum ödemeleri ve tahmini faizi görün.
4. Harcamalarınızı doğru kart veya banka hesabıyla kaydedin.
5. Ekstre kontrolü ekranında banka verileriyle kendi kayıtlarınızı karşılaştırın.
6. Borç planından kapatmak istediğiniz sırayı belirleyin.

## Teknolojiler

- React 18
- Vite 5
- Supabase Authentication ve Database
- Lucide React
- Vercel uyumlu deployment

## Yerel geliştirme

Gereksinimler: Node.js 18 veya daha yeni bir sürüm.

```bash
npm install
npm run dev
```

Supabase ortam değişkenleri tanımlı değilse uygulama yerel demo modunda açılır. Demo verileri yalnızca tarayıcınızda saklanır.

Production build oluşturmak için:

```bash
npm run build
```

## Supabase kurulumu

1. [Supabase](https://supabase.com) üzerinde yeni bir proje oluşturun.
2. SQL Editor ekranında [`supabase.sql`](./supabase.sql) dosyasını çalıştırın.
3. Authentication bölümünden Email / Magic Link girişini etkinleştirin.
4. `.env.example` dosyasını `.env.local` adıyla kopyalayın.
5. Supabase proje bilgilerinizi ekleyin:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Supabase Row Level Security (RLS) politikaları sayesinde her kullanıcı yalnızca kendi kayıtlarına erişir.

## Vercel'e yayınlama

1. GitHub deposunu Vercel'e bağlayın.
2. `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini Vercel Environment Variables bölümüne ekleyin.
3. Projeyi deploy edin.
4. Vercel adresinizi Supabase **Authentication → URL Configuration** alanında Site URL ve Redirect URL olarak tanımlayın.

## Veri modeli

Uygulama verileri Supabase'teki `kv_store` tablosunda kullanıcı hesabına bağlı olarak saklanır. Oturum açan kullanıcı aynı verilere telefon, tablet veya bilgisayarından ulaşabilir.

## Sürümler

Kararlı sürümler ve indirilebilir kaynak arşivleri için [Releases](https://github.com/Zeroceko/borcama/releases) sayfasını ziyaret edebilirsiniz.

## Not

Borcama bir kişisel takip ve planlama aracıdır; finansal danışmanlık hizmeti sunmaz. Faiz hesapları yaklaşık sonuç verir ve banka ekstresinin yerine geçmez.
