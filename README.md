# Borç & Harcama Takibi

Tüm bankalardaki kredi kartı, kredi ve ek hesap (KMH) borçlarını tek yerden takip etmek
ve harcamaları yönetmek için kişisel web uygulaması.

Veriler yalnızca kendi tarayıcınızda (localStorage) saklanır — hiçbir sunucuya gönderilmez.

## Bilgisayarda çalıştırma

1. Node.js kurulu olmalı (https://nodejs.org — LTS sürümü yeterli)
2. Bu klasörde terminal açıp:

   npm install
   npm run dev

3. Tarayıcıda http://localhost:5173 adresini açın.

## Vercel'e yayınlama (önerilen yol)

1. https://github.com adresinde ücretsiz hesap açın ve yeni bir repo oluşturun
   (⚠️ repoyu **Private** yapın).
2. Bu klasörü repoya yükleyin (GitHub Desktop en kolayı, ya da:
   git init && git add . && git commit -m "ilk sürüm" && git push).
3. https://vercel.com adresinde GitHub hesabınızla giriş yapın.
4. "Add New → Project" deyip reponuzu seçin. Vercel, Vite projesini otomatik tanır —
   hiçbir ayar değiştirmeden "Deploy" butonuna basın.
5. 1 dakika içinde size `xxx.vercel.app` uzantılı bir adres verir. Bitti.

Bundan sonra repoya her push ettiğinizde site otomatik güncellenir.

## Önemli notlar

- Veriler tarayıcıya kayıtlıdır: aynı siteye başka bir cihazdan/tarayıcıdan girerseniz
  veriler orada görünmez. Tarayıcı verilerini silerseniz kayıtlar da silinir.
- Telefon + bilgisayar arasında senkronizasyon isterseniz bir veritabanı ve giriş
  sistemi (ör. Supabase) eklemek gerekir — bu bir sonraki adım olarak eklenebilir.
- Finansal bilgiler hassastır: siteyi arama motorlarına kapattık (noindex) ama yine de
  adresi kimseyle paylaşmayın.
