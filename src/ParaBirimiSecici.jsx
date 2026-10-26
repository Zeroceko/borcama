import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { nativeMi } from "./platform.js";
import { t } from "./i18n.js";
import { DESTEKLENEN_PARA_BIRIMLERI, kullaniciParaBirimi, paraBirimiAdi, paraBirimiAyarla } from "./currencyInput.js";

// Karsilama ekraninda kucuk "Currency: USD ▾" secici. Yalniz native'de
// gorunur. Sistem secicisi (select) iOS'ta tekerlek olarak acilir.
export default function ParaBirimiSecici({ className = "", onDegisti }) {
  const [secili, setSecili] = useState(() => kullaniciParaBirimi());
  if (!nativeMi) return null;
  return (
    <label className={`para-birimi-secici ${className}`.trim()}>
      <span aria-hidden="true">
        {t("paraBirimi.secici", { kod: secili })} <ChevronDown size={14} />
      </span>
      <select
        aria-label={t("paraBirimi.seciciEtiket")}
        value={secili}
        onChange={(olay) => {
          const yeni = paraBirimiAyarla(olay.target.value);
          setSecili(yeni);
          onDegisti?.(yeni);
        }}
      >
        {DESTEKLENEN_PARA_BIRIMLERI.map((kod) => (
          <option key={kod} value={kod}>
            {kod} · {paraBirimiAdi(kod)}
          </option>
        ))}
      </select>
    </label>
  );
}
