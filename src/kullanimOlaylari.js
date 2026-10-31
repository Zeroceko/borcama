// Kullanım istatistiklerinin saf kuralları (test edilebilir; tarayıcı ve
// Supabase'e bağımlı değil). Olay listesi migration'daki check ile aynı.

// Olay -> izinli ayrıntılar. Tutar, banka, kart, dosya adı ve serbest metin
// hiçbir olayda yer almaz; ayrıntı yalnız bu listeden seçilir.
export const KULLANIM_OLAYLARI = {
  ekstre_okundu: ["paylas", "secim"],
  ekstre_okunamadi: ["paylasilan_acilamadi", "pdf_uyumsuz", "okunamadi"],
  ekstre_kaydedildi: ["otomatik_son4", "otomatik_banka", "elle", "yeni_kart"],
  odeme_kaydedildi: ["kart", "kredi"],
  harcama_kaydedildi: [null],
  borc_eklendi: ["kart", "kredi", "ek_hesap"],
  bildirimden_acildi: ["tap", "odedim", "yarin"],
};

export function kullanimOlayiGecerliMi(olay, ayrinti = null) {
  const izinli = Object.prototype.hasOwnProperty.call(KULLANIM_OLAYLARI, olay) ? KULLANIM_OLAYLARI[olay] : null;
  return Boolean(izinli) && izinli.includes(ayrinti ?? null);
}

// TestFlight ve geliştirme sürümleri sayılmaz; native kabuk TestFlight'ta
// window.borcamaOrtam = "testflight" bırakır.
export function sayilabilirOrtamMi(uretimMi, ortam = globalThis) {
  return Boolean(uretimMi) && ortam?.borcamaOrtam !== "testflight";
}

// Ekstrenin karta nasıl bağlandığı; kart ya da banka bilgisi içermez.
export function ekstreEslesmeTuru(secilenKart, otomatikEslesme) {
  if (secilenKart === "__new__") return "yeni_kart";
  if (otomatikEslesme?.card?.id && otomatikEslesme.card.id === secilenKart)
    return otomatikEslesme.reason === "last4" ? "otomatik_son4" : "otomatik_banka";
  return "elle";
}
