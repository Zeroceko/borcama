import React from "react";
import { Globe } from "lucide-react";
import { DESTEKLENEN_DILLER, DIL_ADLARI, dil, diliDegistirVeYenile, t } from "./i18n.js";

// Ayarlar > Dil (native ve web).
export default function DilAyari() {
  const secili = dil();
  return (
    <section className="bt-settings-card">
      <div className="bt-settings-title">
        <Globe size={18} /> {t("dil.baslik")}
      </div>
      <div className="bt-setting-row">
        <div>
          <strong>{t("dil.satir")}</strong>
          <small>{t("dil.aciklama")}</small>
        </div>
        <select
          className="bt-input"
          style={{ width: "auto", minWidth: 150 }}
          aria-label={t("dil.satir")}
          value={secili}
          onChange={(e) => diliDegistirVeYenile(e.target.value)}
        >
          {DESTEKLENEN_DILLER.map((kod) => (
            <option key={kod} value={kod} lang={kod}>
              {DIL_ADLARI[kod]}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
