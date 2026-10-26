import React from "react";
import { Globe } from "lucide-react";
import { DESTEKLENEN_DILLER, DIL_ADLARI, dil, diliDegistirVeYenile, t } from "./i18n.js";

// Giris yapmadan dil degistirme (native ve web giris/kayit ekranlari). Dugme
// secili dilin kendi adini gosterir; ustune serilmis gorunmez <select>
// sistemin secim tekerini/listesini acar, secim kaydedilir ve sayfa yenilenir.
export default function DilDugmesi({ className = "" }) {
  const secili = dil();
  return (
    <label className={`dil-dugmesi ${className}`.trim()} lang={secili}>
      <Globe size={15} aria-hidden="true" />
      <span aria-hidden="true">{DIL_ADLARI[secili]}</span>
      <select
        className="dil-dugmesi-secim"
        aria-label={t("dil.degistir")}
        value={secili}
        onChange={(e) => diliDegistirVeYenile(e.target.value)}
      >
        {DESTEKLENEN_DILLER.map((kod) => (
          <option key={kod} value={kod} lang={kod}>
            {DIL_ADLARI[kod]}
          </option>
        ))}
      </select>
    </label>
  );
}
