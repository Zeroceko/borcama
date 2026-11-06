// İçerik sayfalarındaki kayda geçiş yerleşimlerinin ölçüm adları. Ayrı dosya:
// funnelAnalytics ana pakette, hesap mantığını oraya taşımasın.

// Ölçüm: yerleşim adı olayın `content` alanına yazılır (yalnız o olay
// satırında; oturumun ilk temas kaynağı ve user_acquisition değişmez).
// analytics_events (session_id, event_name) tekildir: bir oturumda her olay
// adı bir kez kaydedilir. Bu yüzden content_product_click satırındaki
// yerleşim "oturumun ürüne ilk geçtiği yer"dir; debt_payoff_result_view de
// oturumda ilk görülen hesap sonucudur (araç sayfası ya da içerik içi hesap).
export const ICERIK_YERLERI = Object.freeze({
  SOZLUK_HESAP: "sozluk_hesap",
  REHBER_HESAP: "rehber_hesap",
  SOZLUK_YAPISKAN: "sozluk_yapiskan",
  REHBER_YAPISKAN: "rehber_yapiskan",
  TASFIYE_BIRIKIM: "tasfiye_birikim",
  BANK_RUN_BIRIKIM: "bank_run_birikim",
  SOZLUK_SON: "sozluk_son",
  REHBER_SON: "rehber_son",
  ALT_CTA: "alt_cta",
});

const GECERLI_YERLER = new Set(Object.values(ICERIK_YERLERI));

// Bilinmeyen değer ölçüme gitmez; tutar veya serbest metin buradan sızamaz.
export function olcumYeri(yer) {
  return GECERLI_YERLER.has(yer) ? yer : "";
}

// Olay gövdesindeki edinim alanları; yerleşim varsa yalnız `content` değişir.
export function yerlesimliKaynak(kaynak = {}, yer = "") {
  const gecerli = olcumYeri(yer);
  return gecerli ? { ...kaynak, content: gecerli } : { ...kaynak };
}
