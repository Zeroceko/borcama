// Web'de giriş yapılmadan önceki ekranlar (landing, giriş/kayıt ve kurulumun
// tema sorusundan önceki adımı) her zaman açık temadadır; koyu tema yalnız
// giriş yaptıktan sonra kullanıcının seçebileceği bir ayardır (Özer, 28 Ekim
// 2026). iOS'ta bu ekranlar cihaz temasını izler.
export function webdeKoyuMu({ native, sistemKoyu }) {
  return native ? Boolean(sistemKoyu) : false;
}
