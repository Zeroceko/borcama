// Supabase oturum olaylarının uygulamadaki karşılığı (B14). Yan etkiler
// (dönüşüm, Pro denemesi, giriş kaydı) yalnız önceden oturum yokken gelen
// oturumda çalışır; sekmeye dönüşte yayılan SIGNED_IN ve TOKEN_REFRESHED
// yalnız oturumu günceller, kullanıcı ve token aynıysa hiçbir şey yapmaz.
export function oturumGecisi(eski, yeni, event = null) {
  const ayni = Boolean(eski && yeni
    && eski.user?.id === yeni.user?.id
    && eski.access_token === yeni.access_token);
  if (ayni) return { guncelle: false, yanEtki: false, girisKaydi: false };
  const ilkOturum = Boolean(yeni?.user) && !eski;
  return { guncelle: true, yanEtki: ilkOturum, girisKaydi: ilkOturum && event === "SIGNED_IN" };
}
