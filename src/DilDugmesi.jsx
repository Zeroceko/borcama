import React from "react";
import { Globe } from "lucide-react";
import { nativeMi } from "./platform.js";
import { DIL_ADLARI, digerDil, diliDegistirVeYenile, t } from "./i18n.js";

// Giris yapmadan dil degistirme. Yalniz native'de gorunur; tarayici surumu
// Turkce kalir ve dugme hic cizilmez. Dugme diger dilin kendi adini gosterir
// ("English" / "Türkçe"); dokununca secim kaydedilir ve uygulama yenilenir.
export default function DilDugmesi({ className = "" }) {
  if (!nativeMi) return null;
  const hedef = digerDil();
  return (
    <button
      type="button"
      className={`dil-dugmesi ${className}`.trim()}
      lang={hedef}
      aria-label={t("dil.degistir")}
      onClick={() => diliDegistirVeYenile(hedef)}
    >
      <Globe size={15} aria-hidden="true" />
      {DIL_ADLARI[hedef]}
    </button>
  );
}
