// Bölüm sözlüğü: para-birimi. Para birimi seçimi yalnız native (iOS) uygulamada
// var; web daima TRY ve Türkçe olduğundan buradaki tr metinleri yalnız iOS'ta
// Türkçe arayüzde görünür.
export const tr = {
  "paraBirimi.baslik": "Para birimi",
  "paraBirimi.satir": "Gösterim para birimi",
  "paraBirimi.aciklama": "Toplamlar bu birimde gösterilir; başka birimdeki borçlar kurla çevrilir. Değiştirdiğinde uygulama yeniden açılır.",
  "paraBirimi.secici": "Para birimi: {kod}",
  "paraBirimi.seciciEtiket": "Para birimini seç",
  "paraBirimi.varlikUyari": "Piyasa fiyatları TRY bazlı olduğundan {birim} biriminde otomatik değerleme kapalı; varlıklarının güncel değerini elle gir.",
  "paraBirimi.kartHesabiSerbest": "{baslik} Güncel dönem {yeni} + devreden {devreden} = {toplam}. Toplam ödenen {odenen} sonrası {kalan}. Tahmini aylık faiz {faiz} (%{oran}). Asgari ödeme: {asgari} (girdiğin tutar).",
  // Ulkeye gore varsayilan oranlar (TRY disi)
  "bolge.ortalama": "{ulke} ortalaması, değiştirebilirsin",
  "bolge.tipik": "tipik oran, değiştirebilirsin",
  "bolge.kaynakUlke": "{ulke} ortalaması",
  "bolge.kaynakTipik": "tipik oran",
  "bolge.alanIpucu": "Boşsa {oran} ({kaynak})",
  "paraBirimi.kartHesabiBolge": "{baslik} Güncel dönem {yeni} + devreden {devreden} = {toplam}. Toplam ödenen {odenen} sonrası {kalan}. Tahmini aylık faiz {faiz} (%{oran}). Asgari ödeme: {asgari}. Girmediğin faiz oranı ve asgari tutar için {kaynak} kullanılır.",
  // Borc bazinda para birimi ve kur cevirisi
  "paraBirimi.borc.etiket": "Para birimi",
  "paraBirimi.kur.cevrildi": "≈ kurla çevrildi",
  "paraBirimi.kur.cevrildiTarih": "≈ {tarih} kuruyla çevrildi",
  "paraBirimi.kur.bekliyor": "{n} kayıt kur bekliyor",
};

export const en = {
  "paraBirimi.baslik": "Currency",
  "paraBirimi.satir": "Display currency",
  "paraBirimi.aciklama": "Totals are shown in this currency; debts in other currencies are converted at the exchange rate. The app reloads when you change it.",
  "paraBirimi.secici": "Currency: {kod}",
  "paraBirimi.seciciEtiket": "Choose currency",
  "paraBirimi.varlikUyari": "Market prices are TRY-based, so automatic valuation is off in {birim}. Enter your assets' current value manually.",
  "paraBirimi.kartHesabiSerbest": "{baslik} Current period {yeni} + carried over {devreden} = {toplam}. After {odenen} total paid, {kalan}. Estimated monthly interest {faiz} ({oran}%). Minimum payment: {asgari} (the amount you entered).",
  // Country defaults (non-TRY)
  "bolge.ortalama": "{ulke} average, you can change it",
  "bolge.tipik": "typical rate, you can change it",
  "bolge.kaynakUlke": "{ulke} average",
  "bolge.kaynakTipik": "typical rate",
  "bolge.alanIpucu": "If blank: {oran} ({kaynak})",
  "paraBirimi.kartHesabiBolge": "{baslik} Current period {yeni} + carried over {devreden} = {toplam}. After {odenen} total paid, {kalan}. Estimated monthly interest {faiz} ({oran}%). Minimum payment: {asgari}. If you leave the interest rate or minimum blank, the {kaynak} is used.",
  // Per-debt currency and conversion
  "paraBirimi.borc.etiket": "Currency",
  "paraBirimi.kur.cevrildi": "≈ converted at exchange rate",
  "paraBirimi.kur.cevrildiTarih": "≈ converted at {tarih} rate",
  "paraBirimi.kur.bekliyor": "{n} record(s) awaiting exchange rate",
};
