import React from "react";
import { Globe } from "lucide-react";
import { nativeMi } from "./platform.js";
import { DESTEKLENEN_DILLER, DIL_ADLARI, dil, diliDegistirVeYenile, t } from "./i18n.js";

// Ayarlar > Dil. Yalniz native'de gorunur; tarayici surumu Turkce kalir.
export default function DilAyari() {
  if (!nativeMi) return null;
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
        <div style={{ display: "flex", gap: 6 }} role="group" aria-label={t("dil.satir")}>
          {DESTEKLENEN_DILLER.map((kod) => (
            <button
              key={kod}
              type="button"
              lang={kod}
              className={`bt-btn kucuk ${kod === secili ? "birincil" : "ikincil"}`}
              aria-pressed={kod === secili}
              onClick={() => diliDegistirVeYenile(kod)}
            >
              {DIL_ADLARI[kod]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
